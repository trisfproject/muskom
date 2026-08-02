export interface PublicRegistrationRequest {
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  participant_category: string;
  region?: string;
  community?: string;
  special_notes?: string;
}

export interface PublicRegistrationResponse {
  registration_code: string;
  registration_number?: string;
  qr_token?: string;
  status: string;
}

export interface AdminRegistrationResponse {
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
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AdminListRegistrationsResponse {
  data: AdminRegistrationResponse[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface AdminUpdateRegistrationStatusRequest {
  status: "PENDING" | "APPROVED" | "REJECTED";
}
