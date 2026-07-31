import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MoreHorizontal, Eye, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { candidateService } from '@/services/candidate';

const rejectSchema = z.object({
  notes: z.string().min(5, 'Reason must be at least 5 characters'),
});

type RejectFormValues = z.infer<typeof rejectSchema>;

interface CandidateActionMenuProps {
  candidateId: string;
  status: string;
  onViewDetail: (id: string) => void;
}

export function CandidateActionMenu({ candidateId, status, onViewDetail }: CandidateActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<'NONE' | 'APPROVE' | 'REJECT'>('NONE');
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<RejectFormValues>({
    resolver: zodResolver(rejectSchema)
  });

  const mutation = useMutation({
    mutationFn: (variables: { status: 'ACCEPTED' | 'REJECTED', notes?: string }) => 
      candidateService.verifyCandidate(candidateId, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['candidate-summary'] });
      setModalType('NONE');
      setIsOpen(false);
      reset();
    }
  });

  const handleApprove = () => {
    mutation.mutate({ status: 'ACCEPTED' });
  };

  const handleReject = (data: RejectFormValues) => {
    mutation.mutate({ status: 'REJECTED', notes: data.notes });
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition-colors"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-slate-200 z-20">
            <button
              className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
              onClick={() => {
                setIsOpen(false);
                onViewDetail(candidateId);
              }}
            >
              <Eye className="h-4 w-4 mr-2" /> View Detail
            </button>
            
            {(status === 'PENDING' || status === 'REVIEWING') && (
              <>
                <button
                  className="flex w-full items-center px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                  onClick={() => {
                    setIsOpen(false);
                    setModalType('APPROVE');
                  }}
                >
                  <Check className="h-4 w-4 mr-2" /> Approve
                </button>
                <button
                  className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  onClick={() => {
                    setIsOpen(false);
                    setModalType('REJECT');
                  }}
                >
                  <X className="h-4 w-4 mr-2" /> Reject
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* Modals */}
      {modalType !== 'NONE' && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            
            {modalType === 'APPROVE' && (
              <>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Approve Candidate?</h3>
                <p className="text-slate-500 mb-6 text-sm">
                  Candidate will become eligible for Campaign and Voting.
                </p>
                <div className="flex justify-end gap-3">
                  <Button className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50" onClick={() => setModalType('NONE')} disabled={mutation.isPending}>
                    Cancel
                  </Button>
                  <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700 text-white" disabled={mutation.isPending}>
                    {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Confirm Approval
                  </Button>
                </div>
              </>
            )}

            {modalType === 'REJECT' && (
              <form onSubmit={handleSubmit(handleReject)}>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Reject Candidate?</h3>
                <p className="text-slate-500 mb-4 text-sm">
                  Please provide a reason for rejecting this candidate application.
                </p>
                <div className="space-y-2 mb-6">
                  <label className="text-sm font-medium text-slate-700">Rejection Reason <span className="text-red-500">*</span></label>
                  <textarea 
                    className="w-full rounded-md border border-slate-300 p-3 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    rows={3}
                    placeholder="E.g., Incomplete CV..."
                    {...register('notes')}
                    disabled={mutation.isPending}
                  />
                  {errors.notes && (
                    <p className="text-xs text-red-500">{errors.notes.message}</p>
                  )}
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50" onClick={() => { setModalType('NONE'); reset(); }} disabled={mutation.isPending}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" disabled={mutation.isPending}>
                    {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Confirm Rejection
                  </Button>
                </div>
              </form>
            )}
            
          </div>
        </div>
      )}
    </div>
  );
}
