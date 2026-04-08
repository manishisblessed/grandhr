/**
 * Extends app.json. Set EXPO_PUBLIC_API_URL for EAS/local builds (see .env.example).
 * Play Store builds should point at your production API (HTTPS).
 */
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
    },
  };
};
