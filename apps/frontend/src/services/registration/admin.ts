import api from '@/lib/api';
import { 
  AdminListRegistrationsResponse, 
  AdminRegistrationResponse, 
  AdminUpdateRegistrationStatusRequest 
} from '@/types/registration';

export const adminRegistrationService = {
  async listRegistrations(params?: {
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: string;
    status?: string;
    participant_name?: string;
  }): Promise<AdminListRegistrationsResponse> {
    const response = await api.get('/admin/registrations', { params });
    return response.data.data;
  },

  async getRegistrationDetail(id: string): Promise<AdminRegistrationResponse> {
    const response = await api.get(`/admin/registrations/${id}`);
    return response.data.data;
  },

  async updateRegistrationStatus(id: string, payload: AdminUpdateRegistrationStatusRequest): Promise<void> {
    await api.patch(`/admin/registrations/${id}/status`, payload);
  }
};
