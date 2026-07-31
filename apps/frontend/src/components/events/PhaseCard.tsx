import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';
import { UpdateEventPayload, EventPhase } from '@/types/event';

interface PhaseCardProps {
  form: UseFormReturn<UpdateEventPayload>;
}

const PHASES: { value: EventPhase; label: string }[] = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'UPCOMING', label: 'Upcoming' },
  { value: 'ONGOING', label: 'Ongoing (Musyawarah)' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export function PhaseCard({ form }: PhaseCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Event Phase</CardTitle>
        <CardDescription>Controls the lifecycle of the Musyawarah event.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-900">Current Phase</label>
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            {...form.register('status')}
          >
            {PHASES.map((phase) => (
              <option key={phase.value} value={phase.value}>
                {phase.label}
              </option>
            ))}
          </select>
          {form.formState.errors.status && (
            <p className="text-xs text-red-500">{form.formState.errors.status.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
