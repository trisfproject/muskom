import * as React from "react"
import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-surface border border-light rounded-2xl",
          interactive && "shadow-sm transition-normal hover:-translate-y-0.5 hover:shadow-md hover:border-base hover:bg-surface-secondary active:translate-y-0 active:shadow-xs",
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

export interface GlassSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "header"
}

export const GlassSurface = React.forwardRef<HTMLDivElement, GlassSurfaceProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          {
            "glass": variant === "default",
            "header-glass": variant === "header",
          },
          className
        )}
        {...props}
      />
    )
  }
)
GlassSurface.displayName = "GlassSurface"
