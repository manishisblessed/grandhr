# Deploy GrandHR for grandhr.in

Use this checklist when deploying with domain **grandhr.in**.

---

## 1. Frontend (grandhr.in)

Wherever you host the frontend (e.g. **AWS Amplify**, Vercel, Netlify):

### Environment variables (production)

| Variable | Value |
|----------|--------|
| `VITE_API_URL` | `https://api.grandhr.in/api` (if API is at api.grandhr.in) **or** your backend URL + `/api` |
| `VITE_SUPABASE_URL` | (same as dev if you use Supabase) |
| `VITE_SUPABASE_ANON_KEY` | (same as dev if you use Supabase) |
| `VITE_RAZORPAY_KEY_ID` | (your live key if you use Razorpay) |

- **Important:** `VITE_*` values are baked into the build. After changing them, trigger a **new build** (redeploy).
- Do **not** use `http://localhost:5000/api` in production.

---

## 2. Backend (API for grandhr.in)

On your backend server (e.g. **EC2**), set these in `.env`:

```env
PORT=5000
NODE_ENV=production

# Database (e.g. MongoDB Atlas)
DATABASE_URL="mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/grandhr?retryWrites=true&w=majority"

# JWT (generate: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
JWT_SECRET=your-strong-secret-at-least-32-characters
JWT_EXPIRES_IN=7d

# CORS: allow your live site (and www if you use it)
CORS_ORIGIN=https://grandhr.in,https://www.grandhr.in

# Used in emails (forgot password, etc.)
FRONTEND_URL=https://grandhr.in
```

- Use **only** your real frontend origin(s) in `CORS_ORIGIN`. No trailing slash.
- If you use `www.grandhr.in`, include both `https://grandhr.in` and `https://www.grandhr.in` in `CORS_ORIGIN`.

---

## 3. DNS (if API is on api.grandhr.in)

- **grandhr.in** (and optionally **www.grandhr.in**) → frontend (e.g. Amplify URL or your hosting).
- **api.grandhr.in** → backend (e.g. EC2 IP or load balancer).  
  Then in frontend use: `VITE_API_URL=https://api.grandhr.in/api`.

If you keep using EC2 IP for the API (no api subdomain):

- Frontend: `VITE_API_URL=https://YOUR_EC2_PUBLIC_IP:5000/api` or `http://...` (prefer HTTPS in production).

---

## 4. Quick checklist

- [ ] Frontend env: `VITE_API_URL` = production API URL (e.g. `https://api.grandhr.in/api`), then **rebuild/redeploy**.
- [ ] Backend env: `NODE_ENV=production`, `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `FRONTEND_URL` set.
- [ ] Backend is running (e.g. pm2 on EC2) and reachable at the URL used in `VITE_API_URL`.
- [ ] Test: open https://grandhr.in → HR Login → sign in; no CORS or “Cannot reach server” errors.

---

## 5. After deployment

- **Login:** Should work from https://grandhr.in (and mobile browser) because the frontend calls the production API and CORS allows your domain.
- **Password reset / emails:** Links will use `FRONTEND_URL` (https://grandhr.in).
