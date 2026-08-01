"use client"

import { useQuery } from "@tanstack/react-query"
import { startTransition, useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Menu, X, Lock, CalendarDays, MapPin, ArrowRight, ChevronDown,
  UserCircle2, ArrowUpRight, Sun, Moon, Clock, Mail, Phone,
} from "lucide-react"
import { landingService } from "@/services/landing"
import { HomeResponse } from "@/types/landing"
import { Badge } from "@/components/ui/badge"

// ─────────────────────────────────────────────────────────────
// MOTION HELPERS
// ─────────────────────────────────────────────────────────────
const ease = [0.25, 0.4, 0.25, 1] as const

function FadeUp({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay, ease }}
      className={className}
    >{children}</motion.div>
  )
}

function SlideUp({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease }}
      className={className}
    >{children}</motion.div>
  )
}

function SlideInRight({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 36 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.75, delay, ease }}
      className={className}
    >{children}</motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// COUNTDOWN TIMER (Task 3 — Hero card)
// ─────────────────────────────────────────────────────────────
function CountdownTimer({ targetDate, label }: { targetDate?: string; label: string }) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    startTransition(() => setMounted(true))
    if (!targetDate) return
    const target = new Date(targetDate).getTime()

    const calc = () => {
      const diff = target - Date.now()
      if (diff <= 0) { setT({ d: 0, h: 0, m: 0, s: 0 }); return }
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }

    const id = setInterval(calc, 1000)
    calc()
    return () => clearInterval(id)
  }, [targetDate])

  if (!targetDate || !mounted) return null

  const units = [
    { v: t.d, l: "Hari" }, { v: t.h, l: "Jam" },
    { v: t.m, l: "Menit" }, { v: t.s, l: "Detik" },
  ]

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3">
        <Clock className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-[11px] font-bold pg-faint uppercase tracking-widest">{label}</span>
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        {units.map((u) => (
          <div key={u.l} className="flex flex-col items-center py-3 px-2 rounded-2xl pg-surface border pg-border shadow-sm">
            <span className="text-xl font-black pg-text tabular-nums leading-none tracking-tight">{String(u.v).padStart(2, "0")}</span>
            <span className="text-[10px] font-semibold pg-muted mt-1.5 uppercase tracking-wider">{u.l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// INFO ROW (reusable inside EventInfoCard)
// ─────────────────────────────────────────────────────────────
function InfoRow({
  icon: Icon, label, value, children,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg pg-surface border pg-border flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 pg-muted" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs pg-faint mb-0.5">{label}</div>
        {children ?? <div className="text-sm font-semibold pg-text">{value ?? "—"}</div>}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// EVENT INFO CARD (Task 3 — Hero right column)
// ─────────────────────────────────────────────────────────────
function EventInfoCard({ data, loading }: { data: HomeResponse | null, loading: boolean }) {
  const peakDateStr = data?.event?.event_date ?? "TBD";
  const peakTimeStr = data?.event?.event_time ?? "TBD";
  const venue = data?.event?.location ?? "TBD";
  const countdownTarget = data?.countdown?.target_date;

  return (
    <div className="pg-card p-6 lg:p-8 relative overflow-hidden backdrop-blur-xl">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 blur-[50px] rounded-full pointer-events-none" />
      
      {/* Current Phase indicator */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b pg-border relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-3 h-3">
            <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75" />
            <div className="relative rounded-full w-2 h-2 bg-blue-600" />
          </div>
          <span className="text-sm font-bold tracking-wide pg-text uppercase">
            {loading ? "Memuat..." : (data?.currentPhase?.name || "Persiapan")}
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

// ─────────────────────────────────────────────────────────────
// HEADER (Task 2 — theme toggle)
// ─────────────────────────────────────────────────────────────
const navItems = [
  { label: "Beranda",     href: "#"           },
  { label: "Timeline",   href: "#timeline"   },
  { label: "Kandidat",   href: "#kandidat"   },
  { label: "Pengumuman", href: "#pengumuman" },
  { label: "FAQ",        href: "#faq"        },
  { label: "Bantuan",    href: "#bantuan"    },
]

function Header({ theme, toggleTheme }: { theme: "dark" | "light"; toggleTheme: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${
          scrolled ? "header-glass py-3" : "bg-transparent py-5"
        }`}
      >
        <div className="container-landing flex items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <span className="text-lg font-black tracking-tight pg-text">MUSKOM</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href}
                className="nav-link px-4 py-2 rounded-full text-sm font-medium">
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Theme toggle */}
            <button
              id="theme-toggle"
              onClick={toggleTheme}
              className="pill-btn w-9 h-9 flex items-center justify-center"
              aria-label={theme === "dark" ? "Ganti ke tema terang" : "Ganti ke tema gelap"}
              suppressHydrationWarning
            >
              {theme === "dark"
                ? <Sun  className="w-4 h-4" />
                : <Moon className="w-4 h-4" />}
            </button>

            <Link href="/admin/login"
              className="pill-btn hidden md:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold">
              <Lock className="w-3.5 h-3.5" />
              Portal Admin
            </Link>

            <button onClick={() => setOpen(true)}
              className="ghost-btn md:hidden w-9 h-9 flex items-center justify-center rounded-full"
              aria-label="Buka menu navigasi"
              aria-expanded={open}
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${open ? "visible" : "invisible pointer-events-none"}`}>
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
          style={{ background: "rgba(0,0,0,0.55)" }}
          onClick={() => setOpen(false)}
        />
        <div className={`absolute inset-y-0 right-0 w-72 pg-surface border-l pg-border flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex items-center justify-between px-5 h-16 border-b pg-border">
            <span className="font-bold pg-text">Menu</span>
            <button onClick={() => setOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full pg-muted hover:pg-text transition-colors"
              aria-label="Tutup menu navigasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 p-3 space-y-0.5">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} onClick={() => setOpen(false)}
                className="nav-link flex items-center px-4 py-3.5 rounded-xl text-sm font-medium">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="p-4 border-t pg-border space-y-2">
            <button onClick={() => { toggleTheme(); setOpen(false) }}
              className="pill-btn flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold"
              aria-label={theme === "dark" ? "Ganti ke tema terang" : "Ganti ke tema gelap"}
              suppressHydrationWarning
            >
              {theme === "dark" ? <><Sun className="w-4 h-4" />Tema Terang</> : <><Moon className="w-4 h-4" />Tema Gelap</>}
            </button>
            <Link href="/admin/login" onClick={() => setOpen(false)}
              className="pill-btn flex items-center justify-center gap-2 w-full py-3 px-5 font-bold text-sm">
              <Lock className="w-4 h-4" />
              Portal Admin
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────
// HERO (Task 3 — two-column layout)
// ─────────────────────────────────────────────────────────────
function Hero({ data, loading }: { data: HomeResponse | null, loading: boolean }) {
  const name = data?.event?.name ?? ""
  const themeStr = data?.event?.theme ?? ""
  const isActive = data?.event?.status === "UPCOMING" || data?.event?.status === "ONGOING"
  
  const ctaPrimary = data?.cta?.primary
  const ctaSecondary = data?.cta?.secondary

  return (
    <section className="relative pt-32 lg:pt-48 pb-20 lg:pb-32 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="container-landing relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column (Copy) */}
          <div className="lg:col-span-7 space-y-8">
            <FadeUp>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black pg-text tracking-tight mb-6 leading-[1.1]">
                {loading ? "Portal Resmi Musyawarah" : name}
              </h1>
              <p className="text-lg sm:text-xl pg-muted leading-relaxed max-w-2xl font-medium">
                {loading ? "Memuat informasi..." : themeStr}
              </p>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div className="flex flex-col sm:flex-row items-start gap-3">
                {isActive && ctaPrimary && (
                  <Link href={ctaPrimary.url}
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 text-slate-950 font-bold rounded-full text-sm hover:bg-blue-500 shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 transition-all duration-200">
                    {ctaPrimary.label} <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                {ctaSecondary && (
                  <a href={ctaSecondary.url}
                    className="pill-btn inline-flex items-center gap-2 px-7 py-3.5 font-semibold text-sm">
                    {ctaSecondary.label}
                  </a>
                )}
              </div>
            </FadeUp>
          </div>

          {/* Right Column (Info Card) */}
          <div className="lg:col-span-5 lg:pl-10">
            <FadeUp delay={0.4}>
              <EventInfoCard data={data} loading={loading} />
            </FadeUp>
          </div>

        </div>
      </div>
    </section>
  )
}
// ─────────────────────────────────────────────────────────────
// TIMELINE
// ─────────────────────────────────────────────────────────────
function fmt(d?: string) {
  if (!d) return "TBD"
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
}

const phaseCfg = {
  past:     { dot: "bg-emerald-500",                badge: "emerald" as const,                  label: "Selesai"        },
  active:   { dot: "bg-cyan-500 ring-4 ring-cyan-500/20", badge: "cyan" as const, label: "Berlangsung"   },
  upcoming: { dot: "bg-slate-300",             badge: "default" as const,                  label: "Akan Datang"   },
}

function Timeline({ data }: { data: HomeResponse | null }) {
  const timelines = data?.timeline || [];
  
  return (
    <section id="timeline" className="pg-bg-paper border-t pg-border">
      <div className="container-landing py-24 lg:py-32">
        <SlideUp className="text-center max-w-2xl mx-auto mb-16 lg:mb-24">
          <p className="text-blue-600 text-xs font-semibold tracking-widest uppercase mb-3">Linimasa</p>
          <h2 className="text-3xl sm:text-4xl font-black pg-text tracking-tight mb-4">Agenda Resmi</h2>
          <p className="pg-muted text-lg leading-relaxed">
            Tahapan dan jadwal pelaksanaan musyawarah dari persiapan hingga penetapan.
          </p>
        </SlideUp>

        {(!timelines || timelines.length === 0) && (
          <div className="flex flex-col items-center py-16 text-center pg-card-i rounded-2xl">
            <CalendarDays className="w-12 h-12 pg-faint mb-4" />
            <h3 className="text-lg font-bold pg-text mb-2">Rangkaian Agenda</h3>
            <p className="pg-muted max-w-sm text-sm leading-relaxed">
              Jadwal resmi pelaksanaan musyawarah belum tersedia.
            </p>
          </div>
        )}

        {timelines && timelines.length > 0 && (
          <div className="space-y-4">
            {timelines.map((phase, i) => {
              const status = phase.status;
              const cfg = phaseCfg[status];
              return (
                <SlideUp key={phase.id} delay={i * 0.1}>
                  <div className={`flex gap-6 p-6 lg:p-8 pg-card-i transition-colors ${status === "active" ? "ring-2 ring-blue-600/30" : ""}`}>
                    <div className="flex flex-col items-center pt-1 shrink-0">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${cfg.dot}`} />
                      {i < timelines.length - 1 && <div className="w-px flex-1 bg-current opacity-10 mt-2" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge variant={cfg.badge}>{cfg.label}</Badge>
                        <span className="text-xs font-mono pg-faint">{phase.start_date ? new Date(phase.start_date).toLocaleDateString("id-ID") : ""}</span>
                      </div>
                      <h3 className="text-lg font-bold pg-text mb-1.5">{phase.id}. {phase.title}</h3>
                    </div>
                  </div>
                </SlideUp>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
// ─────────────────────────────────────────────────────────────
// CANDIDATE PREVIEW
// ─────────────────────────────────────────────────────────────
function CandidatePreview({ data }: { data: HomeResponse | null }) {
  const candidates = data?.candidates || [];
  return (
    <section id="kandidat" className="border-t pg-border relative overflow-hidden">
      <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="container-landing py-24 lg:py-32 relative z-10">
        
        <SlideUp className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 lg:mb-24">
          <div className="max-w-2xl">
            <p className="text-blue-600 text-xs font-semibold tracking-widest uppercase mb-3">Kandidat</p>
            <h2 className="text-3xl sm:text-4xl font-black pg-text tracking-tight mb-4">Bursa Calon Ketua</h2>
            <p className="pg-muted text-lg leading-relaxed">
              Mengenal lebih dekat visi dan misi calon pemimpin yang akan membawa perubahan untuk komunitas.
            </p>
          </div>
          <div className="shrink-0">
            <a href="#" className="pill-btn inline-flex items-center gap-2 px-6 py-3 font-semibold text-sm group">
              Lihat Profil Lengkap
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </SlideUp>

        {candidates.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl pg-card flex items-center justify-center mb-5">
              <UserCircle2 className="w-8 h-8 pg-faint" />
            </div>
            <h3 className="text-lg font-bold pg-text mb-2">Verifikasi Kandidat</h3>
            <p className="pg-muted max-w-xs text-sm leading-relaxed">Calon Ketua Umum akan dipublikasikan setelah proses verifikasi administrasi selesai.</p>
          </div>
        )}

        {candidates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {candidates.map((c, i) => (
              <SlideUp key={c.id} delay={i * 0.1}>
                <div className="group pg-card-i p-6 lg:p-8 flex flex-col h-full hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-16 h-16 rounded-full bg-blue-600/10 flex items-center justify-center shrink-0 border border-blue-600/20 text-blue-600 font-black text-xl">
                      {c.sequence_number ?? "?"}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold pg-text group-hover:text-blue-600 transition-colors">{c.name}</h3>
                      <p className="text-sm pg-faint">{c.title}</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-semibold uppercase tracking-wider pg-text mb-3">Visi Utama</h4>
                    <p className="text-sm pg-muted leading-relaxed line-clamp-4">{c.vision}</p>
                  </div>
                </div>
              </SlideUp>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
// ─────────────────────────────────────────────────────────────
// ANNOUNCEMENT
// ─────────────────────────────────────────────────────────────
function fmtDate(d?: string) {
  if (!d) return "Baru saja";
  return new Date(d).toLocaleDateString("id-ID", { month: "short", year: "numeric", day: "numeric" });
}

function Announcement({ data }: { data: HomeResponse | null }) {
  const announcements = data?.announcements || [];
  return (
    <section id="pengumuman" className="pg-bg-paper border-t pg-border">
      <div className="container-landing py-24 lg:py-32">
        <SlideUp className="text-center max-w-2xl mx-auto mb-16 lg:mb-24">
          <p className="text-blue-600 text-xs font-semibold tracking-widest uppercase mb-3">Informasi</p>
          <h2 className="text-3xl sm:text-4xl font-black pg-text tracking-tight mb-4">Pusat Informasi</h2>
          <p className="pg-muted text-lg leading-relaxed">
            Pembaruan terbaru, pengumuman resmi, dan dokumen penting terkait pelaksanaan musyawarah.
          </p>
        </SlideUp>

        {(!announcements || announcements.length === 0) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto rounded-2xl pg-card flex items-center justify-center mb-5">
              <CalendarDays className="w-8 h-8 pg-faint" />
            </div>
            <h3 className="text-lg font-bold pg-text mb-2">Pusat Informasi</h3>
            <p className="pg-muted text-sm max-w-sm mx-auto">Belum ada pengumuman yang diterbitkan saat ini.</p>
          </div>
        )}

        {announcements && announcements.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {announcements.map((a, i) => (
              <SlideUp key={a.id} delay={i * 0.1}>
                <a href={`/announcement/${a.id}`} className="block group pg-card-i p-6 lg:p-8 hover:-translate-y-1 transition-transform">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <Badge variant="blue">Pengumuman</Badge>
                    <span className="text-xs font-mono pg-faint">{a.published_at ? new Date(a.published_at).toLocaleDateString("id-ID") : ""}</span>
                  </div>
                  <h3 className="text-lg font-bold pg-text mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">{a.title}</h3>
                  <p className="text-sm pg-muted line-clamp-3 leading-relaxed">{a.content}</p>
                </a>
              </SlideUp>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
// ─────────────────────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────────────────────
function FAQ({ data }: { data: HomeResponse | null }) {
  const faqs = data?.faq || [];
  if (!faqs.length) return null;

  return (
    <section id="faq" className="pg-bg-paper border-t pg-border">
      <div className="container-landing py-24 lg:py-32">
        <SlideUp className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-blue-600 text-xs font-semibold tracking-widest uppercase mb-3">Tanya Jawab</p>
          <h2 className="text-3xl sm:text-4xl font-black pg-text tracking-tight mb-4">Pertanyaan Umum (FAQ)</h2>
          <p className="pg-muted text-lg leading-relaxed">Jawaban cepat untuk pertanyaan yang sering diajukan mengenai pelaksanaan musyawarah.</p>
        </SlideUp>
        
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, i) => (
            <SlideUp key={i} delay={i * 0.1}>
              <details className="group pg-card-i rounded-2xl [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer p-6 font-bold pg-text">
                  {faq.question}
                  <span className="transition group-open:-rotate-180">
                    <ChevronDown className="w-5 h-5 pg-faint" />
                  </span>
                </summary>
                <div className="px-6 pb-6 pt-0 text-sm pg-muted leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            </SlideUp>
          ))}
        </div>
      </div>
    </section>
  )
}
// ─────────────────────────────────────────────────────────────
// CONTACT
// ─────────────────────────────────────────────────────────────
function Contact({ data }: { data: HomeResponse | null }) {
  const footer = data?.footer;
  if (!footer) return null;

  return (
    <section id="bantuan" className="pg-bg-blue border-t pg-border relative overflow-hidden">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-[50vw] h-[50vw] rounded-full bg-blue-600/5 blur-[100px] pointer-events-none" />
      <div className="container-landing py-24 lg:py-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <SlideUp>
            <p className="text-blue-600 text-xs font-semibold tracking-widest uppercase mb-3">Layanan Bantuan</p>
            <h2 className="text-3xl sm:text-4xl font-black pg-text tracking-tight mb-4">Sekretariat Panitia</h2>
            <p className="pg-muted text-lg leading-relaxed mb-10 max-w-lg">
              Hubungi layanan bantuan resmi kami untuk pertanyaan teknis, kendala pendaftaran, atau informasi lebih lanjut.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full pg-surface border pg-border flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold pg-text mb-1">Email Resmi</h3>
                  <a href={`mailto:${footer.email}`} className="text-sm pg-muted hover:text-blue-600 transition-colors">{footer.email}</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full pg-surface border pg-border flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold pg-text mb-1">WhatsApp Center</h3>
                  <a href={footer.whatsapp_url} target="_blank" rel="noreferrer" className="text-sm pg-muted hover:text-emerald-600 transition-colors">{footer.whatsapp}</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full pg-surface border pg-border flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-bold pg-text mb-1">Lokasi Sekretariat</h3>
                  <p className="text-sm pg-muted mb-2">{footer.address}</p>
                  {data?.event?.mapsUrl && (
                    <a href={data.event.mapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-500">
                      Buka di Google Maps <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </SlideUp>
          
          <SlideInRight className="w-full">
            <div className="pg-card p-8 text-center space-y-5 relative overflow-hidden backdrop-blur-xl">
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-600/10 flex items-center justify-center">
                <Phone className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold pg-text">Butuh Bantuan Cepat?</h3>
              <p className="text-sm pg-muted leading-relaxed">Tim layanan bantuan kami bersiaga pada jam kerja (09:00 - 17:00 WIB).</p>
              <a href={footer.whatsapp_url} target="_blank" rel="noreferrer" className="pill-btn w-full inline-flex justify-center items-center gap-2 px-6 py-4 font-bold text-sm bg-blue-600 text-slate-950 hover:bg-blue-500 border-transparent">
                Hubungi via WhatsApp
              </a>
            </div>
          </SlideInRight>
        </div>
      </div>
    </section>
  )
}
// ─────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────
function Footer({ data }: { data: HomeResponse | null }) {
  const footer = data?.footer;
  if (!footer) return null;

  return (
    <footer className="pg-bg-neutral border-t pg-border relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-blue-600/40 to-transparent" />
      <div className="container-landing py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <span className="text-base font-black pg-text">MUSKOM</span>
            </div>
            <p className="text-sm pg-muted leading-relaxed max-w-xs">
              Portal resmi Musyawarah KOMITKABE 2026. Transparan, aman, dan dapat diandalkan oleh seluruh anggota.
            </p>
            <div className="flex items-center gap-4 mt-6">
              {footer.socials.map((s, i) => (
                <a key={i} href={s.url} title={s.platform} className="w-8 h-8 rounded-full pg-surface border pg-border flex items-center justify-center pg-muted hover:text-blue-600 transition-colors">
                  <span className="sr-only">{s.platform}</span>
                  <div className="w-3.5 h-3.5 bg-current" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold pg-text uppercase tracking-wider mb-5">Navigasi</h4>
            <ul className="space-y-3">
              {navItems.map((n) => (
                <li key={n.label}>
                  <Link href={n.href} className="text-sm pg-muted hover:pg-text transition-colors">{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold pg-text uppercase tracking-wider mb-5">Legal</h4>
            <ul className="space-y-3">
              {footer.links.map((l, i) => (
                <li key={i}><a href={l.url} className="text-sm pg-muted hover:pg-text transition-colors">{l.label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold pg-text uppercase tracking-wider mb-5">Akses</h4>
            <Link href="/admin/login" className="text-sm pg-muted hover:text-blue-600 transition-colors">
              Portal Administrator →
            </Link>
          </div>
        </div>
        <div className="border-t pg-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs pg-faint">&copy; {new Date().getFullYear()} {footer.copyright}</p>
          <p className="text-xs" style={{ color: "var(--c-text-faint)", opacity: 0.5 }}>{footer.tagline}</p>
        </div>
      </div>
    </footer>
  )
}
// ─────────────────────────────────────────────────────────────
// ROOT — manages theme + data
// ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark")

  // Detect system preference + persisted preference on mount
  useEffect(() => {
    const stored = localStorage.getItem("muskom-theme") as "dark" | "light" | null
    const resolved = stored ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    startTransition(() => setTheme(resolved))

    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const listener = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("muskom-theme")) setTheme(e.matches ? "dark" : "light")
    }
    mq.addEventListener("change", listener)
    return () => mq.removeEventListener("change", listener)
  }, [])

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    localStorage.setItem("muskom-theme", next)
  }

  const { data: homeData, isLoading } = useQuery({
    queryKey: ["public-home"],
    queryFn: landingService.getPublicHome,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  return (
    <div className="min-h-screen pg-bg" data-theme={theme}>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main>
        <Hero data={homeData ?? null} loading={isLoading} />
        <Timeline data={homeData ?? null} />
        <CandidatePreview data={homeData ?? null} />
        <Announcement data={homeData ?? null} />
        <FAQ data={homeData ?? null} />
        <Contact data={homeData ?? null} />
      </main>
      <Footer data={homeData ?? null} />
    </div>
  )
}
