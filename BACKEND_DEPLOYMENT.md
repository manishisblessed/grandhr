# Backend Deployment Guide - GrandHR

## 📋 Prerequisites

1. **MongoDB Atlas Account** (Free tier available)
   - Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster (M0 - Free tier)

2. **GitHub Repository** (Already done ✅)

3. **Deployment Platform Account**:
   - **Railway** (Recommended - Easiest)
   - **Render** (Free tier available)
   - **Fly.io** (Global deployment)

---

## 🗄️ Step 1: Set Up MongoDB Atlas

### 1.1 Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up/Login
3. Click **"Create"** → **"Cluster"**
4. Select **"M0 FREE"** tier
5. Choose your preferred cloud provider and region
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
3. For development: Click **"Add Current IP Address"**
4. For production: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ **Note:** This allows any IP to connect. For production, restrict to your deployment platform IPs.
5. Click **"Confirm"**

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

### 1.5 Test Connection (Optional)

You can test the connection string locally:
```bash
cd backend
# Add DATABASE_URL to .env
npm run dev
```

---

## 🚂 Option 1: Deploy to Railway (Recommended)

Railway is the easiest option with automatic MongoDB Atlas integration.

### Step 1: Sign Up

1. Go to [Railway](https://railway.app)
2. Sign up with GitHub
3. Authorize Railway to access your repositories

### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Select your repository: `manishisspecial/grandhr` (or your repo)
4. Railway will detect it's a monorepo

### Step 3: Configure Backend Service

1. Railway will show both `frontend` and `backend` folders
2. Click on **"backend"** or add a new service
3. Click **"Add Service"** → **"GitHub Repo"**
4. Select your repo and set:
   - **Root Directory:** `backend`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`

### Step 4: Add MongoDB Database

1. In your Railway project, click **"New"**
2. Select **"Database"** → **"Add MongoDB"**
3. Railway will create a MongoDB instance (or you can use MongoDB Atlas)
4. Copy the connection string

**OR** Use MongoDB Atlas:
1. Click **"Variables"** tab
2. Add environment variable:
   - **Key:** `DATABASE_URL`
   - **Value:** Your MongoDB Atlas connection string

### Step 5: Configure Environment Variables

In Railway, go to **"Variables"** tab and add:

```env
DATABASE_URL=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/grandhr?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://your-frontend-amplify-url.amplifyapp.com
```

**Important:**
- Replace `<username>` and `<password>` with your MongoDB Atlas credentials
- Replace `your-frontend-amplify-url.amplifyapp.com` with your actual Amplify frontend URL
- Use a strong `JWT_SECRET` (generate with: `openssl rand -base64 32`)

### Step 6: Deploy

1. Railway will automatically deploy when you push to GitHub
2. Or click **"Deploy"** manually
3. Wait for deployment to complete
4. Copy the generated URL (e.g., `https://your-backend.railway.app`)

### Step 7: Update Frontend API URL

1. Go to your **AWS Amplify** console
2. Go to **"Environment variables"**
3. Update `VITE_API_URL` to:
   ```
   https://your-backend.railway.app/api
   ```
4. Redeploy frontend (or wait for auto-deploy)

---

## 🎨 Option 2: Deploy to Render (Free Tier)

Render offers a free tier with some limitations.

### Step 1: Sign Up

1. Go to [Render](https://render.com)
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 2: Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select your repository: `manishisspecial/grandhr`

### Step 3: Configure Service

**Settings:**
- **Name:** `grandhr-backend` (or any name)
- **Root Directory:** `backend`
- **Environment:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Plan:** Free (or paid for better performance)

### Step 4: Add Environment Variables

Scroll down to **"Environment Variables"** and add:

```env
DATABASE_URL=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/grandhr?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://your-frontend-amplify-url.amplifyapp.com
```

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will build and deploy automatically
3. Wait for deployment (first deploy takes 5-10 minutes)
4. Copy the URL (e.g., `https://grandhr-backend.onrender.com`)

**Note:** Free tier services spin down after 15 minutes of inactivity. First request after spin-down takes ~30 seconds.

### Step 6: Update Frontend

Update `VITE_API_URL` in Amplify to your Render URL.

---

## 🪰 Option 3: Deploy to Fly.io

Fly.io offers global deployment with good performance.

### Step 1: Install Fly CLI

```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Mac/Linux
curl -L https://fly.io/install.sh | sh
```

### Step 2: Sign Up

```bash
fly auth signup
```

### Step 3: Create Fly App

```bash
cd backend
fly launch
```

Follow the prompts:
- App name: `grandhr-backend` (or choose your own)
- Region: Choose closest to your users
- PostgreSQL: No (we're using MongoDB)
- Redis: No (optional)

### Step 4: Configure Environment Variables

```bash
fly secrets set DATABASE_URL="mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/grandhr?retryWrites=true&w=majority"
fly secrets set JWT_SECRET="your-super-secret-jwt-key"
fly secrets set JWT_EXPIRES_IN="7d"
fly secrets set NODE_ENV="production"
fly secrets set CORS_ORIGIN="https://your-frontend-amplify-url.amplifyapp.com"
```

### Step 5: Deploy

```bash
fly deploy
```

### Step 6: Get URL

```bash
fly status
# Or check in Fly.io dashboard
```

---

## ✅ Post-Deployment Checklist

- [ ] Backend is accessible (check health endpoint)
- [ ] MongoDB connection is working
- [ ] Environment variables are set correctly
- [ ] CORS is configured for frontend URL
- [ ] Frontend `VITE_API_URL` is updated
- [ ] Test authentication (login/register)
- [ ] Test API endpoints from frontend
- [ ] Check logs for any errors

---

## 🔧 Troubleshooting

### Backend Not Starting

1. **Check logs** in your deployment platform
2. **Verify environment variables** are set correctly
3. **Check MongoDB connection string** format
4. **Verify MongoDB network access** allows your deployment platform IPs

### MongoDB Connection Failed

1. **Check connection string** format:
   - Must start with `mongodb://` or `mongodb+srv://`
   - Must include database name: `/grandhr`
   - Username and password must be URL-encoded (special characters)

2. **Check Network Access:**
   - MongoDB Atlas → Network Access
   - Add `0.0.0.0/0` for all IPs (or specific platform IPs)

3. **Check Database User:**
   - Verify username/password are correct
   - User must have read/write permissions

### CORS Errors

1. **Update CORS_ORIGIN** in backend environment variables:
   ```
   CORS_ORIGIN=https://your-frontend-amplify-url.amplifyapp.com
   ```

2. **For multiple origins:**
   ```
   CORS_ORIGIN=https://frontend1.amplifyapp.com,https://frontend2.amplifyapp.com
   ```

### Environment Variables Not Working

1. **Restart the service** after adding/changing variables
2. **Check variable names** (case-sensitive)
3. **Verify no extra spaces** in values
4. **Check quotes** - some platforms need quotes, others don't

---

## 📝 Environment Variables Reference

### Required Variables

```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/grandhr?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://your-frontend-url.amplifyapp.com
```

### Optional Variables

```env
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=30d
# MongoDB is the only database used - no Supabase needed
```

---

## 🔗 Update Frontend After Deployment

1. **Get your backend URL:**
   - Railway: `https://your-backend.railway.app`
   - Render: `https://your-backend.onrender.com`
   - Fly.io: `https://your-backend.fly.dev`

2. **Update Amplify Environment Variables:**
   - Go to AWS Amplify Console
   - Environment Variables
   - Update `VITE_API_URL` to: `https://your-backend-url/api`
   - Redeploy frontend

3. **Test the connection:**
   - Open your frontend
   - Try logging in
   - Check browser console for API errors

---

## 🎉 Success!

Once deployed, your backend will be accessible at:
- **Railway:** `https://your-backend.railway.app`
- **Render:** `https://your-backend.onrender.com`
- **Fly.io:** `https://your-backend.fly.dev`

Your frontend (Amplify) will connect to this backend, and MongoDB Atlas will store all your data!

---

## 💡 Pro Tips

1. **Use MongoDB Atlas** (not local MongoDB) for production
2. **Set up database backups** in MongoDB Atlas
3. **Monitor your deployment** logs regularly
4. **Use strong JWT secrets** (generate with: `openssl rand -base64 32`)
5. **Restrict MongoDB network access** to specific IPs in production
6. **Set up alerts** for deployment failures
7. **Use environment-specific variables** (dev/staging/prod)

---

**Need help?** Check the deployment platform logs or MongoDB Atlas connection issues.

