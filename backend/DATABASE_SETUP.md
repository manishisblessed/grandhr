# Database Setup Guide

## MongoDB Connection String Format

The `DATABASE_URL` must start with the protocol `mongodb://` or `mongodb+srv://`.

### Local MongoDB:
```env
DATABASE_URL="mongodb://localhost:27017/grandhr"
```

### MongoDB Atlas (Cloud):
```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/grandhr?retryWrites=true&w=majority"
```

### MongoDB with Authentication:
```env
DATABASE_URL="mongodb://username:password@localhost:27017/grandhr?authSource=admin"
```

## Setup Steps

1. **Create `.env` file** in the `backend` directory:
```bash
cd backend
cp env.template .env
```

2. **Edit `.env`** and set your DATABASE_URL:
```env
DATABASE_URL="mongodb://localhost:27017/grandhr"
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_SECRET="your-refresh-secret-here"
JWT_REFRESH_EXPIRES_IN="30d"
PORT=5000
CORS_ORIGIN="http://localhost:5173"
```

3. **Verify connection**:
```bash
npm run dev
```

The scheduler will now gracefully handle missing/invalid database URLs.

## Common Issues

### Error: "the URL must start with the protocol `mongo`"
**Solution**: Make sure your DATABASE_URL starts with `mongodb://` or `mongodb+srv://`

### Error: "Can't reach database server"
**Solution**: 
- Check if MongoDB is running
- Verify the connection string
- Check firewall/network settings

### Error: "Authentication failed"
**Solution**: 
- Verify username/password
- Check authSource parameter
- Ensure user has proper permissions

## Testing Connection

You can test the connection by running:
```bash
cd backend
npm run dev
```

If the connection is valid, you'll see:
```
🚀 GrandHR Backend Server running on port 5000
🔄 Starting automation scheduler...
```

If there's an issue, the scheduler will log a warning but won't crash the server.

