import publicApi from '@/lib/public-api';
import { PublicRegistrationRequest, PublicRegistrationResponse } from '@/types/registration';

export const registrationService = {
  async registerParticipant(payload: PublicRegistrationRequest): Promise<PublicRegistrationResponse> {
    const response = await publicApi.post('/public/registrations', payload);
    return response.data.data;
  }
};
