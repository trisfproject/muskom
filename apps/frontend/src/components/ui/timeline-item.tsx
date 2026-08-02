import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "./surfaces"

export interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  date: string
  description?: string
  status: "past" | "active" | "upcoming"
  isLast?: boolean
}

export const TimelineItem = React.forwardRef<HTMLDivElement, TimelineItemProps>(
  ({ className, title, date, description, status, isLast = false, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("relative flex gap-6 group", className)} {...props}>
        {/* Connector Line */}
        {!isLast && (
          <div className="absolute left-[15px] top-[32px] bottom-[-24px] w-0.5 z-0">
            <div className={cn(
              "w-full h-full",
              status === "past" ? "bg-[var(--color-success)]" : 
              status === "active" ? "bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-info)]" : 
              "bg-gradient-to-b from-[var(--color-info)] to-[rgba(71,85,105,0.3)]"
            )} />
          </div>
        )}

        {/* Timeline Dot */}
        <div className="relative z-10 flex flex-col items-center mt-1">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center border-2 border-surface bg-surface shadow-sm transition-normal",
            status === "past" && "bg-success border-success shadow-[0_0_0_3px_rgba(16,185,129,0.15)]",
            status === "active" && "bg-primary border-primary shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_18%,transparent),0_0_0_6px_color-mix(in_srgb,var(--color-primary)_8%,transparent),0_0_20px_color-mix(in_srgb,var(--color-primary)_35%,transparent)]",
            status === "upcoming" && "bg-info border-info shadow-[0_0_0_2px_rgba(56,189,248,0.12)]"
          )}>
            <div className={cn("w-2 h-2 rounded-full", status === "upcoming" ? "bg-surface" : "bg-white")} />
          </div>
        </div>

        {/* Timeline Content */}
        <Card className={cn(
          "flex-1 p-6 md:p-8 transition-normal",
          status === "active" && "border-primary/50 shadow-glow"
        )}>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
            <h3 className={cn(
              "text-title font-bold",
              status === "active" ? "text-primary" : "text-base"
            )}>
              {title}
            </h3>
            <span className={cn(
              "text-sm font-semibold whitespace-nowrap",
              status === "active" ? "text-primary" : "text-muted"
            )}>
              {date}
            </span>
          </div>
          {description && (
            <p className="text-body text-muted leading-relaxed">{description}</p>
          )}
        </Card>
      </div>
    )
  }
)
TimelineItem.displayName = "TimelineItem"
