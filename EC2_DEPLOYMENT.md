# AWS EC2 Backend Deployment Guide - GrandHR

## 📋 Prerequisites

1. **AWS Account** with EC2 access
2. **MongoDB Atlas Account** (Free tier available)
3. **Domain name** (optional, for custom domain)
4. **SSH client** (PuTTY for Windows, or built-in SSH for Mac/Linux)

---

## 🗄️ Step 1: Set Up MongoDB Atlas

### 1.1 Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up/Login
3. Click **"Create"** → **"Cluster"**
4. Select **"M0 FREE"** tier
5. Choose AWS as cloud provider and select a region
6. Click **"Create Cluster"** (takes 3-5 minutes)

### 1.2 Create Database User

1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter username and password (save these!)
5. Set privileges: **"Atlas Admin"** or **"Read and write to any database"**
6. Click **"Add User"**

### 1.3 Configure Network Access

1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ **Note:** For production, you can restrict to your EC2 instance IP later
4. Click **"Confirm"**

### 1.4 Get Connection String

1. Go to **"Database"** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **"Node.js"** and version **"5.5 or later"**
5. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Modify it** to include database name:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/grandhr?retryWrites=true&w=majority
   ```
   - Replace `<username>` with your database user
   - Replace `<password>` with your database password
   - Add `/grandhr` before the `?` (database name)

**Save this connection string!** You'll need it later.

---

## ☁️ Step 2: Launch EC2 Instance

### 2.1 Create EC2 Instance

1. Go to [AWS Console](https://console.aws.amazon.com)
2. Navigate to **EC2** service
3. Click **"Launch Instance"**

### 2.2 Configure Instance

**Name and tags:**
- Name: `grandhr-backend` (or any name)

**Application and OS Images:**
- Choose **Ubuntu Server 22.04 LTS** (or latest LTS)
- Architecture: **64-bit (x86)**

**Instance type:**
- For testing: **t2.micro** (Free tier eligible)
- For production: **t3.small** or **t3.medium** (recommended)

**Key pair:**
- Click **"Create new key pair"**
- Name: `grandhr-backend-key`
- Key pair type: **RSA**
- Private key file format: **.pem** (for Linux/Mac) or **.ppk** (for Windows/PuTTY)
- Click **"Create key pair"**
- **⚠️ IMPORTANT:** Download and save the key file securely!

**Network settings:**
- **Allow SSH traffic from:** Your IP (or 0.0.0.0/0 for testing)
- **Allow HTTP traffic from:** 0.0.0.0/0
- **Allow HTTPS traffic from:** 0.0.0.0/0

**Configure storage:**
- Size: **20 GB** (minimum, increase for production)
- Volume type: **gp3** (default)

### 2.3 Launch Instance

1. Review settings
2. Click **"Launch Instance"**
3. Wait for instance to be **"Running"** (green status)

### 2.4 Get Instance Details

1. Click on your instance
2. Note the **Public IPv4 address** (e.g., `54.123.45.67`)
3. Note the **Security Group** name

---

## 🔒 Step 3: Configure Security Group

1. In EC2 console, go to **"Security Groups"** (left sidebar)
2. Select your instance's security group
3. Click **"Edit inbound rules"**
4. Add/Verify these rules:

| Type | Protocol | Port Range | Source | Description |
|------|----------|------------|--------|-------------|
| SSH | TCP | 22 | Your IP / 0.0.0.0/0 | SSH access |
| HTTP | TCP | 80 | 0.0.0.0/0 | HTTP traffic |
| HTTPS | TCP | 443 | 0.0.0.0/0 | HTTPS traffic |
| Custom TCP | TCP | 5000 | 0.0.0.0/0 | Backend API (optional, for testing) |

5. Click **"Save rules"**

---

## 🔐 Step 4: Connect to EC2 Instance

### For Windows (PuTTY):

1. **Convert .pem to .ppk:**
   - Open PuTTYgen
   - Click **"Load"** → Select your `.pem` file
   - Click **"Save private key"** → Save as `.ppk`

2. **Connect with PuTTY:**
   - Host Name: `ubuntu@YOUR_EC2_IP` (replace YOUR_EC2_IP)
   - Port: `22`
   - Connection type: **SSH**
   - Under **"SSH"** → **"Auth"** → Browse and select your `.ppk` file
   - Click **"Open"**

### For Mac/Linux:

```bash
# Make key file executable
chmod 400 grandhr-backend-key.pem

# Connect to EC2
ssh -i grandhr-backend-key.pem ubuntu@YOUR_EC2_IP
```

Replace `YOUR_EC2_IP` with your actual EC2 public IP address.

---

## 🛠️ Step 5: Install Required Software

Once connected to EC2, run these commands:

### 5.1 Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### 5.2 Install Node.js 18.x

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version
```

