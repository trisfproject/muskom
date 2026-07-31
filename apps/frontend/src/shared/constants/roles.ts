export const ROLES = {
  ADMIN: 'ADMIN',
  VERIFIER: 'VERIFIER',
  OPERATOR: 'OPERATOR',
  GUEST: 'GUEST',
} as const;

export type RoleType = typeof ROLES[keyof typeof ROLES];
