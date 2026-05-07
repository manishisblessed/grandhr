#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# GrandHR — EC2 backend bootstrap (idempotent).
#
# What this does:
#   1. Installs Node 20 LTS, git, pm2, nginx, certbot
#   2. Clones (or updates) the repo at /home/ubuntu/GrandHR
#   3. Wires backend/.env from the example if missing
#   4. Builds the backend and starts it under pm2 as `grandhr-api`
#   5. Drops an nginx reverse-proxy site at $API_DOMAIN and loads it
#   6. Sets pm2 to start at boot
#
# Usage:
#   sudo API_DOMAIN=api.grandhr.in ./bootstrap-ec2.sh
#
# After it finishes, you still need to:
#   - Fill /home/ubuntu/GrandHR/backend/.env with real secrets (DATABASE_URL,
#     JWT_SECRET, SMTP, VAPID, etc. — see backend/.env.example).
#   - Point an A record for $API_DOMAIN at this server's public IP.
#   - Run TLS issuance:  sudo certbot --nginx -d $API_DOMAIN
#   - Restart the app:   pm2 restart grandhr-api
# -----------------------------------------------------------------------------
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/manishisblessed/grandhr.git}"
APP_USER="${APP_USER:-ubuntu}"
APP_HOME="/home/${APP_USER}"
APP_PATH="${APP_PATH:-${APP_HOME}/GrandHR}"
API_DOMAIN="${API_DOMAIN:-api.grandhr.in}"
APP_PORT="${APP_PORT:-5000}"
NODE_MAJOR="${NODE_MAJOR:-20}"

log() { printf '\n\033[1;36m▶ %s\033[0m\n' "$*"; }

require_root() {
  if [[ $EUID -ne 0 ]]; then
    echo "This script must run as root. Re-run with: sudo $0" >&2
    exit 1
  fi
}

require_root

# -----------------------------------------------------------------------------
log "1/7 · Updating apt and installing system packages"
# -----------------------------------------------------------------------------
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl ca-certificates gnupg git ufw nginx build-essential

# -----------------------------------------------------------------------------
log "2/7 · Installing Node.js ${NODE_MAJOR}.x LTS (NodeSource)"
# -----------------------------------------------------------------------------
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v)" != v${NODE_MAJOR}* ]]; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs
fi
node -v
npm -v

# -----------------------------------------------------------------------------
log "3/7 · Installing pm2 globally"
# -----------------------------------------------------------------------------
if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi
pm2 -v

# -----------------------------------------------------------------------------
log "4/7 · Cloning / updating the repo at ${APP_PATH}"
# -----------------------------------------------------------------------------
# Clean up any stray manual-deploy artifacts in the home dir so they don't
# confuse anyone next time. (`backend/`, `backend.zip`, `package-lock.json`)
for stray in "${APP_HOME}/backend" "${APP_HOME}/backend.zip" "${APP_HOME}/package-lock.json"; do
  if [[ -e "$stray" && "$stray" != "$APP_PATH"* ]]; then
    log "Removing stray $stray"
    rm -rf "$stray"
  fi
done

if [[ ! -d "$APP_PATH/.git" ]]; then
  sudo -u "$APP_USER" git clone "$REPO_URL" "$APP_PATH"
else
  sudo -u "$APP_USER" git -C "$APP_PATH" fetch origin main
  sudo -u "$APP_USER" git -C "$APP_PATH" reset --hard origin/main
fi

# -----------------------------------------------------------------------------
log "5/7 · Installing backend dependencies, generating Prisma, building"
# -----------------------------------------------------------------------------
cd "$APP_PATH/backend"

# Seed .env from the example so the operator has a template to fill in.
if [[ ! -f .env ]]; then
  cp .env.example .env
  chown "$APP_USER:$APP_USER" .env
  chmod 600 .env
  log "ℹ  Created backend/.env from .env.example — FILL IN REAL VALUES BEFORE GOING LIVE."
fi

sudo -u "$APP_USER" npm ci
sudo -u "$APP_USER" npx prisma generate
sudo -u "$APP_USER" npm run build

