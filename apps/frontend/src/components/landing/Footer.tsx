import { HomeResponse } from "@/types/landing"

// Footer: dark navy — section rhythm closes the page with depth
// Minimal two-area layout: left (brand), right (copyright) — per BUILD-001.6
export function Footer({ data }: { data: HomeResponse | null }) {
  if (!data) return null;

  return (
    <footer className="pg-section-navy border-t border-white/5 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      <div className="container-landing py-20 lg:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">

          {/* Left — Brand */}
          <div className="max-w-md">
            <div className="mb-6">
              <span className="text-2xl font-black tracking-tight text-slate-100">MUSKOM</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Portal resmi Musyawarah KOMITKABE.<br />
              Membangun proses pemilihan yang transparan, profesional, dan dapat dipercaya oleh seluruh anggota komunitas.
            </p>
          </div>

          {/* Right — Copyright */}
          <div className="md:text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Official Portal</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-2">
              © {new Date().getFullYear()} MUSKOM.<br />
              Seluruh hak cipta dilindungi.
            </p>
            <p className="text-xs text-slate-500 italic">
              &quot;Dibangun untuk kemajuan bersama.&quot;
            </p>
          </div>

        </div>
      </div>
    </footer>
  )
}
