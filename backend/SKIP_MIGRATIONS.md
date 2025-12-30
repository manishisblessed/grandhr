# Skip Prisma Migrations - Use SQL Schema Instead

## Why Skip Migrations?

If Prisma migrations keep failing due to connection issues, you can:
1. Run the SQL schema directly in Supabase
2. Skip Prisma migrations
3. Just generate Prisma client

## Steps

### Step 1: Run SQL Schema in Supabase

1. Go to Supabase Dashboard
2. SQL Editor → New Query
3. Copy entire `supabase-complete-schema.sql` (from project root)
4. Paste and click **Run**
5. Wait for "Success" message

### Step 2: Generate Prisma Client Only

```bash
cd backend
npm run prisma:generate
```

This will generate the Prisma client without running migrations.

### Step 3: Start Backend

```bash
npm run dev
```

The backend will work because:
- ✅ Tables exist (created via SQL)
- ✅ Prisma client is generated
- ✅ Connection works for queries (even if migrations don't)

## Verify It Works

1. Backend should start without errors
2. Try accessing: `http://localhost:5000/api/health`
3. Should return: `{"status":"ok","message":"GrandHR API is running"}`

## Note

- Prisma migrations are mainly for version control
- If tables already exist (via SQL), you don't need migrations
- This approach works perfectly fine for development

