import { HomeResponse } from "@/types/landing"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"
import { SlideUp, EmptyState, AnnouncementSkeleton } from "@/components/landing/Shared"

export function Announcement({ data }: { data: HomeResponse | null }) {
  const announcements = data?.announcements;
  return (
    // Section rhythm: pure white
    <section id="pengumuman" className="pg-section relative">
      <div className="section-divider" />
      <div className="container-landing py-24 lg:py-32">
        <SlideUp className="text-center max-w-2xl mx-auto mb-16 lg:mb-24">
          <p className="text-blue-600 text-xs font-semibold tracking-widest uppercase mb-3">Informasi</p>
          <h2 className="text-3xl sm:text-4xl font-black pg-text tracking-tight mb-4">Pusat Informasi</h2>
          <p className="pg-muted text-lg leading-relaxed">
            Pembaruan terbaru, pengumuman resmi, dan dokumen penting terkait pelaksanaan musyawarah.
          </p>
        </SlideUp>

        {/* Loading state */}
        {!data && <AnnouncementSkeleton />}

        {/* Empty state */}
        {data && (!announcements || announcements.length === 0) && (
          <EmptyState
            icon="calendar"
            title="Pusat Informasi"
            description="Belum ada pengumuman yang diterbitkan saat ini."
          />
        )}

        {announcements && announcements.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {announcements.map((a, i) => {
              const isLatest = a.is_pinned || i === 0;
              const dateStr = a.published_at || a.created_at;
              const formattedDate = dateStr ? new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "";

              return (
                <SlideUp key={a.id} delay={i * 0.1}>
                  <div
                    className={`block group pg-card-i p-6 lg:p-8 relative overflow-hidden ${
                      isLatest ? "border-blue-500/30" : ""
                    }`}
                  >
                    {isLatest && (
                      <div className="absolute top-0 right-0 px-3 py-1 bg-blue-600 text-[10px] font-bold text-white rounded-bl-xl tracking-wider uppercase flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        Terbaru
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <Badge variant={isLatest ? "blue" : "default"}>{a.category || "Pengumuman"}</Badge>
                      <span className="text-xs font-mono pg-faint">{formattedDate}</span>
                    </div>
                    <h3 className="text-lg font-bold pg-text mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">{a.title}</h3>
                    <p className="text-sm pg-muted line-clamp-3 leading-relaxed">{a.summary || a.content}</p>
                  </div>
                </SlideUp>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
