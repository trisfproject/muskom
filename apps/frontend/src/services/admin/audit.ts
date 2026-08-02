import api from '@/lib/api';

export interface AuditLog {
  id: string;
  module: string;
  action: string;
  entity: string;
  entity_id: string;
  user_id: string | null;
  actor_role: string | null;
  reason: string | null;
  metadata: any | null;
  previous_value: any | null;
  new_value: any | null;
  correlation_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  actor_name: string | null;
  actor_username: string | null;
}

export interface ListAuditLogsResponse {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export const auditService = {
  async listLogs(params?: { search?: string; module?: string; action?: string; user_id?: string; page?: number; limit?: number }): Promise<ListAuditLogsResponse> {
    const response = await api.get('/admin/audit', { params });
    return response.data.data;
  },

  async getLogDetail(id: string): Promise<AuditLog> {
    const response = await api.get(`/admin/audit/${id}`);
    return response.data.data;
  }
};
