import { HomeResponse } from "@/types/landing"
import { Badge } from "@/components/ui/badge"
import { SlideUp, EmptyState, TimelineSkeleton } from "@/components/landing/Shared"

// Timeline — visual journey showing progress
// Color hierarchy (approved):
//   past     → Emerald   (completed milestones)
//   active   → Azure Blue (current focal point)
//   upcoming → Sky Blue  (future milestones)
const phaseCfg = {
  past:     { dot: "timeline-dot-past",     badge: "emerald" as const, label: "Selesai"     },
  active:   { dot: "timeline-dot-active",   badge: "blue"    as const, label: "Berlangsung" },
  upcoming: { dot: "timeline-dot-upcoming", badge: "cyan"    as const, label: "Akan Datang" },
}

// Connector gradient between item i and item i+1
function connectorClass(current: string, next: string): string {
  if (current === "past"     && next === "past")     return "tl-connector-past"
  if (current === "past"     && next === "active")   return "tl-connector-past-to-active"
  if (current === "active")                          return "tl-connector-active-to-next"
  if (current === "upcoming")                        return "tl-connector-upcoming"
  return "tl-connector-default"
}

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
    <section id="timeline" className="pg-section relative overflow-hidden">
      <div className="section-divider" />
      {/* Subtle top-right glow for depth */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[400px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at top right, rgba(37,99,235,0.035) 0%, transparent 65%)",
          filter: "blur(60px)",
        }}
      />

      <div className="container-landing py-24 lg:py-32 relative z-10">
        <SlideUp className="text-center max-w-2xl mx-auto mb-16 lg:mb-24">
          <p className="text-blue-600 text-xs font-bold tracking-[0.16em] uppercase mb-3">Linimasa</p>
          <h2 className="text-3xl sm:text-4xl font-black pg-text tracking-tight mb-4">Agenda Resmi</h2>
          <p className="pg-muted text-lg leading-relaxed">
            Tahapan dan jadwal pelaksanaan musyawarah dari persiapan hingga penetapan.
          </p>
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
          <div className="max-w-3xl mx-auto">
            {timelines.map((phase, i) => {
              const status = phase.status as keyof typeof phaseCfg;
              const cfg = phaseCfg[status] ?? phaseCfg.upcoming;
              const isActive = status === "active";
              const nextStatus = timelines[i + 1]?.status ?? "upcoming";
              const connClass = connectorClass(status, nextStatus);
              const formattedDate = formatDateRange(phase.start_date, phase.end_date);
              const orderIndex = phase.display_order ? String(phase.display_order).padStart(2, '0') : String(i + 1).padStart(2, '0');

              return (
                <SlideUp key={phase.id} delay={i * 0.07}>
                  <div className="flex gap-5">

                    {/* Dot + connector column */}
                    <div className="flex flex-col items-center shrink-0 pt-[1.625rem]">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${cfg.dot}`} />
                      {i < timelines.length - 1 && (
                        <div
                          className={`w-0.5 flex-1 mt-2 min-h-[2rem] ${connClass}`}
                          style={{ minHeight: "2.5rem" }}
                        />
                      )}
                    </div>

                    {/* Content card */}
                    <div className={`flex-1 min-w-0 mb-3 p-5 lg:p-6 rounded-[1.25rem] transition-all duration-200 ${
                      isActive
                        ? "timeline-row-active pg-card"
                        : "pg-card-i"
                    }`}>
                      <div className="flex flex-wrap items-center gap-2 mb-2.5">
                        <Badge variant={cfg.badge}>{cfg.label}</Badge>
                        {formattedDate && (
                          <span className="text-xs pg-faint font-medium">{formattedDate}</span>
                        )}
                      </div>
                      <h3 className={`text-base font-bold leading-snug ${isActive ? "text-blue-600" : "pg-text"}`}>
                        <span className="pg-faint font-medium mr-2 text-sm">{orderIndex}.</span>
                        {phase.title}
                      </h3>
                      {phase.description && (
                        <p className="text-sm pg-muted mt-2 leading-relaxed">{phase.description}</p>
                      )}
                    </div>

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
