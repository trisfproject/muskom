import publicApi from '@/lib/public-api';

export interface PublicParticipantRegistrationPayload {
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

export interface PublicParticipantRegistrationResponse {
  registration_code: string;
  registration_number: string | null;
  qr_token: string | null;
  status: string;
}

export const participantRegistrationService = {
  async register(payload: PublicParticipantRegistrationPayload): Promise<PublicParticipantRegistrationResponse> {
    const { data } = await publicApi.post('/public/register', payload);
    return data.data;
  }
};
