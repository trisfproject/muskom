import { motion } from "framer-motion"
import { MaxWidthWrapper } from "@/components/layout/MaxWidthWrapper"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AnnouncementsSection() {
  const announcements = [
    {
      id: 1,
      title: "Pendaftaran Peserta Telah Dibuka",
      date: "10 Agustus 2026",
      summary: "Seluruh anggota komunitas kini dapat mendaftarkan diri secara resmi melalui portal ini untuk mendapatkan hak suara.",
      category: "Penting",
    },
    {
      id: 2,
      title: "Sosialisasi Tata Tertib Musyawarah",
      date: "05 Agustus 2026",
      summary: "Dokumen tata tertib musyawarah dan pedoman pemilihan telah diterbitkan dan dapat diunduh oleh seluruh peserta.",
      category: "Informasi",
    },
    {
      id: 3,
      title: "Jadwal Verifikasi Kandidat",
      date: "01 Agustus 2026",
      summary: "Proses verifikasi berkas kandidat akan dilakukan secara transparan dan disiarkan melalui kanal resmi.",
      category: "Agenda",
    },
  ]

  return (
    <section id="pengumuman" className="py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Abstract dark mode background decorations */}
      <div className="absolute inset-0 z-0">
        <div className="absolute right-0 top-0 translate-x-1/3 -translate-y-1/4 w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-3xl" />
        <div className="absolute left-0 bottom-0 -translate-x-1/3 translate-y-1/4 w-[500px] h-[500px] bg-slate-800/50 rounded-full blur-3xl" />
      </div>

      <MaxWidthWrapper className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="mb-4 bg-slate-800 text-slate-300 hover:bg-slate-700">Pusat Informasi</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-white">
              Pengumuman Terbaru
            </h2>
            <p className="text-slate-400 text-lg">
              Tetap terhubung dan dapatkan informasi resmi terkini seputar pelaksanaan musyawarah dan kegiatan komunitas.
            </p>
          </div>
          <Button variant="outline" className="w-full md:w-auto border-slate-700 bg-slate-800/50 text-white hover:bg-slate-700 hover:text-white">
            Lihat Semua Pengumuman
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {announcements.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800 transition-colors group cursor-pointer flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline" className="border-slate-600 text-emerald-400">
                  {item.category}
                </Badge>
                <span className="text-xs text-slate-400 font-medium">{item.date}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-emerald-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed flex-1 mb-6">
                {item.summary}
              </p>
              <div className="flex items-center text-sm font-semibold text-emerald-400 gap-1 opacity-80 group-hover:opacity-100 transition-opacity mt-auto">
                Baca selengkapnya <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>
      </MaxWidthWrapper>
    </section>
  )
}
