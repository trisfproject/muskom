import publicApi from '@/lib/public-api';

export interface PublicParticipantRegistrationPayload {
  musyawarah_id: string;
  full_name: string;
  email: string;
  phone: string;
  organization: string;
  position: string;
  membership_number: string;
  province: string;
  city: string;
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
