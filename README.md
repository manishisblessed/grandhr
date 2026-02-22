# GrandHR - Complete HR Management Solution

![GrandHR](https://img.shields.io/badge/GrandHR-HR%20Management-blue)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248)
![License](https://img.shields.io/badge/License-MIT-green)

A comprehensive HR management platform that combines document generation, organizational hierarchy management, and complete HR operations in one unified system.

## 🚀 Features

### 📄 Document Generation
- **Offer Letters** - Professional job offer letter generation
- **Appointment Letters** - Employee appointment documentation
- **Increment Letters** - Salary increment notifications
- **Relieving Letters** - Employee exit documentation
- **Termination Letters** - Termination notices
- **Salary Slips** - Professional salary slip generation with auto-calculations

### 🏢 Organizational Hierarchy
- **Visual Organization Chart** - Interactive hierarchy visualization
- **Employee Management** - Add, edit, delete employees
- **Layout Control** - Horizontal/vertical subordinate layouts
- **MongoDB Database** - Scalable NoSQL database with MongoDB Atlas
- **Import/Export** - JSON import/export functionality
- **PDF/Image Export** - Export hierarchy as PDF or image

### 👔 HR Management (GrandHR Enterprise)
- **Employee Management** - Complete employee CRUD operations
- **Leave Management** - Leave requests and approvals
- **Attendance Tracking** - Clock in/out with hours calculation
- **Payroll Management** - Salary and payslip management
- **Performance Reviews** - Employee performance tracking
- **Document Management** - Employee document storage
- **Dashboard Analytics** - HR metrics and insights

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **jsPDF** - PDF generation
- **html2canvas** - Image export

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM
- **MongoDB** - Database (MongoDB Atlas)

### Database & Auth
- **MongoDB Atlas** - Cloud MongoDB database
- **JWT** - Token-based authentication for HR system

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (free tier available)
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/manishisspecial/grandhr.git
cd grandhr
```

### 2. Install Dependencies

```bash
# Frontend
cd frontend
npm install
cd ..

# Backend
cd backend
npm install
cd ..
```

### 3. Set Up MongoDB Atlas

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (M0 FREE tier)
3. Create a database user (save username and password)
4. Configure Network Access (allow from anywhere: 0.0.0.0/0)
5. Get connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Add database name: `mongodb+srv://user:pass@cluster.mongodb.net/grandhr?retryWrites=true&w=majority`

### 4. Configure Environment Variables

**Frontend `.env` (in `frontend/` directory):**
```env
VITE_API_URL=http://localhost:5000/api
```

**Backend `.env` (in `backend/` directory):**
```env
DATABASE_URL="mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/grandhr?retryWrites=true&w=majority"
JWT_SECRET="your-secret-key-min-32-characters"
JWT_EXPIRES_IN="7d"
PORT=5000
CORS_ORIGIN="http://localhost:3000"
NODE_ENV="development"
```

### 5. Set Up Backend

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

### 6. Start Frontend

```bash
# From project root
cd frontend
npm run dev
```

Visit `http://localhost:3000`

## 📖 Documentation

- **[Complete Setup Guide](COMPLETE_SETUP_GUIDE.md)** - Detailed setup instructions
- **[Quick Start Guide](QUICK_START.md)** - 5-minute setup
- **[Vercel Deployment](VERCEL_DEPLOYMENT.md)** - Production deployment guide
- **[Quick Deploy](QUICK_DEPLOY.md)** - 10-minute deployment
- **[Backend Setup](backend/DATABASE_SETUP.md)** - Backend configuration
- **[Integration Summary](INTEGRATION_SUMMARY.md)** - Feature overview

## 🏗️ Project Structure

```
grandhr/
├── frontend/                # Frontend React app
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Hierarchy.jsx    # Org hierarchy manager
│   │   │   ├── HRDashboard.jsx  # HR dashboard
│   │   │   ├── Employees.jsx    # Employee management
│   │   │   ├── Leaves.jsx       # Leave management
│   │   │   ├── Attendance.jsx   # Attendance tracking
│   │   │   ├── Payroll.jsx      # Payroll management
│   │   │   ├── Navbar.jsx       # Navigation
│   │   │   └── ...              # Document generators
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API services
│   │   ├── lib/             # Libraries
│   │   ├── utils/            # Utilities
│   │   └── main.jsx          # React entry point
│   ├── package.json         # Frontend dependencies
│   ├── vite.config.js       # Vite configuration
│   └── vercel.json          # Frontend Vercel config
│
├── backend/                 # Backend API
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth middleware
│   │   └── utils/           # Utilities
│   ├── api/                 # Vercel serverless entry
│   ├── prisma/              # Database schema
│   ├── package.json         # Backend dependencies
│   └── vercel.json          # Backend Vercel config
│
├── backend/prisma/schema.prisma  # MongoDB Prisma schema
└── README.md                # This file
```

## 🔐 Authentication

GrandHR uses JWT-based authentication:

1. **JWT Auth** - For HR Management features
   - Login: `/hr/login`
   - Register: `/hr/company-onboarding`
   - Backend API authentication
   - Role-based access control
   - Data stored in MongoDB

## 📱 Available Routes

### Public Routes
- `/` - Landing page
- `/hr/login` - HR system login
- `/hr/company-onboarding` - Company registration

### Document Routes (No auth required)
- `/offer-letter` - Offer letter generator
- `/appointment-letter` - Appointment letter generator
- `/increment-letter` - Increment letter generator
- `/relieving-letter` - Relieving letter generator
- `/termination-letter` - Termination letter generator
- `/salary-slip` - Salary slip generator

### Public Routes (No auth required)
- `/hierarchy` - Organizational hierarchy manager

### HR Management Routes (JWT Auth)
- `/hr/login` - HR system login
- `/hr/dashboard` - HR dashboard
- `/hr/employees` - Employee management
- `/hr/leaves` - Leave management
- `/hr/attendance` - Attendance tracking
- `/hr/payroll` - Payroll management

## 🎯 Key Features

### Document Generation
- ✅ Multi-company support
- ✅ Professional templates
- ✅ PDF export
- ✅ Live preview
- ✅ Auto-calculations (salary slips)

### Hierarchy Management
- ✅ Interactive visualization
- ✅ Drag-and-drop organization
- ✅ Import/Export JSON
- ✅ Cloud synchronization
- ✅ Multiple layout options

### HR Management
- ✅ Complete employee lifecycle
- ✅ Leave approval workflow
- ✅ Attendance tracking
- ✅ Payroll generation
- ✅ Performance reviews
- ✅ Role-based access control

## 🚢 Production Deployment

### Vercel Deployment (Recommended)

**Deploy as Two Separate Projects:**

1. **Frontend Project:**
   - Root Directory: `frontend`
   - Framework: Vite
   - Build: `npm run build`
   - Output: `dist`

2. **Backend Project:**
   - Root Directory: `backend`
   - Framework: Other
   - Build: `npm run vercel-build`
   - Output: (empty)

See **[VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)** for detailed instructions.

### Build for Production

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run build
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- GrandHR - Complete HR management solution
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Cloud database
- [React](https://reactjs.org) - UI framework
- [Tailwind CSS](https://tailwindcss.com) - Styling

## 📞 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check the documentation files
- Review setup guides

---

**Built with ❤️ for modern HR management**
