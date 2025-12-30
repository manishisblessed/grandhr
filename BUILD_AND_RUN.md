# Build and Run Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database running
- Environment variables configured

### Step 1: Backend Setup

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name enterprise_features
npm run setup:enterprise
```

**Note:** If you get a Prisma permission error (EPERM), try:
1. Close any running Node processes
2. Delete `node_modules\.prisma` folder
3. Run `npx prisma generate` again

### Step 2: Start Backend

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:5000`

### Step 3: Frontend Setup

```bash
cd frontend
npm install
```

### Step 4: Start Frontend

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🔧 Troubleshooting

### Prisma Permission Error

If you see `EPERM: operation not permitted`:

1. **Close all Node processes:**
   ```powershell
   Get-Process node | Stop-Process -Force
   ```

2. **Delete Prisma cache:**
   ```powershell
   Remove-Item -Path "backend\node_modules\.prisma" -Recurse -Force
   ```

3. **Regenerate Prisma:**
   ```bash
   cd backend
   npx prisma generate
   ```

### Database Connection Error

1. Check `.env` file in `backend/` folder
2. Verify `DATABASE_URL` is correct
3. Ensure PostgreSQL is running
4. Test connection: `npx prisma db push`

### Port Already in Use

If port 5000 or 3000 is in use:

1. **Backend:** Change `PORT` in `.env` or `package.json`
2. **Frontend:** Change port in `vite.config.js`

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/grandhr"
JWT_SECRET="your-secret-key-here"
CORS_ORIGIN="http://localhost:3000"
NODE_ENV="development"
PORT=5000
```

### Frontend (.env)
```env
VITE_API_URL="http://localhost:5000/api"
VITE_SUPABASE_URL="your-supabase-url"
VITE_SUPABASE_ANON_KEY="your-supabase-key"
```

## ✅ Verify Installation

1. **Backend Health Check:**
   - Visit: `http://localhost:5000/api/health`
   - Should return: `{"status":"ok","message":"GrandHR API is running"}`

2. **Frontend:**
   - Visit: `http://localhost:3000`
   - Should see the landing page

3. **Login:**
   - Go to: `http://localhost:3000/hr/login`
   - Email: `admin@grandhr.com`
   - Password: `admin123`

## 🎯 Next Steps

1. Run database migrations
2. Run setup script to create default data
3. Login and change default password
4. Start using the system!

## 📚 Additional Commands

### Database Commands
```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# View database
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Development Commands
```bash
# Backend
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

