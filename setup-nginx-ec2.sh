#!/bin/bash

# Nginx Setup Script for GrandHR Backend on EC2
# Run this script on your EC2 instance after connecting via SSH

set -e

echo "🔧 Setting up Nginx for GrandHR Backend..."

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run with sudo: sudo bash setup-nginx-ec2.sh"
    exit 1
fi

# Install Nginx if not already installed
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    apt update
    apt install -y nginx
else
    echo "✅ Nginx is already installed"
fi

# Create Nginx configuration file
echo "📝 Creating Nginx configuration..."
cat > /etc/nginx/sites-available/grandhr-backend << 'EOF'
server {
    listen 80;
    server_name _;  # Replace with your domain name or EC2 IP if needed

    # Increase body size limit for file uploads
    client_max_body_size 10M;

    # Logging
    access_log /var/log/nginx/grandhr-backend-access.log;
    error_log /var/log/nginx/grandhr-backend-error.log;

    # Proxy settings for backend API
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        
        # Headers for proper proxying
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Cache bypass
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint (optional)
    location /health {
        proxy_pass http://localhost:5000/api/health;
        access_log off;
    }
}
EOF

# Enable the site
echo "🔗 Enabling Nginx site..."
ln -sf /etc/nginx/sites-available/grandhr-backend /etc/nginx/sites-enabled/

# Remove default site (optional)
if [ -f /etc/nginx/sites-enabled/default ]; then
    echo "🗑️  Removing default Nginx site..."
    rm /etc/nginx/sites-enabled/default
fi

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
if nginx -t; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration has errors. Please check the configuration file."
    exit 1
fi

# Restart Nginx
echo "🔄 Restarting Nginx..."
systemctl restart nginx
systemctl enable nginx

# Check Nginx status
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx is running"
else
    echo "❌ Nginx failed to start. Check logs: sudo journalctl -u nginx"
    exit 1
fi

# Get EC2 public IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "YOUR_EC2_IP")

echo ""
echo "✅ Nginx setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update your frontend VITE_API_URL to: http://${PUBLIC_IP}/api"
echo "2. Test the backend: curl http://${PUBLIC_IP}/api/health"
echo "3. If you have a domain, update server_name in /etc/nginx/sites-available/grandhr-backend"
echo ""
echo "📝 Configuration file: /etc/nginx/sites-available/grandhr-backend"
echo "📝 Logs: /var/log/nginx/grandhr-backend-*.log"

