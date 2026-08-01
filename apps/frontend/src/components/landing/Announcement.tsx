import { HomeResponse } from "@/types/landing"
import { Badge } from "@/components/ui/badge"
import { CalendarDays } from "lucide-react"
import { SlideUp } from "@/components/landing/Shared"

export function Announcement({ data }: { data: HomeResponse | null }) {
  const announcements = data?.announcements || [];
  return (
    // Section rhythm: soft blue tint alternates with white
    <section id="pengumuman" className="pg-section-alt border-t pg-border">
      <div className="container-landing py-24 lg:py-32">
        <SlideUp className="text-center max-w-2xl mx-auto mb-16 lg:mb-24">
          <p className="text-blue-600 text-xs font-semibold tracking-widest uppercase mb-3">Informasi</p>
          <h2 className="text-3xl sm:text-4xl font-black pg-text tracking-tight mb-4">Pusat Informasi</h2>
          <p className="pg-muted text-lg leading-relaxed">
            Pembaruan terbaru, pengumuman resmi, dan dokumen penting terkait pelaksanaan musyawarah.
          </p>
        </SlideUp>

        {(!announcements || announcements.length === 0) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto rounded-2xl pg-card flex items-center justify-center mb-5">
              <CalendarDays className="w-8 h-8 pg-faint" />
            </div>
            <h3 className="text-lg font-bold pg-text mb-2">Pusat Informasi</h3>
            <p className="pg-muted text-sm max-w-sm mx-auto">Belum ada pengumuman yang diterbitkan saat ini.</p>
          </div>
        )}

        {announcements && announcements.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {announcements.map((a, i) => (
              <SlideUp key={a.id} delay={i * 0.1}>
                <a href={`/announcement/${a.id}`} className="block group pg-card-i p-6 lg:p-8 hover:-translate-y-1 transition-transform">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <Badge variant="blue">Pengumuman</Badge>
                    <span className="text-xs font-mono pg-faint">{a.published_at ? new Date(a.published_at).toLocaleDateString("id-ID") : ""}</span>
                  </div>
                  <h3 className="text-lg font-bold pg-text mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">{a.title}</h3>
                  <p className="text-sm pg-muted line-clamp-3 leading-relaxed">{a.content}</p>
                </a>
              </SlideUp>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
