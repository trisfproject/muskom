import { motion } from "framer-motion"
import { MusyawarahEvent } from "@/types/event"
import { Users, UserSquare2, ShieldCheck } from "lucide-react"

interface StatsSectionProps {
  event: MusyawarahEvent | null
}

export function StatsSection({ event }: StatsSectionProps) {
  const participants = event?.stats?.total_participants || 0
  const candidates = event?.stats?.total_candidates || 0

  const stats = [
    {
      label: "Peserta Terdaftar",
      value: participants.toString(),
      icon: Users,
    },
    {
      label: "Kandidat Maju",
      value: candidates.toString(),
      icon: UserSquare2,
    },
    {
      label: "Status Portal",
      value: event?.status === "ONGOING" ? "Live" : "Standby",
      icon: ShieldCheck,
    },
  ]

  return (
    <section className="py-16 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <stat.icon className="w-6 h-6" />
              </div>
              <h3 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
                {stat.value}
              </h3>
              <p className="text-slate-500 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
