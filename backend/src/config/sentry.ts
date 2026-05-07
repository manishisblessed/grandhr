import * as Sentry from '@sentry/node';
import { env } from './env';

let initialised = false;

/**
 * Initialise Sentry on the backend. Safe to call before Express is created —
 * @sentry/node v8+ instruments Node automatically. No-op when SENTRY_DSN is
 * unset so local dev stays quiet and free.
 */
export function initSentry(): void {
  if (initialised) return;
  if (!env.SENTRY.enabled) return;
  Sentry.init({
    dsn: env.SENTRY.dsn,
    environment: env.NODE_ENV,
    tracesSampleRate: env.SENTRY.tracesSampleRate,
    sendDefaultPii: false,
    release: process.env.RENDER_GIT_COMMIT || process.env.VERCEL_GIT_COMMIT_SHA || undefined,
    beforeSend(event) {
      // Strip auth headers and password fields just in case anything leaks in.
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }
      if (event.request?.data && typeof event.request.data === 'object') {
        const data = event.request.data as Record<string, unknown>;
        for (const key of Object.keys(data)) {
          if (/(password|token|secret|otp)/i.test(key)) data[key] = '[Filtered]';
        }
      }
      return event;
    },
  });
  initialised = true;
  console.log('[sentry] Backend telemetry enabled.');
}

export const sentry = Sentry;
