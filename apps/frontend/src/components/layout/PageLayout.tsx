import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageLayoutProps {
  children: ReactNode
  className?: string
}

/**
 * PageLayout — the outermost shell for public-facing pages.
 * Establishes the root background, font stack, and selection colour.
 *
 * Usage:
 *   <PageLayout>
 *     <PublicNavbar />
 *     <main>...</main>
 *     <Footer />
 *   </PageLayout>
 */
export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div
      className={cn(
        "min-h-screen w-full font-sans antialiased",
        "bg-white text-slate-900",
        "selection:bg-emerald-100 selection:text-emerald-900",
        className
      )}
    >
      {children}
    </div>
  )
}
