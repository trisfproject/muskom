export interface EventInfo {
  id: string;
  name: string;
  theme?: string;
  status: 'DRAFT' | 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  publish_result: boolean;
  registration_start?: string;
  registration_end?: string;
}

export interface VerificationSummary {
  total_pending: number;
  pending_participants: number;
  pending_candidates: number;
}

export interface DashboardSummary {
  event: EventInfo | null;
  total_participants: number;
  pending_participants: number;
  total_candidates: number;
  pending_candidates: number;
}
