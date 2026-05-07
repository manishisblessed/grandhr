# GrandHR — Production Launch Playbook

This is the single checklist to take GrandHR from staging to a live, paying-customer-grade deployment. Work top to bottom; nothing here is optional unless explicitly marked.

---

## 0 · Rotate every secret you've ever shared

Anything that ever ended up in a chat, screenshot, or someone else's terminal is compromised. Rotate **all** of these and update both the deployment platform's env config and your local `backend/.env`:

- `JWT_SECRET` — `openssl rand -hex 48`
- `DATABASE_URL` / `DIRECT_URL` — rotate Neon password under **Project → Roles → Reset password**
- `SMTP_PASS` / `EMAIL_PASSWORD` — regenerate the Gmail app password
- `CLOUDINARY_API_SECRET` — Cloudinary dashboard → Settings → Security
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — Razorpay dashboard → Settings → API Keys
- `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` — re-generate with `npx web-push generate-vapid-keys` (note: existing browser push subscriptions will be invalidated; users will be re-prompted)
- `SENTRY_DSN` — only if it ever leaked

Confirm `.env` files stay out of git: `git check-ignore -v backend/.env frontend/.env` should print the matching `.gitignore` rule.

---

## 1 · Fill in `.env`

Both projects ship a `.env.example`. Copy and fill in real values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

In production, the backend will **refuse to boot** if:
- `DATABASE_URL` is missing or malformed
- `JWT_SECRET` is shorter than 16 characters or set to a placeholder like `secret`/`changeme`/`dev`

It will *warn* but boot if:
- `CORS_ORIGIN` is unset (no origins allowed in prod)
- `FRONTEND_URL` is unset (emails fall back to defaults)
- `VAPID_*` are unset (push notifications disabled)
- SMTP credentials are unset (email delivery disabled)
- `SENTRY_DSN` is unset (errors only logged locally)

---

## 2 · Database

We use **Neon Postgres** with branching enabled.

### 2a · Migrations

```bash
cd backend
npx prisma migrate deploy        # apply pending migrations
npx prisma generate              # regenerate client
```

Never run `prisma db push --accept-data-loss` against production.

### 2b · Backups

Neon includes **Point-In-Time Recovery (PITR)** out of the box — no app-level backup script is needed. Verify on launch:

1. Neon dashboard → **Project → Backups**
2. Confirm the retention window (Pro plan = 7 days; Scale = 30 days). Upgrade if your customer SLA is longer.
3. Test recovery: create a Neon branch from `now - 1h` and run `SELECT count(*) FROM "User";` on the branch. Delete the branch when done.

### 2c · Seed data

For a fresh tenant:

```bash
cd backend
npm run setup:enterprise
npx tsx src/scripts/seed-templates.ts
```

---

## 3 · Backend deployment

### Option A — Render / Railway / Fly.io / EC2 with Docker

```bash
docker build -t grandhr-backend ./backend
docker run --rm -p 5000:5000 --env-file backend/.env grandhr-backend
```

Health checks:
- **Liveness**: `GET /healthz` → 200 (process is alive)
- **Readiness**: `GET /readyz` → 200 only when the DB ping succeeds

Configure your load balancer to use `/readyz` for routing decisions.

### Option B — Vercel serverless

Existing `vercel-build` script handles this. Set every env var from `.env.example` in **Project → Settings → Environment Variables** (Production scope).

### Required deploy-platform env vars

Beyond the secrets above, set:
- `NODE_ENV=production`
- `PORT` (most platforms set this for you)
- `CORS_ORIGIN=https://grandhr.in,https://www.grandhr.in`
- `FRONTEND_URL=https://grandhr.in`

---

## 4 · Frontend deployment

```bash
cd frontend
npm ci
npm run build
```

Deploy `frontend/dist` to Vercel / Netlify / Cloudflare Pages / S3+CloudFront. Set:
- `VITE_API_URL=https://api.grandhr.in/api`
- `VITE_SENTRY_DSN` (optional)

The PWA service worker is at `/sw.js`. Make sure your CDN serves it with `Cache-Control: no-cache` so updates roll out within minutes.

### DNS / TLS

| Host                  | Target                           |
| --------------------- | -------------------------------- |
| `grandhr.in`          | Frontend deployment (apex/CNAME) |
| `www.grandhr.in`      | Frontend deployment (CNAME)      |
| `api.grandhr.in`      | Backend deployment               |

Force HTTPS on every host. Enable HSTS once you're sure all subdomains have TLS.

---

## 5 · Observability

### Sentry

1. Create two projects: `grandhr-backend` (Node) and `grandhr-frontend` (React).
2. Set `SENTRY_DSN` (backend) and `VITE_SENTRY_DSN` (frontend) in deploy env.
3. Ship a deploy and trigger a test error to confirm both projects appear in Sentry.

`sendDefaultPii` is **off** and request bodies have password/token/otp keys filtered. Authorization and Cookie headers are stripped.

### Application logs

Render/Fly stream stdout to their dashboards by default. The backend prints:
- `🚀 GrandHR Backend Server running on port 5000 [production]`
- `[env] Production warnings: …` if any optional config is missing
- `[sentry] Backend telemetry enabled.` when Sentry boots

---

## 6 · Security checklist

- [x] `helmet` configured with strict CSP in production (`src/index.ts`)
- [x] CORS whitelist required in production (no wildcard)
- [x] `express-rate-limit` on `/api/*` (300 req / 15 min) + auth endpoints (8 / 15 min) + sensitive ops (5 / min) + email/push test blasts (10 / 5 min)
- [x] `app.set('trust proxy', 1)` so rate limiting sees the real client IP behind a load balancer
- [x] Env validation on boot — bad config crashes the process instead of silently misbehaving
- [x] Sentry strips auth headers and sensitive request body fields before sending events
- [ ] Run `npm audit` and resolve **high** / **critical** advisories before launch
- [ ] Penetration test or at minimum run `nikto` / OWASP ZAP against staging

---

## 7 · CI / CD

`.github/workflows/ci.yml` runs on every push & PR:
- **backend**: `npm ci` → `prisma generate` → `tsc --noEmit` → `npm run build`
- **frontend**: `npm ci` → `npm run build` (+ uploads `dist` artifact)

For deployment, either:
- Connect Render/Vercel directly to GitHub for push-to-deploy, or
- Add a deploy job to the workflow that runs after `backend` and `frontend` succeed.

The existing `.github/workflows/deploy-backend-ec2.yml` already handles the EC2 path.

---

## 8 · Post-launch

- **Day 1**: watch Sentry, watch `/readyz` uptime, watch the email queue.
- **Week 1**: review `Token`, `LeaveRequest`, `Attendance` tables for schema fit and indexes that might be missing under real load.
- **Month 1**: run `npm audit fix` and the next round of dep upgrades. Re-test PWA install + push on iOS Safari and Android Chrome.

---

## 9 · Quick smoke test

After every production deploy:

```bash
curl https://api.grandhr.in/healthz
curl https://api.grandhr.in/readyz
curl -I https://grandhr.in/                # expect 200 + CSP header
curl -I https://grandhr.in/sw.js           # expect Content-Type: text/javascript
curl -I https://grandhr.in/manifest.webmanifest
curl -I https://grandhr.in/robots.txt
```

If any of these fail, roll back before any users notice.
