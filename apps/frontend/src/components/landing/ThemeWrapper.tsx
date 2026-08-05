"use client"
import { ThemeProvider } from "next-themes"
import { Header } from "./Header"

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="muskom-theme"
    >
      {/* suppressHydrationWarning is required because next-themes injects
          the data-theme attribute on this element client-side, which differs
          from the server-rendered HTML (no attribute) causing React Error #418. */}
      <div className="min-h-screen pg-bg" suppressHydrationWarning>
        {/* ── Global Atmospheric Layers ── */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-aurora" />
          <div className="absolute inset-0 bg-blueprint" />
          <div className="absolute inset-0 bg-network" />
          <div className="absolute inset-0 bg-noise" />
          <div className="absolute inset-0 bg-glow" />
        </div>

        <div className="relative z-10">
          <Header />
          {children}
        </div>
      </div>
    </ThemeProvider>
  )
}
