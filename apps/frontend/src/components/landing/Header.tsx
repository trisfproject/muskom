"use client"

import { Lock } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useAnchorNav } from "@/hooks/useAnchorNav"
import { navItems } from "@/config/navigation"
import { MobileBottomNavigation } from "@/components/landing/MobileBottomNavigation"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useSystemConfig } from "@/contexts/ConfigContext"
export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const { activeSection, handleNavClick } = useAnchorNav(navItems, 80)
  const { config } = useSystemConfig()
  const identity = config?.website_identity
  const flags = config?.feature_flags

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const filteredNavItems = navItems.filter((item) => {
    if (item.label === "Admin") return false
    if (item.label === "Timeline" && flags && !flags.show_timeline) return false
    if (item.label === "Kandidat" && flags && !flags.show_candidate) return false
    if (item.label === "Informasi" && flags && !flags.show_information) return false
    return true
  })

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 pointer-events-none ${
          scrolled ? "pt-2 sm:pt-3" : "pt-4 sm:pt-5"
        }`}
      >
        <div className="container-landing">
          <div
            className={`pointer-events-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all duration-300 backdrop-blur-xl border ${
              scrolled
                ? "bg-white/70 dark:bg-slate-900/70 border-slate-200/50 dark:border-slate-700/50 shadow-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                : "bg-white/30 dark:bg-slate-900/30 border-slate-200/30 dark:border-slate-700/30 shadow-xs"
            }`}
          >
            {/* Brand */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <span className="w-2 h-2 rounded-full bg-primary group-hover:scale-125 transition-transform" />
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                {identity?.community_name || "MUSKOM"}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1.5 justify-center">
              {filteredNavItems.map((item) => {
                const isActive = activeSection === item.href
                return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "text-primary bg-primary/10 font-semibold shadow-xs"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </nav>

              {/* Right Actions */}
              <div className="flex items-center gap-2.5 shrink-0">

              {/* Theme Toggle */}
              {(!flags || flags.enable_dark_theme) && (
                <div className="hidden sm:block">
                  <ThemeToggle />
                </div>
              )}

              {/* Portal Admin CTA */}
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold rounded-full border border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:text-primary dark:hover:text-primary hover:border-primary/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xs hover:shadow-sm"
              >
                <Lock className="w-3.5 h-3.5 text-primary" />
                <span className="hidden sm:inline">Portal Admin</span>
              </Link>

              {/* Mobile Navigation is now handled by MobileBottomNavigation component */}
            </div>
          </div>
        </div>
      </header>

      <MobileBottomNavigation />
    </>
  )
}
