import { HomeResponse } from "@/types/landing"
import { Mail, MessageCircle, MapPin } from "lucide-react"

// Footer: two-area layout — per BUILD-001.2 & ADR 0006
// Left: brand + description + contact
// Right: copyright
// Removed permanently: Navigation column, Legal, Social Media, Admin Access
export function Footer({ data }: { data: HomeResponse | null }) {
  const footer = data?.footer;
  if (!footer) return null;

  return (
    <footer className="border-t pg-border relative">
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600/20 to-transparent" />

      <div className="container-landing py-16 lg:py-20">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12 lg:gap-24">

          {/* Left — Brand + Contact */}
          <div className="max-w-md">
            {/* Wordmark */}
            <div className="mb-5">
              <span className="text-xl font-black tracking-tight pg-text">MUSKOM</span>
            </div>

            <p className="text-sm pg-muted leading-relaxed mb-8">
              Portal resmi Musyawarah KOMITKABE. Membangun proses pemilihan yang transparan, profesional, dan dapat dipercaya oleh seluruh anggota komunitas.
            </p>

            {/* Contact */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold pg-faint uppercase tracking-widest mb-4">Kontak Panitia</h4>
              <a
                href={`mailto:${footer.email}`}
                className="flex items-center gap-3 group"
              >
                <div className="w-7 h-7 rounded-lg pg-surface border pg-border flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5 pg-faint" />
                </div>
                <span className="text-sm pg-muted group-hover:text-blue-600 transition-colors">{footer.email}</span>
              </a>
              <a
                href={footer.whatsapp_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 group"
              >
                <div className="w-7 h-7 rounded-lg pg-surface border pg-border flex items-center justify-center shrink-0">
                  <MessageCircle className="w-3.5 h-3.5 pg-faint" />
                </div>
                <span className="text-sm pg-muted group-hover:text-emerald-600 transition-colors">{footer.whatsapp}</span>
              </a>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg pg-surface border pg-border flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 pg-faint" />
                </div>
                <span className="text-sm pg-muted leading-relaxed">{footer.address}</span>
              </div>
            </div>
          </div>

          {/* Right — Copyright */}
          <div className="lg:text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border pg-border pg-surface mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-[11px] font-semibold pg-faint uppercase tracking-widest">Official Portal</span>
            </div>
            <p className="text-sm pg-muted leading-relaxed">
              © {new Date().getFullYear()} MUSKOM.
              <br />
              Seluruh hak cipta dilindungi.
            </p>
            <p className="text-xs pg-faint mt-2 opacity-50">{footer.tagline}</p>
          </div>

        </div>
      </div>
    </footer>
  )
}
