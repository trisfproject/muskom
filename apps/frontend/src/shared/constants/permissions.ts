export const PERMISSIONS = {
  // Attendance
  VIEW_ATTENDANCE: 'attendance:view',
  MANAGE_ATTENDANCE: 'attendance:manage',

  // Voting
  VIEW_VOTING: 'voting:view',
  MANAGE_VOTING: 'voting:manage',

  // Verification
  VERIFY_PARTICIPANT: 'verification:participant',
  VERIFY_CANDIDATE: 'verification:candidate',

  // Config
  MANAGE_EVENT: 'event:manage',
} as const;

export type PermissionType = typeof PERMISSIONS[keyof typeof PERMISSIONS];
