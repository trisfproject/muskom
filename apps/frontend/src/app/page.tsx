"use client"

import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Menu, X, Lock, CalendarDays, MapPin, ArrowRight, ChevronDown,
  Users, UserCheck, Activity, UserCircle2, ArrowUpRight,
} from "lucide-react"
import { landingService } from "@/services/landing"
import { MusyawarahEvent } from "@/types/event"
import { Badge } from "@/components/ui/badge"

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
interface CandidateData {
  id?: string
  name?: string
  title?: string
  photo_path?: string
  sequence_number?: number
  vision?: string
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
    >
      {children}
    </motion.div>
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
    >
      {children}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────────────────────────
const navItems = [
  { label: "Beranda", href: "#" },
  { label: "Timeline", href: "#timeline" },
  { label: "Kandidat", href: "#kandidat" },
  { label: "Pengumuman", href: "#pengumuman" },
]

function Header() {
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
          scrolled
            ? "bg-slate-950/85 backdrop-blur-xl border-b border-white/6 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="container-landing flex items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform duration-300">
              <span className="text-slate-950 font-black text-sm">M</span>
            </div>
            <span className="text-lg font-black tracking-tight text-white">MUSKOM</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href}
                className="px-4 py-2 rounded-full text-sm font-medium text-white/60 hover:text-white hover:bg-white/7 transition-all duration-200">
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link href="/admin/login"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border border-white/12 text-white/75 hover:text-white hover:border-white/25 hover:bg-white/6 transition-all duration-200">
              <Lock className="w-3.5 h-3.5" />
              Portal Admin
            </Link>
            <button onClick={() => setOpen(true)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full border border-white/12 text-white/75 hover:bg-white/8 transition-colors">
              <Menu className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${open ? "visible" : "invisible pointer-events-none"}`}>
        <div className={`absolute inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)} />
        <div className={`absolute inset-y-0 right-0 w-72 bg-slate-950 border-l border-white/6 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex items-center justify-between px-5 h-16 border-b border-white/6">
            <span className="font-bold text-white">Menu</span>
            <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/8">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 p-3 space-y-0.5">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} onClick={() => setOpen(false)}
                className="flex items-center px-4 py-3.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/6 transition-colors">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="p-4 border-t border-white/6">
            <Link href="/admin/login" onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 px-5 bg-emerald-500 text-slate-950 rounded-xl font-bold text-sm hover:bg-emerald-400 transition-colors">
              <Lock className="w-4 h-4" />
              Masuk Portal Admin
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────
function Hero({ event }: { event: MusyawarahEvent | null }) {
  const name = event?.name ?? "Musyawarah KOMITKABE"
  const theme = event?.theme ?? "Membangun Komunitas Berdaulat, Transparan & Progresif"
  const location = event?.location ?? "Lokasi Akan Diumumkan"
  const startDate = event?.start_date
    ? new Date(event.start_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : "Segera Hadir"
  const isActive = event?.status === "UPCOMING" || event?.status === "ONGOING"

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-slate-950">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 rounded-full bg-emerald-500/6 blur-[130px]" />
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full bg-emerald-600/5 blur-[100px]" />
      </div>
      <div className="dot-grid absolute inset-0 pointer-events-none" />

      <div className="container-landing relative z-10 pt-40 pb-28 flex flex-col items-center text-center">
        <FadeUp delay={0}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-widest uppercase">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            Portal Resmi Musyawarah
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[1.02] mb-6">
            <span className="text-gradient">{name}</span>
          </h1>
        </FadeUp>

        <FadeUp delay={0.2}>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed mb-10">
            {theme}
          </p>
        </FadeUp>

        <FadeUp delay={0.3}>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-slate-500 mb-12">
            <span className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-emerald-500/80" />
              {startDate}
            </span>
            <span className="w-px h-4 bg-slate-700 hidden sm:block" />
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500/80" />
              {location}
            </span>
          </div>
        </FadeUp>

        <FadeUp delay={0.4}>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {isActive && (
              <Link href="/register"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-emerald-500 text-slate-950 font-bold rounded-full text-sm hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all duration-200">
                Daftar Sekarang
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            <a href="#timeline"
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/10 text-white/70 hover:text-white hover:border-white/20 hover:bg-white/5 font-medium rounded-full text-sm transition-all duration-200">
              Lihat Jadwal
            </a>
          </div>
        </FadeUp>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/20 text-xs font-medium tracking-widest uppercase"
      >
        <span>Scroll</span>
        <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
      </motion.div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────
// STATISTICS
// ─────────────────────────────────────────────────────────────
const STATUS_LABEL: Record<string, string> = {
  UPCOMING: "Segera Dimulai", ONGOING: "Sedang Berlangsung",
  COMPLETED: "Telah Selesai", DRAFT: "Dalam Persiapan", CANCELLED: "Dibatalkan",
}

function Statistics({ event }: { event: MusyawarahEvent | null }) {
  const stats = [
    { value: event?.stats?.total_participants?.toLocaleString("id-ID") ?? "—", label: "Peserta Terdaftar", desc: "Anggota terverifikasi yang memiliki hak suara", icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/8" },
    { value: event?.stats?.total_candidates?.toLocaleString("id-ID") ?? "—", label: "Kandidat Resmi", desc: "Calon pemimpin yang telah melewati verifikasi panitia", icon: UserCheck, color: "text-sky-400", bg: "bg-sky-500/8" },
    { value: event?.status ? STATUS_LABEL[event.status] ?? "—" : "—", label: "Status Portal", desc: "Status pelaksanaan musyawarah saat ini", icon: Activity, color: "text-violet-400", bg: "bg-violet-500/8" },
  ]

  return (
    <section className="bg-slate-950 border-t border-white/5 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
      <div className="container-landing py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden">
          {stats.map((s, i) => (
            <SlideUp key={s.label} delay={i * 0.1}
              className="bg-slate-950 p-8 lg:p-10">
              <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center mb-6`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div className="text-4xl font-black text-white tracking-tight mb-1.5">{s.value}</div>
              <div className="text-base font-semibold text-white/80 mb-2">{s.label}</div>
              <div className="text-sm text-slate-500 leading-relaxed">{s.desc}</div>
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
  past: { dot: "bg-slate-600", badge: "bg-slate-800 text-slate-500", label: "Selesai" },
  active: { dot: "bg-emerald-400 ring-4 ring-emerald-400/20", badge: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", label: "Berlangsung" },
  upcoming: { dot: "bg-slate-700 border-2 border-slate-600", badge: "bg-slate-800/60 text-slate-500", label: "Akan Datang" },
}

function Timeline({ event }: { event: MusyawarahEvent | null }) {
  const phases = [
    { key: "reg", label: "Pendaftaran Peserta", start: event?.registration_start, end: event?.registration_end, desc: "Pendaftaran resmi bagi anggota komunitas untuk memperoleh hak suara dalam musyawarah." },
    { key: "cand", label: "Pendaftaran Kandidat", start: event?.candidate_registration_start, end: event?.candidate_registration_end, desc: "Penerimaan dan verifikasi berkas calon pemimpin komunitas periode berikutnya." },
    { key: "vote", label: "Pemilihan", start: event?.voting_start, end: event?.voting_end, desc: "Pemungutan suara secara elektronik oleh seluruh peserta yang telah terverifikasi." },
  ]

  return (
    <section id="timeline" className="bg-slate-950 border-t border-white/5">
      <div className="container-landing py-24 lg:py-32">
        <SlideUp>
          <p className="text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-3">Agenda</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">Timeline Musyawarah</h2>
          <p className="text-slate-400 max-w-lg text-lg leading-relaxed mb-16">
            Seluruh rangkaian acara tersusun untuk memastikan proses yang adil, transparan, dan dapat diikuti semua anggota.
          </p>
        </SlideUp>

        <div className="space-y-4">
          {phases.map((phase, i) => {
            const status = phaseStatus(phase.start, phase.end)
            const cfg = phaseCfg[status]
            return (
              <SlideUp key={phase.key} delay={i * 0.1}>
                <div className="flex gap-6 p-6 lg:p-8 rounded-2xl bg-slate-900 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex flex-col items-center pt-1 shrink-0">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${cfg.dot}`} />
                    {i < phases.length - 1 && <div className="w-px flex-1 bg-white/5 mt-2" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.badge}`}>{cfg.label}</span>
                      <span className="text-xs font-mono text-slate-600">{fmt(phase.start)} — {fmt(phase.end)}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1.5">{phase.label}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{phase.desc}</p>
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
    <section id="kandidat" className="bg-slate-950 border-t border-white/5 relative overflow-hidden">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-[60vw] h-[60vw] rounded-full bg-emerald-500/4 blur-[120px] pointer-events-none" />
      <div className="container-landing relative z-10 py-24 lg:py-32">
        <SlideUp>
          <p className="text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-3">Kandidat Resmi</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">Mengenal Calon Pemimpin</h2>
          <p className="text-slate-400 max-w-lg text-lg leading-relaxed mb-14">
            Setiap kandidat telah melalui proses verifikasi resmi. Pelajari visi dan misi mereka sebelum memberikan suara.
          </p>
        </SlideUp>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[0, 1, 2].map((i) => <div key={i} className="h-64 rounded-2xl bg-slate-900/60 animate-pulse" />)}
          </div>
        )}

        {!loading && candidates.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center mb-5 border border-white/5">
              <UserCircle2 className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Belum Ada Kandidat</h3>
            <p className="text-slate-500 max-w-xs text-sm leading-relaxed">Daftar kandidat akan dipublikasikan setelah proses verifikasi selesai.</p>
          </div>
        )}

        {!loading && candidates.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {candidates.map((c, i) => (
              <SlideUp key={c.id ?? i} delay={i * 0.07}>
                <article className="group rounded-2xl bg-slate-900 border border-white/5 overflow-hidden hover:border-emerald-500/20 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl hover:shadow-slate-950/50">
                  <div className="relative h-48 bg-slate-800 flex items-center justify-center overflow-hidden">
                    {c.photo_path ? (
                      <img src={c.photo_path} alt={c.name ?? "Kandidat"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <UserCircle2 className="w-20 h-20 text-slate-700" />
                    )}
                    <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm border border-white/10 rounded-full px-2.5 py-1 text-xs font-bold text-white">
                      No. {c.sequence_number ?? i + 1}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-bold text-white mb-0.5">{c.name ?? "—"}</h3>
                    {c.title && <p className="text-sm font-medium text-emerald-400 mb-3">{c.title}</p>}
                    {c.vision && <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">{c.vision}</p>}
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
    <section id="pengumuman" className="bg-slate-950 border-t border-white/5">
      <div className="container-landing py-24 lg:py-32">
        <SlideUp className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-3">Informasi Terkini</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">Pengumuman Resmi</h2>
            <p className="text-slate-400 max-w-lg text-lg leading-relaxed">
              Tetap terhubung dan dapatkan informasi terbaru seputar pelaksanaan musyawarah dari panitia resmi.
            </p>
          </div>
          <button className="shrink-0 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-white transition-colors">
            Lihat semua <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </SlideUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {announcements.map((a, i) => (
            <SlideUp key={a.id} delay={i * 0.1}>
              <article className="group flex flex-col h-full p-6 rounded-2xl bg-slate-900 border border-white/5 hover:border-white/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between mb-5">
                  <Badge variant={a.badgeVariant}>{a.category}</Badge>
                  <span className="text-xs text-slate-600 font-mono">{a.date}</span>
                </div>
                <h3 className="text-base font-bold text-white leading-snug mb-3 group-hover:text-emerald-400 transition-colors duration-200">{a.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed flex-1 mb-5">{a.excerpt}</p>
                <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 group-hover:text-emerald-400 transition-colors duration-200">
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
    <footer className="bg-slate-950 border-t border-white/5 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
      <div className="container-landing py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <span className="text-slate-950 font-black text-sm">M</span>
              </div>
              <span className="text-base font-black text-white">MUSKOM</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              Platform resmi musyawarah komunitas. Transparan, aman, dan dapat diandalkan oleh seluruh anggota.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-5">Navigasi</h4>
            <ul className="space-y-3">
              {navItems.map((n) => (
                <li key={n.label}><Link href={n.href} className="text-sm text-slate-500 hover:text-white transition-colors">{n.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-5">Legal</h4>
            <ul className="space-y-3">
              {["Syarat & Ketentuan", "Kebijakan Privasi", "Panduan Peserta"].map((l) => (
                <li key={l}><a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-5">Akses</h4>
            <Link href="/admin/login" className="text-sm text-slate-500 hover:text-emerald-400 transition-colors">
              Portal Administrator →
            </Link>
          </div>
        </div>
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-600">&copy; {new Date().getFullYear()} MUSKOM. Hak Cipta Dilindungi.</p>
          <p className="text-xs text-slate-700">Dibangun untuk komunitas.</p>
        </div>
      </div>
    </footer>
  )
}

// ─────────────────────────────────────────────────────────────
// ROOT: LANDING PAGE CLIENT
// ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { data: event, isLoading } = useQuery({
    queryKey: ["public-event"],
    queryFn: landingService.getPublicEvent,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <span className="text-emerald-400 font-black text-lg">M</span>
          </div>
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  const ev = event ?? null

  if (ev?.status === "DRAFT" || ev?.status === "CANCELLED") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center px-5 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center mb-6">
            <span className="text-emerald-400 font-black text-2xl">M</span>
          </div>
          <h1 className="text-2xl font-black text-white mb-3 tracking-tight">Portal Dalam Pemeliharaan</h1>
          <p className="text-slate-400 max-w-sm leading-relaxed">Sistem sedang dipersiapkan. Silakan kunjungi kembali beberapa saat lagi.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
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
