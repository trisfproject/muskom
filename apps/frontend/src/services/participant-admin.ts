import api from '@/lib/api';

export interface AdminParticipantResponse {
  id: string;
  musyawarah_id: string;
  registration_number: string;
  full_name: string;
  nickname?: string;

  email: string;
  phone: string;
  company_name: string;
  industrial_area: string;
  job_title: string;
  department?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ParticipantAuditEntry {
  id: string;
  action: string;
  actor_id?: string;
  actor_role?: string;
  reason?: string;
  previous_value?: { status?: string };
  new_value?: { status?: string };
  created_at: string;
}

export const adminParticipantService = {
  async listParticipants(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<AdminParticipantResponse[]> {
    const response = await api.get('/admin/participants', { params });
    return response.data.data || response.data;
  },

  async getParticipantDetail(id: string): Promise<AdminParticipantResponse> {
    const response = await api.get(`/admin/participants/${id}`);
    return response.data.data || response.data;
  },

  async updateStatus(id: string, payload: { status: string }): Promise<void> {
    await api.patch(`/admin/participants/${id}/status`, payload);
  },

  async getAuditLogs(entityId: string): Promise<ParticipantAuditEntry[]> {
    const response = await api.get(`/admin/audit`, {
      params: { entity_id: entityId, module: 'participant', limit: 50 },
    });
    // API returns { data: { items: [...], total: n } }
    return response.data?.data?.items || response.data?.data || [];
  },
};
