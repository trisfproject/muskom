import api from '@/lib/api';
import { ParticipantListParams, ParticipantListResponse, ParticipantDetail, VerificationSummary } from '@/types/participant';

export const participantService = {
  async getParticipants(params: ParticipantListParams): Promise<ParticipantListResponse> {
    const { data } = await api.get('/admin/registration', { params });
    return data.data;
  },

  async getParticipantDetail(id: string): Promise<ParticipantDetail> {
    const { data } = await api.get(`/admin/verification/participants/${id}`);
    return data.data;
  },

  async verifyParticipant(id: string, payload: { status: 'APPROVED' | 'REJECTED', rejection_reason?: string }): Promise<void> {
    await api.patch(`/admin/verification/participants/${id}`, payload);
  },

  async getVerificationSummary(): Promise<VerificationSummary> {
    const { data } = await api.get('/admin/verification/summary');
    return data.data;
  }
};
