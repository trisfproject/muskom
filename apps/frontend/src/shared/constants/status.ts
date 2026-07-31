export const STATUS = {
  // Common states
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',

  // Candidate states
  SUBMITTED: 'SUBMITTED',
  REVIEWING: 'REVIEWING',
  ACCEPTED: 'ACCEPTED',

  // Attendance states
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',

  // Voting states
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
} as const;

export type StatusType = typeof STATUS[keyof typeof STATUS];
