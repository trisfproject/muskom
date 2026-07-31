'use client';

import { useQuery } from '@tanstack/react-query';
import { landingService } from '@/services/landing';
import { HeroSection } from '@/components/landing/HeroSection';
import { EventInfoSection } from '@/components/landing/EventInfoSection';
import { RegistrationStatusSection } from '@/components/landing/RegistrationStatusSection';
import { TimelineSection } from '@/components/landing/TimelineSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { Footer } from '@/components/landing/Footer';
import { LandingEmptyState } from '@/components/landing/LandingEmptyState';
import { LandingLoadingSkeleton } from '@/components/landing/LandingLoadingSkeleton';

export default function LandingPageClient() {
  const { data: event, isLoading, isError } = useQuery({
    queryKey: ['public-musyawarah-event'],
    queryFn: landingService.getPublicEvent,
    staleTime: 60 * 1000 * 5, // 5 minutes cache
    gcTime: 60 * 1000 * 30, // 30 minutes garbage collection
    retry: 1, // Only retry once to avoid spamming the protected endpoint
  });

  if (isLoading) {
    return <LandingLoadingSkeleton />;
  }

  // Handle No Event or Unauthorized (handled by the service mapping it to null)
  if (!event || isError) {
    return <LandingEmptyState />;
  }

  // Handle Draft / Cancelled Status
  if (event.status === 'DRAFT' || event.status === 'CANCELLED') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Event Under Maintenance</h2>
        <p className="text-slate-500 text-center max-w-md">
          The event portal is currently offline or being updated. Please check back soon.
        </p>
      </div>
    );
  }

  // Handle Finished
  if (event.status === 'COMPLETED') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">{event.name}</h1>
        <p className="text-xl text-slate-500 text-center max-w-xl mb-8">
          This Musyawarah has successfully concluded. Thank you to all participants, candidates, and organizers for their contribution.
        </p>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
          <p className="text-slate-600 mb-4">You can view the final verified results through the public results portal.</p>
          <a href="/results" className="text-blue-600 hover:underline font-medium">View Final Results &rarr;</a>
        </div>
      </div>
    );
  }

  // Standard Published Event
  return (
    <>
      <HeroSection event={event} />
      <EventInfoSection event={event} />
      <RegistrationStatusSection event={event} />
      <TimelineSection event={event} />
      <FAQSection />
      <Footer />
    </>
  );
}
