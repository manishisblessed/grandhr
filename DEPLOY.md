# GrandHR Deployment: Amplify (frontend) + EC2 (backend)

## Why login was failing

The portal at **https://grandhr.in** was calling **http://localhost:5000/api** for login. In the browser, `localhost` is the visitor’s machine, not your EC2 server, so the request never reached your backend and you saw “Cannot reach server” and CORS errors.

**Fix applied:** The frontend now uses a **production API URL** when built for production (default `https://api.grandhr.in/api`). You can override it with the Amplify env var below.

---

## 1. Frontend on AWS Amplify (automated)

- Amplify already builds and deploys when you push to `main`.
- Set the backend URL so the site can reach your API.

**In Amplify Console:**

1. Open your app → **App settings** → **Environment variables**.
2. Add:
   - **Variable:** `VITE_API_URL`
   - **Value (choose one):**
     - If you use a subdomain: `https://api.grandhr.in/api`
     - If you use EC2 IP for now: `http://3.82.65.130:5000/api` (replace with your EC2 public IP if different)
3. **Redeploy** the frontend (e.g. trigger a new build or push a commit).

After the next build, https://grandhr.in will call the URL you set instead of localhost.

---

## 2. Backend on EC2 (your instance: 3.82.65.130)

The backend must be running on EC2 with MongoDB and CORS set for the frontend.

### 2.1 One-time setup on EC2

SSH in (you already use):

```bash
ssh -i "C:\Users\hp\Desktop\grandhr-backend-key.pem" ubuntu@3.82.65.130
```

Then:

```bash
# Node 18+ is enough (backend needs >=18). You already have Node 18.20.8 — skip Node install.
# If you ever need to fix a failed NodeSource setup and get apt working again, run:
#   sudo rm -f /etc/apt/sources.list.d/nodesource.list
#   sudo apt update

# Repo is already at ~/grandhr; go to backend
cd ~/grandhr/backend

# Env file (use env.template if .env.example is not present, e.g. on an older EC2 clone)
cp .env.example .env 2>/dev/null || cp env.template .env
nano .env   # edit as below
```

**Required in `.env` on EC2:**

```env
PORT=5000
NODE_ENV=production
DATABASE_URL="mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/grandhr?retryWrites=true&w=majority"
JWT_SECRET=your-strong-secret-at-least-32-chars
CORS_ORIGIN=https://grandhr.in
FRONTEND_URL=https://grandhr.in
```

Install, generate Prisma, build, and run:

```bash
npm ci
npx prisma generate
npm run build
node dist/index.js
```

For a persistent process, use **pm2**:

```bash
sudo npm install -g pm2
pm2 start dist/index.js --name grandhr-api
pm2 save
pm2 startup
```

### 2.2 EC2 security group

- Allow **inbound**:
  - **Port 5000** (or 80/443 if you put Nginx in front) from `0.0.0.0/0` (or restrict to your Amplify IPs if you prefer).

### 2.3 Optional: API subdomain (https://api.grandhr.in)

- In your DNS (e.g. Route 53), add an **A record**: `api.grandhr.in` → EC2 public IP `3.82.65.130`.
- On EC2, install Nginx and optionally SSL (e.g. Let’s Encrypt) and proxy `api.grandhr.in` to `http://127.0.0.1:5000`.
- Then set `VITE_API_URL=https://api.grandhr.in/api` in Amplify so the frontend uses HTTPS.

---

## 3. Automate backend deploys (GitHub Actions)

To deploy the backend to EC2 on every push to `main` (when `backend/` changes):

1. **On EC2 (one-time):** Clone the repo and start the app with pm2 once (see section 2), so the repo exists at e.g. `/home/ubuntu/GrandHR` and pm2 process name is `grandhr-api`.

2. **In GitHub:** Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**. Add:
   - `EC2_HOST` = `3.82.65.130` (your EC2 public IP)
   - `EC2_SSH_KEY` = full contents of your `.pem` file (the private key you use for `ssh -i ...`)
   - `EC2_USER` = `ubuntu` (optional; default is ubuntu)
   - `EC2_APP_PATH` = `/home/ubuntu/GrandHR` (optional; where the repo is on EC2)

3. Push to `main`; the workflow in `.github/workflows/deploy-backend-ec2.yml` will run and deploy the backend to EC2.

---

## 4. Summary

| Component    | Where        | What to set / run |
|-------------|--------------|-------------------|
| Frontend    | AWS Amplify  | Env: `VITE_API_URL` = `https://api.grandhr.in/api` or `http://EC2_IP:5000/api` |
| Backend     | EC2          | `.env`: `CORS_ORIGIN=https://grandhr.in`, `DATABASE_URL`, `JWT_SECRET`; run Node (or pm2) |
| MongoDB     | Atlas / self | Use same `DATABASE_URL` on EC2 |
| Login       | —            | Works once frontend points to EC2 URL and backend allows CORS from `https://grandhr.in` |

After setting `VITE_API_URL` in Amplify and running the backend on EC2 with the correct `.env`, **redeploy the frontend** and try logging in again at https://grandhr.in/hr/login.

---

## 5. Troubleshooting

### "File has unexpected size" / NodeSource apt update failed

If you ran the Node 20 setup script and saw:
`E: Failed to fetch ... File has unexpected size ... Mirror sync in progress?`

- **Cause:** NodeSource’s mirror had a temporary sync issue; the Node 20 repo was partially added and now breaks `apt update`.
- **Fix:** Remove **all** NodeSource list files, then run `apt update`:
  ```bash
  ls /etc/apt/sources.list.d/                    # see what’s there
  sudo rm -f /etc/apt/sources.list.d/*node*      # remove any node/nodesource lists
  sudo apt update
  ```
  If the error persists, disable the repo by moving (not deleting) the file so you can restore it later:
  ```bash
  sudo mv /etc/apt/sources.list.d/nodesource.list /etc/apt/sources.list.d/nodesource.list.bak
  # or whatever name appears in ls (e.g. node_20.x.list)
  sudo apt update
  ```
- **You can skip fixing apt for now:** You already have **Node 18** installed. The backend only needs Node >= 18 and does **not** need any new apt packages. Go straight to:
  ```bash
  cd ~/grandhr/backend
  cp .env.example .env && nano .env   # set DATABASE_URL, JWT_SECRET, CORS_ORIGIN, FRONTEND_URL
  npm ci && npx prisma generate && npm run build
  node dist/index.js
  ```
