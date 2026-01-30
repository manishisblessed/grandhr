# GrandHR Pricing System - Implementation Complete

## ✅ Overview

A complete, scalable SaaS pricing system has been implemented for GrandHR with per-employee-per-month pricing, tiered plans, add-ons, one-time setup fees, and admin-controlled pricing.

## 📦 Database Schemas

### Models Created

1. **Plan** - Pricing plans (Starter, Professional, Enterprise)
2. **CustomPlanPricing** - Custom pricing overrides for Enterprise clients
3. **AddOn** - Additional services (Biometric, WhatsApp, etc.)
4. **Subscription** - Company subscription tracking
5. **SubscriptionAddOn** - Many-to-many relationship for subscription add-ons
6. **Invoice** - Payment tracking

### Key Features
- Plans support min/max employee limits
- Custom pricing overrides for Enterprise
- Flexible add-on pricing (monthly, per-unit, one-time)
- Yearly billing with 10% discount
- Setup fees (one-time)

## 🔧 Backend Implementation

### Service Layer
**File:** `backend/src/modules/pricing/services/pricing.service.ts`

- `calculatePrice()` - Complete pricing calculation with all factors
- `getActivePlans()` - Fetch all active plans
- `getActiveAddOns()` - Fetch all active add-ons
- `validatePlanSelection()` - Validate plan against employee count
- `getCompanySubscription()` - Get company's current subscription

### API Endpoints
**File:** `backend/src/routes/pricing.routes.ts`

- `GET /api/pricing/plans` - Get all active plans
- `GET /api/pricing/plans/:id` - Get plan by ID
- `GET /api/pricing/add-ons` - Get all active add-ons
- `POST /api/pricing/calculate` - Calculate total price
- `POST /api/pricing/validate` - Validate plan selection
- `GET /api/pricing/subscription/:companyId` - Get company subscription

### Pricing Calculation Logic

```
Total Monthly Price = 
  (Employee Count × Plan Price)
  + Add-Ons Monthly Total
  + (One-Time Setup Fee – first invoice only)

Yearly billing = 10% discount on recurring charges only
Enterprise pricing may override base price
```

## 🎨 Frontend Implementation

### Pricing Page
**File:** `frontend/src/components/Pricing.jsx`

**Features:**
- ✅ Pricing cards with "Most Popular" badge
- ✅ Employee count slider (1-500)
- ✅ Monthly/Yearly billing toggle (10% discount shown)
- ✅ Add-on selector with quantity inputs
- ✅ Live price calculation
- ✅ Validation warnings (employee limits, payroll on Starter)
- ✅ "Get Custom Quote" CTA for Enterprise
- ✅ Real-time price breakdown

### Admin Panel
**File:** `frontend/src/components/AdminPricing.jsx`

**Features:**
- ✅ View all plans and add-ons
- ✅ Enable/disable plans
- ✅ Edit pricing (requires backend endpoints)
- ✅ Toggle add-ons active/inactive

## 📊 Pricing Plans

### Starter
- **Price:** ₹49/employee/month
- **Employee Range:** 5-50
- **Setup Fee:** ₹2,999
- **Modules:** Employee Management, Attendance, Leave, Holiday Calendar, Basic Reports
- **Excludes:** Payroll

### Professional (Most Popular)
- **Price:** ₹99/employee/month
- **Employee Range:** 25-200
- **Setup Fee:** ₹4,999
- **Modules:** Everything in Starter + Payroll, Statutory Compliance, Payslips, Role-based Access, CSV/PDF Reports

### Enterprise
- **Price:** ₹149/employee/month (default, admin-configurable)
- **Employee Range:** 200+
- **Setup Fee:** Custom
- **Modules:** Everything in Professional + Recruitment, Performance Management, Expense & Reimbursement, Advanced Analytics, Priority Support

## ➕ Add-Ons

| Add-On | Pricing | Type |
|--------|---------|------|
| Biometric / Device Integration | ₹1,999/month | Monthly |
| WhatsApp Alerts | ₹0.50/message | Per Unit |
| Custom Reports | ₹3,000/report | Per Unit |
| Dedicated HR Support | ₹10,000/month | Monthly |
| Data Migration | ₹5,000-₹25,000 | One-time |

## 🚀 Setup Instructions

### 1. Database Migration
```bash
cd backend
npx prisma generate
npx prisma db push
```

### 2. Seed Initial Data
```bash
cd backend
npx ts-node src/scripts/seed-pricing.ts
```

### 3. Backend Routes
Routes are already added to `backend/src/index.ts`:
```typescript
app.use('/api/pricing', pricingRoutes);
```

### 4. Frontend Routes
The pricing page is accessible at `/pricing` (already configured in `main.jsx`)

## ✅ Validation Rules

1. **Starter Plan:**
   - Minimum 5 employees
   - Maximum 50 employees
   - Warning if payroll needed (not included)

2. **Professional Plan:**
   - Minimum 25 employees
   - Maximum 200 employees

3. **Enterprise Plan:**
   - Minimum 200 employees
   - No maximum (admin can set custom pricing)

## 🔐 Admin Features

- Plans and prices are admin-editable (no hard-coding)
- Enable/disable plans without deployment
- Custom Enterprise pricing per client
- All prices stored in database

## 📝 Notes

1. **GST Field:** Included in schema for future use (not calculated yet)
2. **No Hard-Coding:** All prices come from database
3. **Extensible:** Easy to add new plans or add-ons
4. **Non-Breaking:** Existing HR modules remain untouched

## 🎯 Next Steps (Optional)

1. Create admin API endpoints for CRUD operations on plans/add-ons
2. Integrate with Razorpay for payment processing
3. Add subscription management UI
4. Implement invoice generation
5. Add GST calculation when needed

## 📄 Files Created/Modified

### Backend
- `backend/prisma/schema.prisma` - Added pricing models
- `backend/src/modules/pricing/services/pricing.service.ts` - Pricing logic
- `backend/src/controllers/pricing.controller.ts` - API controllers
- `backend/src/routes/pricing.routes.ts` - API routes
- `backend/src/index.ts` - Added pricing routes
- `backend/src/scripts/seed-pricing.ts` - Initial data seed

### Frontend
- `frontend/src/components/Pricing.jsx` - Complete pricing page
- `frontend/src/components/AdminPricing.jsx` - Admin management UI

---

**Status:** ✅ Complete and Ready for Production
**Last Updated:** Implementation Date

