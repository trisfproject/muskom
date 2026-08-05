import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "./surfaces"
import { Sparkles, Calendar, ArrowRight } from "lucide-react"

export interface AnnouncementCardProps extends React.HTMLAttributes<HTMLDivElement> {
  category: string
  title: string
  summary: string
  date?: string
  thumbnailUrl?: string
  isLatest?: boolean
  onClick?: () => void
}

export const AnnouncementCard = React.forwardRef<HTMLDivElement, AnnouncementCardProps>(
  ({ className, category, title, summary, date, thumbnailUrl, isLatest, onClick, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        onClick={onClick}
        className={cn(
          "group relative overflow-hidden flex flex-col p-5 md:p-6 lg:p-7 transition-all duration-300 rounded-2xl bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl hover:shadow-xl hover:shadow-blue-500/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),inset_0_0_0_1px_rgba(255,255,255,0.5)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),inset_0_0_0_1px_rgba(255,255,255,0.05)] hover:-translate-y-1 h-full cursor-pointer",
          isLatest && "shadow-[0_4px_24px_-4px_rgba(37,99,235,0.15)] ring-1 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-900/10",
          className
        )}
        {...props}
      >
        {isLatest && (
          <div className="absolute top-0 right-0 px-3.5 py-1 bg-gradient-to-r from-primary to-info text-[10px] font-bold text-white rounded-bl-xl tracking-wider uppercase flex items-center gap-1.5 shadow-sm z-10">
            <Sparkles className="w-3 h-3 animate-pulse" />
            Terbaru
          </div>
        )}

        {thumbnailUrl && (
          <div className="w-full h-40 md:h-44 mb-4 md:mb-5 overflow-hidden rounded-xl border border-light dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
            <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
        )}

        <div className="flex items-center gap-3 mb-3 md:mb-3.5">
          <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            {category}
          </span>
          {date && (
            <span suppressHydrationWarning className="flex items-center gap-1.5 text-[11px] md:text-xs font-medium text-muted">
              <Calendar className="w-3.5 h-3.5 opacity-70" />
              {date}
            </span>
          )}
        </div>

        <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-2 md:mb-2.5 group-hover:text-primary transition-colors leading-snug">
          {title}
        </h3>

        <p className="text-[13px] md:text-sm text-muted leading-relaxed line-clamp-3 mb-5 md:mb-6 flex-1">
          {summary}
        </p>

        <div className="mt-auto pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <span className="text-xs font-bold text-primary group-hover:text-primary-hover flex items-center gap-1.5 transition-colors">
            Baca Selengkapnya
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Card>
    )
  }
)
AnnouncementCard.displayName = "AnnouncementCard"
