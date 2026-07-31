"use client"

import { useQuery } from "@tanstack/react-query"
import { landingService } from "@/services/landing"

// Layout primitives
import { PageLayout } from "@/components/layout/PageLayout"
import { PublicNavbar } from "@/components/layout/PublicNavbar"

// Landing sections (Phase 1 stubs — implementation in Phase 2+)
import { Hero } from "@/components/landing/Hero"
import { Statistics } from "@/components/landing/Statistics"
import { Timeline } from "@/components/landing/Timeline"
import { Candidate } from "@/components/landing/Candidate"
import { Announcement } from "@/components/landing/Announcement"
import { LandingFooter } from "@/components/landing/Footer"
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

  // DRAFT / CANCELLED — maintenance screen
  if (activeEvent?.status === "DRAFT" || activeEvent?.status === "CANCELLED") {
    return (
      <PageLayout className="bg-slate-950">
        <PublicNavbar />
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-8">
            <span className="text-emerald-400 font-extrabold text-2xl">M</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">
            Portal Sedang dalam Pemeliharaan
          </h1>
          <p className="text-slate-400 max-w-md leading-relaxed text-lg">
            Sistem pendaftaran dan pemilihan sedang dipersiapkan. Silakan kunjungi kembali beberapa saat lagi.
          </p>
        </div>
      </PageLayout>
    )
  }

  // Standard render — sections are stubs during Phase 1
  return (
    <PageLayout>
      <PublicNavbar />
      <main>
        <Hero />
        <Statistics />
        <Timeline />
        <Candidate />
        <Announcement />
      </main>
      <LandingFooter />
    </PageLayout>
  )
}
