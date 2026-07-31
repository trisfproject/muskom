export interface CandidateRegistrationPayload {
  // General
  full_name: string;
  email: string;
  phone: string;
  company: string;
  job_title?: string;
  
  // Profile
  vision: string;
  mission: string;
  work_program: string;
  motivation: string;
  biography?: string;

  // Files
  photo?: File;
  cv?: File;
}

export interface CandidateRegistrationResponse {
  candidate_code: string;
  status: string;
}
