# Quick Backend Deployment Guide

## 🚀 Fastest Way: Railway (5 minutes)

### Step 1: MongoDB Atlas Setup (2 min)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) → Sign up (free)
2. Create **M0 FREE** cluster
3. **Database Access** → Add user (save username/password)
4. **Network Access** → Allow from anywhere (0.0.0.0/0)
5. **Database** → Connect → Get connection string
6. **Modify connection string:**
   ```
   mongodb+srv://<YOUR_ATLAS_USER>:<YOUR_ATLAS_PASSWORD>@cluster0.xxxxx.mongodb.net/grandhr?retryWrites=true&w=majority
   ```
   - Replace `USERNAME` and `PASSWORD`
   - Add `/grandhr` before `?` (database name)

### Step 2: Deploy to Railway (3 min)

1. Go to [Railway](https://railway.app) → Sign up with GitHub
2. **New Project** → Deploy from GitHub repo
3. Select your repo → Add **backend** folder as service
4. **Variables** tab → Add:
   ```env
   DATABASE_URL=mongodb+srv://<YOUR_ATLAS_USER>:<YOUR_ATLAS_PASSWORD>@cluster0.xxxxx.mongodb.net/grandhr?retryWrites=true&w=majority
   JWT_SECRET=generate-with-openssl-rand-base64-32
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend.amplifyapp.com
   ```
5. Railway auto-deploys → Copy URL

### Step 3: Update Frontend (1 min)

1. AWS Amplify Console → Environment Variables
2. Update `VITE_API_URL` to: `https://your-backend.railway.app/api`
3. Redeploy frontend

**Done!** ✅

---

## 🎨 Alternative: Render (Free Tier)

1. Go to [Render](https://render.com) → Sign up
2. **New Web Service** → Connect GitHub repo
3. Settings:
   - Root Directory: `backend`
   - Build: `npm install && npm run build`
   - Start: `npm start`
4. Add environment variables (same as Railway)
5. Deploy → Copy URL
6. Update frontend `VITE_API_URL`

**Note:** Free tier spins down after 15 min inactivity (first request takes ~30s)

---

## 📝 Required Environment Variables

```env
DATABASE_URL=mongodb+srv://<YOUR_ATLAS_USER>:<YOUR_ATLAS_PASSWORD>@cluster.mongodb.net/grandhr?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.amplifyapp.com
```

---

## ✅ Verify Deployment

1. Check backend health: `https://your-backend-url/api/health`
2. Test from frontend: Try login/register
3. Check logs in deployment platform

---

## 🔗 Full Guide

See `BACKEND_DEPLOYMENT.md` for detailed instructions and troubleshooting.

