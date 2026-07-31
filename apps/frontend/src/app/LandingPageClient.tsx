'use client';

import { useQuery } from '@tanstack/react-query';
import { landingService } from '@/services/landing';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { AboutSection } from '@/components/landing/AboutSection';
import { EventSection } from '@/components/landing/EventSection';
import { CandidatesSection } from '@/components/landing/CandidatesSection';
import { TimelineSection } from '@/components/landing/TimelineSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { Footer } from '@/components/landing/Footer';
import { LandingLoadingSkeleton } from '@/components/landing/LandingLoadingSkeleton';

export default function LandingPageClient() {
  const { data: event, isLoading } = useQuery({
    queryKey: ['public-musyawarah-event'],
    queryFn: landingService.getPublicEvent,
    staleTime: 60 * 1000 * 5,
    gcTime: 60 * 1000 * 30,
    retry: 1,
  });

  if (isLoading) {
    return <LandingLoadingSkeleton />;
  }

  const activeEvent = event || null;

  // Handle Draft / Cancelled — show maintenance screen WITH navbar
  if (activeEvent?.status === 'DRAFT' || activeEvent?.status === 'CANCELLED') {
    return (
      <div className="min-h-screen bg-slate-50">
        <PublicNavbar />
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-extrabold text-2xl">M</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Portal Sedang dalam Pemeliharaan</h2>
          <p className="text-slate-500 max-w-md leading-relaxed">
            Portal musyawarah sedang dalam pemeliharaan atau persiapan. Silakan kunjungi kembali beberapa saat lagi.
          </p>
        </div>
      </div>
    );
  }

  // Handle Completed — show results screen WITH all sections
  if (activeEvent?.status === 'COMPLETED') {
    return (
      <div className="min-h-screen">
        <PublicNavbar />
        <HeroSection event={activeEvent} />
        <AboutSection />
        <CandidatesSection />
        <TimelineSection event={activeEvent} />
        <div className="py-16 bg-white text-center">
          <div className="max-w-2xl mx-auto px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-6">
              <span className="text-3xl">🎉</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Musyawarah Telah Selesai</h2>
            <p className="text-slate-600 mb-8">
              Terima kasih kepada seluruh peserta, kandidat, dan panitia atas partisipasi yang luar biasa.
            </p>
            <a
              href="/results"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full gradient-primary text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Lihat Hasil Pemilihan →
            </a>
          </div>
        </div>
        <FAQSection />
        <Footer />
      </div>
    );
  }

  // Standard Render — all sections visible
  return (
    <div className="min-h-screen">
      <PublicNavbar />
      <HeroSection event={activeEvent} />
      <AboutSection />
      <EventSection event={activeEvent} />
      <CandidatesSection />
      <TimelineSection event={activeEvent} />
      <FAQSection />
      <Footer />
    </div>
  );
}
