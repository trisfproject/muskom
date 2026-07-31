import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';
import { UpdateEventPayload } from '@/types/event';

interface QuotaCardProps {
  form: UseFormReturn<UpdateEventPayload>;
}

export function QuotaCard({ form }: QuotaCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quota Management</CardTitle>
        <CardDescription>Limit the number of accepted applicants.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-900">Max Participants</label>
          <input
            type="number"
            min="0"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            {...form.register('max_participants', { valueAsNumber: true })}
          />
          {form.formState.errors.max_participants && (
            <p className="text-xs text-red-500">{form.formState.errors.max_participants.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
