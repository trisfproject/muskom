import { HomeResponse } from "@/types/landing"
import { Mail, MessageCircle, MapPin } from "lucide-react"

// Footer: dark navy — section rhythm closes the page with depth
// Two-area layout: left (brand + contact), right (copyright) — per BUILD-001.2 & ADR 0006
export function Footer({ data }: { data: HomeResponse | null }) {
  const footer = data?.footer;
  if (!footer) return null;

  return (
    <footer className="pg-section-navy border-t border-white/5 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      <div className="container-landing py-16 lg:py-20">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12 lg:gap-24">

          {/* Left — Brand + Contact */}
          <div className="max-w-md">
            {/* Wordmark */}
            <div className="mb-5">
              <span className="text-xl font-black tracking-tight text-slate-100">MUSKOM</span>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed mb-8">
              Portal resmi Musyawarah KOMITKABE. Membangun proses pemilihan yang transparan, profesional, dan dapat dipercaya oleh seluruh anggota komunitas.
            </p>

            {/* Contact */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Kontak Panitia</h4>
              <a
                href={`mailto:${footer.email}`}
                className="flex items-center gap-3 group"
              >
                <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <span className="text-sm text-slate-400 group-hover:text-blue-400 transition-colors">{footer.email}</span>
              </a>
              <a
                href={footer.whatsapp_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 group"
              >
                <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <span className="text-sm text-slate-400 group-hover:text-emerald-400 transition-colors">{footer.whatsapp}</span>
              </a>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <span className="text-sm text-slate-400 leading-relaxed">{footer.address}</span>
              </div>
            </div>
          </div>

          {/* Right — Copyright */}
          <div className="lg:text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Official Portal</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              © {new Date().getFullYear()} MUSKOM.
              <br />
              Seluruh hak cipta dilindungi.
            </p>
            <p className="text-xs text-slate-600 mt-2">{footer.tagline}</p>
          </div>

        </div>
      </div>
    </footer>
  )
}
