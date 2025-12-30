# GrandHR Enterprise Setup Guide

## 🚀 Quick Start

This guide will help you set up the complete enterprise HR management system.

## 📋 Prerequisites

1. Node.js 18+ installed
2. PostgreSQL database (or Supabase)
3. Environment variables configured

## 🔧 Database Setup

### Step 1: Update Prisma Schema

The schema has been enhanced with enterprise features:
- Multi-tenant Company support
- Automation/Jobs system
- Support/Tickets system
- Configuration management
- Audit logs
- Custom fields

### Step 2: Run Migrations

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name enterprise_features
```

### Step 3: Verify Database

```bash
npx prisma studio
```

## 🔐 Environment Variables

### Backend (.env)

```env
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_jwt_secret_key"
CORS_ORIGIN="http://localhost:3000"
NODE_ENV="development"
PORT=5000
```

### Frontend (.env)

```env
VITE_API_URL="http://localhost:5000/api"
VITE_SUPABASE_URL="your_supabase_url"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
```

## 🏃 Running the Application

### Backend

```bash
cd backend
npm install
npm run dev
```

The backend will start on `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`

## ✨ New Features

### 1. Automation System (Autobots)

**Location:** `/hr/automation`

**Features:**
- Auto-payroll processing
- Auto-attendance marking
- Auto-leave balance updates
- Auto-reminders
- Scheduled jobs with cron-like syntax

**Usage:**
1. Navigate to Automation page
2. Click "Create Automation"
3. Select job type and schedule
4. Job will run automatically based on schedule

### 2. Support & Tickets

**Location:** `/hr/support`

**Features:**
- Create support tickets
- Reply to tickets
- Track ticket status
- Internal notes (for admins)
- Priority levels

**Usage:**
1. Navigate to Support page
2. Click "Create Ticket"
3. Fill in details and submit
4. Admins can reply and resolve tickets

### 3. Configuration Management

**API:** `/api/configuration`

**Features:**
- Flexible configuration system
- Company-specific settings
- Payroll configurations
- Leave policies
- Holiday calendars

**Usage:**
- Access via API (admin/HR only)
- Store any JSON configuration
- Categorized configurations

## 📊 Database Models

### New Models

1. **Company** - Multi-tenant organization support
2. **Configuration** - Flexible settings storage
3. **AutomationJob** - Scheduled automation tasks
4. **SupportTicket** - Support ticket management
5. **TicketReply** - Ticket replies and notes
6. **Workflow** - Custom workflow definitions
7. **CustomField** - Flexible custom fields
8. **Report** - Saved report configurations
9. **AuditLog** - Activity tracking
10. **Integration** - Third-party integrations
11. **NotificationPreference** - User notification settings

## 🔄 Automation Jobs

### Available Job Types

1. **AUTO_PAYROLL** - Process payroll automatically
2. **AUTO_ATTENDANCE** - Mark attendance automatically
3. **AUTO_LEAVE_BALANCE** - Update leave balances
4. **AUTO_REMINDER** - Send automated reminders

### Schedule Examples

- Daily: `0 0 * * *`
- Weekly: `0 0 * * 0`
- Monthly: `0 0 1 * *`
- Custom: `HH:MM` format

## 🎯 API Endpoints

### Automation
- `GET /api/automation` - List all jobs
- `POST /api/automation` - Create job
- `POST /api/automation/:id/run` - Run job manually
- `PATCH /api/automation/:id/toggle` - Enable/disable job
- `DELETE /api/automation/:id` - Delete job

### Support
- `GET /api/support` - List tickets
- `POST /api/support` - Create ticket
- `GET /api/support/:id` - Get ticket details
- `POST /api/support/:id/reply` - Reply to ticket
- `PATCH /api/support/:id/status` - Update status

### Configuration
- `GET /api/configuration` - List configurations
- `GET /api/configuration/:key` - Get configuration
- `POST /api/configuration` - Create/update configuration
- `DELETE /api/configuration/:key` - Delete configuration

## 🔒 Security

- All endpoints require authentication
- Role-based access control (ADMIN, HR, MANAGER, EMPLOYEE)
- Rate limiting on API endpoints
- Input validation with Zod
- SQL injection protection via Prisma

## 📝 Next Steps

1. **Create Default Company**
   - Register as ADMIN
   - Company will be created automatically

2. **Set Up Automation Jobs**
   - Create payroll automation (monthly)
   - Create attendance automation (daily)
   - Create reminder automation (daily)

3. **Configure Settings**
   - Set payroll configurations
   - Set leave policies
   - Add holiday calendar

4. **Test Support System**
   - Create a test ticket
   - Reply as admin
   - Resolve ticket

## 🐛 Troubleshooting

### Database Connection Issues

1. Check DATABASE_URL in .env
2. Verify PostgreSQL is running
3. Check network connectivity
4. Run `npx prisma db push` to sync schema

### Automation Jobs Not Running

1. Check scheduler is started (backend logs)
2. Verify job isActive = true
3. Check nextRun date
4. Review job error messages

### Support Tickets Not Loading

1. Check authentication token
2. Verify user has access
3. Check API endpoint URL
4. Review browser console for errors

## 📚 Documentation

- [Enterprise Plan](./ENTERPRISE_HR_PLAN.md)
- [API Documentation](./API_DOCS.md) (to be created)
- [User Guide](./USER_GUIDE.md) (to be created)

## 🎉 You're All Set!

Your enterprise HR management system is ready to use. Start by:
1. Creating automation jobs
2. Setting up configurations
3. Testing the support system
4. Inviting team members

For questions or issues, create a support ticket in the system!

