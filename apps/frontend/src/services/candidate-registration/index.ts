import publicApi from '@/lib/public-api';
import { CandidateRegistrationPayload, CandidateRegistrationResponse } from '@/types/candidate-registration';

export const candidateRegistrationService = {
  async registerCandidate(payload: CandidateRegistrationPayload): Promise<CandidateRegistrationResponse> {
    // Step 1: Register as a Participant first
    // Backend requirement: Candidates must have an APPROVED participant registration ID
    const regRes = await publicApi.post('/public/registrations', {
      full_name: payload.full_name,
      email: payload.email,
      phone: payload.phone,
      company: payload.company,
      job_title: payload.job_title,
      participant_category: 'CANDIDATE',
    });
    
    // registration_code acts as the registration_id for the next call
    const registrationId = regRes.data.data.registration_code;

    // Step 2: Register as a Candidate
    // Note: If the event is set to MANUAL approval for participants, this will fail
    // with 400 (ErrRegistrationNotApproved).
    const candRes = await publicApi.post('/public/candidates', {
      registration_id: registrationId,
      vision: payload.vision,
      mission: payload.mission,
      work_program: payload.work_program,
      // motivation and biography are omitted as they are not supported by the backend DTO
    });

    const candidateCode = candRes.data.data.candidate_code;
    const status = candRes.data.data.status;

    // Step 3: Upload Documents if present
    if (payload.photo || payload.cv) {
      const formData = new FormData();
      if (payload.photo) formData.append('photo', payload.photo);
      if (payload.cv) formData.append('document', payload.cv);

      await publicApi.post(`/public/candidates/${candidateCode}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }

    return {
      candidate_code: candidateCode,
      status: status,
    };
  }
};
