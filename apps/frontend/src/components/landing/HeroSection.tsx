import { motion } from "framer-motion"
import { MusyawarahEvent } from "@/types/event"
import { Button } from "@/components/ui/button"
import { CalendarDays, MapPin } from "lucide-react"

interface HeroSectionProps {
  event: MusyawarahEvent | null
}

export function HeroSection({ event }: HeroSectionProps) {
  // Use fallbacks if event is null, though it shouldn't be null in active state
  const name = event?.name || "Musyawarah Tahunan"
  const theme = event?.theme || "Membangun Komunitas Solid & Progresif"
  const location = event?.location || "Convention Center, Jakarta"
  const startDate = event?.start_date
    ? new Date(event.start_date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Segera Hadir"

  return (
    <section className="relative pt-40 pb-24 md:pt-48 md:pb-32 overflow-hidden bg-slate-950">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] rounded-full bg-emerald-900/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] rounded-full bg-slate-900/50 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.05)_2px,transparent_2px)] bg-[length:40px_40px] opacity-20 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/50 border border-emerald-800 text-emerald-400 text-sm font-semibold mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Official Portal
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
            {name}
          </h1>

          <p className="text-xl md:text-2xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            {theme}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12 text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-emerald-600" />
              {startDate}
            </div>
            <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-300" />
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              {location}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto">
              Daftar Sebagai Peserta
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Pelajari Lebih Lanjut
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
