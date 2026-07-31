import { useQuery } from '@tanstack/react-query';
import { candidateService } from '@/services/candidate';
import { X, Loader2, Calendar, User, FileText, Image as ImageIcon, History, Target, Lightbulb } from 'lucide-react';
import { CandidateStatusBadge } from './CandidateStatusBadge';

interface CandidateDetailDrawerProps {
  candidateId: string | null;
  onClose: () => void;
}

export function CandidateDetailDrawer({ candidateId, onClose }: CandidateDetailDrawerProps) {
  const { data: detail, isLoading, isError } = useQuery({
    queryKey: ['candidate-detail', candidateId],
    queryFn: () => candidateService.getCandidateDetail(candidateId!),
    enabled: !!candidateId,
  });

  if (!candidateId) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/50 z-40 transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-y-0 right-0 w-full sm:w-[550px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform border-l border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-900">Candidate Details</h2>
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
              <p>Loading candidate details...</p>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center h-full text-red-500 text-center">
              <p className="mb-2 font-medium">Failed to load details</p>
              <p className="text-sm">Please try again or close this panel.</p>
            </div>
          )}

          {detail && (
            <div className="space-y-8">
              {/* Header Info */}
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{detail.name}</h3>
                <div className="flex items-center gap-3">
                  <CandidateStatusBadge status={detail.status} />
                  <span className="text-sm font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {detail.candidate_code}
                  </span>
                </div>
              </div>

              {/* General Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Category</p>
                    <p className="text-slate-900">{detail.participant_category}</p>
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

              {/* Documents */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2">Documents</h4>
                <div className="grid grid-cols-2 gap-4">
                  {detail.photo_url ? (
                    <a href={detail.photo_url} target="_blank" rel="noreferrer" className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <ImageIcon className="h-8 w-8 text-blue-500 mb-2" />
                      <span className="text-sm font-medium text-blue-600">View Photo</span>
                    </a>
                  ) : (
                    <div className="flex flex-col items-center p-4 border border-dashed border-slate-300 rounded-lg bg-slate-50">
                      <ImageIcon className="h-8 w-8 text-slate-300 mb-2" />
                      <span className="text-sm text-slate-400">No Photo</span>
                    </div>
                  )}

                  {detail.document_url ? (
                    <a href={detail.document_url} target="_blank" rel="noreferrer" className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <FileText className="h-8 w-8 text-blue-500 mb-2" />
                      <span className="text-sm font-medium text-blue-600">View CV / Document</span>
                    </a>
                  ) : (
                    <div className="flex flex-col items-center p-4 border border-dashed border-slate-300 rounded-lg bg-slate-50">
                      <FileText className="h-8 w-8 text-slate-300 mb-2" />
                      <span className="text-sm text-slate-400">No Document</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Vision & Mission */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2">Candidate Profile</h4>
                
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 mb-2 text-slate-700">
                    <Lightbulb className="h-4 w-4" />
                    <h5 className="font-medium text-sm">Vision</h5>
                  </div>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{detail.vision}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 mb-2 text-slate-700">
                    <Target className="h-4 w-4" />
                    <h5 className="font-medium text-sm">Mission</h5>
                  </div>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{detail.mission}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 mb-2 text-slate-700">
                    <FileText className="h-4 w-4" />
                    <h5 className="font-medium text-sm">Work Programs</h5>
                  </div>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{detail.work_program}</p>
                </div>
              </div>

              {/* Verification History */}
              {detail.audit_history && detail.audit_history.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                    <History className="h-4 w-4" /> Audit History
                  </h4>
                  <div className="space-y-3">
                    {detail.audit_history.map((audit) => (
                      <div key={audit.id} className="text-sm border-l-2 border-slate-300 pl-3 py-1">
                        <p className="font-medium text-slate-900">{audit.action}</p>
                        <p className="text-xs text-slate-500 mb-1">
                          {new Date(audit.created_at).toLocaleString()} {audit.user_name && `by ${audit.user_name}`}
                        </p>
                        {audit.metadata && <p className="text-slate-600 font-mono text-xs">{audit.metadata}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
            </div>
          )}
        </div>
      </div>
    </>
  );
}
