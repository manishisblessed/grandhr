# GrandHR - Quick Setup Guide

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up MongoDB connection in .env
# DATABASE_URL=mongodb://localhost:27017/grandhr
# OR for MongoDB Atlas:
# DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/grandhr

# Generate Prisma client for MongoDB
npx prisma generate

# Push schema to MongoDB (creates collections)
npx prisma db push

# Start backend server
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies (Supabase removed)
npm install

# Set API URL in .env
# VITE_API_URL=http://localhost:5000/api

# Start development server
npm run dev
```

### 3. MongoDB Setup Options

#### Option A: Local MongoDB
```bash
# Install MongoDB locally
# Then use: mongodb://localhost:27017/grandhr
```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Use: `mongodb+srv://username:password@cluster.mongodb.net/grandhr`

## ✅ What's New

### Features
- ✅ MongoDB database (replaced Supabase/PostgreSQL)
- ✅ JWT authentication (replaced Supabase Auth)
- ✅ Automatic activity logging
- ✅ Document storage in database
- ✅ Modern UI theme with smooth transitions
- ✅ Enhanced chatbot UI

### Key Changes
- All user actions are automatically logged
- All generated documents are saved to database
- Beautiful, modern UI with professional color scheme
- Smooth animations throughout the application

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL=mongodb://localhost:27017/grandhr
JWT_SECRET=your-secret-key-here
PORT=5000
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🎨 UI Improvements

- Modern color palette (professional blues, warm oranges)
- Smooth animations (fade-in, slide-up, scale-in)
- Enhanced chatbot with gradient backgrounds
- Better visual hierarchy
- Improved user experience

## 📊 Database Collections

The following collections are automatically created:
- `users` - User accounts
- `employees` - Employee records
- `generated_documents` - All generated HR documents
- `activity_logs` - User activity tracking
- `companies` - Multi-tenant company data
- Plus all other HR-related collections

## 🔐 Authentication

- Register/Login at `/hr/register` and `/hr/login`
- JWT tokens stored in localStorage
- All document routes require authentication
- Activity logging tracks all user actions

## 📄 Document Generation

- All generated documents are automatically saved
- PDFs stored as base64 in database
- Metadata captured for future reference
- Documents linked to users and employees

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running (local) or cluster is accessible (Atlas)
- Check DATABASE_URL format
- Verify network connectivity

### Prisma Issues
- Run `npx prisma generate` after schema changes
- Run `npx prisma db push` to sync schema

### Authentication Issues
- Clear localStorage: `localStorage.clear()`
- Check JWT_SECRET in backend .env
- Verify API URL in frontend .env

## 📚 Documentation

See `MIGRATION_SUMMARY.md` for detailed information about all changes.

---

**Ready to use!** 🎉

