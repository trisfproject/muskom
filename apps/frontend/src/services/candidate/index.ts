import api from '@/lib/api';
import { CandidateListParams, CandidateListResponse, CandidateDetail, ManualCandidatePayload } from '@/types/candidate';
import { VerificationSummary } from '@/types/participant';

export const candidateService = {
  async getCandidates(params: CandidateListParams): Promise<CandidateListResponse> {
    const { data } = await api.get('/admin/candidates', { params });
    return data.data;
  },

  async getCandidateDetail(id: string): Promise<CandidateDetail> {
    const { data } = await api.get(`/admin/candidates/${id}`);
    return data.data;
  },

  async verifyCandidate(id: string, payload: { status: 'ACCEPTED' | 'REJECTED', notes?: string }): Promise<void> {
    await api.patch(`/admin/verification/candidates/${id}`, payload);
  },

  async getSummary(): Promise<VerificationSummary> {
    const { data } = await api.get('/admin/verification/summary');
    return data.data;
  },

  async createManual(payload: ManualCandidatePayload): Promise<void> {
    // 1. Register the participant
    // Auto-generate email since backend requires it but UI spec omits it for manual entry
    const dummyEmail = `manual-${Date.now()}@muskom.local`;
    
    const regRes = await api.post('/registration', {
      full_name: payload.name,
      company: payload.company,
      phone: payload.whatsapp,
      email: dummyEmail,
      participant_category: 'CANDIDATE',
    });

    const registrationId = regRes.data.data.registration_code;

    // 2. Submit candidate application using the new registration code
    await api.post('/candidates', {
      registration_id: registrationId,
      vision: payload.vision || 'N/A',
      mission: payload.mission || 'N/A',
      work_program: payload.work_program || 'N/A'
    });
  }
};
