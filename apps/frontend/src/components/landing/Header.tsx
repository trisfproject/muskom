"use client"

import { Lock } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useAnchorNav } from "@/hooks/useAnchorNav"
import { navItems } from "@/config/navigation"
import { MobileBottomNavigation } from "@/components/landing/MobileBottomNavigation"

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const { activeSection, handleNavClick } = useAnchorNav(navItems, 80)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
                ? "bg-white/70 border-slate-200/50 shadow-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]"
                : "bg-white/30 border-slate-200/30 shadow-xs"
            }`}
          >
            {/* Brand */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <span className="w-2 h-2 rounded-full bg-primary group-hover:scale-125 transition-transform" />
              <span className="text-lg font-black tracking-tight text-base">MUSKOM</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1.5 justify-center">
              {navItems.map((item) => {
                const isActive = activeSection === item.href
                return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "text-primary bg-primary/10 font-semibold shadow-xs"
                          : "text-muted hover:text-base hover:bg-surface-secondary"
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </nav>

              {/* Right Actions */}
              <div className="flex items-center gap-2.5 shrink-0">

              {/* Portal Admin CTA */}
              <Link
                href="/admin/login"
                className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full border border-light bg-surface text-base hover:text-primary hover:border-primary/40 hover:bg-surface-secondary transition-all shadow-xs hover:shadow-sm"
              >
                <Lock className="w-3.5 h-3.5 text-primary" />
                Portal Admin
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
