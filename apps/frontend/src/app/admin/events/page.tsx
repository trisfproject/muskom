'use client';

import { useQuery } from '@tanstack/react-query';
import { eventService } from '@/services/event';
import { EventForm } from '@/components/events/EventForm';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EventsManagementPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['musyawarah-event'],
    queryFn: eventService.getEvent,
    staleTime: 60 * 1000 * 5, // 5 minutes
    gcTime: 60 * 1000 * 30, // 30 minutes
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6 max-w-7xl mx-auto">
        <div className="h-8 bg-slate-200 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[500px] bg-slate-200 rounded-lg"></div>
          <div className="h-[500px] bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-red-50 rounded-lg border border-red-200 p-8 text-center max-w-7xl mx-auto">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-900 mb-2">Failed to load Event Configuration</h2>
        <p className="text-red-700 mb-6">There was a problem retrieving the current Musyawarah configuration. Please try again.</p>
        <Button onClick={() => refetch()} className="bg-red-600 hover:bg-red-700 text-white">
          Retry Connection
        </Button>
      </div>
    );
  }

  // If there is no active event, we provide a blank scaffolding default structure so they can create it
  // But wait, the backend `PUT /api/v1/admin/musyawarah` creates or updates a singleton event.
  const defaultEventData = {
    name: '',
    status: 'DRAFT' as const,
    publish_result: false,
    allow_candidate_registration: false,
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Event Management</h1>
        <p className="text-slate-500 mt-1 text-sm">Configure the public Musyawarah settings, timeline, and registration quotas.</p>
      </div>

      <EventForm initialData={data || defaultEventData} />
    </div>
  );
}
