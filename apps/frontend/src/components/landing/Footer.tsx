import { HomeResponse } from "@/types/landing"
import Link from "next/link"
import { Mail, Phone } from "lucide-react"

// Footer: Navigation, Contact, Copyright only — per ADR 0006
// Permanently removed: Legal/Privacy, Social Media, Admin Access
const navItems = [
  { label: "Beranda",     href: "#"           },
  { label: "Timeline",   href: "#timeline"   },
  { label: "Kandidat",   href: "#kandidat"   },
  { label: "Pengumuman", href: "#pengumuman" },
]

export function Footer({ data }: { data: HomeResponse | null }) {
  const footer = data?.footer;
  if (!footer) return null;

  return (
    <footer className="pg-bg-neutral border-t pg-border relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-blue-600/40 to-transparent" />
      <div className="container-landing py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-base font-black pg-text">MUSKOM</span>
            </div>
            <p className="text-sm pg-muted leading-relaxed max-w-xs">
              Portal resmi Musyawarah KOMITKABE 2026. Transparan, aman, dan dapat diandalkan oleh seluruh anggota.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-semibold pg-text uppercase tracking-wider mb-5">Navigasi</h4>
            <ul className="space-y-3">
              {navItems.map((n) => (
                <li key={n.label}>
                  <Link href={n.href} className="text-sm pg-muted hover:pg-text transition-colors">{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold pg-text uppercase tracking-wider mb-5">Kontak</h4>
            <div className="space-y-3">
              <a href={`mailto:${footer.email}`} className="flex items-center gap-2.5 text-sm pg-muted hover:text-blue-600 transition-colors">
                <Mail className="w-4 h-4 shrink-0" />
                {footer.email}
              </a>
              <a href={footer.whatsapp_url} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 text-sm pg-muted hover:text-emerald-600 transition-colors">
                <Phone className="w-4 h-4 shrink-0" />
                {footer.whatsapp}
              </a>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t pg-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs pg-faint">&copy; {new Date().getFullYear()} {footer.copyright}</p>
          <p className="text-xs pg-faint opacity-60">{footer.tagline}</p>
        </div>
      </div>
    </footer>
  )
}
