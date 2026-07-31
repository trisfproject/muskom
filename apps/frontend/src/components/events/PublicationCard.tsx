import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { UseFormReturn } from 'react-hook-form';
import { UpdateEventPayload } from '@/types/event';

interface PublicationCardProps {
  form: UseFormReturn<UpdateEventPayload>;
}

export function PublicationCard({ form }: PublicationCardProps) {
  const isPublished = form.watch('status') !== 'DRAFT' && form.watch('status') !== 'CANCELLED';
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Publication</CardTitle>
        <CardDescription>Control the public visibility of this event.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
          <div className="space-y-0.5">
            <h4 className="text-sm font-medium text-slate-900">Publish Event</h4>
            <p className="text-xs text-slate-500">
              When published, the landing page will be visible to the public.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${isPublished ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
              {isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
