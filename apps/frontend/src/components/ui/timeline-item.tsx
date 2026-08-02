import * as React from "react"
import { Check, Clock, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  order: string
  title: string
  date: string
  description?: string
  status: "past" | "active" | "upcoming"
  isLast?: boolean
}

export const TimelineItem = React.forwardRef<HTMLDivElement, TimelineItemProps>(
  ({ className, order, title, date, description, status, isLast = false, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("relative flex gap-4 sm:gap-6 group", className)} {...props}>
        {/* Connector Line */}
        {!isLast && (
          <div className="absolute left-[17px] sm:left-[19px] top-[40px] bottom-[-24px] w-[2px] z-0">
            <div
              className={cn(
                "w-full h-full transition-all duration-300",
                status === "past"
                  ? "bg-emerald-500/40"
                  : status === "active"
                  ? "bg-gradient-to-b from-primary via-primary/40 to-slate-200 dark:to-slate-800"
                  : "bg-slate-200/80 dark:bg-slate-800/80"
              )}
            />
          </div>
        )}

        {/* Timeline Node */}
        <div className="relative z-10 flex flex-col items-center mt-1 shrink-0">
          {status === "past" && (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600 border-2 border-emerald-500/40 shadow-xs dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-600/50">
              <Check className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
            </div>
          )}

          {status === "active" && (
            <div className="relative flex items-center justify-center">
              <div className="absolute -inset-1.5 rounded-full bg-primary/20 animate-ping opacity-75 pointer-events-none" />
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-primary text-white border-2 border-white dark:border-slate-900 shadow-[0_0_20px_rgba(37,99,235,0.45)] ring-4 ring-primary/20">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              </div>
            </div>
          )}

          {status === "upcoming" && (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-surface border-2 border-light text-muted shadow-xs">
              <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
            </div>
          )}
        </div>

        {/* Timeline Card */}
        <div
          className={cn(
            "flex-1 p-5 sm:p-7 rounded-2xl transition-all duration-300 relative overflow-hidden",
            status === "active"
              ? "bg-surface border-2 border-primary shadow-[0_8px_30px_rgba(37,99,235,0.1)] ring-1 ring-primary/20"
              : status === "past"
              ? "bg-surface/90 border border-light hover:border-slate-300 dark:hover:border-slate-700 shadow-xs"
              : "bg-surface/60 border border-light/80 opacity-90 shadow-xs"
          )}
        >
          {/* Active Phase Background Accent Glow */}
          {status === "active" && (
            <div
              className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary/8 pointer-events-none"
              style={{ filter: "blur(24px)" }}
            />
          )}

          {/* Card Header: Badges & Date */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3 relative z-10">
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              {status === "active" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary text-white shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Fase Aktif
                </span>
              )}
              {status === "past" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                  Selesai
                </span>
              )}
              {status === "upcoming" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-secondary text-muted border border-light">
                  Akan Datang
                </span>
              )}
              <span className="text-xs font-bold text-muted uppercase tracking-wider">
                Tahap {order}
              </span>
            </div>

            {/* Date with Icon */}
            <div
              className={cn(
                "inline-flex items-center gap-1.5 text-xs font-semibold",
                status === "active" ? "text-primary" : "text-muted"
              )}
            >
              {status === "active" ? (
                <Clock className="w-3.5 h-3.5 text-primary" />
              ) : (
                <Calendar className="w-3.5 h-3.5" />
              )}
              <span>{date}</span>
            </div>
          </div>

          {/* Title */}
          <h3
            className={cn(
              "text-lg sm:text-xl font-bold tracking-tight mb-2 relative z-10",
              status === "active" ? "text-base" : "text-base"
            )}
          >
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p
              className={cn(
                "text-sm leading-relaxed relative z-10",
                status === "active" ? "text-muted font-normal" : "text-muted"
              )}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    )
  }
)
TimelineItem.displayName = "TimelineItem"
