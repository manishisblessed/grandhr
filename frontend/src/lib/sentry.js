import * as Sentry from '@sentry/react';

let initialised = false;

/**
 * Initialise Sentry on the frontend. No-op when VITE_SENTRY_DSN is unset.
 * Safe to call before the React tree mounts.
 */
export function initSentry() {
  if (initialised) return;
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION || undefined,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? 0.05),
    sendDefaultPii: false,
    beforeSend(event) {
      if (event.request?.headers) {
        delete event.request.headers.Authorization;
        delete event.request.headers.authorization;
        delete event.request.headers.Cookie;
      }
      return event;
    },
  });
  initialised = true;
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log('[sentry] Frontend telemetry enabled.');
  }
}

export function captureException(err, context) {
  if (!initialised) return;
  Sentry.captureException(err, context ? { extra: context } : undefined);
}

export { Sentry };
