"use client"

import { Menu, X, Sun, Moon, Lock } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

// HEADER (Task 2 — theme toggle)
// ─────────────────────────────────────────────────────────────
const navItems = [
  { label: "Beranda",     href: "#"           },
  { label: "Timeline",   href: "#timeline"   },
  { label: "Kandidat",   href: "#kandidat"   },
  { label: "Pengumuman", href: "#pengumuman" },
  { label: "FAQ",        href: "#faq"        },
  { label: "Bantuan",    href: "#bantuan"    },
]

export function Header({ theme, toggleTheme }: { theme: "dark" | "light"; toggleTheme: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${
          scrolled ? "header-glass py-3" : "bg-transparent py-5"
        }`}
      >
        <div className="container-landing flex items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <span className="text-lg font-black tracking-tight pg-text">MUSKOM</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href}
                className="nav-link px-4 py-2 rounded-full text-sm font-medium">
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Theme toggle */}
            <button
              id="theme-toggle"
              onClick={toggleTheme}
              className="pill-btn w-9 h-9 flex items-center justify-center"
              aria-label={theme === "dark" ? "Ganti ke tema terang" : "Ganti ke tema gelap"}
              suppressHydrationWarning
            >
              {theme === "dark"
                ? <Sun  className="w-4 h-4" />
                : <Moon className="w-4 h-4" />}
            </button>

            <Link href="/admin/login"
              className="pill-btn hidden md:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold">
              <Lock className="w-3.5 h-3.5" />
              Portal Admin
            </Link>

            <button onClick={() => setOpen(true)}
              className="ghost-btn md:hidden w-9 h-9 flex items-center justify-center rounded-full"
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
          style={{ background: "rgba(0,0,0,0.55)" }}
          onClick={() => setOpen(false)}
        />
        <div className={`absolute inset-y-0 right-0 w-72 pg-surface border-l pg-border flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex items-center justify-between px-5 h-16 border-b pg-border">
            <span className="font-bold pg-text">Menu</span>
            <button onClick={() => setOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full pg-muted hover:pg-text transition-colors"
              aria-label="Tutup menu navigasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 p-3 space-y-0.5">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} onClick={() => setOpen(false)}
                className="nav-link flex items-center px-4 py-3.5 rounded-xl text-sm font-medium">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="p-4 border-t pg-border space-y-2">
            <button onClick={() => { toggleTheme(); setOpen(false) }}
              className="pill-btn flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold"
              aria-label={theme === "dark" ? "Ganti ke tema terang" : "Ganti ke tema gelap"}
              suppressHydrationWarning
            >
              {theme === "dark" ? <><Sun className="w-4 h-4" />Tema Terang</> : <><Moon className="w-4 h-4" />Tema Gelap</>}
            </button>
            <Link href="/admin/login" onClick={() => setOpen(false)}
              className="pill-btn flex items-center justify-center gap-2 w-full py-3 px-5 font-bold text-sm">
              <Lock className="w-4 h-4" />
              Portal Admin
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
