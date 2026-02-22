#!/bin/bash

# GrandHR EC2 Quick Setup Script
# Run on EC2 after SSH:  sudo bash ec2-quick-setup.sh
# Best run from:  cd ~/grandhr && sudo bash ec2-quick-setup.sh

set -e

echo "🚀 GrandHR EC2 Quick Setup"
echo "=========================="

# Must run as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Run with sudo: sudo bash ec2-quick-setup.sh"
    exit 1
fi

REPO_DIR="/home/ubuntu/grandhr"
BACKEND_DIR="$REPO_DIR/backend"

# --- 1. System update ---
echo ""
echo "📦 Step 1/6: Updating system..."
apt-get update -qq
apt-get upgrade -y -qq

# --- 2. Install Node.js 18 ---
echo ""
echo "📦 Step 2/6: Installing Node.js 18..."
if ! command -v node &> /dev/null || [[ $(node -v | cut -d. -f1 | tr -d 'v') -lt 18 ]]; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - > /dev/null 2>&1
    apt-get install -y nodejs > /dev/null 2>&1
fi
echo "   Node: $(node -v)  npm: $(npm -v)"

# --- 3. Install PM2 and Git ---
echo ""
echo "📦 Step 3/6: Installing PM2 and Git..."
npm install -g pm2 > /dev/null 2>&1
apt-get install -y git > /dev/null 2>&1

# --- 4. Pull code and build backend ---
echo ""
echo "📦 Step 4/6: Pulling repo and building backend..."
if [ ! -d "$REPO_DIR" ]; then
    echo "   Cloning repo..."
    sudo -u ubuntu git clone https://github.com/manishisspecial/grandhr.git "$REPO_DIR"
else
    echo "   Pulling latest..."
    (cd "$REPO_DIR" && sudo -u ubuntu git pull origin main || true)
fi

if [ ! -f "$BACKEND_DIR/package.json" ]; then
    echo "❌ Backend not found at $BACKEND_DIR"
    exit 1
fi

echo "   Installing dependencies..."
(cd "$BACKEND_DIR" && sudo -u ubuntu npm install --silent)
echo "   Building..."
(cd "$BACKEND_DIR" && sudo -u ubuntu npm run build)

# --- 5. PM2 start/restart ---
echo ""
echo "📦 Step 5/6: Starting backend with PM2..."
sudo -u ubuntu pm2 delete grandhr-backend 2>/dev/null || true
sudo -u ubuntu sh -c "cd $BACKEND_DIR && pm2 start dist/index.js --name grandhr-backend"
sudo -u ubuntu pm2 save
# Setup startup script if not already
sudo -u ubuntu pm2 startup systemd -u ubuntu --hp /home/ubuntu 2>/dev/null || true

# --- 6. Nginx ---
echo ""
echo "📦 Step 6/6: Configuring Nginx..."
apt-get install -y nginx > /dev/null 2>&1

cat > /etc/nginx/sites-available/grandhr-backend << 'NGINX_EOF'
server {
    listen 80;
    server_name _;
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
NGINX_EOF

ln -sf /etc/nginx/sites-available/grandhr-backend /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
systemctl enable nginx

# --- Done ---
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "YOUR_EC2_IP")

echo ""
echo "✅ Quick setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Ensure backend .env exists:  nano $BACKEND_DIR/.env"
echo "   Required: DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, PORT=5000, CORS_ORIGIN"
echo "2. Restart backend after editing .env:  sudo -u ubuntu pm2 restart grandhr-backend"
echo "3. Test API:  curl http://$PUBLIC_IP/api/health"
echo "4. Set frontend VITE_API_URL to:  http://$PUBLIC_IP/api"
echo ""
