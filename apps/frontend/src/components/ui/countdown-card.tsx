"use client";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock } from "lucide-react";

export function CountdownCard({
  targetDate,
  label,
}: {
  targetDate?: string;
  label: string;
}) {
  const [t, setT] = React.useState({ d: 0, h: 0, m: 0, s: 0 });
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    if (!targetDate) return;

    const target = new Date(targetDate).getTime();

    const calculateTimeLeft = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        return { d: 0, h: 0, m: 0, s: 0 };
      }
      return {
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / 1000 / 60) % 60),
        s: Math.floor((diff / 1000) % 60),
      };
    };

    // Initial setting
    setT(calculateTimeLeft());

    const id = setInterval(() => {
      setT((prev) => {
        const next = calculateTimeLeft();
        if (
          prev.d === next.d &&
          prev.h === next.h &&
          prev.m === next.m &&
          prev.s === next.s
        ) {
          return prev;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [targetDate]);

  const units = [
    { v: mounted ? t.d : 0, l: "Hari" },
    { v: mounted ? t.h : 0, l: "Jam" },
    { v: mounted ? t.m : 0, l: "Mnt" },
    { v: mounted ? t.s : 0, l: "Dtk" },
  ];

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3 md:mb-5">
        <Clock className="w-3.5 h-3.5 text-blue-500/70 dark:text-blue-400/70" />
        <span className="text-[11px] font-bold text-slate-400/80 dark:text-slate-500 uppercase tracking-widest">
          {label}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1.5 md:gap-4">
        {units.map((u) => (
          <div
            key={u.l}
            className="flex flex-col items-center justify-center py-2 md:py-6 px-1 md:px-2 rounded-xl md:rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-slate-700/30 shadow-sm relative overflow-hidden transition-all group backdrop-blur-sm"
          >
            {/* Subtle top inner sheen */}
            <div className="absolute top-0 left-0 right-0 h-px bg-white/60 dark:bg-white/10" />

            <div className="h-5 md:h-8 flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={u.v}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="text-xl md:text-4xl font-black text-slate-900 dark:text-white tabular-nums leading-none tracking-tight block drop-shadow-sm"
                >
                  {String(u.v).padStart(2, "0")}
                </motion.span>
              </AnimatePresence>
            </div>
            <span className="text-[8px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 md:mt-2.5 uppercase tracking-[0.15em]">
              {u.l}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
