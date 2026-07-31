'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { landingService } from '@/services/landing';
import { PublicRegistrationResponse } from '@/types/registration';
import { RegistrationForm } from '@/components/register/RegistrationForm';
import { RegistrationSuccess } from '@/components/register/RegistrationSuccess';
import { RegistrationClosed } from '@/components/register/RegistrationClosed';
import { RegistrationLoadingSkeleton } from '@/components/register/RegistrationLoadingSkeleton';

export default function RegisterPage() {
  const [successData, setSuccessData] = useState<PublicRegistrationResponse | null>(null);

  const { data: event, isLoading, isError } = useQuery({
    queryKey: ['public-musyawarah-event'],
    queryFn: landingService.getPublicEvent,
    staleTime: 60 * 1000 * 5,
    retry: 1,
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <RegistrationLoadingSkeleton />
      </main>
    );
  }

  if (!event || isError || event.status === 'DRAFT' || event.status === 'CANCELLED') {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <RegistrationClosed reason="NOT_FOUND" />
      </main>
    );
  }

  // Check if registration phase is open
  const now = new Date();
  const partStart = event.registration_start ? new Date(event.registration_start) : null;
  const partEnd = event.registration_end ? new Date(event.registration_end) : null;
  
  const isPartOpen = partStart && partEnd && now >= partStart && now <= partEnd && event.status === 'UPCOMING';

  if (!isPartOpen) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <RegistrationClosed reason="CLOSED" />
      </main>
    );
  }

  // TODO: Future quota check could be implemented here if frontend needs to eagerly block it.
  // We rely on backend validation for actual quota enforcement.

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-50 blur-3xl opacity-70"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-purple-50 blur-3xl opacity-70"></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{event.name}</h1>
          <p className="text-blue-600 font-medium">{event.theme}</p>
        </div>

        {successData ? (
          <RegistrationSuccess data={successData} event={event} />
        ) : (
          <RegistrationForm onSuccess={setSuccessData} />
        )}
      </div>
    </main>
  );
}
