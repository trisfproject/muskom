import api from '@/lib/api';

export interface AdminParticipantResponse {
  id: string;
  event_id: string;
  registration_number: string;
  event_name: string;
  // Backend list API returns full_name as participant_name via query alias
  participant_name: string;
  // Backend returns company_name (from registrations.company_name)
  company_name: string;
  // Legacy alias kept for edit-form backward compat (editForm.company)
  company: string;
  // Backend returns industrial_area (derived from registrations.region)
  industrial_area: string;
  // Legacy alias kept for edit-form backward compat (editForm.region)
  region: string;
  nickname: string;
  email: string;
  phone: string;
  job_title: string;
  community: string;
  participant_category: string;
  source: string;
  status: string;
  special_notes: string;
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

export interface EmailLogResponse {
  id: string;
  email_type: string;
  recipient_email: string;
  status: string;
  sent_at?: string;
  last_retry_at?: string;
  retry_count: number;
  last_error?: string;
}

// ─── Dashboard / Stats types ──────────────────────────────────────────────────

export interface LabelCount {
  label: string;
  count: number;
}

export interface DailyCount {
  date: string;  // "YYYY-MM-DD"
  count: number;
}

export interface RecentParticipant {
  id: string;
  registration_number: string;
  full_name: string;
  company_name: string;
  industrial_area: string;
  status: string;
  created_at: string;
}

export interface ParticipantStats {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
  today: number;
  by_industrial_area: LabelCount[];
  by_company: LabelCount[];
  by_date: DailyCount[];
  recent: RecentParticipant[];
  limit?: number;
}

export interface PaginatedParticipants {
  data: AdminParticipantResponse[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export const adminParticipantService = {
  async listParticipants(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedParticipants> {
    const response = await api.get('/admin/registrations', { params });
    const payload = response.data.data || response.data;
    return {
      data: payload.data || payload || [],
      total: payload.total || 0,
      page: payload.page || 1,
      limit: payload.limit || 10,
      total_pages: payload.total_pages || 1,
    };
  },

  async getParticipantDetail(id: string): Promise<AdminParticipantResponse> {
    const response = await api.get(`/admin/registrations/${id}`);
    return response.data.data || response.data;
  },

  async updateStatus(id: string, payload: { status: string, reason?: string }): Promise<void> {
    await api.patch(`/admin/registrations/${id}/status`, payload);
  },

  async getEmailHistory(id: string): Promise<EmailLogResponse[]> {
    const response = await api.get(`/admin/registrations/${id}/emails`);
    return response.data.data || response.data;
  },

  async resendEmail(id: string, emailType: string): Promise<void> {
    await api.post(`/admin/registrations/${id}/emails/resend`, { email_type: emailType });
  },

  async retryEmailLog(logId: string): Promise<void> {
    await api.post(`/admin/emails/${logId}/retry`);
  },

  async createParticipant(payload: any): Promise<AdminParticipantResponse> {
    const response = await api.post('/admin/participants', payload);
    return response.data.data || response.data;
  },

  async updateParticipant(id: string, payload: Partial<AdminParticipantResponse>): Promise<AdminParticipantResponse> {
    const apiPayload = {
      full_name: payload.participant_name,
      nickname: payload.nickname,
      email: payload.email,
      phone: payload.phone,
      company_name: payload.company,
      industrial_area: payload.region,
      job_title: payload.job_title,
      department: payload.community,
      special_notes: payload.special_notes,
    };
    const response = await api.put(`/admin/participants/${id}`, apiPayload);
    return response.data.data || response.data;
  },

  async deleteParticipant(id: string): Promise<void> {
    await api.delete(`/admin/participants/${id}`);
  },

  async bulkDelete(ids: string[]): Promise<void> {
    await api.post('/admin/participants/bulk-delete', { ids });
  },

  async bulkUpdateStatus(ids: string[], status: string, reason?: string): Promise<void> {
    await api.post('/admin/participants/bulk-status', { ids, status, reason });
  },

  async getAuditLogs(entityId: string): Promise<ParticipantAuditEntry[]> {
    const response = await api.get(`/admin/audit`, {
      params: { entity_id: entityId, module: 'participant', limit: 50 },
    });
    // API returns { data: { items: [...], total: n } }
    return response.data?.data?.items || response.data?.data || [];
  },

  /** Aggregated dashboard stats — single round-trip, no N+1 */
  async getStats(): Promise<ParticipantStats> {
    const response = await api.get('/admin/participants/stats');
    return response.data.data;
  },

  /** Export all participants to CSV and trigger browser download */
  async exportCSV(filters?: {
    status?: string;
    search?: string;
    participant_name?: string;
    email?: string;
    phone?: string;
    area?: string;
    department?: string;
    region?: string;
    community?: string;
  }): Promise<void> {
    const params: Record<string, any> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.search) params.search = filters.search;
    if (filters?.participant_name) params.participant_name = filters.participant_name;
    if (filters?.email) params.email = filters.email;
    if (filters?.phone) params.phone = filters.phone;
    if (filters?.area) params.area = filters.area;
    if (filters?.department) params.department = filters.department;
    if (filters?.region) params.region = filters.region;
    if (filters?.community) params.community = filters.community;

    const response = await api.get('/admin/registrations/export/csv', {
      params,
      responseType: 'blob',
    });

    let filename = 'data-peserta.csv';
    const disposition = response.headers['content-disposition'];
    if (disposition) {
      const match = disposition.match(/filename=["']?([^"';]+)["']?/i);
      if (match && match[1]) {
        filename = match[1].trim();
      }
    }

    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
