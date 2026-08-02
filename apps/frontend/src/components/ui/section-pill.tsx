import React from "react"
import { cn } from "@/lib/utils"

export interface SectionPillProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  animated?: boolean
}

export function SectionPill({ label, animated = false, className, ...props }: SectionPillProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full",
        "border border-blue-500/20 bg-blue-50/80 backdrop-blur-md",
        "dark:border-blue-500/30 dark:bg-blue-950/40",
        "text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-[0.16em]",
        "cursor-default select-none",
        className
      )}
      {...props}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        {animated && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
        )}
        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 dark:bg-blue-400" />
      </span>
      <span>{label}</span>
    </div>
  )
}
