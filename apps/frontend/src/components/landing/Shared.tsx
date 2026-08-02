"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Clock, UserCircle2, CalendarDays, FileText, BookOpen } from "lucide-react"
import { startTransition, useEffect, useState } from "react"
import { Card } from "@/components/ui/surfaces"

// ─────────────────────────────────────────────────────────────
// MOTION HELPERS
// ─────────────────────────────────────────────────────────────
const ease = [0.16, 1, 0.3, 1] as const

export function FadeUp({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function SlideUp({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// (CountdownTimer moved to ui/countdown-card.tsx)
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// UNIFIED EMPTY STATE
// ─────────────────────────────────────────────────────────────
export function EmptyState({
  icon = "calendar",
  title,
  description,
  className,
}: {
  icon?: "calendar" | "user" | "file" | "book"
  title: string
  description: string
  className?: string
}) {
  const Icon = icon === "user" ? UserCircle2 : icon === "file" ? FileText : CalendarDays
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl max-w-md mx-auto ${className || ""}`}>
      <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3.5 shadow-sm">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 mb-1.5">{title}</h3>
      <p className="text-muted text-xs sm:text-sm leading-relaxed max-w-xs">{description}</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// SKELETON LOADERS
// ─────────────────────────────────────────────────────────────
export function SkeletonPulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-surface-secondary ${className}`} />
}

export function TimelineSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-6 flex items-start gap-4">
          <SkeletonPulse className="w-4 h-4 rounded-full mt-1 shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonPulse className="h-5 w-1/3" />
            <SkeletonPulse className="h-4 w-2/3" />
          </div>
        </Card>
      ))}
    </div>
  )
}

export function AnnouncementSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
      {[1, 2].map((i) => (
        <Card key={i} className="p-6 lg:p-8 space-y-4">
          <SkeletonPulse className="h-5 w-24" />
          <SkeletonPulse className="h-6 w-3/4" />
          <SkeletonPulse className="h-4 w-full" />
          <SkeletonPulse className="h-4 w-5/6" />
        </Card>
      ))}
    </div>
  )
}

export function CandidateSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-6 lg:p-8 space-y-4">
          <div className="flex items-center gap-4">
            <SkeletonPulse className="w-16 h-16 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <SkeletonPulse className="h-5 w-3/4" />
              <SkeletonPulse className="h-4 w-1/2" />
            </div>
          </div>
          <SkeletonPulse className="h-4 w-full" />
          <SkeletonPulse className="h-4 w-4/5" />
        </Card>
      ))}
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
      <div className="w-8 h-8 rounded-lg bg-surface border border-light flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-muted" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-muted mb-0.5">{label}</div>
        {children ?? <div className="text-sm font-semibold text-base">{value ?? "—"}</div>}
      </div>
    </div>
  )
}

