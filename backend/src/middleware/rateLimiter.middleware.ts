import rateLimit from 'express-rate-limit';

// General API rate limiter — per IP, fairly generous for normal use.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for auth endpoints (login/register/forgot-*)
// Successful logins shouldn't count toward the limit.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: 'Too many auth attempts. Please wait a few minutes and try again.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// Sensitive ops that send emails/push or change passwords. Lower than authLimiter
// because these are server-cost heavy and abuse-prone.
export const sensitiveLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: 'You\u2019re doing that too often. Please wait a moment and try again.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Outbound email/push test limiter — these are valuable to abusers because they
// generate real outbound traffic on our domain.
export const blastLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: 'Too many test sends. Please wait a few minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

