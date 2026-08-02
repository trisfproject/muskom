import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "./surfaces"

import { Sparkles } from "lucide-react"

export interface AnnouncementCardProps extends React.HTMLAttributes<HTMLDivElement> {
  category: string
  title: string
  summary: string
  date?: string
  thumbnailUrl?: string
  isLatest?: boolean
}

export const AnnouncementCard = React.forwardRef<HTMLDivElement, AnnouncementCardProps>(
  ({ className, category, title, summary, date, thumbnailUrl, isLatest, ...props }, ref) => {
    return (
      <Card ref={ref} className={cn(
      "group relative overflow-hidden flex flex-col p-6 lg:p-8 transition-normal hover:shadow-lg h-full",
      isLatest && "border-info/30",
      className
    )} {...props}>
        {isLatest && (
          <div className="absolute top-0 right-0 px-3 py-1 bg-info text-[10px] font-bold text-white rounded-bl-xl tracking-wider uppercase flex items-center gap-1 z-10">
            <Sparkles className="w-2.5 h-2.5" />
            Terbaru
          </div>
        )}
        {thumbnailUrl && (
          <div className="w-full h-48 mb-6 overflow-hidden rounded-xl border border-light">
            <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover transition-slow group-hover:scale-105" />
          </div>
        )}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-badge text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            {category}
          </span>
          {date && <span className="text-sm font-medium text-muted">{date}</span>}
        </div>
        <h3 className="text-title text-base mb-3 group-hover:text-primary transition-normal">{title}</h3>
        <p className="text-body text-muted leading-relaxed line-clamp-3 mb-6 flex-1">
          {summary}
        </p>
        <div className="mt-auto">
          <span className="text-sm font-semibold text-primary group-hover:text-primary-hover flex items-center gap-1 transition-normal">
            Baca Selengkapnya
            <span className="transition-normal group-hover:translate-x-1">→</span>
          </span>
        </div>
      </Card>
    )
  }
)
AnnouncementCard.displayName = "AnnouncementCard"
