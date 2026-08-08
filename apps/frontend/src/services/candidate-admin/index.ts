import api from "@/lib/api";

export interface CandidateAdminResponse {
  id: string;
  registration_number: string;
  full_name: string;
  nickname?: string;
  email: string;
  phone: string;
  company_name?: string;
  industrial_area?: string;
  job_title?: string;
  department?: string;

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
      process.env.NEXT_PUBLIC_API_URL || "/api/v1"
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

  // Create candidate
  createCandidate: async (payload: any) => {
    const { data } = await api.post<{ data: CandidateAdminResponse }>(
      "/admin/candidates",
      payload
    );
    return data.data;
  },

  // Update candidate
  updateCandidate: async (id: string, payload: any) => {
    const { data } = await api.put<{ data: CandidateAdminResponse }>(
      `/admin/candidates/${id}`,
      payload
    );
    return data.data;
  },

  // Delete candidate
  deleteCandidate: async (id: string) => {
    const { data } = await api.delete<{ data: null }>(
      `/admin/candidates/${id}`
    );
    return data.data;
  },

  // Bulk delete candidates
  bulkDeleteCandidates: async (ids: string[]) => {
    const { data } = await api.post<{ data: null }>(
      "/admin/candidates/bulk-delete",
      { ids }
    );
    return data.data;
  },

  // Upload candidate photo
  uploadPhoto: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("photo", file);
    const { data } = await api.post<{ data: CandidateAdminResponse }>(
      `/admin/candidates/${id}/photo`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return data.data;
  },

  /** Export all candidates to CSV and trigger browser download */
  exportCSV(filters?: { status?: string; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.search) params.set('search', filters.search);
    const query = params.toString() ? `?${params.toString()}` : '';
    const baseUrl = (api.defaults.baseURL || '').replace(/\/$/, '');
    window.open(`${baseUrl}/admin/candidates/export/csv${query}`, '_blank');
  },
};