### 5.3 Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

PM2 will keep your Node.js app running and restart it automatically if it crashes.

### 5.4 Install Git

```bash
sudo apt install -y git
```

### 5.5 Install Nginx (Optional, for reverse proxy)

```bash
sudo apt install -y nginx
```

---

## 📦 Step 6: Deploy Backend Code

### 6.1 Clone Repository

```bash
# Navigate to home directory
cd ~

# Clone your repository
git clone https://github.com/manishisspecial/grandhr.git

# Navigate to backend directory
cd grandhr/backend
```

**Note:** If your repo is private, you'll need to:
- Set up SSH keys on EC2, or
- Use a personal access token

### 6.2 Install Dependencies

```bash
cd ~/grandhr/backend
npm install
```

### 6.3 Build the Application

```bash
npm run build
```

This will:
- Generate Prisma client
- Compile TypeScript to JavaScript

---

## ⚙️ Step 7: Configure Environment Variables

### 7.1 Create .env File

```bash
cd ~/grandhr/backend
nano .env
```

### 7.2 Add Environment Variables

Paste the following and update with your values:

```env
# MongoDB Atlas Connection
DATABASE_URL=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/grandhr?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS Configuration (Update with your Amplify frontend URL)
CORS_ORIGIN=https://your-frontend.amplifyapp.com

# MongoDB is the only database used - no Supabase needed
```

**Important:**
- Replace `USERNAME` and `PASSWORD` with your MongoDB Atlas credentials
- Generate a strong `JWT_SECRET`: `openssl rand -base64 32`
- Replace `your-frontend.amplifyapp.com` with your actual Amplify frontend URL
- URL-encode special characters in passwords if needed

### 7.3 Save and Exit

- Press `Ctrl + X`
- Press `Y` to confirm
- Press `Enter` to save

---

## 🚀 Step 8: Start Backend with PM2

### 8.1 Start Application

```bash
cd ~/grandhr/backend
pm2 start dist/index.js --name grandhr-backend
```

### 8.2 Configure PM2 to Start on Boot

```bash
pm2 startup
# Copy and run the command it shows (usually starts with 'sudo env PATH=...')
pm2 save
```

### 8.3 Check Status

```bash
pm2 status
pm2 logs grandhr-backend
```

### 8.4 Useful PM2 Commands

```bash
# View logs
pm2 logs grandhr-backend

# Restart app
pm2 restart grandhr-backend

# Stop app
pm2 stop grandhr-backend

# View app info
pm2 info grandhr-backend

# Monitor resources
pm2 monit
```

---

## 🌐 Step 9: Configure Nginx (Reverse Proxy)

This step is optional but recommended for production. It allows you to:
- Use port 80/443 instead of 5000
- Add SSL/HTTPS
- Better security

### 9.1 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/grandhr-backend
```

### 9.2 Add Configuration

Paste the following:

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Replace `YOUR_DOMAIN_OR_IP` with:
- Your domain name (if you have one), or
- Your EC2 public IP address

### 9.3 Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/grandhr-backend /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 9.4 Test

Open browser and go to:
- `http://YOUR_EC2_IP/api/health` (should work)
- Or `http://YOUR_DOMAIN/api/health` (if you have a domain)

---

## 🔒 Step 10: Set Up SSL with Let's Encrypt (Optional but Recommended)

If you have a domain name, set up HTTPS:

### 10.1 Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 10.2 Get SSL Certificate

```bash
sudo certbot --nginx -d your-domain.com
```

Follow the prompts:
- Enter your email
- Agree to terms
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

### 10.3 Auto-Renewal

Certbot sets up auto-renewal automatically. Test it:

```bash
sudo certbot renew --dry-run
```

---

## 🔄 Step 11: Set Up Auto-Deployment (Optional)

### 11.1 Create Deployment Script

```bash
cd ~
nano deploy-backend.sh
```

Paste:

```bash
#!/bin/bash
cd ~/grandhr
git pull origin main
cd backend
npm install
npm run build
pm2 restart grandhr-backend
echo "Deployment complete!"
```

Make it executable:

```bash
chmod +x deploy-backend.sh
```

### 11.2 Deploy Updates

When you push code to GitHub:

```bash
./deploy-backend.sh
```

---

## ✅ Step 12: Verify Deployment

### 12.1 Test Backend

```bash
# From your local machine
curl http://YOUR_EC2_IP/api/health

# Or with domain
curl https://your-domain.com/api/health
```

### 12.2 Check Logs

