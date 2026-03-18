# Deploy GrandHR for grandhr.in

Use this checklist when deploying with domain **grandhr.in**.

---

## ⚠️ "Mixed Content" / "Cannot reach server" after deploy

If the site at **https://grandhr.in** shows "Cannot reach server" and the console says:

```text
Mixed Content: The page at 'https://grandhr.in/...' was loaded over HTTPS,
but requested an insecure XMLHttpRequest endpoint 'http://3.82.65.130:5000/...'
```

then the **frontend is calling the API over HTTP** from an HTTPS page. Browsers block that.

**Fix in two steps:**

1. **Serve the API over HTTPS**  
   - Use a subdomain like **api.grandhr.in** pointing to your EC2 IP.  
   - On EC2, put **nginx** (or Caddy) in front of Node, get an SSL certificate (e.g. **Let’s Encrypt**), and proxy `https://api.grandhr.in` → `http://localhost:5000`.  
   - Then the API is available at `https://api.grandhr.in` (no port in URL).

2. **Point the frontend to that HTTPS API**  
   - In **Amplify** → App settings → Environment variables, set:  
     **`VITE_API_URL`** = `https://api.grandhr.in/api`  
   - Trigger a **new build** (redeploy).  
   - Do **not** use `http://3.82.65.130:5000/api` when the site is on https://grandhr.in.

Until the backend is on HTTPS, login from https://grandhr.in will keep failing with Mixed Content.

**Quick HTTPS on EC2 (api.grandhr.in):**

1. **DNS:** Add an A record: `api.grandhr.in` → your EC2 public IP (e.g. `3.82.65.130`).
2. **On EC2** install nginx and certbot, then:
   - Create a vhost for `api.grandhr.in` that proxies to `http://127.0.0.1:5000`.
   - Run `sudo certbot --nginx -d api.grandhr.in` to get a free SSL certificate.
3. **Amplify:** Set `VITE_API_URL=https://api.grandhr.in/api`, then redeploy.

---

## 1. Frontend (grandhr.in)

Wherever you host the frontend (e.g. **AWS Amplify**, Vercel, Netlify):

### Environment variables (production)

| Variable | Value |
|----------|--------|
| `VITE_API_URL` | `https://api.grandhr.in/api` (if API is at api.grandhr.in) **or** your backend URL + `/api` |
| `VITE_RAZORPAY_KEY_ID` | (your live key if you use Razorpay) |

**Note:** GrandHR uses **MongoDB** (via your backend). Supabase env vars are not used; you can remove `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from Amplify/local `.env` if present.

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

---

## 6. MongoDB "SCRAM failure: bad auth" on EC2

If `pm2 logs grandhr-backend` shows:

```text
AuthenticationFailed { user: "SCRAM failure: bad auth : authentication failed" }
```

the **backend’s `DATABASE_URL` on EC2** has wrong MongoDB credentials.

**Fix on the EC2 server:**

1. **Edit backend env**
   ```bash
   cd ~/grandhr/backend
   nano .env
   ```

2. **Set a correct `DATABASE_URL`**
   - **MongoDB Atlas:** In Atlas → Database → Connect → “Drivers” → copy the connection string. It should look like:
     ```text
     mongodb+srv://<username>:<password>@<cluster>.mongodb.net/grandhr?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with the **database user** you created in Atlas (not your Atlas account login).
   - **Password:** If it contains `@`, `#`, `:`, `/`, `?`, etc., **URL-encode** them (e.g. `@` → `%40`, `#` → `%23`). Or create a MongoDB user whose password has no special characters.
   - **Local MongoDB:** If the DB is on the same server: `DATABASE_URL="mongodb://localhost:27017/grandhr"` (no user/pass unless you configured auth).

3. **Restart the backend**
   ```bash
   pm2 restart grandhr-backend
   pm2 logs grandhr-backend --lines 5
   ```
   You should see the server start without authentication errors.

4. **Verify:** Open https://grandhr.in/hr/login and try logging in.

---

## 7. Logo 404 (/logo.jpeg)

If the console shows `404` for `/logo.jpeg`, the favicon/logo at the site root is missing. The repo has `frontend/public/logo.jpeg` (copied from `src/assets/logo.jpeg`). Ensure your build includes the `public` folder so that `/logo.jpeg` is served. After a fresh deploy, the 404 should go away.
