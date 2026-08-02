import { HomeResponse } from "@/types/landing"
import { SlideUp, EmptyState, TimelineSkeleton } from "@/components/landing/Shared"
import { Container, Section } from "@/components/ui/layout"
import { SectionHeader } from "@/components/ui/section-header"
import { TimelineItem } from "@/components/ui/timeline-item"
import { SectionPill } from "@/components/ui/section-pill"

// Timeline — visual journey showing progress
// Timeline — visual journey showing progress

function formatDateRange(startDateStr: string, endDateStr: string): string {
  try {
    const s = new Date(startDateStr);
    const e = new Date(endDateStr);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return "";

    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    if (s.toDateString() === e.toDateString()) {
      return `${s.getDate()} ${months[s.getMonth()]} ${s.getFullYear()}`;
    }
    if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
      return `${s.getDate()}–${e.getDate()} ${months[s.getMonth()]} ${s.getFullYear()}`;
    }
    return `${s.getDate()} ${months[s.getMonth()]} – ${e.getDate()} ${months[e.getMonth()]} ${e.getFullYear()}`;
  } catch {
    return "";
  }
}

export function Timeline({ data }: { data: HomeResponse | null }) {
  const timelines = data?.timeline;

  return (
    // Section rhythm: pure white — contrasts with surrounding blue-tint sections
    <Section id="timeline" className="relative overflow-hidden">
      <div className="section-divider" />
      {/* Subtle top-right glow for depth */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[400px] pointer-events-none bg-glow"
        style={{ filter: "blur(60px)" }}
      />

      <Container className="py-24 lg:py-32 relative z-10">
        <SlideUp className="text-center max-w-2xl mx-auto mb-16 lg:mb-24 flex flex-col items-center">
          <SectionPill label="Linimasa" className="mb-4" />
          <SectionHeader 
            title="Agenda Resmi" 
            description="Tahapan dan jadwal pelaksanaan musyawarah dari persiapan hingga penetapan."
            centered
          />
        </SlideUp>

        {/* Loading state */}
        {!data && <TimelineSkeleton />}

        {/* Empty state */}
        {data && (!timelines || timelines.length === 0) && (
          <EmptyState
            icon="calendar"
            title="Rangkaian Agenda"
            description="Jadwal resmi pelaksanaan musyawarah belum tersedia."
          />
        )}

        {/* Journey list */}
        {timelines && timelines.length > 0 && (
          <div className="max-w-3xl mx-auto flex flex-col gap-6 lg:gap-8">
            {timelines.map((phase, i) => {
              const status = (phase.status === "past" || phase.status === "active" || phase.status === "upcoming") 
                ? phase.status 
                : "upcoming"
              const formattedDate = formatDateRange(phase.start_date, phase.end_date)
              const orderIndex = phase.display_order ? String(phase.display_order).padStart(2, '0') : String(i + 1).padStart(2, '0')

              return (
                <SlideUp key={phase.id} delay={i * 0.07}>
                  <TimelineItem
                    order={orderIndex}
                    status={status}
                    title={phase.title}
                    date={formattedDate}
                    description={phase.description}
                    isLast={i === timelines.length - 1}
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
