"use client"

import { motion } from "framer-motion"
import { Clock } from "lucide-react"
import { startTransition, useEffect, useState } from "react"

// ─────────────────────────────────────────────────────────────
// MOTION HELPERS
// ─────────────────────────────────────────────────────────────
const ease = [0.25, 0.4, 0.25, 1] as const

export function FadeUp({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay, ease }}
      className={className}
    >{children}</motion.div>
  )
}

export function SlideUp({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
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

export function SlideInRight({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
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
export function CountdownTimer({ targetDate, label }: { targetDate?: string; label: string }) {
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
export function InfoRow({
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

