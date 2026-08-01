"use client"
import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock } from "lucide-react"

export function CountdownCard({ targetDate, label }: { targetDate?: string; label: string }) {
  const [t, setT] = React.useState({ d: 0, h: 0, m: 0, s: 0 })
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    React.startTransition(() => setMounted(true))
    if (!targetDate) return
    const target = new Date(targetDate).getTime()

    const calc = () => {
      const diff = target - Date.now()
      if (diff <= 0) { setT({ d: 0, h: 0, m: 0, s: 0 }); return }
      setT({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / 1000 / 60) % 60),
        s: Math.floor((diff / 1000) % 60),
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  const units = [
    { v: mounted ? t.d : 0, l: "Hari" },
    { v: mounted ? t.h : 0, l: "Jam" },
    { v: mounted ? t.m : 0, l: "Mnt" },
    { v: mounted ? t.s : 0, l: "Dtk" },
  ]

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3">
        <Clock className="w-3.5 h-3.5 text-info" />
        <span className="text-[11px] font-bold text-muted uppercase tracking-widest">{label}</span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {units.map((u) => (
          <div
            key={u.l}
            className="flex flex-col items-center py-3 px-2 rounded-2xl shadow-sm border border-base bg-surface relative overflow-hidden"
          >
            <div className="h-6 flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={u.v}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="text-[20px] font-black text-base tabular-nums leading-none tracking-tight block"
                >
                  {String(u.v).padStart(2, "0")}
                </motion.span>
              </AnimatePresence>
            </div>
            <span className="text-[10px] font-bold text-muted mt-2 uppercase tracking-widest">{u.l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
