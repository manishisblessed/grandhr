# Supabase Configuration Check

## ✅ Quick Verification

After changing your Supabase URL and Anon Key, follow these steps to verify everything is working:

### 1. **Check Environment Variables**

Make sure your `frontend/.env` file has:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_URL=http://localhost:5000/api
```

**Important:**
- ✅ File must be in `frontend/` folder (not root)
- ✅ Variable names must start with `VITE_`
- ✅ No quotes around values (unless they contain spaces)
- ✅ No trailing spaces

### 2. **Restart Dev Server**

After changing `.env`, you **MUST** restart:

```bash
# Stop server (Ctrl+C)
# Then restart:
cd frontend
npm run dev
```

Vite only loads environment variables at startup!

### 3. **Check Browser Console**

Open browser DevTools (F12) and check Console for:

**✅ Good signs:**
- No warnings about "Supabase URL or Anon Key not found"
- No errors when trying to login/register

**❌ Bad signs:**
- `Supabase URL or Anon Key not found`
- `supabaseUrl is required`
- `Invalid API key`
- `Failed to fetch` errors

### 4. **Test Authentication**

1. Go to `http://localhost:3000`
2. Click "Register" in navbar
3. Try to create an account
4. Check if it works without errors

### 5. **Common Issues**

#### Issue: "Supabase URL or Anon Key not found"

**Causes:**
- `.env` file not in `frontend/` folder
- Variable names don't start with `VITE_`
- Dev server not restarted after changes

**Fix:**
```bash
# 1. Check file location
ls frontend/.env

# 2. Check variable names
cat frontend/.env | grep VITE_

# 3. Restart server
```

#### Issue: "Invalid API key" or Authentication fails

**Causes:**
- Wrong anon key copied
- Key has extra spaces or quotes
- Project URL doesn't match the key

**Fix:**
1. Go to Supabase Dashboard → Settings → API
2. Copy **Project URL** exactly (no trailing slash)
3. Copy **anon/public key** exactly (starts with `eyJhbG...`)
4. Paste directly into `.env` (no quotes needed)
5. Restart server

#### Issue: CORS errors

**Causes:**
- Supabase project settings not configured
- Wrong URL format

**Fix:**
1. Go to Supabase Dashboard → Settings → API
2. Check "Allowed Origins" includes your frontend URL
3. For local dev, add: `http://localhost:3000`

### 6. **Verify Supabase Project**

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Check project status (should be "Active")
4. Go to Settings → API
5. Verify:
   - Project URL matches your `VITE_SUPABASE_URL`
   - Anon key matches your `VITE_SUPABASE_ANON_KEY`

### 7. **Test Database Connection**

If you're using Hierarchy feature:

1. Login/Register
2. Go to `/hierarchy`
3. Try to save data
4. Check if it syncs to Supabase

### 8. **Environment File Location**

**Correct:**
```
frontend/
  ├── .env          ← HERE
  ├── package.json
  └── src/
```

**Wrong:**
```
grandhr/
  ├── .env          ← NOT HERE
  └── frontend/
```

### 9. **Format Check**

**✅ Correct:**
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2ODAwMCwiZXhwIjoxOTU0NTQ0MDAwfQ.example
```

**❌ Wrong:**
```env
# With quotes (not needed)
VITE_SUPABASE_URL="https://..."
VITE_SUPABASE_ANON_KEY="eyJhbG..."

# Wrong variable names
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=eyJhbG...

# Placeholder values
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🔍 Quick Test

Run this in browser console (after page loads):

```javascript
// Check if Supabase is configured
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Anon Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set');
```

If you see `undefined`, the environment variables aren't loading.

## 📞 Still Having Issues?

1. **Double-check** Supabase Dashboard → Settings → API
2. **Verify** `.env` file is in `frontend/` folder
3. **Restart** dev server completely
4. **Clear** browser cache and reload
5. **Check** browser console for specific error messages

---

**Note:** The backend uses a different connection (DATABASE_URL) for Prisma. Frontend only needs the Supabase URL and Anon Key for authentication and real-time features.

