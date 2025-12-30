# Database Setup Instructions

## Quick Setup

1. **Update the `.env` file** in the backend directory with your PostgreSQL credentials:

```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/grandhr?schema=public"
JWT_SECRET="grandhr-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
```

**Common PostgreSQL defaults:**
- Username: `postgres`
- Password: (the password you set during PostgreSQL installation)
- Host: `localhost`
- Port: `5432`
- Database: `grandhr` (will be created automatically)

2. **Create the database** (if it doesn't exist):

You can do this in one of these ways:

**Option A: Using pgAdmin (GUI)**
- Open pgAdmin
- Right-click on "Databases" → "Create" → "Database"
- Name it: `grandhr`
- Click "Save"

**Option B: Using Command Line**
- Open Command Prompt or PowerShell
- Navigate to PostgreSQL bin directory (usually `C:\Program Files\PostgreSQL\XX\bin`)
- Run: `psql -U postgres`
- Enter your password when prompted
- Run: `CREATE DATABASE grandhr;`
- Run: `\q` to exit

**Option C: Using SQL Shell (psql)**
- Open "SQL Shell (psql)" from Start Menu
- Press Enter for all defaults (host, port, database)
- Enter your password
- Run: `CREATE DATABASE grandhr;`
- Run: `\q` to exit

3. **Run database migrations:**

```bash
cd backend
npm run prisma:migrate
```

This will create all the necessary tables in your database.

4. **Restart the backend server** (if it's running):

The server should automatically pick up the new database connection.

## Verify Setup

After setup, you can verify the connection by:
- Checking the backend console for successful database connection
- Accessing http://localhost:5000/api/health
- The frontend should be able to make API calls successfully

