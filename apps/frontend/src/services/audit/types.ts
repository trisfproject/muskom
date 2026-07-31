export interface AuditFilter {
  page?: number;
  limit?: number;
  module?: string;
  action?: string;
  entity?: string;
  entity_id?: string;
  actor_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface AuditEntry {
  id: string;
  module: string;
  entity: string;
  entity_id: string;
  action: string;
  actor_id?: string;
  actor_role?: string;
  reason?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}