```bash
# On EC2
pm2 logs grandhr-backend
```

### 12.3 Test from Frontend

1. Update Amplify environment variable:
   - `VITE_API_URL=http://YOUR_EC2_IP/api` (or `https://your-domain.com/api`)
2. Redeploy frontend
3. Test login/register from frontend

---

## 🔧 Step 13: Update Frontend API URL

1. Go to **AWS Amplify Console**
2. Navigate to your frontend app
3. Go to **"Environment variables"**
4. Update `VITE_API_URL` to:
   - `http://YOUR_EC2_IP/api` (HTTP)
   - Or `https://your-domain.com/api` (HTTPS - recommended)
5. Redeploy frontend

---

## 🛡️ Security Best Practices

### 1. Restrict SSH Access

Edit security group to allow SSH only from your IP:
- Type: SSH
- Source: `YOUR_IP/32` (instead of 0.0.0.0/0)

### 2. Use Strong Passwords

- MongoDB Atlas: Use strong password
- JWT_SECRET: Use `openssl rand -base64 32`

### 3. Keep System Updated

```bash
# Run periodically
sudo apt update && sudo apt upgrade -y
```

### 4. Firewall (UFW)

```bash
# Install UFW
sudo apt install -y ufw

# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

### 5. Restrict MongoDB Network Access

In MongoDB Atlas:
- Go to Network Access
- Remove `0.0.0.0/0`
- Add your EC2 instance IP: `YOUR_EC2_IP/32`

---

## 📊 Monitoring

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# View app metrics
pm2 show grandhr-backend
```

### System Resources

```bash
# CPU and memory
htop

# Disk usage
df -h

# Network
sudo netstat -tulpn
```

### CloudWatch (AWS)

1. Go to **CloudWatch** in AWS Console
2. View EC2 metrics:
   - CPU utilization
   - Network in/out
   - Disk read/write

---

## 🔧 Troubleshooting

### Backend Not Starting

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs grandhr-backend --lines 100

# Check if port is in use
sudo netstat -tulpn | grep 5000
```

### MongoDB Connection Failed

1. **Check connection string:**
   ```bash
   cat ~/grandhr/backend/.env | grep DATABASE_URL
   ```

2. **Test connection:**
   ```bash
   # Install MongoDB shell (optional)
   # Test from EC2 if MongoDB allows connections
   ```

3. **Check MongoDB Atlas:**
   - Network Access: Ensure EC2 IP is allowed
   - Database User: Verify credentials

### Nginx Not Working

```bash
# Check Nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log
```

### Port 5000 Not Accessible

1. **Check security group:** Ensure port 5000 is open
2. **Check firewall:** `sudo ufw status`
3. **Check if app is running:** `pm2 status`

### Can't Connect via SSH

1. **Check security group:** SSH (port 22) must be open
2. **Check key file permissions:** `chmod 400 key.pem`
3. **Verify IP address:** Use correct public IP

---

## 📝 Environment Variables Reference

Required variables in `~/grandhr/backend/.env`:

```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/grandhr?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-min-32-characters
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://your-frontend.amplifyapp.com
```

---

## 🔄 Updating the Backend

### Manual Update

```bash
cd ~/grandhr
git pull origin main
cd backend
npm install
npm run build
pm2 restart grandhr-backend
```

### Using Deployment Script

```bash
~/deploy-backend.sh
```

---

## 💰 Cost Optimization

1. **Use t2.micro** for testing (Free tier eligible)
2. **Stop instance** when not in use (to save costs)
3. **Use Reserved Instances** for long-term (save up to 75%)
4. **Monitor usage** with AWS Cost Explorer

---

## 🎉 Success Checklist

- [ ] EC2 instance is running
- [ ] MongoDB Atlas cluster is created and accessible
- [ ] Backend code is deployed
- [ ] Environment variables are set
- [ ] PM2 is running the app
- [ ] Nginx is configured (optional)
- [ ] SSL certificate is installed (if using domain)
- [ ] Security group is configured
- [ ] Frontend API URL is updated
- [ ] Backend is accessible from frontend
- [ ] Authentication works (login/register)

---

## 📞 Next Steps

1. **Set up domain** (optional but recommended)
2. **Configure monitoring** (CloudWatch, PM2 Plus)
3. **Set up backups** (MongoDB Atlas backups)
4. **Configure auto-scaling** (if needed)
5. **Set up CI/CD** (GitHub Actions for auto-deploy)

---

**Your backend is now deployed on EC2!** 🚀

For issues, check:
- PM2 logs: `pm2 logs grandhr-backend`
- Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- System logs: `sudo journalctl -u nginx`

