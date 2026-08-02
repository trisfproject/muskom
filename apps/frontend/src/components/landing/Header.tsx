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
      setScrolled(window.scrollY > 24)

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
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
          scrolled ? "header-glass py-3" : "bg-transparent py-5"
        }`}
      >
        <div className="container-landing flex items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <span className="text-lg font-black tracking-tight text-base">MUSKOM</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navItems.map((item) => {
              const isActive = activeSection === item.href
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-primary bg-primary/10 font-semibold"
                      : "text-muted hover:text-base hover:bg-surface"
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Theme toggle */}
            <button
              id="theme-toggle"
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-light bg-surface text-muted hover:text-base hover:bg-surface-secondary transition-colors"
              aria-label={theme === "dark" ? "Ganti ke tema terang" : "Ganti ke tema gelap"}
              suppressHydrationWarning
            >
              {theme === "dark"
                ? <Sun  className="w-4 h-4" />
                : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <Link href="/admin/login"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full border border-light bg-surface text-base hover:bg-surface-secondary hover:border-base transition-all shadow-xs">
              <Lock className="w-3.5 h-3.5 text-primary" />
              Portal Admin
            </Link>

            <button onClick={() => setOpen(true)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full border border-light bg-surface text-muted hover:text-base transition-colors"
              aria-label="Buka menu navigasi"
              aria-expanded={open}
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${open ? "visible" : "invisible pointer-events-none"}`}>
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setOpen(false)}
        />
        <div className={`absolute inset-y-0 right-0 w-72 glass border-l border-light flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex items-center justify-between px-5 h-16 border-b border-light">
            <span className="font-bold text-base">Menu</span>
            <button onClick={() => setOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full text-muted hover:text-base transition-colors"
              aria-label="Tutup menu navigasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 p-3 space-y-1">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} onClick={() => setOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-muted hover:text-base hover:bg-surface-secondary transition-colors">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="p-4 border-t border-light space-y-2">
            <button onClick={() => { toggleTheme(); setOpen(false) }}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold rounded-xl border border-light bg-surface text-base hover:bg-surface-secondary transition-colors"
              aria-label={theme === "dark" ? "Ganti ke tema terang" : "Ganti ke tema gelap"}
              suppressHydrationWarning
            >
              {theme === "dark" ? <><Sun className="w-4 h-4" />Tema Terang</> : <><Moon className="w-4 h-4" />Tema Gelap</>}
            </button>
            <Link href="/admin/login" onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 font-bold text-sm rounded-xl bg-primary text-white hover:bg-primary-hover transition-colors shadow-glow">
              <Lock className="w-4 h-4" />
              Portal Admin
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
