# Quick EC2 Deployment Guide

## 🚀 Fast Track (15 minutes)

### Step 1: MongoDB Atlas (2 min)
1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) → Create M0 FREE cluster
2. **Database Access** → Add user (save credentials)
3. **Network Access** → Allow from anywhere (0.0.0.0/0)
4. **Database** → Connect → Get connection string
5. **Modify:** Add `/grandhr` before `?` in connection string

### Step 2: Launch EC2 (3 min)
1. AWS Console → EC2 → Launch Instance
2. **OS:** Ubuntu 22.04 LTS
3. **Type:** t2.micro (free tier) or t3.small
4. **Key Pair:** Create new → Download `.pem` file
5. **Security Group:** Allow SSH (22), HTTP (80), HTTPS (443)
6. Launch → Note Public IP

### Step 3: Connect to EC2 (1 min)

**Windows (PuTTY):**
```bash
# Convert .pem to .ppk with PuTTYgen
# Connect: ubuntu@YOUR_EC2_IP
```

**Mac/Linux:**
```bash
chmod 400 key.pem
ssh -i key.pem ubuntu@YOUR_EC2_IP
```

### Step 4: Install Software (3 min)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Git
sudo apt install -y git
```

### Step 5: Deploy Code (3 min)

```bash
# Clone repo
cd ~
git clone https://github.com/manishisspecial/grandhr.git
cd grandhr/backend

# Install and build
npm install
npm run build
```

### Step 6: Configure Environment (2 min)

```bash
# Create .env file
nano .env
```

Paste and update (use your Atlas credentials in place of the placeholders — do not commit real values):
```env
DATABASE_URL=mongodb+srv://<YOUR_ATLAS_USER>:<YOUR_ATLAS_PASSWORD>@cluster.mongodb.net/grandhr?retryWrites=true&w=majority
JWT_SECRET=generate-with-openssl-rand-base64-32
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://your-frontend.amplifyapp.com
```

Save: `Ctrl+X`, `Y`, `Enter`

### Step 7: Start Backend (1 min)

```bash
# Start with PM2
pm2 start dist/index.js --name grandhr-backend

# Auto-start on reboot
pm2 startup
# Run the command it shows
pm2 save
```

### Step 8: Test (1 min)

```bash
# Check status
pm2 status

# View logs
pm2 logs grandhr-backend

# Test from local machine
curl http://YOUR_EC2_IP/api/health
```

### Step 9: Update Frontend

1. AWS Amplify → Environment Variables
2. Update `VITE_API_URL` to: `http://YOUR_EC2_IP/api`
3. Redeploy frontend

**Done!** ✅

---

## 🔧 Optional: Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install -y nginx

# Create config
sudo nano /etc/nginx/sites-available/grandhr-backend
```

Paste:
```nginx
server {
    listen 80;
    server_name YOUR_EC2_IP;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable:
```bash
sudo ln -s /etc/nginx/sites-available/grandhr-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 Optional: SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate (requires domain)
sudo certbot --nginx -d your-domain.com
```

---

## 📝 Quick Commands

```bash
# View logs
pm2 logs grandhr-backend

# Restart app
pm2 restart grandhr-backend

# Update code
cd ~/grandhr && git pull && cd backend && npm install && npm run build && pm2 restart grandhr-backend

# Check status
pm2 status

# Monitor
pm2 monit
```

---

## 🛡️ Security Checklist

- [ ] Security group: Restrict SSH to your IP
- [ ] MongoDB: Restrict network access to EC2 IP
- [ ] Strong JWT_SECRET (32+ characters)
- [ ] UFW firewall enabled
- [ ] System updated (`sudo apt update && sudo apt upgrade`)

---

## 📖 Full Guide

See `EC2_DEPLOYMENT.md` for detailed instructions.

