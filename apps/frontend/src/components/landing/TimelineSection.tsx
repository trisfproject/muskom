import { motion } from "framer-motion"
import { MusyawarahEvent } from "@/types/event"
import { MaxWidthWrapper } from "@/components/layout/MaxWidthWrapper"
import { Badge } from "@/components/ui/badge"

interface TimelineSectionProps {
  event: MusyawarahEvent | null
}

export function TimelineSection({ event }: TimelineSectionProps) {
  const steps = [
    {
      title: "Pendaftaran Peserta",
      start: event?.registration_start,
      end: event?.registration_end,
      description: "Pendaftaran resmi bagi anggota komunitas untuk mengikuti musyawarah.",
    },
    {
      title: "Pendaftaran Kandidat",
      start: event?.candidate_registration_start,
      end: event?.candidate_registration_end,
      description: "Penerimaan berkas dan verifikasi calon pemimpin baru komunitas.",
    },
    {
      title: "Masa Pemilihan",
      start: event?.voting_start,
      end: event?.voting_end,
      description: "Proses pemungutan suara secara elektronik dan transparan.",
    },
  ]

  const formatDate = (dateString?: string) => {
    if (!dateString) return "TBD"
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <section id="timeline" className="py-24 bg-slate-50">
      <MaxWidthWrapper>
        <div className="text-center mb-16">
          <Badge variant="emerald" className="mb-4">Timeline Acara</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Agenda & Jadwal Penting
          </h2>
          <p className="mt-4 text-slate-500 max-w-2xl mx-auto">
            Seluruh rangkaian acara telah disusun untuk memastikan transparansi dan kelancaran proses musyawarah dari awal hingga akhir.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative border-l-2 border-emerald-100 ml-4 md:ml-0 md:border-l-0 md:border-t-2 md:flex md:justify-between pt-8 md:pt-0">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative pl-8 md:pl-0 md:pt-8 pb-12 md:pb-0 md:w-1/3 md:text-center group"
              >
                {/* Node marker */}
                <div className="absolute left-[-9px] top-1 md:left-1/2 md:top-[-9px] md:-translate-x-1/2 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-50 transition-transform group-hover:scale-125" />
                
                <h3 className="text-xl font-bold text-slate-900 mb-2 ml-2 md:ml-0">
                  {step.title}
                </h3>
                <div className="text-sm font-semibold text-emerald-600 mb-3 bg-emerald-50 inline-block px-3 py-1 rounded-full ml-2 md:ml-0">
                  {formatDate(step.start)} - {formatDate(step.end)}
                </div>
                <p className="text-slate-500 text-sm leading-relaxed max-w-xs ml-2 md:mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  )
}
