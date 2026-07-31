"use client"

import { useQuery } from "@tanstack/react-query"
import { landingService } from "@/services/landing"
import { PublicNavbar } from "@/components/layout/PublicNavbar"
import { HeroSection } from "@/components/landing/HeroSection"
import { StatsSection } from "@/components/landing/StatsSection"
import { TimelineSection } from "@/components/landing/TimelineSection"
import { CandidatesSection } from "@/components/landing/CandidatesSection"
import { AnnouncementsSection } from "@/components/landing/AnnouncementsSection"
import { Footer } from "@/components/landing/Footer"
import { LandingLoadingSkeleton } from "@/components/landing/LandingLoadingSkeleton"

export default function LandingPageClient() {
  const { data: event, isLoading } = useQuery({
    queryKey: ["public-musyawarah-event"],
    queryFn: landingService.getPublicEvent,
    staleTime: 60 * 1000 * 5,
    gcTime: 60 * 1000 * 30,
    retry: 1,
  })

  if (isLoading) {
    return <LandingLoadingSkeleton />
  }

  const activeEvent = event || null

  // Handle Draft / Cancelled — show maintenance screen WITH navbar
  if (activeEvent?.status === "DRAFT" || activeEvent?.status === "CANCELLED") {
    return (
      <div className="min-h-screen bg-slate-950 font-sans">
        <PublicNavbar />
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-3xl" />
          </div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <span className="text-emerald-400 font-extrabold text-3xl">M</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Portal Sedang dalam Pemeliharaan</h2>
            <p className="text-slate-400 max-w-md leading-relaxed mx-auto text-lg">
              Sistem pendaftaran dan pemilihan sedang dipersiapkan. Silakan kunjungi kembali beberapa saat lagi.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Handle Completed — show results screen WITH all sections
  if (activeEvent?.status === "COMPLETED") {
    return (
      <div className="min-h-screen font-sans bg-white selection:bg-emerald-100 selection:text-emerald-900">
        <PublicNavbar />
        <main>
          <HeroSection event={activeEvent} />
          <StatsSection event={activeEvent} />
          <TimelineSection event={activeEvent} />
          <CandidatesSection />
          <AnnouncementsSection />
          
          <div className="py-24 bg-white text-center border-t border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-gradient-to-b from-emerald-50/50 to-transparent pointer-events-none" />
            
            <div className="relative z-10 max-w-3xl mx-auto px-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-8 shadow-inner shadow-emerald-200">
                <span className="text-4xl">🎉</span>
              </div>
              <h2 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">Musyawarah Telah Selesai</h2>
              <p className="text-xl text-slate-500 mb-10 leading-relaxed">
                Terima kasih kepada seluruh peserta, kandidat, dan panitia atas partisipasi yang luar biasa dalam menyukseskan acara ini.
              </p>
              <a
                href="/results"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/30 text-lg"
              >
                Lihat Hasil Pemilihan →
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Standard Render
  return (
    <div className="min-h-screen font-sans bg-white selection:bg-emerald-100 selection:text-emerald-900">
      <PublicNavbar />
      <main>
        <HeroSection event={activeEvent} />
        <StatsSection event={activeEvent} />
        <TimelineSection event={activeEvent} />
        <CandidatesSection />
        <AnnouncementsSection />
      </main>
      <Footer />
    </div>
  )
}
