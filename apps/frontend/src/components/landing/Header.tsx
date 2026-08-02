"use client"

import { Menu, X, Sun, Moon, Lock } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

// Nav: Beranda, Timeline, Kandidat, Pengumuman — per ADR 0006 (no FAQ, no Bantuan)
const navItems = [
  { label: "Beranda",     href: "#"           },
  { label: "Timeline",   href: "#timeline"   },
  { label: "Kandidat",   href: "#kandidat"   },
  { label: "Pengumuman", href: "#pengumuman" },
]

export function Header({ theme, toggleTheme }: { theme: "dark" | "light"; toggleTheme: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("#")
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)

      const sections = ["pengumuman", "kandidat", "timeline"]
      const scrollPosition = window.scrollY + 200

      let current = "#"
      for (const section of sections) {
        const el = document.getElementById(section)
        if (el && el.offsetTop <= scrollPosition) {
          current = `#${section}`
          break
        }
      }
      setActiveSection(current)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

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
                ? "bg-surface/90 border-light shadow-md"
                : "bg-surface/75 border-light/80 shadow-xs"
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
              {/* Theme Toggle */}
              <button
                id="theme-toggle"
                onClick={toggleTheme}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-light bg-surface text-muted hover:text-base hover:bg-surface-secondary transition-all hover:scale-105"
                aria-label={theme === "dark" ? "Ganti ke tema terang" : "Ganti ke tema gelap"}
                suppressHydrationWarning
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </button>

              {/* Portal Admin CTA */}
              <Link
                href="/admin/login"
                className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full border border-light bg-surface text-base hover:text-primary hover:border-primary/40 hover:bg-surface-secondary transition-all shadow-xs hover:shadow-sm"
              >
                <Lock className="w-3.5 h-3.5 text-primary" />
                Portal Admin
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setOpen(true)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-full border border-light bg-surface text-muted hover:text-base transition-colors"
                aria-label="Buka menu navigasi"
                aria-expanded={open}
              >
                <Menu className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
          open ? "visible" : "invisible pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          style={{ background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)" }}
          onClick={() => setOpen(false)}
        />
        <div
          className={`absolute inset-y-0 right-0 w-72 glass border-l border-light flex flex-col transition-transform duration-300 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-5 h-16 border-b border-light">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="font-bold text-base">Menu Navigasi</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full text-muted hover:text-base hover:bg-surface-secondary transition-colors"
              aria-label="Tutup menu navigasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-muted hover:text-base hover:bg-surface-secondary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="p-4 border-t border-light space-y-2.5">
            <button
              onClick={() => {
                toggleTheme()
                setOpen(false)
              }}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold rounded-xl border border-light bg-surface text-base hover:bg-surface-secondary transition-colors"
              aria-label={theme === "dark" ? "Ganti ke tema terang" : "Ganti ke tema gelap"}
              suppressHydrationWarning
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  Tema Terang
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-600" />
                  Tema Gelap
                </>
              )}
            </button>
            <Link
              href="/admin/login"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 font-bold text-sm rounded-xl bg-primary text-white hover:bg-primary-hover transition-colors shadow-glow"
            >
              <Lock className="w-4 h-4" />
              Portal Admin
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
