"use client"

import { HomeResponse } from "@/types/landing"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { FadeUp, CountdownTimer } from "@/components/landing/Shared"

// Hero — 100vh premium technology conference atmosphere
// Theme: "Together We Shape the Future"
export function Hero({ data }: { data: HomeResponse | null }) {
  const name = data?.event?.name ?? "Portal Resmi Musyawarah"
  const themeStr = data?.event?.theme ?? ""

  const ctaList = [
    data?.cta?.candidate_registration,
    data?.cta?.participant_registration,
  ].filter(Boolean)

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">

      {/* ── Atmospheric layers (bottom to top) ── */}

      {/* Layer 2: Aurora Gradient */}
      <div className="absolute inset-0 hero-aurora pointer-events-none" />

      {/* Layer 3: Blueprint Grid */}
      <div className="absolute inset-0 hero-blueprint pointer-events-none" />

      {/* Layer 4: Connection Network */}
      <div className="absolute inset-0 hero-network pointer-events-none" />

      {/* Layer 5: Premium Noise */}
      <div className="absolute inset-0 hero-noise pointer-events-none" />

      {/* Hero Lighting */}
      <div className="absolute inset-0 hero-lighting pointer-events-none" />

      {/* ── Content ── */}
      <div className="container-landing relative z-10 py-36 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-center">

          {/* Left column */}
          <div className="lg:col-span-7">
            <FadeUp>
              {/* Official identity pill */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-sky-400/5 text-[11px] font-bold text-blue-600 uppercase tracking-[0.16em] mb-8 shadow-[0_0_12px_rgba(37,99,235,0.1)]">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                Together We Shape the Future
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-black pg-text tracking-tight leading-[1.07] mb-6">
                {name}
              </h1>

              <p className="text-lg sm:text-xl pg-muted leading-relaxed max-w-xl font-medium">
                {themeStr}
              </p>
            </FadeUp>

            {/* CTAs — driven by backend style field */}
            <FadeUp delay={0.18}>
              <div className="flex flex-col sm:flex-row items-start gap-3 mt-10">
                {ctaList.map((cta) => {
                  if (!cta || !cta.open) return null
                  const isPrimary = cta.style === "primary" || !cta.style
                  return isPrimary ? (
                    <Link
                      key={cta.url}
                      href={cta.url}
                      className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-all duration-200 hover:-translate-y-0.5"
                      style={{ boxShadow: "0 4px 20px -4px rgba(37,99,235,0.45), inset 0 1px 0 rgba(255,255,255,0.15)" }}
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

          {/* Right column — Phase card */}
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

// PhaseCard — Active Phase + Countdown only
function PhaseCard({ data }: { data: HomeResponse | null }) {
  const phaseName = data?.currentPhase?.name || "Persiapan"
  const countdownTarget = data?.countdown?.target_date
  const countdownLabel = data?.countdown?.label || "Tersisa"

  return (
    <div
      className="relative overflow-hidden rounded-[1.25rem]"
      style={{
        padding: "1.75rem 2rem",
        background: "linear-gradient(180deg, var(--c-surface) 0%, var(--c-bg-glass) 100%)",
        border: "1px solid var(--c-border)",
        boxShadow: "0 8px 32px -12px var(--c-shadow-sm), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {/* Card inner atmosphere — top-right glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-40px", right: "-40px",
          width: "200px", height: "180px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse at top right, rgba(37,99,235,0.08) 0%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />
      {/* Card inner mesh */}
      <div className="absolute inset-0 tech-dots opacity-20 pointer-events-none" />

      {/* Active phase indicator */}
      <div className="flex items-center gap-2.5 mb-4 relative z-10">
        <div className="relative w-2 h-2 shrink-0">
          <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-50" />
          <div className="relative rounded-full w-full h-full bg-blue-600" />
        </div>
        <span className="text-[11px] font-bold pg-faint uppercase tracking-[0.14em]">Fase Aktif</span>
      </div>

      <p className="text-lg font-bold pg-text leading-snug mb-8 relative z-10">
        {phaseName}
      </p>

      {/* Countdown */}
      {countdownTarget && (
        <div className="relative z-10">
          <CountdownTimer targetDate={countdownTarget} label={countdownLabel} />
        </div>
      )}
    </div>
  )
}
