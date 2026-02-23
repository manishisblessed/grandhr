# GrandHR – noreply@grandhr.in Setup & Short-Term Roadmap

## 1. Where and how to start noreply mail

You have your domain and Gmail (Google Workspace) set up. To send transactional emails (password reset, forgot username, etc.) **from noreply@grandhr.in**:

### Option A: Use Google Workspace (your current setup)

**Step 1 – Create the noreply address**

- **Option 1 – Alias (recommended)**  
  - Google Admin: **Directory** → **Users** → select a user (e.g. support@grandhr.in) → **User information** → **Email aliases** → Add alias: **noreply@grandhr.in**  
  - Or: **Domains** → **grandhr.in** → **Manage domain** → add an alias there if your plan supports it.
- **Option 2 – Dedicated user**  
  - Create a new user **noreply@grandhr.in** in Google Admin (no need to give it a real mailbox if you only send from the app).

**Step 2 – App password (if 2-Step Verification is on)**

1. Go to [Google Account → Security](https://myaccount.google.com/security).
2. Under “How you sign in to Google”, turn on **2-Step Verification** if not already.
3. **App passwords** → Select app: “Mail”, device: “Other” → name it “GrandHR Backend”.
4. Copy the 16-character password.

**Step 3 – Backend `.env` (in `backend/`)**

Use the account that can send as noreply (either noreply itself or the user that has noreply as alias):

```env
# Email – send from noreply@grandhr.in
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@grandhr.in
SMTP_PASS=your_16_char_app_password_here
EMAIL_FROM=noreply@grandhr.in
```

If you use **support@grandhr.in** as the sending user and noreply as alias:

```env
SMTP_USER=support@grandhr.in
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@grandhr.in
```

**Step 4 – “Send mail as” in Gmail (optional, for sending as noreply)**

- Gmail → **Settings** → **Accounts** → **Send mail as** → Add **noreply@grandhr.in** and set as default if you want.
- For the **backend**, the important part is `EMAIL_FROM=noreply@grandhr.in`; Nodemailer will use that as the “From” address.

**Step 5 – Reduce “spam” risk**

- Add SPF (and ideally DKIM) for **grandhr.in** in your DNS (Google Admin / Domain setup usually gives you the records).
- Avoid sending high volume from a free Gmail account; for large volume later, use SendGrid/AWS SES (see Option B).

---

### Option B: Dedicated transactional service (later, for scale)

When you need higher volume or better deliverability:

- **SendGrid / Mailgun / AWS SES**: Create a domain identity for **grandhr.in**, verify DNS, then send via API/SMTP with “From: noreply@grandhr.in”.
- Backend stays the same idea: set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, and `EMAIL_FROM=noreply@grandhr.in` to point to that service.

---

## 2. What we use noreply for (already in code)

- **Password reset** – link to `/reset-password?token=...`
- **Forgot username** – sends login details to the user’s email
- **Password changed confirmation**
- Any future transactional mail (e.g. welcome, leave approved) should also use `EMAIL_FROM=noreply@grandhr.in` so users see “GrandHR (noreply@grandhr.in)”.

---

## 3. Short-term recommendations – where to start

After noreply is sending correctly, start with these in order:

| # | Item | Why first | Where in codebase |
|---|------|-----------|-------------------|
| 1 | **noreply email** | Password reset and account recovery must work for production | `backend/.env`, `backend/src/utils/email.util.ts` |
| 2 | **Payment gateway (Razorpay/Stripe)** | Enables revenue; plans/subscriptions already in DB | New: `backend` billing routes, `frontend` pricing/checkout |
| 3 | **Bulk employee import (CSV/Excel)** | Fast onboarding for companies; strong differentiator | New: upload API + parsing, `frontend` in Employees |
| 4 | **PWA / Installable web app** | “Add to home screen”, works offline for key screens | `frontend`: manifest, service worker, icons |
| 5 | **Multi-language (Hindi + English)** | Important for Indian MNCs | i18n library + JSON keys, language switcher in navbar |

Suggested order: **1 (noreply) → 2 (payments) → 3 (bulk import)**. Then PWA and i18n.

---

## 4. Login and SUPER_ADMIN checklist

If **super_admin@grandhr.in** / **GrandHR@2026** fails:

1. **Backend running** – e.g. `npm run dev` in `backend/`, listening on port 5000.
2. **Frontend API URL** – In `frontend/.env`:  
   `VITE_API_URL=http://localhost:5000/api` (local) or your production API URL.
3. **Same database** – Seed runs against `backend/.env` `DATABASE_URL`. If frontend points to production API, the user must exist in that DB.
4. **Re-run seed** – In `backend/`:  
   `npm run seed`  
   This creates/updates SUPER_ADMIN with the password above.
5. **See password** – On `/hr/login` use the “eye” icon next to the password field to confirm you’re typing **GrandHR@2026** (no extra spaces).

---

**Summary:** Configure **noreply@grandhr.in** in Google Workspace (alias or user + app password), set `SMTP_*` and `EMAIL_FROM` in `backend/.env`, then move on to payments and bulk import as the next short-term steps.
