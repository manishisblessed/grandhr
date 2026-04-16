import Constants from 'expo-constants';
import { Flags } from '../constants/flags';

/**
 * Thin wrapper so the rest of the app can call `Telemetry.captureError(err)`
 * without caring whether a crash-reporting SDK is wired up.
 *
 * To enable real crash reporting:
 *  1. `npx expo install @sentry/react-native`
 *  2. set EXPO_PUBLIC_SENTRY_DSN
 *  3. initialise Sentry inside `init()` below.
 *
 * Keeping this indirection means we don't add a heavyweight dependency until
 * the operator actually wants telemetry, which avoids collecting data we
 * haven't disclosed on the Play Console "Data safety" form.
 */

let initialised = false;

export const Telemetry = {
  init() {
    if (initialised) return;
    initialised = true;
    // Intentionally no-op when no DSN is configured. When enabling Sentry,
    // call Sentry.init({ dsn: Flags.sentryDsn, environment: Flags.buildChannel, ... }) here.
    if (__DEV__ && !Flags.sentryDsn) {
      // eslint-disable-next-line no-console
      console.log('[telemetry] disabled (no EXPO_PUBLIC_SENTRY_DSN)');
    }
  },

  captureError(error: unknown, context?: Record<string, unknown>) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.error('[telemetry]', error, context);
    }
    // When Sentry is wired: Sentry.captureException(error, { extra: context });
  },

  captureMessage(message: string, context?: Record<string, unknown>) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[telemetry]', message, context);
    }
    // When Sentry is wired: Sentry.captureMessage(message, { extra: context });
  },

  /**
   * Small helper to include in bug reports / About screen.
   */
  diagnostics(): Record<string, string | number | boolean> {
    return {
      appVersion: Constants.expoConfig?.version || 'unknown',
      runtimeVersion:
        (Constants.expoConfig?.runtimeVersion as string | undefined) || 'unknown',
      channel: Flags.buildChannel,
      platform: Constants.platform ? Object.keys(Constants.platform).join(',') : 'unknown',
    };
  },
};
