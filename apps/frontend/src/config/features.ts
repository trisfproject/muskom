/**
 * Application feature flags.
 * These can be mapped to environment variables or fetched from a remote config.
 */
export const FEATURES = {
  ATTENDANCE_MODULE: process.env.NEXT_PUBLIC_FEATURE_ATTENDANCE === 'true' || true,
  VOTING_MODULE: process.env.NEXT_PUBLIC_FEATURE_VOTING === 'true' || true,
  REALTIME_SYNC: process.env.NEXT_PUBLIC_FEATURE_REALTIME === 'true' || true,
  NOTIFICATION_SERVICE: process.env.NEXT_PUBLIC_FEATURE_NOTIFICATIONS === 'true' || false,
  REPORTING_SERVICE: process.env.NEXT_PUBLIC_FEATURE_REPORTING === 'true' || false,
} as const;
