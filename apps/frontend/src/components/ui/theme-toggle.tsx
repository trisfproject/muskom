"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
        <div className="w-4 h-4" />
      </div>
    )
  }

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300
        text-slate-600 hover:text-primary hover:bg-white
        dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-slate-800
        bg-white/50 dark:bg-slate-900/50
        border border-slate-200/50 dark:border-slate-700/50
        shadow-xs hover:shadow-sm hover:-translate-y-0.5 overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label="Toggle theme"
    >
      <div className="relative flex items-center justify-center">
        {/* Sun Icon */}
        <Sun
          className={`w-4 h-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] absolute
            ${isDark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100 group-hover:scale-110"}
          `}
        />
        
        {/* Moon Icon */}
        <Moon
          className={`w-4 h-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] absolute
            ${isDark ? "opacity-100 rotate-0 scale-100 group-hover:scale-110" : "opacity-0 -rotate-90 scale-50"}
          `}
        />
      </div>
    </button>
  )
}
