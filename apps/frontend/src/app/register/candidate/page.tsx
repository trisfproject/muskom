'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { landingService } from '@/services/landing';
import { CandidateRegistrationResponse } from '@/types/candidate-registration';
import { CandidateRegistrationForm } from '@/components/candidate-registration/CandidateRegistrationForm';
import { CandidateRegistrationSuccess } from '@/components/candidate-registration/CandidateRegistrationSuccess';
import { CandidateRegistrationClosed } from '@/components/candidate-registration/CandidateRegistrationClosed';
import { CandidateRegistrationLoadingSkeleton } from '@/components/candidate-registration/CandidateRegistrationLoadingSkeleton';

export default function CandidateRegisterPage() {
  const [successData, setSuccessData] = useState<{
    data: CandidateRegistrationResponse;
    candidateName: string;
  } | null>(null);

  const { data: event, isLoading, isError } = useQuery({
    queryKey: ['public-musyawarah-event'],
    queryFn: landingService.getPublicEvent,
    staleTime: 60 * 1000 * 5,
    retry: 1,
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <CandidateRegistrationLoadingSkeleton />
      </main>
    );
  }

  if (!event || isError || event.status === 'DRAFT' || event.status === 'CANCELLED') {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <CandidateRegistrationClosed reason="NOT_FOUND" />
      </main>
    );
  }

  if (!event.allow_candidate_registration) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <CandidateRegistrationClosed reason="DISABLED" />
      </main>
    );
  }

  // Check if candidate registration phase is open
  const now = new Date();
  const candStart = event.candidate_registration_start ? new Date(event.candidate_registration_start) : null;
  const candEnd = event.candidate_registration_end ? new Date(event.candidate_registration_end) : null;
  
  const isCandOpen = candStart && candEnd && now >= candStart && now <= candEnd && event.status === 'UPCOMING';

  if (!isCandOpen) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <CandidateRegistrationClosed reason="CLOSED" />
      </main>
    );
  }

  // Note: Eager quota blocking could go here if exposed by backend.

  const handleSuccess = (data: CandidateRegistrationResponse, candidateName: string) => {
    setSuccessData({ data, candidateName });
    // Scroll to top upon success
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background shapes */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-50/80 blur-3xl opacity-70"></div>
        <div className="absolute top-60 -left-20 w-[400px] h-[400px] rounded-full bg-purple-50/80 blur-3xl opacity-70"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">{event.name}</h1>
          <p className="text-blue-600 font-semibold text-lg">{event.theme}</p>
        </div>

        {successData ? (
          <CandidateRegistrationSuccess 
            data={successData.data} 
            event={event} 
            candidateName={successData.candidateName} 
          />
        ) : (
          <CandidateRegistrationForm onSuccess={handleSuccess} />
        )}
      </div>
    </main>
  );
}
