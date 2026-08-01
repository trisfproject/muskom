import { HomeResponse } from "@/types/landing"
import { Badge } from "@/components/ui/badge"
import { CalendarDays } from "lucide-react"
import { SlideUp } from "@/components/landing/Shared"

// Timeline color hierarchy (approved — ADR 0006 / BUILD-001.3)
// past → Emerald  |  active → Azure Blue  |  upcoming → Sky Blue  |  future → Neutral slate
const phaseCfg = {
  past:     { dot: "timeline-dot-past",     badge: "emerald" as const, label: "Selesai"      },
  active:   { dot: "timeline-dot-active",   badge: "blue" as const,    label: "Berlangsung"  },
  upcoming: { dot: "timeline-dot-upcoming", badge: "cyan" as const,    label: "Akan Datang"  },
}

export function Timeline({ data }: { data: HomeResponse | null }) {
  const timelines = data?.timeline || [];

  return (
    // Section rhythm: white background
    <section id="timeline" className="pg-section border-t pg-border">
      <div className="container-landing py-24 lg:py-32">
        <SlideUp className="text-center max-w-2xl mx-auto mb-16 lg:mb-24">
          <p className="text-blue-600 text-xs font-bold tracking-[0.16em] uppercase mb-3">Linimasa</p>
          <h2 className="text-3xl sm:text-4xl font-black pg-text tracking-tight mb-4">Agenda Resmi</h2>
          <p className="pg-muted text-lg leading-relaxed">
            Tahapan dan jadwal pelaksanaan musyawarah dari persiapan hingga penetapan.
          </p>
        </SlideUp>

        {(!timelines || timelines.length === 0) && (
          <div className="flex flex-col items-center py-16 text-center pg-card-i rounded-2xl">
            <CalendarDays className="w-12 h-12 pg-faint mb-4" />
            <h3 className="text-lg font-bold pg-text mb-2">Rangkaian Agenda</h3>
            <p className="pg-muted max-w-sm text-sm leading-relaxed">
              Jadwal resmi pelaksanaan musyawarah belum tersedia.
            </p>
          </div>
        )}

        {timelines && timelines.length > 0 && (
          <div className="space-y-3 max-w-4xl mx-auto">
            {timelines.map((phase, i) => {
              const status = phase.status;
              const cfg = phaseCfg[status] ?? phaseCfg.upcoming;
              const isActive = status === "active";
              return (
                <SlideUp key={phase.id} delay={i * 0.07}>
                  <div className={`flex gap-6 p-6 lg:p-7 pg-card-i transition-all ${
                    isActive
                      ? "ring-2 ring-blue-600/25 bg-blue-600/3"
                      : ""
                  }`}>
                    {/* Dot + connector */}
                    <div className="flex flex-col items-center pt-1 shrink-0 gap-2">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${cfg.dot}`} />
                      {i < timelines.length - 1 && (
                        <div className="w-px flex-1 bg-current opacity-8 min-h-[1.5rem]" />
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2.5">
                        <Badge variant={cfg.badge}>{cfg.label}</Badge>
                        {phase.date && (
                          <span className="text-xs pg-faint font-medium">{phase.date}</span>
                        )}
                      </div>
                      <h3 className={`text-base font-bold leading-snug ${isActive ? "text-blue-600" : "pg-text"}`}>
                        <span className="pg-faint font-medium mr-1.5">{phase.id}.</span>
                        {phase.title}
                      </h3>
                      {phase.description && (
                        <p className="text-sm pg-muted mt-1.5 leading-relaxed">{phase.description}</p>
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
