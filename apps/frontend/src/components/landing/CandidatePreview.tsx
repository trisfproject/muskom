import { HomeResponse } from "@/types/landing"
import { ArrowRight, UserCircle2 } from "lucide-react"
import { SlideUp } from "@/components/landing/Shared"

export function CandidatePreview({ data }: { data: HomeResponse | null }) {
  const candidates = data?.candidates || [];
  return (
    // Section rhythm: soft blue tint
    <section id="kandidat" className="pg-section-alt relative overflow-hidden">
      <div className="section-divider" />
      <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="container-landing py-24 lg:py-32 relative z-10">
        
        <SlideUp className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 lg:mb-24">
          <div className="max-w-2xl">
            <p className="text-blue-600 text-xs font-semibold tracking-widest uppercase mb-3">Kandidat</p>
            <h2 className="text-3xl sm:text-4xl font-black pg-text tracking-tight mb-4">Bursa Calon Ketua</h2>
            <p className="pg-muted text-lg leading-relaxed">
              Mengenal lebih dekat visi dan misi calon pemimpin yang akan membawa perubahan untuk komunitas.
            </p>
          </div>
          <div className="shrink-0">
            <a href="#" className="pill-btn inline-flex items-center gap-2 px-6 py-3 font-semibold text-sm group">
              Lihat Profil Lengkap
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </SlideUp>

        {candidates.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl pg-card flex items-center justify-center mb-5">
              <UserCircle2 className="w-8 h-8 pg-faint" />
            </div>
            <h3 className="text-lg font-bold pg-text mb-2">Verifikasi Kandidat</h3>
            <p className="pg-muted max-w-xs text-sm leading-relaxed">Calon Ketua Umum akan dipublikasikan setelah proses verifikasi administrasi selesai.</p>
          </div>
        )}

        {candidates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {candidates.map((c, i) => (
              <SlideUp key={c.id} delay={i * 0.1}>
                <div className="group pg-card-i p-6 lg:p-8 flex flex-col h-full hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-16 h-16 rounded-full bg-blue-600/10 flex items-center justify-center shrink-0 border border-blue-600/20 text-blue-600 font-black text-xl">
                      {c.sequence_number ?? "?"}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold pg-text group-hover:text-blue-600 transition-colors">{c.name}</h3>
                      <p className="text-sm pg-faint">{c.title}</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-semibold uppercase tracking-wider pg-text mb-3">Visi Utama</h4>
                    <p className="text-sm pg-muted leading-relaxed line-clamp-4">{c.vision}</p>
                  </div>
                </div>
              </SlideUp>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
