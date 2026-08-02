import { HomeResponse } from "@/types/landing"
import { SlideUp, EmptyState, AnnouncementSkeleton } from "@/components/landing/Shared"
import { Container, Section } from "@/components/ui/layout"
import { SectionHeader } from "@/components/ui/section-header"
import { AnnouncementCard } from "@/components/ui/announcement-card"

export function Announcement({ data }: { data: HomeResponse | null }) {
  const announcements = data?.announcements;
  return (
    <Section id="pengumuman" className="relative">
      <div className="section-divider" />
      <Container className="py-24 lg:py-32">
        <SlideUp className="text-center max-w-2xl mx-auto mb-16 lg:mb-24">
          <p className="text-info text-xs font-semibold tracking-widest uppercase mb-3">Informasi</p>
          <SectionHeader 
            title="Pusat Informasi" 
            description="Pembaruan terbaru, pengumuman resmi, dan dokumen penting terkait pelaksanaan musyawarah."
            centered
          />
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
                  <AnnouncementCard
                    category={a.category || "Pengumuman"}
                    title={a.title}
                    summary={a.summary || a.content}
                    date={formattedDate}
                    isLatest={isLatest}
                  />
                </SlideUp>
              )
            })}
          </div>
        )}
      </Container>
    </Section>
  )
}
