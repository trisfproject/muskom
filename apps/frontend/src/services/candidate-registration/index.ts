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
  verification_notes?: string;
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
  },

  async getDocuments(id: string): Promise<CandidateDocumentResponse[]> {
    const res = await publicApi.get(`/candidates/${id}/documents`);
    return res.data?.data || res.data || res;
  },

  async uploadDocument(id: string, docType: string, file: File): Promise<CandidateDocumentResponse> {
    const formData = new FormData();
    formData.append('document_type', docType);
    formData.append('file', file);
    
    const res = await publicApi.post(`/candidates/${id}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data?.data || res.data || res;
  },

  async deleteDocument(id: string, docId: string): Promise<void> {
    await publicApi.delete(`/candidates/${id}/documents/${docId}`);
  },

  getDocumentStreamUrl(id: string, docId: string): string {
    return `${publicApi.defaults.baseURL}/candidates/${id}/documents/${docId}/stream`;
  }
};

export interface CandidateDocumentResponse {
  id: string;
  candidate_id: string;
  document_type: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  uploaded_at: string;
}
