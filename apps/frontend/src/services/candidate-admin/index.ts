import api from "@/lib/api";

export interface CandidateAdminResponse {
  id: string;
  musyawarah_id: string;
  registration_number: string;
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
  profile_photo?: string;
  status: string;
  verification_notes?: string;
  candidate_number?: number;
  display_order: number;
  publication_status: string;
  published_at?: string;
  show_biography: boolean;
  show_vision: boolean;
  show_mission: boolean;
  show_photo: boolean;
  created_at: string;
  updated_at: string;
  documents?: CandidateAdminDocumentResponse[];
}

export interface CandidateAdminDocumentResponse {
  id: string;
  candidate_id: string;
  document_type: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  uploaded_at: string;
  verification_status?: string;
  verification_notes?: string;
}

export const candidateAdminService = {
  // Get all candidates with filters
  getCandidates: async (params?: {
    status?: string;
    musyawarah_id?: string;
    search?: string;
  }) => {
    const { data } = await api.get<{ data: CandidateAdminResponse[] }>(
      "/admin/candidates",
      { params }
    );
    return data.data;
  },

  // Get specific candidate detail
  getCandidateDetail: async (id: string) => {
    const { data } = await api.get<{ data: CandidateAdminResponse }>(
      `/admin/candidates/${id}`
    );
    return data.data;
  },

  // Verify candidate (Approve, Reject, Request Revision, Under Review)
  verifyCandidate: async (
    id: string,
    status: string,
    notes?: string
  ) => {
    const { data } = await api.patch<{ data: null }>(
      `/admin/candidates/${id}/verify`,
      {
        status,
        verification_notes: notes,
      }
    );
    return data.data;
  },

  // Verify a specific document
  verifyDocument: async (
    id: string,
    docId: string,
    status: string, // "Valid" | "Invalid"
    notes?: string
  ) => {
    const { data } = await api.patch<{ data: null }>(
      `/admin/candidates/${id}/documents/${docId}/verify`,
      {
        verification_status: status,
        verification_notes: notes,
      }
    );
    return data.data;
  },

  // Get document stream URL for preview
  getDocumentStreamUrl: (id: string, docId: string) => {
    return `${
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3101/api/v1"
    }/admin/candidates/${id}/documents/${docId}/stream`;
  },

  // Publication Methods
  publishCandidate: async (id: string) => {
    const { data } = await api.post<{ data: null }>(
      `/admin/candidates/${id}/publish`
    );
    return data.data;
  },

  unpublishCandidate: async (id: string) => {
    const { data } = await api.post<{ data: null }>(
      `/admin/candidates/${id}/unpublish`
    );
    return data.data;
  },

  updatePublicationSettings: async (
    id: string,
    settings: {
      candidate_number?: number;
      display_order: number;
      show_biography: boolean;
      show_vision: boolean;
      show_mission: boolean;
      show_photo: boolean;
    }
  ) => {
    const { data } = await api.put<{ data: null }>(
      `/admin/candidates/${id}/publication`,
      settings
    );
    return data.data;
  },

  reorderCandidates: async (items: { id: string; display_order: number }[]) => {
    const { data } = await api.put<{ data: null }>(
      `/admin/candidates/reorder`,
      { items }
    );
    return data.data;
  },
};
