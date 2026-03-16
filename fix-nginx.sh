#!/bin/bash
cat > /tmp/api.grandhr.in.conf << 'NGINXEOF'
server {
    server_name api.grandhr.in;

    client_max_body_size 10M;

    access_log /var/log/nginx/grandhr-backend-access.log;
    error_log /var/log/nginx/grandhr-backend-error.log;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_cache_bypass $http_upgrade;
    }

    location /health {
        proxy_pass http://127.0.0.1:5000/api/health;
        access_log off;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/api.grandhr.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.grandhr.in/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    if ($host = api.grandhr.in) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    server_name api.grandhr.in;
    return 404;
}
NGINXEOF

sudo cp /tmp/api.grandhr.in.conf /etc/nginx/sites-available/api.grandhr.in
sudo ln -sf /etc/nginx/sites-available/api.grandhr.in /etc/nginx/sites-enabled/api.grandhr.in
sudo nginx -t && sudo systemctl reload nginx && echo "Nginx updated successfully!"
