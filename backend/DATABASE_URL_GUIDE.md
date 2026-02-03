# MongoDB DATABASE_URL Configuration Guide

## ⚠️ Common Error: "empty database name not allowed"

This error occurs when your DATABASE_URL is missing the database name.

## ✅ Correct Format

### Local MongoDB:
```env
DATABASE_URL="mongodb://localhost:27017/grandhr"
```
**Note**: `/grandhr` is the database name - **REQUIRED**

### MongoDB Atlas:
```env
DATABASE_URL="mongodb+srv://<YOUR_USERNAME>:<YOUR_PASSWORD>@<YOUR_CLUSTER>.mongodb.net/grandhr?retryWrites=true&w=majority"
```
**Note**: `/grandhr` after the host is the database name - **REQUIRED**

## ❌ Common Mistakes

### Missing Database Name:
```env
# ❌ WRONG - No database name
DATABASE_URL="mongodb://localhost:27017"

# ❌ WRONG - Missing database name
DATABASE_URL="mongodb+srv://<user>:<pass>@cluster.mongodb.net"
```

### Correct Format:
```env
# ✅ CORRECT - Has database name
DATABASE_URL="mongodb://localhost:27017/grandhr"

# ✅ CORRECT - Has database name
DATABASE_URL="mongodb+srv://<user>:<pass>@cluster.mongodb.net/grandhr"
```

## 📝 Connection String Structure

```
mongodb://[username:password@]host[:port]/[database][?options]
```

**Required Parts:**
- `mongodb://` or `mongodb+srv://` (protocol)
- `host` (server address)
- `/database` (database name - **REQUIRED**)

**Optional Parts:**
- `username:password@` (authentication)
- `:port` (default: 27017)
- `?options` (connection options)

## 🔧 Quick Fix

1. **Check your `.env` file** in `backend` directory
2. **Ensure database name is included** after the host:
   ```
   mongodb://localhost:27017/grandhr
                                    ^^^^^^^^
                                    Database name (required)
   ```
3. **Restart the server**

## 🎯 Examples

### Local with Authentication:
```env
DATABASE_URL="mongodb://<username>:<password>@localhost:27017/grandhr?authSource=admin"
```

### Atlas with Options:
```env
DATABASE_URL="mongodb+srv://<YOUR_USERNAME>:<YOUR_PASSWORD>@<YOUR_CLUSTER>.mongodb.net/grandhr?retryWrites=true&w=majority&appName=GrandHR"
```

### Local Default:
```env
DATABASE_URL="mongodb://localhost:27017/grandhr"
```

## ✅ Verification

After setting DATABASE_URL correctly, restart the server:

```bash
npm run dev
```

You should see:
```
🚀 GrandHR Backend Server running on port 5000
🔄 Starting automation scheduler...
```

**No errors!** ✅

---

**Remember**: The database name (e.g., `/grandhr`) is **REQUIRED** in the connection string!

