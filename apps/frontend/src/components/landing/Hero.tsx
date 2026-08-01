"use client"

import { HomeResponse } from "@/types/landing"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { FadeUp, CountdownTimer } from "@/components/landing/Shared"

// Hero — 100vh, vertically centered, answers 3 questions in 5 seconds:
//  1. What is happening?  → Phase name (card)
//  2. How long until?     → Countdown (card, target = active phase end_date from Timeline Engine)
//  3. What can I do?      → CTAs (priority set by backend via style field)
export function Hero({ data }: { data: HomeResponse | null }) {
  const name = data?.event?.name ?? "Portal Resmi Musyawarah"
  const themeStr = data?.event?.theme ?? ""

  // CTAs — backend drives priority via style field; frontend only renders
  const ctaList = [
    data?.cta?.candidate_registration,
    data?.cta?.participant_registration,
  ].filter(Boolean)

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-blue-600/8 blur-[140px] pointer-events-none" />

      <div className="container-landing relative z-10 py-32 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-center">

          {/* Left Column */}
          <div className="lg:col-span-7">
            <FadeUp>
              {/* Official tagline pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border pg-border bg-blue-600/5 text-[11px] font-semibold text-blue-600 uppercase tracking-widest mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Together We Shape the Future
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-black pg-text tracking-tight leading-[1.08] mb-6">
                {name}
              </h1>

              <p className="text-lg sm:text-xl pg-muted leading-relaxed max-w-xl font-medium">
                {themeStr}
              </p>
            </FadeUp>

            {/* CTAs — rendered in order received; style field drives filled vs outline */}
            <FadeUp delay={0.18}>
              <div className="flex flex-col sm:flex-row items-start gap-3 mt-10">
                {ctaList.map((cta) => {
                  if (!cta || !cta.open) return null
                  const isPrimary = cta.style === "primary" || !cta.style
                  return isPrimary ? (
                    <Link
                      key={cta.url}
                      href={cta.url}
                      className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 text-white font-bold rounded-full text-sm hover:bg-blue-500 shadow-lg shadow-blue-600/25 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      {cta.label} <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <Link
                      key={cta.url}
                      href={cta.url}
                      className="pill-btn inline-flex items-center gap-2 px-7 py-3.5 font-semibold text-sm"
                    >
                      {cta.label}
                    </Link>
                  )
                })}
              </div>
            </FadeUp>
          </div>

          {/* Right Column — Phase Card (simplified per BUILD-001.1) */}
          <div className="lg:col-span-5">
            <FadeUp delay={0.3}>
              <PhaseCard data={data} />
            </FadeUp>
          </div>

        </div>
      </div>
    </section>
  )
}

// PhaseCard — shows only: Active Phase + Countdown
// Countdown target = active timeline phase end_date (from Timeline Engine via countdown.target_date)
// No date/time/location — per BUILD-001.1
function PhaseCard({ data }: { data: HomeResponse | null }) {
  const phaseName = data?.currentPhase?.name || "Persiapan"
  const countdownTarget = data?.countdown?.target_date
  const countdownLabel = data?.countdown?.label || "Tersisa"

  return (
    <div className="pg-card p-7 lg:p-8 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-600/10 blur-[60px] rounded-full pointer-events-none" />

      {/* Active phase indicator */}
      <div className="flex items-center gap-2.5 mb-3 relative z-10">
        <div className="relative w-2 h-2 shrink-0">
          <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-60" />
          <div className="relative rounded-full w-full h-full bg-blue-600" />
        </div>
        <span className="text-[11px] font-bold pg-faint uppercase tracking-widest">Fase Aktif</span>
      </div>

      <p className="text-lg font-bold pg-text leading-snug mb-8 relative z-10">
        {phaseName}
      </p>

      {/* Countdown — follows Timeline Engine */}
      {countdownTarget && (
        <div className="relative z-10">
          <CountdownTimer targetDate={countdownTarget} label={countdownLabel} />
        </div>
      )}
    </div>
  )
}
