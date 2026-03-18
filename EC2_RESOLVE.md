# Resolve MongoDB / Backend on EC2

Run these **on your EC2 server** (SSH: `ssh -i your-key.pem ubuntu@your-ec2-ip`).

---

## 1. Test current database connection

```bash
cd ~/grandhr/backend
npx tsx scripts/test-db-connection.ts
```

- If you see **✅ MongoDB OK** → connection is fine; restart backend and try login.
- If you see **❌ MongoDB connection failed** and "SCRAM" / "auth" → do step 2.

---

## 2. Fix DATABASE_URL (auth failure)

**On your laptop (one-time):**

1. Open **MongoDB Atlas** → **Database Access** → your user (e.g. `manishisblessed_db_user`) → **Edit**.
2. Set a **new password** (only letters and numbers).
3. **Database** → **Connect** → **Drivers** → copy the connection string.
4. Replace `<password>` with the new password.
5. Ensure the path has **/grandhr** before `?`:
   - Correct: `...mongodb.net/grandhr?retryWrites=true&w=majority`
   - Wrong: `...mongodb.net/?appName=...`

**On EC2:**

```bash
cd ~/grandhr/backend
nano .env
```

Set this single line (use your real password):

```env
DATABASE_URL="mongodb+srv://manishisblessed_db_user:YOUR_NEW_PASSWORD@grandhr.omswqsp.mongodb.net/grandhr?retryWrites=true&w=majority"
```

Save: Ctrl+O, Enter, Ctrl+X.

**Atlas Network Access:** Ensure EC2 IP is allowed (or **Allow from anywhere** `0.0.0.0/0` for testing).

---

## 3. Restart backend and verify

```bash
cd ~/grandhr/backend
npx tsx scripts/test-db-connection.ts
pm2 restart grandhr-backend
pm2 logs grandhr-backend --lines 10
```

Then try **https://grandhr.in/hr/login**.

---

## 4. One-time: ensure deploy script runs from repo root

From repo root:

```bash
cd ~/grandhr
./deploy-backend-ec2.sh
```

This pulls latest code, builds backend, and restarts PM2.
