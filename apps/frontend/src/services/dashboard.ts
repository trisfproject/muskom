import api from '@/lib/api';
import { DashboardSummary, EventInfo, VerificationSummary } from '@/types/dashboard';

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    try {
      // Execute calls concurrently
      const [eventRes, verificationRes, participantsRes, candidatesRes] = await Promise.allSettled([
        api.get('/admin/musyawarah'),
        api.get('/admin/verification/summary'),
        api.get('/admin/registration?limit=1'),
        api.get('/admin/candidate?limit=1')
      ]);

      const event = eventRes.status === 'fulfilled' ? eventRes.value.data.data as EventInfo : null;
      
      const verification = verificationRes.status === 'fulfilled' 
        ? verificationRes.value.data.data as VerificationSummary 
        : { pending_participants: 0, pending_candidates: 0, total_pending: 0 };
        
      const totalParticipants = participantsRes.status === 'fulfilled'
        ? participantsRes.value.data.data.total || 0
        : 0;

      const totalCandidates = candidatesRes.status === 'fulfilled'
        ? candidatesRes.value.data.data.total || 0
        : 0;

      return {
        event,
        total_participants: totalParticipants,
        pending_participants: verification.pending_participants,
        total_candidates: totalCandidates,
        pending_candidates: verification.pending_candidates,
      };
    } catch (error) {
      throw error;
    }
  }
};
