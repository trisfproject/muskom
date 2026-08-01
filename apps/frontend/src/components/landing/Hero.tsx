"use client"

import { HomeResponse } from "@/types/landing"
import { ArrowRight, CalendarDays, Clock, MapPin } from "lucide-react"
import Link from "next/link"
import { FadeUp, InfoRow, CountdownTimer } from "@/components/landing/Shared"

// Hero — 100vh on desktop, content vertically centered
// Two independent registration CTAs gated by backend `open` boolean (ADR 0006)
export function Hero({ data }: { data: HomeResponse | null }) {
  const name = data?.event?.name ?? "Portal Resmi Musyawarah"
  const themeStr = data?.event?.theme ?? ""

  const participantCta = data?.cta?.participant_registration
  const candidateCta = data?.cta?.candidate_registration

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="container-landing relative z-10 py-32 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left Column */}
          <div className="lg:col-span-7 space-y-8">
            <FadeUp>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full pg-surface border pg-border text-xs font-semibold pg-muted uppercase tracking-widest mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                {data?.currentPhase?.name || "Portal Resmi"}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black pg-text tracking-tight leading-[1.1]">
                {name}
              </h1>
              <p className="text-lg sm:text-xl pg-muted leading-relaxed max-w-2xl font-medium mt-6">
                {themeStr}
              </p>
            </FadeUp>

            {/* Two independent registration CTAs */}
            <FadeUp delay={0.2}>
              <div className="flex flex-col sm:flex-row items-start gap-3">
                {/* Participant Registration */}
                {participantCta?.open && (
                  <Link
                    href={participantCta.url}
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 text-slate-950 font-bold rounded-full text-sm hover:bg-blue-500 shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {participantCta.label} <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                {/* Candidate Registration — independent workflow */}
                {candidateCta?.open && (
                  <Link
                    href={candidateCta.url}
                    className="pill-btn inline-flex items-center gap-2 px-7 py-3.5 font-semibold text-sm"
                  >
                    {candidateCta.label} <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </FadeUp>
          </div>

          {/* Right Column — Info Card */}
          <div className="lg:col-span-5 lg:pl-10">
            <FadeUp delay={0.4}>
              <EventInfoCard data={data} />
            </FadeUp>
          </div>

        </div>
      </div>
    </section>
  )
}

export function EventInfoCard({ data }: { data: HomeResponse | null }) {
  const peakDateStr = data?.event?.event_date ?? "TBD";
  const peakTimeStr = data?.event?.event_time ?? "TBD";
  const venue = data?.event?.location ?? "TBD";
  const countdownTarget = data?.countdown?.target_date;

  return (
    <div className="pg-card p-6 lg:p-8 relative overflow-hidden backdrop-blur-xl">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 blur-[50px] rounded-full pointer-events-none" />

      {/* Current Phase */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b pg-border relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-3 h-3">
            <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75" />
            <div className="relative rounded-full w-2 h-2 bg-blue-600" />
          </div>
          <span className="text-sm font-bold tracking-wide pg-text uppercase">
            {data?.currentPhase?.name || "Persiapan"}
          </span>
        </div>
        {countdownTarget && <CountdownTimer targetDate={countdownTarget} label={data?.countdown?.label || "Tersisa"} />}
      </div>

      {/* Info rows */}
      <div className="space-y-4 pt-1 relative z-10">
        <InfoRow icon={CalendarDays} label="Tanggal Acara" value={peakDateStr} />
        <InfoRow icon={Clock} label="Waktu Acara" value={peakTimeStr} />
        <InfoRow icon={MapPin} label="Lokasi Utama" value={venue} />
      </div>
    </div>
  )
}
