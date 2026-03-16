#!/bin/bash
set -e

echo "============================================"
echo "  GrandHR Backend - EC2 Production Setup"
echo "============================================"
echo ""

DOMAIN="api.grandhr.in"
BACKEND_DIR="$HOME/grandhr/backend"
REPO_DIR="$HOME/grandhr"

# ----------------------------
# 1. System updates & packages
# ----------------------------
echo "[1/8] Installing system packages..."
sudo apt update -y
sudo apt install -y curl git nginx certbot python3-certbot-nginx

# ----------------------------
# 2. Install Node.js 20 LTS
# ----------------------------
if ! command -v node &>/dev/null || [[ "$(node -v)" != v20* ]]; then
  echo "[2/8] Installing Node.js 20 LTS..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
else
  echo "[2/8] Node.js $(node -v) already installed."
fi

# ----------------------------
# 3. Install PM2
# ----------------------------
if ! command -v pm2 &>/dev/null; then
  echo "[3/8] Installing PM2..."
  sudo npm install -g pm2
  pm2 startup systemd -u "$USER" --hp "$HOME" | tail -1 | bash || true
else
  echo "[3/8] PM2 already installed."
fi

# ----------------------------
# 4. Pull latest code
# ----------------------------
echo "[4/8] Pulling latest code..."
cd "$REPO_DIR"
git pull origin main || echo "Warning: git pull failed, continuing with existing code..."

# ----------------------------
# 5. Backend setup
# ----------------------------
echo "[5/8] Setting up backend..."
cd "$BACKEND_DIR"

npm install

# Create .env if missing
if [ ! -f .env ]; then
  echo "Creating .env file..."
  JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
  cat > .env << ENVEOF
PORT=5000
NODE_ENV=production

# MongoDB - UPDATE THIS with your MongoDB Atlas connection string
DATABASE_URL="mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/grandhr?retryWrites=true&w=majority"

JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d

CORS_ORIGIN=https://grandhr.in,https://www.grandhr.in
FRONTEND_URL=https://grandhr.in

# Email (update with your SMTP credentials)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=support@grandhr.in
# SMTP_PASS=your-app-password
# EMAIL_FROM=noreply@grandhr.in
ENVEOF
  echo ""
  echo "=========================================="
  echo "  IMPORTANT: Edit .env with your actual"
  echo "  MongoDB URI and SMTP credentials!"
  echo "  Run: nano $BACKEND_DIR/.env"
  echo "=========================================="
  echo ""
fi

npx prisma generate
npm run build

# ----------------------------
# 6. Start backend with PM2
# ----------------------------
echo "[6/8] Starting backend with PM2..."
pm2 delete grandhr-backend 2>/dev/null || true
pm2 start dist/index.js --name grandhr-backend --env production
pm2 save

# ----------------------------
# 7. Nginx config (HTTP first for Certbot)
# ----------------------------
echo "[7/8] Configuring Nginx..."

sudo tee /etc/nginx/sites-available/grandhr-backend > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name api.grandhr.in;

    client_max_body_size 10M;

    access_log /var/log/nginx/grandhr-backend-access.log;
    error_log /var/log/nginx/grandhr-backend-error.log;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        proxy_cache_bypass $http_upgrade;
    }

    location /health {
        proxy_pass http://localhost:5000/api/health;
        access_log off;
    }
}
NGINXEOF

sudo ln -sf /etc/nginx/sites-available/grandhr-backend /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# ----------------------------
# 8. SSL with Let's Encrypt
# ----------------------------
echo "[8/8] Setting up SSL certificate..."
echo ""
echo "Make sure DNS A record for $DOMAIN points to this server's public IP."
echo ""
read -p "Is DNS configured? Proceed with SSL? (y/n): " SETUP_SSL

if [[ "$SETUP_SSL" == "y" || "$SETUP_SSL" == "Y" ]]; then
  sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m support@grandhr.in || {
    echo "Certbot failed. You can run it manually later:"
    echo "  sudo certbot --nginx -d $DOMAIN"
  }
  sudo systemctl restart nginx
fi

echo ""
echo "============================================"
echo "  Setup Complete!"
echo "============================================"
echo ""
echo "Backend status:"
pm2 status
echo ""
echo "Test the API:"
echo "  curl https://$DOMAIN/api/health"
echo ""
echo "View logs:"
echo "  pm2 logs grandhr-backend"
echo ""
echo "IMPORTANT next steps:"
echo "  1. Edit .env if not done: nano $BACKEND_DIR/.env"
echo "  2. Ensure DNS A record: $DOMAIN -> $(curl -s ifconfig.me)"
echo "  3. If SSL skipped: sudo certbot --nginx -d $DOMAIN"
echo ""
