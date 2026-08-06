import api from '@/lib/api';
import { DashboardSummary, EventInfo, VerificationSummary } from '@/types/dashboard';

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    try {
      // Execute calls concurrently using existing working endpoints
      const [eventRes, verificationRes, participantStatsRes, candidatesRes] = await Promise.allSettled([
        api.get('/admin/musyawarah'),
        api.get('/admin/verifications/summary'),
        api.get('/admin/participants/stats'),
        api.get('/admin/candidates')
      ]);

      const event = eventRes.status === 'fulfilled' ? eventRes.value.data.data as EventInfo : null;
      
      const verification = verificationRes.status === 'fulfilled' 
        ? verificationRes.value.data.data as VerificationSummary 
        : { pending_participants: 0, pending_candidates: 0, total_pending: 0 };
        
      const totalParticipants = participantStatsRes.status === 'fulfilled'
        ? participantStatsRes.value.data.data?.total || 0
        : 0;

      const pendingParticipants = participantStatsRes.status === 'fulfilled'
        ? participantStatsRes.value.data.data?.pending || 0
        : verification.pending_participants;

      const candidateData = candidatesRes.status === 'fulfilled'
        ? candidatesRes.value.data.data
        : null;
      const totalCandidates = Array.isArray(candidateData) 
        ? candidateData.length 
        : candidateData?.total || 0;

      return {
        event,
        total_participants: totalParticipants,
        pending_participants: pendingParticipants,
        total_candidates: totalCandidates,
        pending_candidates: verification.pending_candidates,
      };
    } catch (error) {
      throw error;
    }
  }
};
