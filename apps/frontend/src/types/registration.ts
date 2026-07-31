export interface PublicRegistrationRequest {
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  participant_category: string;
}

export interface PublicRegistrationResponse {
  registration_code: string;
  status: string;
}
