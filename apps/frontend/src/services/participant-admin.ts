import api from '@/lib/api';

export interface AdminParticipantResponse {
  id: string;
  musyawarah_id: string;
  registration_number: string;
  full_name: string;
  nickname?: string;
  gender: string;
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

export const adminParticipantService = {
  async listParticipants(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<AdminParticipantResponse[]> {
    const response = await api.get('/admin/participants', { params });
    // If backend returns data in data.data or directly in data
    // Usually it returns { message: "...", data: [...] }
    return response.data.data || response.data;
  },

  async getParticipantDetail(id: string): Promise<AdminParticipantResponse> {
    const response = await api.get(`/admin/participants/${id}`);
    return response.data.data || response.data;
  },

  async updateStatus(id: string, payload: { status: string }): Promise<void> {
    await api.patch(`/admin/participants/${id}/status`, payload);
  }
};
