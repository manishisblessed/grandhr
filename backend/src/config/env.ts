import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env files exactly once. Subsequent imports get a memoised object.
dotenv.config();

const stringList = z
  .string()
  .optional()
  .transform((v) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : []));

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),

  // ---- Database ----
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .refine(
      (v) => /^postgres(ql)?:\/\//.test(v) || /^mongodb(\+srv)?:\/\//.test(v),
      'DATABASE_URL must be a Postgres or MongoDB connection string',
    ),
  DIRECT_URL: z.string().optional(),

  // ---- Auth ----
  JWT_SECRET: z
    .string()
    .min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // ---- HTTP ----
  CORS_ORIGIN: z.string().optional(),
  FRONTEND_URL: z.string().url().optional(),

  // ---- Email ----
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().optional(),
  SMTP_USER: z.string().optional(),
  EMAIL_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  // ---- Cloudinary ----
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // ---- Web Push ----
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().optional(),

  // ---- Razorpay ----
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),

  // ---- Observability ----
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0.1),

  // Hosting helpers
  VERCEL: z.string().optional(),
  VERCEL_ENV: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // Format Zod errors so the operator sees exactly which env vars are missing.
  const issues = parsed.error.issues
    .map((i) => `  · ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  console.error('\n[env] Invalid environment configuration:\n' + issues + '\n');
  // In production we hard-fail — there is no graceful recovery from bad config.
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

const data = parsed.success ? parsed.data : (envSchema.partial().parse(process.env) as Partial<z.infer<typeof envSchema>>);

// Production-only sanity checks. These prevent the app from launching with
// obviously-unsafe defaults (e.g. JWT_SECRET=='secret', dev hosts, etc.).
const productionWarnings: string[] = [];
if (data.NODE_ENV === 'production') {
  if (!data.JWT_SECRET || /^(secret|change[-_]?me|dev|password)$/i.test(data.JWT_SECRET)) {
    console.error('[env] JWT_SECRET appears to be a placeholder. Set a strong secret before launch.');
    process.exit(1);
  }
  if (!data.FRONTEND_URL) productionWarnings.push('FRONTEND_URL not set — emails and push CTAs will use defaults.');
  if (!data.CORS_ORIGIN) productionWarnings.push('CORS_ORIGIN not set — using a permissive default.');
  if (!data.SMTP_USER && !data.EMAIL_USER) productionWarnings.push('No SMTP credentials set — outgoing emails will fail.');
  if (!data.VAPID_PUBLIC_KEY || !data.VAPID_PRIVATE_KEY) {
    productionWarnings.push('VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY missing — Web Push notifications disabled.');
  }
  if (!data.SENTRY_DSN) productionWarnings.push('SENTRY_DSN not set — server errors will only be logged locally.');
}
if (productionWarnings.length > 0) {
  console.warn('[env] Production warnings:\n' + productionWarnings.map((w) => '  · ' + w).join('\n'));
}

export const env = {
  NODE_ENV: data.NODE_ENV ?? 'development',
  isProduction: data.NODE_ENV === 'production',
  isDevelopment: data.NODE_ENV !== 'production' && data.NODE_ENV !== 'test',
  isTest: data.NODE_ENV === 'test',
  PORT: data.PORT ?? 5000,
  DATABASE_URL: data.DATABASE_URL || '',
  DIRECT_URL: data.DIRECT_URL,
  JWT_SECRET: data.JWT_SECRET || 'unsafe-dev-secret',
  JWT_EXPIRES_IN: data.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: data.CORS_ORIGIN,
  CORS_ORIGINS: data.CORS_ORIGIN
    ? data.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean)
    : [],
  FRONTEND_URL: data.FRONTEND_URL,
  SMTP: {
    host: data.SMTP_HOST,
    port: data.SMTP_PORT,
    user: data.SMTP_USER || data.EMAIL_USER,
    pass: data.SMTP_PASS || data.EMAIL_PASSWORD,
    from: data.EMAIL_FROM,
  },
  CLOUDINARY: {
    name: data.CLOUDINARY_CLOUD_NAME,
    key: data.CLOUDINARY_API_KEY,
    secret: data.CLOUDINARY_API_SECRET,
  },
  PUSH: {
    publicKey: data.VAPID_PUBLIC_KEY,
    privateKey: data.VAPID_PRIVATE_KEY,
    subject: data.VAPID_SUBJECT || 'mailto:noreply@grandhr.in',
    enabled: !!(data.VAPID_PUBLIC_KEY && data.VAPID_PRIVATE_KEY),
  },
  RAZORPAY: {
    keyId: data.RAZORPAY_KEY_ID,
    keySecret: data.RAZORPAY_KEY_SECRET,
  },
  SENTRY: {
    dsn: data.SENTRY_DSN,
    tracesSampleRate: data.SENTRY_TRACES_SAMPLE_RATE ?? 0.1,
    enabled: !!data.SENTRY_DSN,
  },
  IS_VERCEL: data.VERCEL === '1' || !!data.VERCEL_ENV,
};

export type AppEnv = typeof env;
