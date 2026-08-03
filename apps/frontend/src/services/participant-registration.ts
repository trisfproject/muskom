import publicApi from '@/lib/public-api';

export interface PublicParticipantRegistrationPayload {
  musyawarah_id: string;
  full_name: string;
  nickname?: string;
  gender: string;
  email: string;
  phone: string;
  company_name: string;
  industrial_area: string;
  job_title: string;
  department?: string;
}

export interface PublicParticipantRegistrationResponse {
  registration_number: string;
  qr_token: string;
}

export const participantRegistrationService = {
  async register(payload: PublicParticipantRegistrationPayload): Promise<PublicParticipantRegistrationResponse> {
    const { data } = await publicApi.post('/public/participants/register', payload);
    return data.data;
  }
};
