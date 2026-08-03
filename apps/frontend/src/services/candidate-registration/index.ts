import publicApi from '@/lib/public-api';

export interface CandidateRegistrationPayload {
  musyawarah_id: string;
  full_name: string;
  nickname?: string;
  email: string;
  phone: string;
  gender: string;
  birth_place?: string;
  birth_date?: string;
  occupation?: string;
  organization?: string;
  address?: string;
  biography?: string;
  motivation?: string;
  vision?: string;
  mission?: string;
}

export interface CandidateResponse {
  id: string;
  musyawarah_id: string;
  registration_number: string;
  full_name: string;
  status: string;
}

export const candidateRegistrationService = {
  async registerCandidate(payload: CandidateRegistrationPayload): Promise<CandidateResponse> {
    const res = await publicApi.post('/candidates', payload);
    return res.data?.data || res.data || res;
  },

  async getDraft(id: string): Promise<CandidateResponse> {
    const res = await publicApi.get(`/candidates/${id}`);
    return res.data?.data || res.data || res;
  },

  async patchDraft(id: string, payload: Partial<CandidateRegistrationPayload>): Promise<CandidateResponse> {
    const res = await publicApi.patch(`/candidates/${id}`, payload);
    return res.data?.data || res.data || res;
  },

  async deleteDraft(id: string): Promise<void> {
    await publicApi.delete(`/candidates/${id}`);
  },

  async submitCandidate(id: string): Promise<CandidateResponse> {
    const res = await publicApi.patch(`/candidates/${id}`, {
      status: 'Submitted'
    });
    return res.data?.data || res.data || res;
  }
};
