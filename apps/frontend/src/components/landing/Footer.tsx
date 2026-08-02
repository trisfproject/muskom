import { HomeResponse } from "@/types/landing"

// Footer: dark navy — section rhythm closes the page with depth
// Fully powered by Website CMS
export function Footer({ data }: { data: HomeResponse | null }) {
  if (!data) return null;

  const orgName = data.footer?.organization_name || "MUSKOM";
  const desc = data.footer?.description || "Portal resmi Musyawarah KOMITKABE.\nMembangun proses pemilihan yang transparan, profesional, dan dapat dipercaya oleh seluruh anggota komunitas.";
  const copyright = data.footer?.copyright || `© ${new Date().getFullYear()} MUSKOM. Seluruh hak cipta dilindungi.`;
  const badge = data.footer?.official_badge || "OFFICIAL PORTAL";
  const tagline = data.footer?.tagline || "Dibangun untuk kemajuan bersama.";

  return (
    <footer className="pg-section-navy border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-blueprint pointer-events-none opacity-20" />
      <div className="absolute inset-0 bg-noise pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      <div className="container-landing py-20 lg:py-24 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">

          {/* Left — Brand */}
          <div className="max-w-md">
            <div className="mb-6">
              <span className="text-2xl font-black tracking-tight text-slate-100">{orgName}</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">
              {desc}
            </p>
          </div>

          {/* Right — Copyright */}
          <div className="md:text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{badge}</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-2 whitespace-pre-line">
              {copyright}
            </p>
            {tagline && (
              <p className="text-xs text-slate-500 italic">
                &quot;{tagline}&quot;
              </p>
            )}
          </div>

        </div>
      </div>
    </footer>
  )
}
