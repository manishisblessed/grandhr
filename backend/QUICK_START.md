# GrandHR Quick Start Guide

## 🚀 Setup Steps

### 1. Backend Setup

```bash
cd backend
```

#### Install Dependencies
```bash
npm install
```

#### Configure Environment
Create a `.env` file in the `backend` directory:

```env
# MongoDB Connection (REQUIRED)
# Must start with mongodb:// or mongodb+srv://
DATABASE_URL="mongodb://localhost:27017/grandhr"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_REFRESH_EXPIRES_IN="30d"

# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN="http://localhost:5173"
```

#### Generate Prisma Client
```bash
npm run build
```

#### Start Backend
```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
```

#### Install Dependencies
```bash
npm install
```

#### Start Frontend
```bash
npm run dev
```

## 📝 MongoDB Connection String Formats

### Local MongoDB (Default)
```env
DATABASE_URL="mongodb://localhost:27017/grandhr"
```

### MongoDB Atlas (Cloud)
```env
DATABASE_URL="mongodb+srv://<YOUR_USERNAME>:<YOUR_PASSWORD>@<YOUR_CLUSTER>.mongodb.net/grandhr?retryWrites=true&w=majority"
```

### MongoDB with Authentication
```env
DATABASE_URL="mongodb://<username>:<password>@localhost:27017/grandhr?authSource=admin"
```

## ⚠️ Common Issues

### Error: "the URL must start with the protocol `mongo`"
**Fix**: Make sure your DATABASE_URL starts with `mongodb://` or `mongodb+srv://`

Example:
```env
# ✅ Correct
DATABASE_URL="mongodb://localhost:27017/grandhr"

# ❌ Wrong
DATABASE_URL="localhost:27017/grandhr"
```

### Error: "Can't reach database server"
**Fix**: 
- Make sure MongoDB is running
- Check your connection string
- Verify network/firewall settings

### Scheduler Warning
If you see: `⚠️  DATABASE_URL not configured, scheduler disabled`

This is normal if you haven't set up MongoDB yet. The server will still run, but scheduled jobs won't execute.

## 🎯 Next Steps

1. **Set up MongoDB** (local or Atlas)
2. **Configure DATABASE_URL** in `.env`
3. **Run migrations** (if needed)
4. **Start backend**: `npm run dev`
5. **Start frontend**: `npm run dev` (in frontend directory)

## 📚 Documentation

- See `DATABASE_SETUP.md` for detailed database setup
- See `COMPLETE_IMPLEMENTATION_SUMMARY.md` for module documentation
- See `BACKEND_FIXES_AND_UI_THEME.md` for UI theme guide

---

**Note**: The scheduler will gracefully handle missing database connections and won't crash the server.

