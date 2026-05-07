// Sentry must be the very first import so it can instrument Node before
// anything else loads. The init function is a no-op when SENTRY_DSN is unset.
import { initSentry, sentry } from './config/sentry';
initSentry();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';

import { env } from './config/env';

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
import superAdminRoutes from './routes/superAdmin.routes';
import templateRoutes from './routes/template.routes';
import emailTemplateRoutes from './routes/emailTemplate.routes';
import reportsRoutes from './routes/reports.routes';
import pushRoutes from './routes/push.routes';

// Middleware
import { apiLimiter } from './middleware/rateLimiter.middleware';
import { activityLogger } from './middleware/activityLogger.middleware';

const app = express();
const prisma = new PrismaClient();

// ---- Trust proxy: required when behind Render/Heroku/Nginx so req.ip + rate
// limiters work against the original client IP.
app.set('trust proxy', 1);

// ---- Security headers. CSP allows the styles/scripts our frontend actually
// uses (Razorpay checkout, Cloudinary images, Sentry endpoints). Frontend is
// served from a different origin in production so connect-src must allow it.
app.use(
  helmet({
    contentSecurityPolicy: env.isProduction
      ? {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: [
              "'self'",
              "'unsafe-inline'",
              'https://checkout.razorpay.com',
            ],
            imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
            connectSrc: [
              "'self'",
              'https:',
              'https://*.sentry.io',
              'https://*.ingest.sentry.io',
            ],
            frameSrc: ["'self'", 'https://api.razorpay.com', 'https://checkout.razorpay.com'],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
          },
        }
      : false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

// ---- CORS. CORS_ORIGIN is a comma-separated list. In dev we allow any origin
// so the Vite proxy/mobile-emulator works; in prod we whitelist explicitly.
const corsOrigin = env.CORS_ORIGINS.length
  ? env.CORS_ORIGINS
  : env.isProduction
    ? false // require explicit whitelist in prod
    : true;

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(activityLogger);

// ---- Health endpoints (no rate limit, no auth). /healthz is for liveness
// probes (just confirms the process answers); /readyz pings the DB so a load
// balancer can avoid routing to a node with a broken Prisma connection.
app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), env: env.NODE_ENV });
});
app.get('/readyz', async (_req, res) => {
  try {
    await prisma.$queryRawUnsafe('SELECT 1');
    res.json({ status: 'ready', db: 'up' });
  } catch (err: any) {
    res.status(503).json({ status: 'unready', db: 'down', error: err?.message });
  }
});
// Back-compat alias used by older clients.
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'GrandHR API is running', env: env.NODE_ENV });
});

// ---- Rate limit the API surface (health endpoints are excluded above).
app.use('/api/', apiLimiter);

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
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/email-templates', emailTemplateRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/push', pushRoutes);

// ---- Final error handler. Sentry captures unhandled errors via its automatic
// instrumentation; this handler turns them into clean JSON for the client and
// avoids leaking stack traces in production.
app.use(
  (err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (env.SENTRY.enabled) {
      try {
        sentry.captureException(err);
      } catch (e) {
        console.warn('[sentry] capture failed:', e);
      }
    }
    if (!res.headersSent) {
      console.error(err.stack || err);
    }
    res.status(err.status || 500).json({
      message: err.message || 'Internal server error',
      ...(env.isProduction ? {} : { stack: err.stack }),
    });
  },
);

// Export the app for serverless platforms.
export default app;

// Standalone server boot (Render, Docker, plain node).
if (!env.IS_VERCEL) {
  app.listen(env.PORT, () => {
    console.log(`\n🚀 GrandHR Backend Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  // Scheduler boots only when DATABASE_URL is configured. Postgres + Mongo
  // both supported (the legacy Mongo path is kept for backwards compat).
  const dbUrl = env.DATABASE_URL;
  if (dbUrl && /^(postgres|postgresql|mongodb(\+srv)?):\/\//.test(dbUrl)) {
    import('./services/scheduler.service')
      .then(({ SchedulerService }) => SchedulerService.start())
      .catch((error) => console.warn('⚠️  Could not start scheduler:', error.message));
  } else {
    console.warn('⚠️  DATABASE_URL not configured, scheduler disabled');
  }

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received — closing connections.`);
    try {
      const { SchedulerService } = await import('./services/scheduler.service');
      SchedulerService.stop();
    } catch {
      /* scheduler may not have started */
    }
    await prisma.$disconnect().catch(() => {});
    if (env.SENTRY.enabled) await sentry.flush(2000).catch(() => {});
    process.exit(0);
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('beforeExit', () => prisma.$disconnect().catch(() => {}));
}
