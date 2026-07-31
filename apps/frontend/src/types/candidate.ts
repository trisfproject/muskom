export interface CandidateItem {
  id: string;
  candidate_code: string;
  registration_id: string;
  name: string;
  participant_category: string;
  status: 'PENDING' | 'REVIEWING' | 'ACCEPTED' | 'REJECTED';
  created_at: string;
}

export interface CandidateListResponse {
  data: CandidateItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface CandidateAuditLog {
  id: string;
  action: string;
  metadata: string;
  created_at: string;
  user_name?: string;
}

export interface CandidateDetail extends CandidateItem {
  vision: string;
  mission: string;
  work_program: string;
  photo_url?: string;
  document_url?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  reviewer_name?: string;
  audit_history?: CandidateAuditLog[];
}

export interface CandidateListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  candidate_id?: string;
  registration_id?: string;
}

export interface ManualCandidatePayload {
  name: string;
  company: string;
  whatsapp: string;
  vision?: string;
  mission?: string;
  work_program?: string;
}
