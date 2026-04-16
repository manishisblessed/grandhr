/**
 * Extends app.json. Reads environment variables to configure the build.
 * See .env.example for the list of supported variables.
 *
 * Play/App Store builds should point at your production API (HTTPS).
 */
const toBool = (v, def = false) => {
  if (v === undefined || v === null || v === '') return def;
  return ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase());
};

const toInt = (v, def) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : def;
};

module.exports = ({ config }) => {
  const apiUrl =
    process.env.EXPO_PUBLIC_API_URL ||
    config.extra?.apiUrl ||
    'https://api.grandhr.in/api';

  return {
    ...config,
    extra: {
      ...config.extra,
      apiUrl,
      // Feature flags (all default to the safe/enterprise values).
      allowCompanySignup: toBool(process.env.EXPO_PUBLIC_ALLOW_COMPANY_SIGNUP, false),
      supportWhatsapp: process.env.EXPO_PUBLIC_SUPPORT_WHATSAPP || '',
      supportEmail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL || 'support@grandhr.in',
      privacyUrl: process.env.EXPO_PUBLIC_PRIVACY_URL || 'https://grandhr.in/privacy-policy',
      termsUrl: process.env.EXPO_PUBLIC_TERMS_URL || 'https://grandhr.in/terms',
      accountDeletionUrl:
        process.env.EXPO_PUBLIC_ACCOUNT_DELETION_URL || 'https://grandhr.in/account-deletion',
      idleLogoutMinutes: toInt(process.env.EXPO_PUBLIC_IDLE_LOGOUT_MINUTES, 15),
      requireAppLock: toBool(process.env.EXPO_PUBLIC_REQUIRE_APP_LOCK, false),
      sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
      buildChannel: process.env.EAS_BUILD_PROFILE || process.env.NODE_ENV || 'development',
    },
  };
};
