import { useQuery } from '@tanstack/react-query';
import { participantService } from '@/services/participant';
import { X, Loader2, Building, Phone, Mail, Calendar, User } from 'lucide-react';
import { ParticipantStatusBadge } from './ParticipantStatusBadge';

interface ParticipantDetailDrawerProps {
  participantId: string | null;
  onClose: () => void;
}

export function ParticipantDetailDrawer({ participantId, onClose }: ParticipantDetailDrawerProps) {
  const { data: detail, isLoading, isError } = useQuery({
    queryKey: ['participant-detail', participantId],
    queryFn: () => participantService.getParticipantDetail(participantId!),
    enabled: !!participantId,
  });

  if (!participantId) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/50 z-40 transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform border-l border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-900">Participant Details</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p>Loading participant details...</p>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center h-full text-red-500 text-center">
              <p className="mb-2 font-medium">Failed to load details</p>
              <p className="text-sm">Please try again or close this panel.</p>
            </div>
          )}

          {detail && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{detail.full_name}</h3>
                <ParticipantStatusBadge status={detail.status} />
              </div>

              {detail.status === 'REJECTED' && detail.rejection_reason && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <p className="text-xs font-semibold text-red-800 mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-900">{detail.rejection_reason}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Company / Institution</p>
                    <p className="text-slate-900">{detail.institution}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email Address</p>
                    <p className="text-slate-900">{detail.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">WhatsApp Number</p>
                    <p className="text-slate-900">{detail.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Category & Source</p>
                    <p className="text-slate-900">{detail.participant_category} • {detail.source}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Registration Date</p>
                    <p className="text-slate-900">{new Date(detail.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-500 text-center">
                  Registration ID: <span className="font-mono text-slate-400">{detail.id}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
