"use client";

import { useSystemConfig } from "@/contexts/ConfigContext";
import { HomeResponse } from "@/types/landing";
import { ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";
import { CountdownCard } from "@/components/ui/countdown-card";
import { SlideUp } from "@/components/landing/Shared";
import { SectionPill } from "@/components/ui/section-pill";

export function Hero({ data }: { data: HomeResponse | null }) {
  const { config } = useSystemConfig();
  const identity = config?.website_identity;
  
  const badge = data?.hero?.hero_badge || "Together We Shape the Future";
  const title = data?.hero?.hero_title || identity?.community_name || "Musyawarah Komunitas";
  const description = data?.hero?.hero_description || identity?.website_description || "Platform pemilihan resmi. Membangun proses kepemimpinan yang transparan, terpercaya, dan akuntabel.";

  let ctaList = [
    data?.cta?.candidate_registration,
    data?.cta?.participant_registration,
  ].filter(Boolean);

  if (config?.feature_flags && !config.feature_flags.enable_registration) {
    ctaList = [];
  }

  if (config?.feature_flags && !config.feature_flags.show_hero) {
    return null;
  }

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-28 pb-12 md:pt-36 md:pb-20 lg:pt-48 lg:pb-32">
      {/* ── Specific Hero Lighting (Overlays on top of Global Atmosphere) ── */}
      {/* Reduced haze ambient glow */}
      <div
        className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] pointer-events-none bg-hero-glow opacity-40 mix-blend-screen dark:mix-blend-lighten"
        style={{ filter: "blur(60px)" }}
      />
      {/* Subtle radial light specifically behind the headline */}
      <div 
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-sky-300/10 dark:bg-sky-400/5 rounded-full pointer-events-none"
        style={{ filter: "blur(80px)" }}
      />

      {/* ── Hero Main Content ── */}
      <div className="container-landing relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 lg:gap-8 items-center">
          {/* Left Column: Hero Content */}
          <div className="lg:col-span-6 relative z-10">
            <SlideUp delay={0.1}>
              {/* 1. Official Identity Pill */}
              <div className="mb-6 md:mb-8">
                <SectionPill label={badge} animated={true} />
              </div>
            </SlideUp>

            <SlideUp delay={0.2}>
              {/* 2. Headline with Premium Gradient */}
              <div className="relative mb-5 md:mb-6">
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-[1.15] md:leading-[1.1] bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-slate-800 to-slate-500 dark:from-white dark:via-slate-200 dark:to-slate-400 drop-shadow-sm">
                  {title}
                </h1>
              </div>
            </SlideUp>

            <SlideUp delay={0.3}>
              {/* 3. Description */}
              <p className="text-base md:text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mb-8 md:mb-10 font-medium">
                {description}
              </p>
            </SlideUp>

            <SlideUp delay={0.4}>
              {/* 4. Action CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
                {ctaList.map((cta) => {
                  if (!cta || !cta.open) return null;
                  const isPrimary = cta.style === "primary" || !cta.style;

                  return isPrimary ? (
                    <Link
                      key={cta.url}
                      href={cta.url}
                      className="group relative inline-flex items-center justify-center gap-2.5 px-6 py-3.5 md:px-8 md:py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 hover:from-blue-700 hover:via-blue-600 hover:to-sky-600 text-white font-bold text-sm shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                      <span className="relative z-10">{cta.label}</span>
                      <ArrowRight className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                    </Link>
                  ) : (
                    <Link
                      key={cta.url}
                      href={cta.url}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md hover:bg-white/90 dark:hover:bg-slate-800/90 border border-white/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 font-bold text-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                    >
                      <span>{cta.label}</span>
                    </Link>
                  );
                })}
              </div>
            </SlideUp>
          </div>

          {/* Right Column: Rebuilt Integrated Phase Card */}
          <div className="lg:col-span-5 lg:col-start-8">
            <SlideUp delay={0.5}>
              <IntegratedPhaseCard data={data} />
            </SlideUp>
          </div>
        </div>
      </div>
    </section>
  );
}

// Integrated Phase Card — Redesigned for natural harmony and breathing atmosphere
function IntegratedPhaseCard({ data }: { data: HomeResponse | null }) {
  const { config } = useSystemConfig();
  const identity = config?.website_identity;
  const eventLabel = data?.event?.name || identity?.community_name || "MUSKOM 2026";
  
  const phaseName = data?.currentPhase?.name || "Penjaringan Bakal Calon";
  const countdownTarget = data?.countdown?.target_date;
  const countdownLabel = data?.countdown?.label || "Tahapan Berakhir";

  return (
    <div className="relative animate-float-subtle">
      {/* Ambient Backlight for the Card (Increased depth) */}
      <div
        className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-blue-500/30 via-sky-400/20 to-transparent pointer-events-none opacity-80 mix-blend-multiply dark:mix-blend-screen"
        style={{ filter: "blur(32px)" }}
      />

      {/* Main Glass Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/40 dark:border-slate-800/40 p-5 md:p-10 lg:p-12 shadow-2xl shadow-blue-900/5 transition-all hover:shadow-blue-500/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
        {/* Top Highlight Sheen */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white dark:via-blue-400/50 to-transparent opacity-90" />

        {/* Phase Header Badge */}
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold tracking-widest uppercase shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>FASE AKTIF</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />
            <span>{eventLabel}</span>
          </div>
        </div>

        {/* Phase Title */}
        <h3 className="text-lg md:text-2xl lg:text-[26px] font-black text-slate-900 dark:text-white leading-snug mb-5 md:mb-10 drop-shadow-sm">
          {phaseName}
        </h3>

        {/* Countdown Integration */}
        {countdownTarget && config?.feature_flags?.show_countdown !== false && (
          <div className="pt-5 md:pt-10 pb-1 md:pb-2 border-t border-slate-200/50 dark:border-slate-700/50 relative">
            {/* Subtle glow on separator */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
            <CountdownCard targetDate={countdownTarget} label={countdownLabel} />
          </div>
        )}
      </div>
    </div>
  );
}
