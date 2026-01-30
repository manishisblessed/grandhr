import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';

// Routes
import authRoutes from './routes/auth.routes';
import employeeRoutes from './routes/employee.routes';
import leaveRoutes from './routes/leave.routes';
import attendanceRoutes from './routes/attendance.routes';
import payrollRoutes from './routes/payroll.routes';
import documentRoutes from './routes/document.routes';
import reviewRoutes from './routes/review.routes';
import dashboardRoutes from './routes/dashboard.routes';
import automationRoutes from './routes/automation.routes';
import supportRoutes from './routes/support.routes';
import configurationRoutes from './routes/configuration.routes';
import chatbotRoutes from './routes/chatbot.routes';
import generatedDocumentRoutes from './routes/generatedDocument.routes';
import companyRoutes from './routes/company.routes';
import pricingRoutes from './routes/pricing.routes';
import notificationRoutes from './routes/notification.routes';

// Middleware
import { apiLimiter, authLimiter } from './middleware/rateLimiter.middleware';
import { activityLogger } from './middleware/activityLogger.middleware';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || process.env.NODE_ENV === 'production' 
    ? process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000']
    : true,
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Activity Logging (before routes)
app.use(activityLogger);

// Rate Limiting
app.use('/api/', apiLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'GrandHR API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/configuration', configurationRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/generated-documents', generatedDocumentRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Export app for Vercel serverless functions
export default app;

// Only start server if not in Vercel environment
if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
  const PORT = process.env.PORT || 5000;
  
  app.listen(PORT, () => {
    console.log(`🚀 GrandHR Backend Server running on port ${PORT}`);
  });

  // Start automation scheduler (only if database is configured)
  if (process.env.DATABASE_URL && 
      (process.env.DATABASE_URL.startsWith('mongodb://') || 
       process.env.DATABASE_URL.startsWith('mongodb+srv://'))) {
    import('./services/scheduler.service').then(({ SchedulerService }) => {
      SchedulerService.start();
    }).catch((error) => {
      console.warn('⚠️  Could not start scheduler:', error.message);
    });
  } else {
    console.warn('⚠️  DATABASE_URL not configured, scheduler disabled');
  }

  // Graceful shutdown
  process.on('beforeExit', async () => {
    const { SchedulerService } = await import('./services/scheduler.service');
    SchedulerService.stop();
    await prisma.$disconnect();
  });
}

