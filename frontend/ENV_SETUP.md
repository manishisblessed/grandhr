# Environment Variables Setup

## 📝 Quick Setup

1. **Create `.env` file** in the `frontend/` folder:
   ```bash
   cd frontend
   touch .env
   ```

2. **Edit `.env` file** and add your backend API URL:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

   For production (after deploying backend):
   ```env
   VITE_API_URL=https://your-backend-url.com/api
   ```

3. **Restart the dev server** after creating/updating `.env`:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

## ⚠️ Important Notes

- The `.env` file must be in the **`frontend/`** folder (not root)
- Vite only loads `.env` files from the project root (where `vite.config.js` is)
- After changing `.env`, you must restart the dev server
- Never commit `.env` to Git (it's in `.gitignore`)
- **MongoDB is used** - no Supabase configuration needed

## 🔍 Troubleshooting

**Error: "API URL not found"**
- Check that `.env` is in `frontend/` folder
- Verify variable name is `VITE_API_URL`
- Restart the dev server

**Error: "Cannot connect to backend"**
- Make sure backend is running on the specified port
- Check that `VITE_API_URL` points to the correct backend URL
- Verify CORS is configured in backend for your frontend URL

