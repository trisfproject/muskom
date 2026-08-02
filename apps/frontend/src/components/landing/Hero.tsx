"use client";

import { HomeResponse } from "@/types/landing";
import { ArrowRight, Sparkles, Clock, Calendar } from "lucide-react";
import Link from "next/link";
import { ConnectionNetwork } from "@/components/landing/ConnectionNetwork";
import { CountdownCard } from "@/components/ui/countdown-card";

export function Hero({ data }: { data: HomeResponse | null }) {
  const badge = data?.hero?.hero_badge || "Together We Shape the Future";
  const title = data?.hero?.hero_title || "Musyawarah Terpadu";
  const description =
    data?.hero?.hero_description ||
    "Platform pemilihan resmi KOMITKABE 2026. Membangun proses kepemimpinan yang transparan, terpercaya, dan akuntabel.";

  const ctaList = [
    data?.cta?.candidate_registration,
    data?.cta?.participant_registration,
  ].filter(Boolean);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-28 pb-16 lg:pt-32 lg:pb-24">
      {/* ── 6-Layer Atmospheric Background ── */}
      {/* Layer 1: Pure White Base (Inherited from body) */}

      {/* Layer 2: Large Soft Aurora (Azure, Sky, Soft Cyan) */}
      <div className="absolute inset-0 bg-aurora pointer-events-none" />

      {/* Layer 3: Subtle Blueprint Grid */}
      <div className="absolute inset-0 bg-blueprint pointer-events-none" />

      {/* Layer 4: Connection Network (SVG based, nodes converging toward Hero area) */}
      <ConnectionNetwork />

      {/* Layer 5: Morning Sunlight Glow behind Hero Area */}
      <div
        className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] pointer-events-none bg-hero-glow opacity-80"
        style={{ filter: "blur(90px)" }}
      />

      {/* Layer 6: Subtle Texture */}
      <div className="absolute inset-0 bg-noise pointer-events-none" />

      {/* ── Hero Main Content ── */}
      <div className="container-landing relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Hero Content */}
          <div className="lg:col-span-7">
            {/* 1. Official Identity Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-50/80 dark:bg-blue-950/40 backdrop-blur-md text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wide mb-8 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 dark:bg-blue-400" />
              </span>
              <span>{badge}</span>
            </div>

            {/* 2. Headline with Morning Light Diffusion */}
            <div className="relative mb-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                {title}
              </h1>
            </div>

            {/* 3. Description */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mb-10">
              {description}
            </p>

            {/* 4. Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {ctaList.map((cta) => {
                if (!cta || !cta.open) return null;
                const isPrimary = cta.style === "primary" || !cta.style;

                return isPrimary ? (
                  <Link
                    key={cta.url}
                    href={cta.url}
                    className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-semibold text-sm shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                  >
                    <span>{cta.label}</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                ) : (
                  <Link
                    key={cta.url}
                    href={cta.url}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm shadow-xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                  >
                    <span>{cta.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Column: Rebuilt Integrated Phase Card */}
          <div className="lg:col-span-5">
            <IntegratedPhaseCard data={data} />
          </div>
        </div>
      </div>
    </section>
  );
}

// Integrated Phase Card — Redesigned for natural harmony and breathing atmosphere
function IntegratedPhaseCard({ data }: { data: HomeResponse | null }) {
  const phaseName = data?.currentPhase?.name || "Penjaringan Bakal Calon";
  const countdownTarget = data?.countdown?.target_date;
  const countdownLabel = data?.countdown?.label || "Tahapan Berakhir";

  return (
    <div className="relative animate-float-subtle">
      {/* Ambient Backlight for the Card */}
      <div
        className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-blue-500/20 via-sky-400/10 to-transparent pointer-events-none opacity-70"
        style={{ filter: "blur(24px)" }}
      />

      {/* Main Glass Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 p-7 sm:p-8 shadow-xl shadow-blue-500/5 transition-all">
        {/* Top Highlight Sheen */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />

        {/* Phase Header Badge */}
        <div className="flex items-center justify-between mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold tracking-widest uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>FASE AKTIF</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>MUSKOM 2026</span>
          </div>
        </div>

        {/* Phase Title */}
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug mb-6">
          {phaseName}
        </h3>

        {/* Countdown Integration */}
        {countdownTarget && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <CountdownCard targetDate={countdownTarget} label={countdownLabel} />
          </div>
        )}
      </div>
    </div>
  );
}
