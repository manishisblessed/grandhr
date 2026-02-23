# Where to Get Backend .env Values (EC2) — MongoDB

GrandHR backend uses **MongoDB only** (Prisma + MongoDB). No Supabase.

---

## 1. DATABASE_URL

**Source:** Your MongoDB instance (local or Atlas).

**Format:** Must start with `mongodb://` or `mongodb+srv://` and **include the database name** (e.g. `/grandhr`).

**Local MongoDB:**
```env
DATABASE_URL="mongodb://localhost:27017/grandhr"
```

**MongoDB Atlas (cloud):**
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → your project.
2. **Database** → **Connect** → **Drivers** (or **Connect your application**).
3. Copy the connection string. It looks like:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<username>` and `<password>` with your DB user and password.
5. **Add the database name** before the `?` (required for Prisma):
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/grandhr?retryWrites=true&w=majority
   ```

**Example (replace placeholders with your Atlas credentials — do not commit real values):**
```env
DATABASE_URL="mongodb+srv://<YOUR_ATLAS_USER>:<YOUR_ATLAS_PASSWORD>@cluster0.xxxxx.mongodb.net/grandhr?retryWrites=true&w=majority"
```

**Important:** The path `/grandhr` (or your chosen DB name) is required. Without it the backend can fail.

---

## 2. JWT_SECRET

**Source:** You create it — a long random string for signing login tokens.

**On EC2 or Git Bash:**
```bash
openssl rand -base64 32
```
Use the output as `JWT_SECRET`. Don’t use a simple word or your name.

**Example:**
```env
JWT_SECRET="k9Xm2pL7qR4vN1wY8zA3bC6dE0fG5hJ2"
```

---

## 3. JWT_EXPIRES_IN

**Source:** Literal value. How long login tokens are valid.

**Use:**
```env
JWT_EXPIRES_IN=7d
```
(`7d` = 7 days. You can use `24h`, `30d`, etc.)

---

## 4. PORT

**Source:** Literal. Port the backend listens on.

**Use:**
```env
PORT=5000
```

---

## 5. CORS_ORIGIN

**Source:** The URL where users open your **frontend** in the browser.

- **Same EC2, frontend on port 3000:**  
  `http://YOUR_EC2_PUBLIC_IP:3000`
- **With a domain later:**  
  `https://yourdomain.com`

**Get EC2 public IP:** AWS Console → EC2 → Instances → your instance → **Public IPv4 address**. Or on the server: `curl -s http://checkip.amazonaws.com`.

**Example:**
```env
CORS_ORIGIN=http://13.53.159.43:3000
```

---

## 6. NODE_ENV

**Source:** Literal.

**Use:**
```env
NODE_ENV=production
```

---

## Full .env example (EC2, MongoDB)

Use your real values only in the server `.env` file — never commit them.

```env
DATABASE_URL="mongodb+srv://<YOUR_ATLAS_USER>:<YOUR_ATLAS_PASSWORD>@cluster0.xxxxx.mongodb.net/grandhr?retryWrites=true&w=majority"
JWT_SECRET="your-32-char-random-string-from-openssl-rand"
JWT_EXPIRES_IN=7d
PORT=5000
CORS_ORIGIN=http://YOUR_EC2_PUBLIC_IP:3000
NODE_ENV=production
```

**Checklist:**
- [ ] `DATABASE_URL` starts with `mongodb://` or `mongodb+srv://` and includes `/grandhr` (or your DB name).
- [ ] `JWT_SECRET` is a long random value (e.g. from `openssl rand -base64 32`).
- [ ] `CORS_ORIGIN` is the exact URL of your frontend (e.g. `http://<EC2-IP>:3000`).

After editing, restart the backend (`npm start` or PM2).