# -----------------------------------------------------------------------------
log "6/7 · Starting the app under pm2"
# -----------------------------------------------------------------------------
# pm2 needs to run as the app user so its dump file lives in their home.
sudo -u "$APP_USER" -H bash <<'PM2_EOF'
set -e
cd "$HOME/GrandHR/backend"
if pm2 describe grandhr-api >/dev/null 2>&1; then
  pm2 restart grandhr-api --update-env
else
  pm2 start dist/index.js --name grandhr-api --time
fi
pm2 save
PM2_EOF

# Have pm2 launch on every reboot under the app user.
env PATH="$PATH:/usr/bin" pm2 startup systemd -u "$APP_USER" --hp "$APP_HOME" >/tmp/pm2-startup.log
bash -c "$(grep -E '^sudo ' /tmp/pm2-startup.log | tail -n 1 || true)" || true

# -----------------------------------------------------------------------------
log "7/7 · Configuring Nginx reverse proxy for ${API_DOMAIN}"
# -----------------------------------------------------------------------------
NGINX_SITE="/etc/nginx/sites-available/grandhr-api"
cat > "$NGINX_SITE" <<NGINX
# GrandHR API — reverse proxy from ${API_DOMAIN} to local Node app.
# Replaced by certbot once TLS is issued; the redirect/HTTPS server blocks
# below are added automatically by certbot --nginx.

server {
    listen 80;
    listen [::]:80;
    server_name ${API_DOMAIN};

    # Allow Let's Encrypt HTTP-01 challenges to flow through.
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Reasonable upload size for document uploads (10 MB matches express limit).
    client_max_body_size 12m;

    # Health endpoints — handy for an external uptime monitor.
    location = /healthz { proxy_pass http://127.0.0.1:${APP_PORT}; access_log off; }
    location = /readyz  { proxy_pass http://127.0.0.1:${APP_PORT}; access_log off; }

    location / {
        proxy_pass         http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header   Host              \$host;
        proxy_set_header   X-Real-IP         \$remote_addr;
        proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_set_header   Upgrade           \$http_upgrade;
        proxy_set_header   Connection        "upgrade";
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
    }
}
NGINX

ln -sfn "$NGINX_SITE" /etc/nginx/sites-enabled/grandhr-api
# Drop the default landing page so requests to plain $hostname don't 404.
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# -----------------------------------------------------------------------------
log "Configuring UFW firewall (allow OpenSSH + Nginx Full)"
# -----------------------------------------------------------------------------
ufw allow OpenSSH || true
ufw allow 'Nginx Full' || true
yes | ufw enable >/dev/null 2>&1 || true
ufw status

# -----------------------------------------------------------------------------
log "Installing certbot for HTTPS (issuance is manual — see next steps)"
# -----------------------------------------------------------------------------
if ! command -v certbot >/dev/null 2>&1; then
  apt-get install -y certbot python3-certbot-nginx
fi

cat <<DONE

══════════════════════════════════════════════════════════════════════════════
  ✅ EC2 backend bootstrap complete.

  Next steps (you do these once):

  1. Edit the env file with real secrets:
       sudo -u ${APP_USER} nano ${APP_PATH}/backend/.env

  2. Restart the app to pick up new env:
       sudo -u ${APP_USER} pm2 restart grandhr-api --update-env

  3. Point a DNS A record for ${API_DOMAIN} at this server's public IP.

  4. Once DNS resolves, issue TLS:
       sudo certbot --nginx -d ${API_DOMAIN} --redirect --agree-tos --no-eff-email -m hello@grandhr.in

  5. Smoke test:
       curl https://${API_DOMAIN}/healthz
       curl https://${API_DOMAIN}/readyz

  Useful commands afterwards:
     pm2 logs grandhr-api          # tail app logs
     pm2 status                    # process status
     sudo systemctl status nginx   # nginx status
     sudo certbot renew --dry-run  # confirm cert auto-renew works
══════════════════════════════════════════════════════════════════════════════
DONE
