export interface SystemHealth {
  api_status: string;
  database_status: string;
  worker_status: string;
}

export interface EventStatus {
  phase: string;
  registration_open: boolean;
  verification_active: boolean;
  voting_session_state: string;
}

export interface DashboardSummary {
  total_participants: number;
  approved_participants: number;
  total_candidates: number;
  checked_in: number;
  votes_cast: number;
  pending_notifications: number;
}

export interface RecentActivity {
  id: string;
  action: string;
  actor: string;
  role: string;
  timestamp: string;
}

export interface DashboardData {
  event_id: string;
  health: SystemHealth;
  status: EventStatus;
  summary: DashboardSummary;
  recent_activity: RecentActivity[];
}
