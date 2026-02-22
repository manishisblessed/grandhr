# AWS Amplify Deployment Guide - GrandHR Frontend

## 📋 Prerequisites

1. AWS Account with Amplify access
2. GitHub repository with code pushed (already done ✅)
3. Environment variables ready (Backend API URL)

## 🚀 Step-by-Step Deployment

### Step 1: Connect Repository to Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click **"New app"** → **"Host web app"**
3. Select **GitHub** as your source
4. Authorize AWS Amplify to access your GitHub account
5. Select your repository: `manishisspecial/grandhr` (or your repo name)
6. Select the branch: `main` (or your default branch)

### Step 2: Configure Build Settings

Amplify will auto-detect the `amplify.yml` file in the root. The configuration is already set up:

**Build Settings (Auto-detected from amplify.yml):**
- **App root directory:** Leave empty (or set to `/` if prompted)
- **Build command:** `cd frontend && npm ci && npm run build` (handled by amplify.yml)
- **Output directory:** `frontend/dist` (handled by amplify.yml)

**Note:** The `amplify.yml` file handles:
- Changing to the `frontend/` directory
- Installing dependencies with `npm ci`
- Building the app with `npm run build`
- Outputting to `frontend/dist`

### Step 3: Configure Environment Variables

In the Amplify console, go to **"Environment variables"** and add:

#### Required Variables:

```env
VITE_API_URL=https://your-backend-url.com/api
```

**How to get this value:**

1. **VITE_API_URL:**
   - Use your deployed backend URL
   - Format: `https://your-backend.railway.app/api` (Railway)
   - Or: `https://your-backend.onrender.com/api` (Render)
   - Or: `https://your-ec2-ip/api` (EC2)
   - Or: `https://your-backend-domain.com/api` (Custom domain)

#### Optional Variables (if using Razorpay):

```env
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
```

**How to get Razorpay key:**
- Get from Razorpay Dashboard (if using payments)

### Step 4: Review and Deploy

1. Review all settings
2. Click **"Save and deploy"**
3. Amplify will:
   - Clone your repository
   - Install dependencies
   - Build your app
   - Deploy to a CDN

### Step 5: Configure Custom Domain (Optional)

1. In Amplify console, go to **"Domain management"**
2. Click **"Add domain"**
3. Enter your domain name
4. Follow DNS configuration instructions
5. SSL certificate will be automatically provisioned

## 📁 Project Structure

```
grandhr/
├── amplify.yml          ← Amplify build configuration
├── frontend/            ← Frontend React app
│   ├── src/            ← React source code
│   ├── dist/           ← Build output (generated)
│   ├── package.json    ← Frontend dependencies
│   └── vite.config.js  ← Vite configuration
└── backend/            ← Backend (not deployed to Amplify)
```

## 🔧 Build Configuration

The `amplify.yml` file is configured as:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/dist
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**/*
```

## ✅ Post-Deployment Checklist

- [ ] Verify the app loads correctly
- [ ] Test authentication (login/register)
- [ ] Verify API connections work
- [ ] Check that environment variables are set correctly
- [ ] Test on mobile devices (responsive design)
- [ ] Verify React Router navigation works
- [ ] Check browser console for errors

## 🔄 Continuous Deployment

Amplify automatically deploys when you push to your connected branch:
- Push to `main` → Auto-deploys to production
- Create a branch → Creates a preview deployment
- Merge PR → Deploys to production

## 🐛 Troubleshooting

### Build Fails

1. **Check build logs** in Amplify console
2. **Verify environment variables** are set correctly
3. **Check Node.js version** (Amplify uses Node 18 by default)
4. **Verify `amplify.yml`** syntax is correct

### App Not Loading

1. **Check environment variables** - especially `VITE_API_URL`
2. **Verify backend is accessible** from the deployed frontend
3. **Check CORS settings** on your backend
4. **Check browser console** for errors

### React Router Not Working

The `amplify.yml` should handle SPA routing. If routes don't work:
- Verify `amplify.yml` includes redirect rules (already configured)
- Check that all routes redirect to `index.html`

### Environment Variables Not Working

- Make sure variables start with `VITE_` prefix
- Restart the build after adding/changing variables
- Check that variables are set in Amplify console (not just in `.env`)

## 📝 Notes

- **Frontend only:** This deployment is for the frontend only. Backend should be deployed separately (Vercel, EC2, etc.)
- **Environment variables:** Never commit `.env` files. Set them in Amplify console.
- **Build output:** The build output goes to `frontend/dist/` which Amplify serves
- **Caching:** Node modules are cached for faster builds

## 🎉 Success!

Once deployed, you'll get a URL like:
- `https://main.xxxxx.amplifyapp.com`

You can also set up a custom domain for a professional URL.

---

**Need help?** Check the Amplify console logs or AWS documentation.

