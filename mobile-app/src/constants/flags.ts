import Constants from 'expo-constants';

type Extra = {
  apiUrl?: string;
  allowCompanySignup?: boolean;
  supportWhatsapp?: string;
  supportEmail?: string;
  privacyUrl?: string;
  termsUrl?: string;
  accountDeletionUrl?: string;
  idleLogoutMinutes?: number;
  requireAppLock?: boolean;
  sentryDsn?: string;
  buildChannel?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

/**
 * Runtime feature flags. Values come from app.config.js, which reads
 * EXPO_PUBLIC_* environment variables at build time.
 *
 * Defaults are enterprise-safe:
 *  - self-serve company signup is OFF
 *  - no support WhatsApp number is exposed in the UI
 *  - idle auto-logout after 15 minutes
 *  - biometric app lock is optional (user-controlled in Settings)
 */
export const Flags = {
  allowCompanySignup: Boolean(extra.allowCompanySignup),
  supportWhatsapp: typeof extra.supportWhatsapp === 'string' ? extra.supportWhatsapp.trim() : '',
  supportEmail: extra.supportEmail || 'support@grandhr.in',
  privacyUrl: extra.privacyUrl || 'https://grandhr.in/privacy-policy',
  termsUrl: extra.termsUrl || 'https://grandhr.in/terms',
  accountDeletionUrl: extra.accountDeletionUrl || 'https://grandhr.in/account-deletion',
  idleLogoutMinutes: Number.isFinite(extra.idleLogoutMinutes) && (extra.idleLogoutMinutes as number) > 0
    ? (extra.idleLogoutMinutes as number)
    : 15,
  requireAppLock: Boolean(extra.requireAppLock),
  sentryDsn: extra.sentryDsn || '',
  buildChannel: extra.buildChannel || 'development',
} as const;

export type FeatureFlags = typeof Flags;
