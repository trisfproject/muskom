import { HomeResponse } from "@/types/landing"
import { Badge } from "@/components/ui/badge"
import { CalendarDays } from "lucide-react"
import { SlideUp } from "@/components/landing/Shared"

const phaseCfg = {
  past:     { dot: "bg-emerald-500",                badge: "emerald" as const,                  label: "Selesai"        },
  active:   { dot: "bg-cyan-500 ring-4 ring-cyan-500/20", badge: "cyan" as const, label: "Berlangsung"   },
  upcoming: { dot: "bg-slate-300",             badge: "default" as const,                  label: "Akan Datang"   },
}

export function Timeline({ data }: { data: HomeResponse | null }) {
  const timelines = data?.timeline || [];
  
  return (
    <section id="timeline" className="pg-bg-paper border-t pg-border">
      <div className="container-landing py-24 lg:py-32">
        <SlideUp className="text-center max-w-2xl mx-auto mb-16 lg:mb-24">
          <p className="text-blue-600 text-xs font-semibold tracking-widest uppercase mb-3">Linimasa</p>
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
          <div className="space-y-4">
            {timelines.map((phase, i) => {
              const status = phase.status;
              const cfg = phaseCfg[status];
              return (
                <SlideUp key={phase.id} delay={i * 0.1}>
                  <div className={`flex gap-6 p-6 lg:p-8 pg-card-i transition-colors ${status === "active" ? "ring-2 ring-blue-600/30" : ""}`}>
                    <div className="flex flex-col items-center pt-1 shrink-0">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${cfg.dot}`} />
                      {i < timelines.length - 1 && <div className="w-px flex-1 bg-current opacity-10 mt-2" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge variant={cfg.badge}>{cfg.label}</Badge>
                        <span className="text-xs font-mono pg-faint">{phase.start_date ? new Date(phase.start_date).toLocaleDateString("id-ID") : ""}</span>
                      </div>
                      <h3 className="text-lg font-bold pg-text mb-1.5">{phase.id}. {phase.title}</h3>
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
