import * as React from "react"
import { cn } from "@/lib/utils"

export interface SectionHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode
  description?: React.ReactNode
  centered?: boolean
}

export const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ className, title, description, centered = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "mb-12 md:mb-16",
          centered && "text-center",
          className
        )}
        {...props}
      >
        <h2 className="text-heading text-base mb-4 tracking-tight">{title}</h2>
        {description && (
          <p className={cn("text-body text-muted", centered && "mx-auto max-w-2xl")}>
            {description}
          </p>
        )}
      </div>
    )
  }
)
SectionHeader.displayName = "SectionHeader"
