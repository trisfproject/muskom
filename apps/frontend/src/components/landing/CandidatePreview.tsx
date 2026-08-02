import { HomeResponse } from "@/types/landing"
import { ArrowRight } from "lucide-react"
import { SlideUp, EmptyState, CandidateSkeleton } from "@/components/landing/Shared"

export function CandidatePreview({ data }: { data: HomeResponse | null }) {
  const candidates = data?.candidates;
  const sectionTitle = data?.candidate_cms?.section_title || "Bursa Calon Ketua";
  const sectionDesc = data?.candidate_cms?.section_description || "Mengenal lebih dekat visi dan misi calon pemimpin yang akan membawa perubahan untuk komunitas.";
  const emptyMsg = data?.candidate_cms?.empty_state_message || "Calon Ketua Umum akan dipublikasikan setelah proses verifikasi administrasi selesai.";

  return (
    // Section rhythm: soft blue tint
    <section id="kandidat" className="relative overflow-hidden">
      <div className="section-divider" />
      <div className="container-landing py-24 lg:py-32 relative z-10">
        
        <SlideUp className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 lg:mb-24">
          <div className="max-w-2xl">
            <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-3">Kandidat</p>
            <h2 className="text-3xl sm:text-4xl font-black pg-text tracking-tight mb-4">{sectionTitle}</h2>
            <p className="pg-muted text-lg leading-relaxed">
              {sectionDesc}
            </p>
          </div>
          <div className="shrink-0">
            <a href="#" className="pill-btn inline-flex items-center gap-2 px-6 py-3 font-semibold text-sm group">
              Lihat Profil Lengkap
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </SlideUp>

        {/* Loading state */}
        {!data && <CandidateSkeleton />}

        {/* Empty state */}
        {data && (!candidates || candidates.length === 0) && (
          <EmptyState
            icon="user"
            title="Verifikasi Kandidat"
            description={emptyMsg}
          />
        )}

        {candidates && candidates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {candidates.map((c, i) => (
              <SlideUp key={c.id} delay={i * 0.1}>
                <div className="group bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-slate-800/50 p-6 lg:p-8 rounded-3xl flex flex-col h-full hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-blue-600/20 text-primary font-black text-xl">
                      {c.sequence_number ?? "?"}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold pg-text group-hover:text-primary transition-colors">{c.name}</h3>
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
