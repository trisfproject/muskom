"use client"

import { HomeResponse } from "@/types/landing"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { FadeUp } from "@/components/landing/Shared"
import { CountdownCard } from "@/components/ui/countdown-card"
import { Container } from "@/components/ui/layout"
import { Card } from "@/components/ui/surfaces"
import { Button } from "@/components/ui/button"

// Hero — 100vh premium technology conference atmosphere
// Theme & content completely configured via Website CMS
export function Hero({ data }: { data: HomeResponse | null }) {
  const badge = data?.hero?.hero_badge || "Together We Shape the Future"
  const title = data?.hero?.hero_title || "Musyawarah Terpadu"
  const description = data?.hero?.hero_description || "Platform pemilihan resmi KOMITKABE 2026. Membangun proses kepemimpinan yang transparan, terpercaya, dan akuntabel."

  const ctaList = [
    data?.cta?.candidate_registration,
    data?.cta?.participant_registration,
  ].filter(Boolean)

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* ── Atmospheric layers (bottom to top) ── */}
      <div className="absolute inset-0 bg-aurora pointer-events-none" />
      <div className="absolute inset-0 bg-blueprint pointer-events-none" />
      <div className="absolute inset-0 bg-network pointer-events-none" />
      <div className="absolute inset-0 bg-noise pointer-events-none" />
      <div className="absolute inset-0 bg-glow pointer-events-none" />

      {/* ── Content ── */}
      <Container className="relative z-10 py-36 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-center">

          {/* Left column */}
          <div className="lg:col-span-7">
            {/* 1. Official identity pill */}
            <FadeUp delay={0.05}>
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-sky-400/5 text-[11px] font-bold text-blue-600 uppercase tracking-[0.16em] mb-8 shadow-[0_0_12px_rgba(37,99,235,0.1)]">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                {badge}
              </div>
            </FadeUp>

            {/* 2. Heading */}
            <FadeUp delay={0.15}>
              <h1 className="text-display text-base tracking-tight mb-6">
                {title}
              </h1>
            </FadeUp>

            {/* 3. Description */}
            <FadeUp delay={0.25}>
              <p className="text-title text-muted leading-relaxed max-w-xl">
                {description}
              </p>
            </FadeUp>

            {/* 4. CTAs — driven by backend style field */}
            <FadeUp delay={0.35}>
              <div className="flex flex-col sm:flex-row items-start gap-3 mt-10">
                {ctaList.map((cta) => {
                  if (!cta || !cta.open) return null
                  const isPrimary = cta.style === "primary" || !cta.style
                  return isPrimary ? (
                    <Button
                      key={cta.url}
                      asChild
                      variant="primary"
                      size="lg"
                    >
                      <Link href={cta.url}>
                        {cta.label} <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      key={cta.url}
                      asChild
                      variant="secondary"
                      size="lg"
                    >
                      <Link href={cta.url}>
                        {cta.label}
                      </Link>
                    </Button>
                  )
                })}
              </div>
            </FadeUp>
          </div>

          {/* Right column — Phase card */}
          <div className="lg:col-span-5">
            {/* 5. Current Phase Card */}
            <FadeUp delay={0.45}>
              <PhaseCard data={data} />
            </FadeUp>
          </div>

        </div>
      </Container>
    </section>
  )
}

// PhaseCard — Active Phase + Countdown only
function PhaseCard({ data }: { data: HomeResponse | null }) {
  const phaseName = data?.currentPhase?.name || "Persiapan"
  const countdownTarget = data?.countdown?.target_date
  const countdownLabel = data?.countdown?.label || "Tahapan Berakhir"

  return (
    <Card
      className="relative overflow-hidden rounded-2xl p-7 lg:p-8 border-light shadow-md"
      style={{
        background: "linear-gradient(180deg, var(--color-surface) 0%, var(--color-bg) 100%)",
      }}
    >
      {/* Card inner atmosphere — top-right glow */}
      <div
        className="absolute pointer-events-none bg-glow"
        style={{
          top: "-40px", right: "-40px",
          width: "200px", height: "180px",
          borderRadius: "50%",
          filter: "blur(30px)",
        }}
      />
      {/* Card inner mesh */}
      <div className="absolute inset-0 bg-network opacity-20 pointer-events-none" />

      {/* Active phase indicator */}
      <div className="flex items-center gap-2.5 mb-4 relative z-10">
        <div className="relative w-2 h-2 shrink-0">
          <div className="absolute inset-0 rounded-full bg-info animate-ping opacity-50" />
          <div className="relative rounded-full w-full h-full bg-info" />
        </div>
        <span className="text-badge text-muted tracking-widest">Fase Aktif</span>
      </div>

      <p className="text-title font-bold text-base leading-snug mb-8 relative z-10">
        {phaseName}
      </p>

      {/* Countdown */}
      {countdownTarget && (
        <div className="relative z-10">
          <CountdownCard targetDate={countdownTarget} label={countdownLabel} />
        </div>
      )}
    </Card>
  )
}
