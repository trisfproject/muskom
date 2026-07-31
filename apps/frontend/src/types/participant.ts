export interface ParticipantItem {
  id: string;
  event_id: string;
  event_name: string;
  participant_name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  participant_category: string;
  source: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  updated_at: string;
}

export interface ParticipantListResponse {
  data: ParticipantItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ParticipantDetail {
  id: string;
  event_id: string;
  participant_category: string;
  source: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  person_id: string;
  full_name: string;
  email: string;
  phone: string;
  institution: string;
}

export interface ParticipantListParams {
  page?: number;
  limit?: number;
  status?: string;
  participant_name?: string;
  phone?: string;
}

export interface VerificationSummary {
  total_pending: number;
  pending_participants: number;
  pending_candidates: number;
}
