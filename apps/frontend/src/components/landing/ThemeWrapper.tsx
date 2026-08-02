"use client"
import { useEffect, useState, startTransition } from "react"
import { Header } from "./Header"

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("light")

  useEffect(() => {
    const stored = localStorage.getItem("muskom-theme") as "dark" | "light" | null
    if (stored) {
      startTransition(() => setTheme(stored))
    }
  }, [])

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    localStorage.setItem("muskom-theme", next)
  }

  return (
    <div className="min-h-screen pg-bg" data-theme={theme}>
      {/* ── Global Atmospheric Layers ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-aurora" />
        <div className="absolute inset-0 bg-blueprint" />
        <div className="absolute inset-0 bg-network" />
        <div className="absolute inset-0 bg-noise" />
        <div className="absolute inset-0 bg-glow" />
      </div>

      <div className="relative z-10">
        <Header theme={theme} toggleTheme={toggleTheme} />
        {children}
      </div>
    </div>
  )
}
