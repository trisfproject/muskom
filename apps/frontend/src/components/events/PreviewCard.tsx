import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';
import { UpdateEventPayload } from '@/types/event';

interface PreviewCardProps {
  form: UseFormReturn<UpdateEventPayload>;
}

export function PreviewCard({ form }: PreviewCardProps) {
  const values = form.watch();

  const isPublished = values.status !== 'DRAFT' && values.status !== 'CANCELLED';
  const isCandidateRegOpen = values.allow_candidate_registration;
  
  return (
    <Card className="bg-slate-50 border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Public Preview</span>
          <span className="text-xs font-normal text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
            Read Only
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-slate-200">
            <span className="text-sm text-slate-600">Landing Page</span>
            <span className={`text-xs font-semibold px-2 py-1 rounded ${isPublished ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isPublished ? 'Accessible' : 'Hidden'}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-slate-200">
            <span className="text-sm text-slate-600">Candidate Registration</span>
            <span className={`text-xs font-semibold px-2 py-1 rounded ${isCandidateRegOpen && isPublished ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
              {isCandidateRegOpen && isPublished ? 'Open' : 'Closed'}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-slate-200">
            <span className="text-sm text-slate-600">Current Phase</span>
            <span className="text-sm font-medium text-slate-900">
              {values.status || 'Not set'}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-slate-600">Participant Quota</span>
            <span className="text-sm font-medium text-slate-900">
              {values.max_participants ? values.max_participants : 'Unlimited'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
