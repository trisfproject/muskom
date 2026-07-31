import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { candidateService } from '@/services/candidate';

const manualCandidateSchema = z.object({
  name: z.string().min(2, 'Name is required').max(255),
  company: z.string().min(2, 'Company is required').max(255),
  whatsapp: z.string().min(8, 'Valid WhatsApp is required').max(50),
  vision: z.string().optional(),
  mission: z.string().optional(),
  work_program: z.string().optional(),
});

type ManualCandidateForm = z.infer<typeof manualCandidateSchema>;

export function ManualCandidateDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ManualCandidateForm>({
    resolver: zodResolver(manualCandidateSchema)
  });

  const mutation = useMutation({
    mutationFn: (data: ManualCandidateForm) => candidateService.createManual(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['candidate-summary'] });
      setIsOpen(false);
      reset();
    }
  });

  const onSubmit = (data: ManualCandidateForm) => {
    mutation.mutate(data);
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
      >
        <Plus className="h-4 w-4 mr-2" /> Add Manual Candidate
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="fixed inset-0 bg-slate-900/50" onClick={() => !mutation.isPending && setIsOpen(false)} />
          
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col z-50">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Add Manual Candidate</h3>
              <button 
                onClick={() => !mutation.isPending && setIsOpen(false)}
                className="text-slate-400 hover:text-slate-500"
                disabled={mutation.isPending}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form id="manual-candidate-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2">General Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Full Name <span className="text-red-500">*</span></label>
                      <input 
                        type="text"
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        {...register('name')}
                        disabled={mutation.isPending}
                      />
                      {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Company <span className="text-red-500">*</span></label>
                      <input 
                        type="text"
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        {...register('company')}
                        disabled={mutation.isPending}
                      />
                      {errors.company && <p className="text-xs text-red-500">{errors.company.message}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">WhatsApp <span className="text-red-500">*</span></label>
                      <input 
                        type="text"
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        {...register('whatsapp')}
                        disabled={mutation.isPending}
                      />
                      {errors.whatsapp && <p className="text-xs text-red-500">{errors.whatsapp.message}</p>}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2">Candidate Profile (Optional)</h4>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Vision</label>
                    <textarea 
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      rows={2}
                      {...register('vision')}
                      disabled={mutation.isPending}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Mission</label>
                    <textarea 
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      rows={3}
                      {...register('mission')}
                      disabled={mutation.isPending}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Work Programs</label>
                    <textarea 
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      rows={3}
                      {...register('work_program')}
                      disabled={mutation.isPending}
                    />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 rounded-b-lg">
              <Button 
                type="button" 
                className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50" 
                onClick={() => { setIsOpen(false); reset(); }} 
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                form="manual-candidate-form" 
                className="bg-blue-600 hover:bg-blue-700 text-white" 
                disabled={mutation.isPending}
              >
                {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Candidate
              </Button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
