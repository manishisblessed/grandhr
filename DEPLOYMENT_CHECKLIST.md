# Vercel Deployment Checklist

## ✅ Pre-Deployment

### Code Preparation
- [ ] All code committed to GitHub
- [ ] `.env` files are in `.gitignore`
- [ ] No sensitive data in code
- [ ] Build works locally (`npm run build`)

## 🚀 Deployment Steps

### Backend Deployment

1. **Create Vercel Project**
   - [ ] Go to vercel.com
   - [ ] Import GitHub repository
   - [ ] Select repository: `manishisspecial/grandhr`

2. **Configure Backend**
   - [ ] Framework: Other
   - [ ] Root Directory: `backend`
   - [ ] Build Command: `npm run vercel-build`
   - [ ] Output Directory: (empty)
   - [ ] Install Command: `npm install`

3. **Set Environment Variables**
   - [ ] `DATABASE_URL`
   - [ ] `DIRECT_URL`
   - [ ] `JWT_SECRET`
   - [ ] `JWT_EXPIRES_IN=7d`
   - [ ] `CORS_ORIGIN` (set after frontend deploys)
   - [ ] `NODE_ENV=production`

4. **Deploy**
   - [ ] Click Deploy
   - [ ] Wait for completion
   - [ ] Copy backend URL: `https://xxx.vercel.app`

### Frontend Deployment

1. **Create Vercel Project**
   - [ ] Add New Project
   - [ ] Import same repository
   - [ ] Select repository: `manishisspecial/grandhr`

2. **Configure Frontend**
   - [ ] Framework: Vite (auto-detected)
   - [ ] Root Directory: `.` (root)
   - [ ] Build Command: `npm run build` (auto)
   - [ ] Output Directory: `dist` (auto)
   - [ ] Install Command: `npm install`

3. **Set Environment Variables**
   - [ ] `VITE_API_URL` (use backend URL, e.g. `https://api.grandhr.in/api`)
   - [ ] `VITE_RAZORPAY_KEY_ID` (if using Razorpay)
   - (Supabase not used — app uses MongoDB via backend.)

4. **Deploy**
   - [ ] Click Deploy
   - [ ] Wait for completion
   - [ ] Copy frontend URL: `https://xxx.vercel.app`

### Post-Deployment

1. **Update Backend CORS**
   - [ ] Go to backend project settings
   - [ ] Update `CORS_ORIGIN` with frontend URL
   - [ ] Redeploy backend

2. **Test Everything**
   - [ ] Frontend loads correctly
   - [ ] Login/Register works
   - [ ] Hierarchy feature works
   - [ ] HR features work
   - [ ] Document generation works
   - [ ] API calls succeed

## 🔍 Verification Tests

### Backend Health Check
```bash
curl https://your-backend.vercel.app/api/health
```
Expected: `{"status":"ok","message":"GrandHR API is running"}`

### Frontend Tests
- [ ] Landing page loads
- [ ] Navigation works
- [ ] All routes accessible
- [ ] No console errors
- [ ] Authentication flows work

## 📝 URLs to Save

- Frontend URL: `https://xxx.vercel.app`
- Backend URL: `https://xxx.vercel.app`

## 🎯 Success Criteria

- [ ] Both deployments successful
- [ ] No build errors
- [ ] All features working
- [ ] Environment variables set
- [ ] CORS configured
- [ ] Database connected

---

**Ready to deploy!** Follow the steps above. 🚀

