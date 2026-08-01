"use client"

import { useQuery } from "@tanstack/react-query"
import { startTransition, useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Menu, X, Lock, CalendarDays, MapPin, ArrowRight, ChevronDown,
  Users, UserCheck, Activity, UserCircle2, ArrowUpRight,
  Sun, Moon, Clock,
} from "lucide-react"
import { landingService } from "@/services/landing"
import { MusyawarahEvent } from "@/types/event"
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
      <div className="flex items-center gap-1.5 mb-2.5">
        <Clock className="w-3 h-3 pg-faint" />
        <span className="text-xs font-semibold pg-faint uppercase tracking-wider">{label}</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {units.map((u) => (
          <div key={u.l} className="flex flex-col items-center p-2.5 rounded-xl pg-surface border pg-border">
            <span className="text-lg font-black pg-text tabular-nums leading-none">{String(u.v).padStart(2, "0")}</span>
            <span className="text-xs pg-faint mt-1">{u.l}</span>
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
const EVENT_STATUS: Record<string, { label: string; variant: "emerald" | "sky" | "amber" | "red" | "default" }> = {
  UPCOMING:  { label: "Akan Datang",       variant: "sky"     },
  ONGOING:   { label: "Sedang Berlangsung", variant: "emerald" },
  COMPLETED: { label: "Telah Selesai",      variant: "default" },
  DRAFT:     { label: "Dalam Persiapan",    variant: "amber"   },
  CANCELLED: { label: "Dibatalkan",         variant: "red"     },
}

function EventInfoCard({ event }: { event: MusyawarahEvent | null }) {
  const status = event?.status ? EVENT_STATUS[event.status] : null

  const countdownDate = event?.status === "UPCOMING" ? event?.start_date
    : event?.status === "ONGOING" ? event?.voting_end : undefined
  const countdownLabel = event?.status === "UPCOMING" ? "Dimulai dalam" : "Voting berakhir dalam"

  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(id)
  }, [])
  const regStart = event?.registration_start ? new Date(event.registration_start).getTime() : null
  const regEnd   = event?.registration_end   ? new Date(event.registration_end).getTime()   : null

  const regStatus = (() => {
    if (!event) return null
    if (regEnd && now > regEnd) return { label: "Ditutup",         variant: "red"     as const }
    if (!event.allow_candidate_registration)
                                return { label: "Belum Dibuka",    variant: "sky"     as const }
    if (regStart && now < regStart) return { label: "Belum Dimulai", variant: "amber"   as const }
    if (regStart && regEnd && now >= regStart && now <= regEnd)
                                return { label: "Sedang Dibuka",   variant: "emerald" as const }
    return null
  })()

  const startDate = event?.start_date
    ? new Date(event.start_date).toLocaleDateString("id-ID", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      })
    : "Belum Ditentukan"

  return (
    <div className="pg-card rounded-2xl p-6 lg:p-8 space-y-5 shadow-2xl">
      {/* Status header */}
      <div className="flex items-center justify-between pb-1">
        <span className="text-xs font-semibold pg-faint uppercase tracking-widest">
          Informasi Event
        </span>
        {status && <Badge variant={status.variant}>{status.label}</Badge>}
      </div>

      {/* Countdown */}
      {countdownDate && (
        <>
          <CountdownTimer targetDate={countdownDate} label={countdownLabel} />
          <div className="border-t pg-border" />
        </>
      )}

      {/* Info rows */}
      <div className="space-y-4">
        <InfoRow icon={CalendarDays} label="Tanggal Pelaksanaan" value={startDate} />
        <InfoRow icon={MapPin}       label="Lokasi"               value={event?.location ?? "Akan Diumumkan"} />
        {regStatus && (
          <InfoRow icon={Users} label="Status Pendaftaran">
            <Badge variant={regStatus.variant} className="mt-0.5">{regStatus.label}</Badge>
          </InfoRow>
        )}
        {event?.max_participants && (
          <InfoRow icon={UserCheck} label="Kapasitas Peserta"
            value={event.max_participants.toLocaleString("id-ID") + " orang"} />
        )}
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
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform duration-300">
              <span className="text-slate-950 font-black text-sm">M</span>
            </div>
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
              className="ghost-btn w-9 h-9 flex items-center justify-center rounded-full"
              aria-label={theme === "dark" ? "Ganti ke tema terang" : "Ganti ke tema gelap"}
            >
              {theme === "dark"
                ? <Sun  className="w-4 h-4" />
                : <Moon className="w-4 h-4" />}
            </button>

            <Link href="/admin/login"
              className="ghost-btn hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold">
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
              className="ghost-btn flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold">
              {theme === "dark" ? <><Sun className="w-4 h-4" />Tema Terang</> : <><Moon className="w-4 h-4" />Tema Gelap</>}
            </button>
            <Link href="/admin/login" onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 px-5 bg-emerald-500 text-slate-950 rounded-xl font-bold text-sm hover:bg-emerald-400 transition-colors">
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
function Hero({ event }: { event: MusyawarahEvent | null }) {
  const name = event?.name ?? "Musyawarah KOMITKABE"
  const themeStr = event?.theme ?? "Membangun Komunitas Berdaulat, Transparan & Progresif"
  const isActive = event?.status === "UPCOMING" || event?.status === "ONGOING"

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pg-bg">
      {/* Background ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 rounded-full bg-emerald-500/6 blur-[130px]" />
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full bg-emerald-600/5 blur-[100px]" />
      </div>
      <div className="dot-grid absolute inset-0 pointer-events-none" />

      <div className="container-landing relative z-10 pt-32 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">

          {/* ── LEFT: Text content ── */}
          <div className="flex flex-col items-start">
            <FadeUp delay={0}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold tracking-widest uppercase">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                </span>
                Portal Resmi Musyawarah
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-[1.05] mb-6">
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
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-emerald-500 text-slate-950 font-bold rounded-full text-sm hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all duration-200">
                    Daftar Sekarang <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                <a href="#timeline"
                  className="ghost-btn inline-flex items-center gap-2 px-7 py-3.5 font-medium rounded-full text-sm">
                  Lihat Jadwal
                </a>
              </div>
            </FadeUp>
          </div>

          {/* ── RIGHT: Event info card ── */}
          <SlideInRight delay={0.25}>
            <EventInfoCard event={event} />
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
// STATISTICS (Task 4 — elevated cards)
// ─────────────────────────────────────────────────────────────
const STATUS_LABEL: Record<string, string> = {
  UPCOMING:  "Segera Dimulai",
  ONGOING:   "Sedang Berlangsung",
  COMPLETED: "Telah Selesai",
  DRAFT:     "Dalam Persiapan",
  CANCELLED: "Dibatalkan",
}

function Statistics({ event }: { event: MusyawarahEvent | null }) {
  const stats = [
    {
      value:   event?.stats?.total_participants?.toLocaleString("id-ID") ?? "—",
      label:   "Peserta Terdaftar",
      desc:    "Anggota komunitas yang telah memiliki hak suara penuh dalam musyawarah.",
      icon:    Users,
      color:   "text-emerald-500",
      bg:      "bg-emerald-500/10",
      accent:  "hover:shadow-emerald-500/10",
    },
    {
      value:   event?.stats?.total_candidates?.toLocaleString("id-ID") ?? "—",
      label:   "Kandidat Resmi",
      desc:    "Calon pemimpin yang telah lulus proses verifikasi dan validasi panitia.",
      icon:    UserCheck,
      color:   "text-sky-500",
      bg:      "bg-sky-500/10",
      accent:  "hover:shadow-sky-500/10",
    },
    {
      value:   event?.status ? STATUS_LABEL[event.status] ?? "—" : "—",
      label:   "Status Portal",
      desc:    "Fase dan kondisi pelaksanaan musyawarah yang sedang berjalan saat ini.",
      icon:    Activity,
      color:   "text-violet-500",
      bg:      "bg-violet-500/10",
      accent:  "hover:shadow-violet-500/10",
    },
  ]

  return (
    <section className="pg-bg border-t pg-border relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
      <div className="container-landing py-20 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {stats.map((s, i) => (
            <SlideUp key={s.label} delay={i * 0.1}>
              <div className={`group pg-card-i rounded-2xl p-7 lg:p-9 cursor-default hover:shadow-2xl ${s.accent}`}>
                {/* Icon */}
                <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
                {/* Value */}
                <div className="text-4xl font-black pg-text tracking-tight mb-1.5 leading-none">{s.value}</div>
                {/* Label */}
                <div className="text-base font-bold pg-text mb-2.5">{s.label}</div>
                {/* Description */}
                <div className="text-sm pg-muted leading-relaxed">{s.desc}</div>
              </div>
            </SlideUp>
          ))}
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
  past:     { dot: "bg-slate-600",                badge: "pg-surface pg-faint border pg-border",                  label: "Selesai"        },
  active:   { dot: "bg-emerald-400 ring-4 ring-emerald-400/20", badge: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20", label: "Berlangsung"   },
  upcoming: { dot: "pg-surface border-2 pg-border",             badge: "pg-surface pg-faint border pg-border",                  label: "Akan Datang"   },
}

function Timeline({ event }: { event: MusyawarahEvent | null }) {
  const phases = [
    { key: "reg",  label: "Pendaftaran Peserta",  start: event?.registration_start,          end: event?.registration_end,          desc: "Pendaftaran resmi bagi anggota komunitas untuk memperoleh hak suara dalam musyawarah."        },
    { key: "cand", label: "Pendaftaran Kandidat", start: event?.candidate_registration_start, end: event?.candidate_registration_end, desc: "Penerimaan dan verifikasi berkas calon pemimpin komunitas periode berikutnya."                 },
    { key: "vote", label: "Pemilihan",            start: event?.voting_start,                end: event?.voting_end,                desc: "Pemungutan suara secara elektronik oleh seluruh peserta yang telah terverifikasi."              },
  ]

  return (
    <section id="timeline" className="pg-bg border-t pg-border">
      <div className="container-landing py-24 lg:py-32">
        <SlideUp>
          <p className="text-emerald-500 text-xs font-semibold tracking-widest uppercase mb-3">Agenda</p>
          <h2 className="text-3xl sm:text-4xl font-black pg-text tracking-tight mb-4">Timeline Musyawarah</h2>
          <p className="pg-muted max-w-lg text-lg leading-relaxed mb-14">
            Seluruh rangkaian acara tersusun untuk memastikan proses yang adil, transparan, dan dapat diikuti semua anggota.
          </p>
        </SlideUp>

        <div className="space-y-4">
          {phases.map((phase, i) => {
            const status = phaseStatus(phase.start, phase.end)
            const cfg = phaseCfg[status]
            return (
              <SlideUp key={phase.key} delay={i * 0.1}>
                <div className="flex gap-6 p-6 lg:p-8 rounded-2xl pg-card hover:pg-border-up transition-colors">
                  <div className="flex flex-col items-center pt-1 shrink-0">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${cfg.dot}`} />
                    {i < phases.length - 1 && <div className="w-px flex-1 bg-current opacity-10 mt-2" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.badge}`}>{cfg.label}</span>
                      <span className="text-xs font-mono pg-faint">{fmt(phase.start)} — {fmt(phase.end)}</span>
                    </div>
                    <h3 className="text-lg font-bold pg-text mb-1.5">{phase.label}</h3>
                    <p className="text-sm pg-muted leading-relaxed">{phase.desc}</p>
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
function CandidatePreview() {
  const [candidates, setCandidates] = useState<CandidateData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    landingService.getPublicCandidates()
      .then((r) => setCandidates(r as CandidateData[]))
      .catch(() => setCandidates([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="kandidat" className="pg-bg border-t pg-border relative overflow-hidden">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-[60vw] h-[60vw] rounded-full bg-emerald-500/4 blur-[120px] pointer-events-none" />
      <div className="container-landing relative z-10 py-24 lg:py-32">
        <SlideUp>
          <p className="text-emerald-500 text-xs font-semibold tracking-widest uppercase mb-3">Kandidat Resmi</p>
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
                <article className="group pg-card-i rounded-2xl overflow-hidden hover:border-emerald-500/20">
                  <div className="relative h-52 pg-surface flex items-center justify-center overflow-hidden">
                    {c.photo_path ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.photo_path} alt={c.name ?? "Kandidat"}
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
                    {c.title && <p className="text-sm font-medium text-emerald-500 mb-3">{c.title}</p>}
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
const announcements = [
  {
    id: 1, category: "Penting", badgeVariant: "emerald" as const,
    title: "Pendaftaran Peserta Resmi Dibuka",
    excerpt: "Seluruh anggota komunitas kini dapat mendaftarkan diri melalui portal ini untuk mendapatkan hak suara pada musyawarah.",
    date: "Agu 2026",
  },
  {
    id: 2, category: "Informasi", badgeVariant: "sky" as const,
    title: "Tata Tertib Musyawarah Telah Diterbitkan",
    excerpt: "Dokumen pedoman pelaksanaan dan tata cara pemilihan kini tersedia untuk diunduh oleh seluruh peserta yang telah terdaftar.",
    date: "Agu 2026",
  },
  {
    id: 3, category: "Agenda", badgeVariant: "violet" as const,
    title: "Jadwal Verifikasi Berkas Kandidat",
    excerpt: "Proses verifikasi berkas calon pemimpin dilaksanakan secara terbuka dan disiarkan melalui kanal komunikasi resmi komunitas.",
    date: "Agu 2026",
  },
]

function Announcement() {
  return (
    <section id="pengumuman" className="pg-bg border-t pg-border">
      <div className="container-landing py-24 lg:py-32">
        <SlideUp className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-emerald-500 text-xs font-semibold tracking-widest uppercase mb-3">Informasi Terkini</p>
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
              <article className="group pg-card-i rounded-2xl p-6 flex flex-col h-full cursor-pointer">
                <div className="flex items-center justify-between mb-5">
                  <Badge variant={a.badgeVariant}>{a.category}</Badge>
                  <span className="text-xs pg-faint font-mono">{a.date}</span>
                </div>
                <h3 className="text-base font-bold pg-text leading-snug mb-3 group-hover:text-emerald-500 transition-colors duration-200 flex-1">{a.title}</h3>
                <p className="text-sm pg-muted leading-relaxed mb-5">{a.excerpt}</p>
                <div className="flex items-center gap-1 text-xs font-semibold pg-faint group-hover:text-emerald-500 transition-colors duration-200">
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
    <footer className="pg-bg border-t pg-border relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
      <div className="container-landing py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <span className="text-slate-950 font-black text-sm">M</span>
              </div>
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
            <Link href="/admin/login" className="text-sm pg-muted hover:text-emerald-500 transition-colors">
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

  const { data: event, isLoading } = useQuery({
    queryKey: ["public-event"],
    queryFn: landingService.getPublicEvent,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen pg-bg flex items-center justify-center" data-theme={theme}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <span className="text-emerald-500 font-black text-lg">M</span>
          </div>
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  const ev = event ?? null

  if (ev?.status === "DRAFT" || ev?.status === "CANCELLED") {
    return (
      <div className="min-h-screen pg-bg flex flex-col" data-theme={theme}>
        <Header theme={theme} toggleTheme={toggleTheme} />
        <div className="flex-1 flex flex-col items-center justify-center px-5 text-center">
          <div className="w-16 h-16 rounded-2xl pg-card flex items-center justify-center mb-6">
            <span className="text-emerald-500 font-black text-2xl">M</span>
          </div>
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
        <Hero event={ev} />
        <Statistics event={ev} />
        <Timeline event={ev} />
        <CandidatePreview />
        <Announcement />
      </main>
      <Footer />
    </div>
  )
}
