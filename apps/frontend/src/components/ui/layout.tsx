import * as React from "react"
import { cn } from "@/lib/utils"

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType
}

export const Container = React.forwardRef<HTMLElement, ContainerProps>(
  ({ className, as: Component = "div", ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          "w-full max-w-[1440px] mx-auto px-6 sm:px-10 xl:px-20",
          className
        )}
        {...props}
      />
    )
  }
)
Container.displayName = "Container"

export interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType
  variant?: "default" | "alt" | "navy" | "paper" | "blue" | "white" | "neutral"
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, variant = "default", as: Component = "section", ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          {
            "bg-transparent": variant === "default",
            "bg-[var(--color-surface)]/20": variant === "alt" || variant === "neutral",
            "bg-[var(--color-surface)]/80 backdrop-blur-sm": variant === "paper" || variant === "white",
            "bg-[#0f172a]/90 backdrop-blur-sm": variant === "navy", /* Legacy fallback */
            "bg-[#f0f9ff]/50": variant === "blue",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Section.displayName = "Section"
