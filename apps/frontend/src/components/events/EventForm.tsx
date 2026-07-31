'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '@/services/event';
import { UpdateEventPayload, MusyawarahEvent } from '@/types/event';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PublicationCard } from './PublicationCard';
import { RegistrationCard } from './RegistrationCard';
import { QuotaCard } from './QuotaCard';
import { PhaseCard } from './PhaseCard';
import { PreviewCard } from './PreviewCard';
import { Button } from '@/components/ui/button';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';

const eventSchema = z.object({
  name: z.string().min(1, 'Event Name is required'),
  theme: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  status: z.enum(['DRAFT', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'] as const),
  max_participants: z.number().min(0, 'Quota cannot be negative').optional(),
  publish_result: z.boolean(),
  allow_candidate_registration: z.boolean(),
  registration_start: z.string().optional(),
  voting_end: z.string().optional(),
}).refine(data => {
  if (data.registration_start && data.voting_end) {
    const start = new Date(data.registration_start);
    const end = new Date(data.voting_end);
    return end >= start;
  }
  return true;
}, {
  message: "End Date must be greater than or equal to Start Date",
  path: ["voting_end"],
});

interface EventFormProps {
  initialData: MusyawarahEvent;
}

export function EventForm({ initialData }: EventFormProps) {
  const queryClient = useQueryClient();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const form = useForm<UpdateEventPayload>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(eventSchema) as any,
    defaultValues: {
      name: initialData.name || '',
      theme: initialData.theme || '',
      location: initialData.location || '',
      status: initialData.status || 'DRAFT',
      max_participants: initialData.max_participants || 0,
      publish_result: initialData.publish_result || false,
      allow_candidate_registration: initialData.allow_candidate_registration || false,
      registration_start: initialData.registration_start ? new Date(initialData.registration_start).toISOString().slice(0, 16) : '',
      voting_end: initialData.voting_end ? new Date(initialData.voting_end).toISOString().slice(0, 16) : '',
    }
  });

  const mutation = useMutation({
    mutationFn: (data: UpdateEventPayload) => {
      // Backend expects proper RFC3339 timestamps if provided
      const payload = { ...data };
      if (payload.registration_start) {
        payload.registration_start = new Date(payload.registration_start).toISOString();
      } else {
        payload.registration_start = undefined;
      }
      if (payload.voting_end) {
        payload.voting_end = new Date(payload.voting_end).toISOString();
      } else {
        payload.voting_end = undefined;
      }
      return eventService.updateEvent(payload);
    },
    onSuccess: () => {
      setSaveStatus('success');
      queryClient.invalidateQueries({ queryKey: ['musyawarah-event'] });
      setTimeout(() => setSaveStatus('idle'), 3000);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      setSaveStatus('error');
      setErrorMessage(err.response?.data?.message || 'Failed to save event configuration');
      setTimeout(() => setSaveStatus('idle'), 5000);
    }
  });

  const onSubmit = (data: UpdateEventPayload) => {
    // Confirmation dialog before publishing
    if (data.status !== 'DRAFT' && data.status !== 'CANCELLED' && initialData.status === 'DRAFT') {
      if (!window.confirm('You are about to publish this event. This will make it visible to the public. Are you sure you want to proceed?')) {
        return;
      }
    }
    
    setSaveStatus('idle');
    mutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      
      {/* Feedback Toasts */}
      {saveStatus === 'success' && (
        <div className="p-4 mb-6 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-800">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <p className="font-medium text-sm">Event configuration saved successfully.</p>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-800">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="font-medium text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - General Info & Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">General Information</CardTitle>
              <CardDescription>Primary details for the Musyawarah event.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">Event Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  {...form.register('name')}
                  disabled={mutation.isPending}
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">Theme</label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    {...form.register('theme')}
                    disabled={mutation.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">Location <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    {...form.register('location')}
                    disabled={mutation.isPending}
                  />
                  {form.formState.errors.location && (
                    <p className="text-xs text-red-500">{form.formState.errors.location.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">Start Date <span className="text-red-500">*</span></label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    {...form.register('registration_start')}
                    disabled={mutation.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">End Date <span className="text-red-500">*</span></label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    {...form.register('voting_end')}
                    disabled={mutation.isPending}
                  />
                  {form.formState.errors.voting_end && (
                    <p className="text-xs text-red-500">{form.formState.errors.voting_end.message}</p>
                  )}
                </div>
              </div>

            </CardContent>
          </Card>

          <QuotaCard form={form} />
        </div>

        {/* Right Column - Controls & Previews */}
        <div className="space-y-6">
          <div className="sticky top-20 space-y-6">
            
            {/* Save Actions */}
            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="p-4">
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                  disabled={mutation.isPending || !form.formState.isDirty}
                >
                  <Save className="h-4 w-4" />
                  {mutation.isPending ? 'Saving Changes...' : 'Save Configuration'}
                </Button>
                {form.formState.isDirty && (
                  <p className="text-xs text-orange-600 font-medium text-center mt-3 flex items-center justify-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    You have unsaved changes
                  </p>
                )}
              </CardContent>
            </Card>

            <PhaseCard form={form} />
            <PublicationCard form={form} />
            <RegistrationCard form={form} />
            <PreviewCard form={form} />

          </div>
        </div>

      </div>
    </form>
  );
}
