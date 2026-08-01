"use client"
import { useEffect, useState, startTransition } from "react"
import { Header } from "./Header"

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark")

  useEffect(() => {
    const stored = localStorage.getItem("muskom-theme") as "dark" | "light" | null
    const resolved = stored ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    startTransition(() => setTheme(resolved))

    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const listener = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("muskom-theme")) setTheme(e.matches ? "dark" : "light")
    }
    mq.addEventListener("change", listener)
    return () => mq.removeEventListener("change", listener)
  }, [])

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    localStorage.setItem("muskom-theme", next)
  }

  return (
    <div className="min-h-screen pg-bg" data-theme={theme}>
      <Header theme={theme} toggleTheme={toggleTheme} />
      {children}
    </div>
  )
}
