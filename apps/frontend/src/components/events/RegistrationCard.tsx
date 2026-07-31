import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { UseFormReturn, Controller } from 'react-hook-form';
import { UpdateEventPayload } from '@/types/event';

interface RegistrationCardProps {
  form: UseFormReturn<UpdateEventPayload>;
}

export function RegistrationCard({ form }: RegistrationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Registration</CardTitle>
        <CardDescription>Enable or disable public registration forms.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Note: the backend DTO does not have an explicit boolean for ParticipantRegistration toggle. 
            It is usually governed by the timeline. 
            However, we have AllowCandidateRegistration. 
            For participant registration, if there's no direct flag, we can control it via Phase. 
            The requirements say: Participant Registration ON/OFF, Candidate Registration ON/OFF. 
            Since UpdateMusyawarahRequest has `allow_candidate_registration` but NO `allow_participant_registration`, 
            we must mock the UI for the participant toggle or use a timeline-based heuristic. 
            I will include Candidate Registration here. */}
        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
          <div className="space-y-0.5">
            <h4 className="text-sm font-medium text-slate-900">Candidate Registration</h4>
            <p className="text-xs text-slate-500">
              Allow users to register as candidates.
            </p>
          </div>
          <Controller
            control={form.control}
            name="allow_candidate_registration"
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>
        
        <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-md">
          Turning these toggles off will immediately lock the respective registration forms on the public portal.
        </div>
      </CardContent>
    </Card>
  );
}
