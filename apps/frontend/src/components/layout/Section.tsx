import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SectionProps {
  /** HTML id for anchor navigation */
  id?: string
  /** Additional classes */
  className?: string
  children: ReactNode
  /** Background variant */
  variant?: "white" | "muted" | "dark"
}

/**
 * Section — the standard vertical section wrapper.
 * All landing page sections should use this as their outermost element.
 *
 * Usage:
 *   <Section id="timeline" variant="muted">
 *     ...
 *   </Section>
 */
export function Section({ id, className, children, variant = "white" }: SectionProps) {
  const bg = {
    white: "bg-white",
    muted: "bg-slate-50",
    dark: "bg-slate-950",
  }[variant]

  return (
    <section
      id={id}
      className={cn(
        "relative w-full py-20 md:py-24 lg:py-32 overflow-hidden",
        bg,
        className
      )}
    >
      {children}
    </section>
  )
}
