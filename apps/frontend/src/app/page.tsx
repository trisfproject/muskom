"use client"

import { useQuery } from "@tanstack/react-query"
import { startTransition, useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Menu, X, Lock, CalendarDays, MapPin, ArrowRight, ChevronDown,
  UserCircle2, ArrowUpRight,
  Sun, Moon, Clock,
} from "lucide-react"
import { landingService } from "@/services/landing"
import { HomeResponse, PublicEventDTO, PublicCurrentPhaseDTO, PublicTimelineDTO, PublicAnnouncementDTO, PublicCandidateDTO } from "@/types/landing"
import { Badge } from "@/components/ui/badge"

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
interface CandidateData {
  id?: string; name?: string; title?: string
  photo_path?: string; sequence_number?: number; vision?: string
}

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
function EventInfoCard({ event, currentPhase }: { event: PublicEventDTO | null, currentPhase: PublicCurrentPhaseDTO | null }) {
  const peakDateStr = event?.event_date ? new Date(event.event_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) + " WIB" : "TBD";
  const venue = event?.location || "TBD";

  return (
    <div className="pg-card p-8 lg:p-10 space-y-7 backdrop-blur-xl relative overflow-hidden">
      {/* Subtle background glow for premium feel inside the card */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-[60px] pointer-events-none rounded-full" />
      
      {/* Status header */}
      <div className="flex flex-col gap-1.5 pb-1 relative z-10">
        <span className="text-[11px] font-bold pg-faint uppercase tracking-widest">
          Fase Saat Ini
        </span>
        <h3 className="text-xl lg:text-2xl font-black pg-text tracking-tight">
          {currentPhase?.name || "Belum Ada Jadwal"}
        </h3>
      </div>

      {/* Countdown */}
      <div className="relative z-10">
        <CountdownTimer targetDate={currentPhase?.end_date} label={`Menuju Batas Waktu Fase`} />
      </div>

      <div className="border-t pg-border relative z-10" />

      {/* Info rows */}
      <div className="space-y-4 pt-1 relative z-10">
        <InfoRow icon={CalendarDays} label="Puncak Musyawarah" value={peakDateStr} />
        <InfoRow icon={MapPin}       label="Lokasi Utama"      value={venue} />
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
              className="ghost-btn md:hidden w-9 h-9 flex items-center justify-center rounded-full">
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
              className="w-8 h-8 flex items-center justify-center rounded-full pg-muted hover:pg-text transition-colors">
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
              className="pill-btn flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold">
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
function Hero({ event, currentPhase }: { event: PublicEventDTO | null, currentPhase: PublicCurrentPhaseDTO | null }) {
  const name = event?.name ?? "Musyawarah KOMITKABE"
  const themeStr = event?.theme ?? "Membangun Komunitas Berdaulat, Transparan & Progresif"
  const isActive = event?.status === "UPCOMING" || event?.status === "ONGOING"

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pg-bg-paper">
      {/* Background ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 rounded-full bg-blue-600/6 blur-[130px]" />
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full bg-blue-700/5 blur-[100px]" />
      </div>
      <div className="dot-grid absolute inset-0 pointer-events-none" />

      <div className="container-landing relative z-10 pt-32 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16 items-center">

          {/* ── LEFT: Text content ── */}
          <div className="flex flex-col items-start lg:col-span-7">
            <FadeUp delay={0}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-600 text-xs font-semibold tracking-widest uppercase">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500" />
                </span>
                Portal Resmi Musyawarah
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <h1 className="text-balance text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-black tracking-tight leading-[1.05] mb-6">
                <span className="text-gradient">{name}</span>
              </h1>
            </FadeUp>

            <FadeUp delay={0.2}>
              <p className="text-lg pg-muted leading-relaxed mb-10 max-w-lg">
                {themeStr}
              </p>
            </FadeUp>

            <FadeUp delay={0.35}>
              <div className="flex flex-col sm:flex-row items-start gap-3">
                {isActive && (
                  <Link href="/register"
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 text-slate-950 font-bold rounded-full text-sm hover:bg-blue-500 shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 transition-all duration-200">
                    Daftar Sekarang <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                <a href="#timeline"
                  className="pill-btn inline-flex items-center gap-2 px-7 py-3.5 font-semibold text-sm">
                  Lihat Jadwal
                </a>
              </div>
            </FadeUp>
          </div>

          {/* ── RIGHT: Event info card ── */}
          <SlideInRight delay={0.25} className="lg:col-span-5 w-full">
            <EventInfoCard event={event} currentPhase={currentPhase} />
          </SlideInRight>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pg-faint text-xs font-medium tracking-widest uppercase">
        <span>Scroll</span>
        <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
      </motion.div>
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

function phaseStatus(start?: string, end?: string): "past" | "active" | "upcoming" {
  if (!start) return "upcoming"
  const now = Date.now()
  const s = new Date(start).getTime()
  const e = end ? new Date(end).getTime() : s
  if (now > e) return "past"
  if (now >= s) return "active"
  return "upcoming"
}

const phaseCfg = {
  past:     { dot: "bg-emerald-500",                badge: "emerald" as const,                  label: "Selesai"        },
  active:   { dot: "bg-cyan-500 ring-4 ring-cyan-500/20", badge: "cyan" as const, label: "Berlangsung"   },
  upcoming: { dot: "bg-slate-300",             badge: "default" as const,                  label: "Akan Datang"   },
}

function Timeline({ timelines }: { timelines: PublicTimelineDTO[] }) {
  if (!timelines || timelines.length === 0) return null;

  return (
    <section id="timeline" className="pg-bg-white border-t pg-border">
      <div className="container-landing py-24 lg:py-32">
        <SlideUp>
          <p className="text-blue-600 text-xs font-semibold tracking-widest uppercase mb-3">Agenda</p>
          <h2 className="text-3xl sm:text-4xl font-black pg-text tracking-tight mb-4">Timeline Musyawarah</h2>
          <p className="pg-muted max-w-lg text-lg leading-relaxed mb-14">
            Seluruh rangkaian acara tersusun untuk memastikan proses yang adil, transparan, dan dapat diikuti semua anggota.
          </p>
        </SlideUp>

        <div className="space-y-4">
          {timelines.map((phase, i) => {
            const status = phaseStatus(phase.start_date, phase.end_date)
            const cfg = phaseCfg[status]
            return (
              <SlideUp key={phase.id} delay={i * 0.1}>
                <div className="flex gap-6 p-6 lg:p-8 pg-card-i transition-colors">
                  <div className="flex flex-col items-center pt-1 shrink-0">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${cfg.dot}`} />
                    {i < timelines.length - 1 && <div className="w-px flex-1 bg-current opacity-10 mt-2" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant={cfg.badge}>{cfg.label}</Badge>
                      <span className="text-xs font-mono pg-faint">{fmt(phase.start_date)} — {fmt(phase.end_date)}</span>
                    </div>
                    <h3 className="text-lg font-bold pg-text mb-1.5">{phase.title}</h3>
                    <p className="text-sm pg-muted leading-relaxed">{phase.description}</p>
                  </div>
                </div>
              </SlideUp>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────
// CANDIDATE PREVIEW
// ─────────────────────────────────────────────────────────────
function CandidatePreview({ candidates, loading }: { candidates: PublicCandidateDTO[], loading: boolean }) {

  return (
    <section id="kandidat" className="pg-bg-blue border-t pg-border relative overflow-hidden">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-[60vw] h-[60vw] rounded-full bg-blue-600/4 blur-[120px] pointer-events-none" />
      <div className="container-landing relative z-10 py-24 lg:py-32">
        <SlideUp>
          <p className="text-blue-600 text-xs font-semibold tracking-widest uppercase mb-3">Kandidat Resmi</p>
          <h2 className="text-3xl sm:text-4xl font-black pg-text tracking-tight mb-4">Mengenal Calon Pemimpin</h2>
          <p className="pg-muted max-w-lg text-lg leading-relaxed mb-14">
            Setiap kandidat telah melalui proses verifikasi resmi. Pelajari visi dan misi mereka sebelum memberikan suara.
          </p>
        </SlideUp>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[0, 1, 2].map((i) => <div key={i} className="h-64 rounded-2xl pg-surface animate-pulse" />)}
          </div>
        )}

        {!loading && candidates.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl pg-card flex items-center justify-center mb-5">
              <UserCircle2 className="w-8 h-8 pg-faint" />
            </div>
            <h3 className="text-lg font-bold pg-text mb-2">Belum Ada Kandidat</h3>
            <p className="pg-muted max-w-xs text-sm leading-relaxed">Daftar kandidat akan dipublikasikan setelah proses verifikasi selesai.</p>
          </div>
        )}

        {!loading && candidates.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {candidates.map((c, i) => (
              <SlideUp key={c.id ?? i} delay={i * 0.07}>
                <article className="group pg-card-i overflow-hidden">
                  <div className="relative h-52 pg-surface flex items-center justify-center overflow-hidden">
                    {c.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.photo_url} alt={c.name ?? "Kandidat"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <UserCircle2 className="w-20 h-20 pg-faint" />
                    )}
                    <div className="absolute top-3 left-3 pg-card backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-bold pg-text">
                      No. {c.sequence_number ?? i + 1}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-bold pg-text mb-0.5">{c.name ?? "—"}</h3>
                    {c.title && <p className="text-sm font-medium text-blue-600 mb-3">{c.title}</p>}
                    {c.vision && <p className="text-sm pg-muted line-clamp-3 leading-relaxed">{c.vision}</p>}
                  </div>
                </article>
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

function Announcement({ announcements }: { announcements: PublicAnnouncementDTO[] }) {
  if (!announcements || announcements.length === 0) return null;
  return (
    <section id="pengumuman" className="pg-bg-white border-t pg-border">
      <div className="container-landing py-24 lg:py-32">
        <SlideUp className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-blue-600 text-xs font-semibold tracking-widest uppercase mb-3">Informasi Terkini</p>
            <h2 className="text-3xl sm:text-4xl font-black pg-text tracking-tight mb-3">Pengumuman Resmi</h2>
            <p className="pg-muted max-w-lg text-lg leading-relaxed">
              Tetap terhubung dan dapatkan informasi terbaru seputar pelaksanaan musyawarah dari panitia resmi.
            </p>
          </div>
          <button className="shrink-0 inline-flex items-center gap-1 text-sm font-semibold pg-faint hover:pg-text transition-colors">
            Lihat semua <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </SlideUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {announcements.map((a, i) => (
            <SlideUp key={a.id} delay={i * 0.1}>
              <article className="group pg-card-i p-6 flex flex-col h-full cursor-pointer">
                <div className="flex items-center justify-between mb-5">
                  <Badge variant={['blue', 'violet', 'amber', 'rose'][i % 4] as any}>Pengumuman</Badge>
                  <span className="text-xs pg-faint font-mono">{fmtDate(a.published_at || a.created_at)}</span>
                </div>
                <h3 className="text-base font-bold pg-text leading-snug mb-3 group-hover:text-blue-600 transition-colors duration-200 flex-1">{a.title}</h3>
                <p className="text-sm pg-muted leading-relaxed mb-5 line-clamp-3">{a.content}</p>
                <div className="flex items-center gap-1 text-xs font-semibold pg-faint group-hover:text-blue-600 transition-colors duration-200">
                  Baca selengkapnya
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                </div>
              </article>
            </SlideUp>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────
function Footer() {
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
              Platform resmi musyawarah komunitas. Transparan, aman, dan dapat diandalkan oleh seluruh anggota.
            </p>
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
              {["Syarat & Ketentuan", "Kebijakan Privasi", "Panduan Peserta"].map((l) => (
                <li key={l}><a href="#" className="text-sm pg-muted hover:pg-text transition-colors">{l}</a></li>
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
          <p className="text-xs pg-faint">&copy; {new Date().getFullYear()} MUSKOM. Hak Cipta Dilindungi.</p>
          <p className="text-xs" style={{ color: "var(--c-text-faint)", opacity: 0.5 }}>Dibangun untuk komunitas.</p>
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

  if (isLoading) {
    return (
      <div className="min-h-screen pg-bg flex items-center justify-center" data-theme={theme}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  const ev = homeData?.event ?? null
  const currentPhase = homeData?.currentPhase ?? null
  const timelines = homeData?.timeline ?? []
  const announcements = homeData?.announcements ?? []
  const candidates = homeData?.candidates ?? []
  const settings = homeData?.settings ?? null

  if (ev?.status === "DRAFT" || ev?.status === "CANCELLED") {
    return (
      <div className="min-h-screen pg-bg flex flex-col" data-theme={theme}>
        <Header theme={theme} toggleTheme={toggleTheme} />
        <div className="flex-1 flex flex-col items-center justify-center px-5 text-center">
          <h1 className="text-2xl font-black pg-text mb-3 tracking-tight">Portal Dalam Pemeliharaan</h1>
          <p className="pg-muted max-w-sm leading-relaxed">Sistem sedang dipersiapkan. Silakan kunjungi kembali beberapa saat lagi.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pg-bg" data-theme={theme}>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main>
        <Hero event={ev} currentPhase={currentPhase} />
        {settings?.show_timeline && <Timeline timelines={timelines} />}
        {settings?.show_candidate_list && <CandidatePreview candidates={candidates} loading={false} />}
        {settings?.show_announcements && <Announcement announcements={announcements} />}
      </main>
      <Footer />
    </div>
  )
}
