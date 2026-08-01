import { HomeResponse } from "@/types/landing"
import Link from "next/link"

// FOOTER
// ─────────────────────────────────────────────────────────────
const navItems = [
  { label: "Beranda",     href: "#"           },
  { label: "Timeline",   href: "#timeline"   },
  { label: "Kandidat",   href: "#kandidat"   },
  { label: "Pengumuman", href: "#pengumuman" },
  { label: "FAQ",        href: "#faq"        },
  { label: "Bantuan",    href: "#bantuan"    },
]

export function Footer({ data }: { data: HomeResponse | null }) {
  const footer = data?.footer;
  if (!footer) return null;

  return (
    <footer className="pg-bg-neutral border-t pg-border relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-blue-600/40 to-transparent" />
      <div className="container-landing py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <span className="text-base font-black pg-text">MUSKOM</span>
            </div>
            <p className="text-sm pg-muted leading-relaxed max-w-xs">
              Portal resmi Musyawarah KOMITKABE 2026. Transparan, aman, dan dapat diandalkan oleh seluruh anggota.
            </p>
            <div className="flex items-center gap-4 mt-6">
              {footer.socials.map((s, i) => (
                <a key={i} href={s.url} title={s.platform} className="w-8 h-8 rounded-full pg-surface border pg-border flex items-center justify-center pg-muted hover:text-blue-600 transition-colors">
                  <span className="sr-only">{s.platform}</span>
                  <div className="w-3.5 h-3.5 bg-current" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }} />
                </a>
              ))}
            </div>
          </div>
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
          <div>
            <h4 className="text-xs font-semibold pg-text uppercase tracking-wider mb-5">Legal</h4>
            <ul className="space-y-3">
              {footer.links.map((l, i) => (
                <li key={i}><a href={l.url} className="text-sm pg-muted hover:pg-text transition-colors">{l.label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold pg-text uppercase tracking-wider mb-5">Akses</h4>
            <Link href="/admin/login" className="text-sm pg-muted hover:text-blue-600 transition-colors">
              Portal Administrator →
            </Link>
          </div>
        </div>
        <div className="border-t pg-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs pg-faint">&copy; {new Date().getFullYear()} {footer.copyright}</p>
          <p className="text-xs" style={{ color: "var(--c-text-faint)", opacity: 0.5 }}>{footer.tagline}</p>
        </div>
      </div>
    </footer>
  )
}
