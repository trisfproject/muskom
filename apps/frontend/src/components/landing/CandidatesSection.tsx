"use client"
import { motion } from "framer-motion"
import { MaxWidthWrapper } from "@/components/layout/MaxWidthWrapper"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { landingService } from "@/services/landing"

interface CandidateData {
  id?: string;
  name?: string;
  title?: string;
  photo_path?: string;
  sequence_number?: number;
  vision?: string;
}

export function CandidatesSection() {
  const [candidates, setCandidates] = useState<CandidateData[]>([])

  useEffect(() => {
    landingService.getPublicCandidates().then((res) => setCandidates(res as CandidateData[])).catch(() => setCandidates([]))
  }, [])

  if (candidates.length === 0) {
    return (
      <section id="kandidat" className="py-24 bg-white">
        <MaxWidthWrapper>
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">Kandidat</Badge>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Profil Kandidat</h2>
            <p className="text-slate-500">Belum ada kandidat yang dipublikasikan saat ini.</p>
          </div>
        </MaxWidthWrapper>
      </section>
    )
  }

  return (
    <section id="kandidat" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-50 rounded-full blur-3xl -z-10" />
      
      <MaxWidthWrapper>
        <div className="text-center mb-16">
          <Badge variant="emerald" className="mb-4">Kandidat Resmi</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Mengenal Calon Pemimpin
          </h2>
          <p className="mt-4 text-slate-500 max-w-2xl mx-auto">
            Pelajari profil, visi, dan misi dari setiap kandidat yang telah diverifikasi dan siap memimpin komunitas kita ke depan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {candidates.map((candidate, index) => (
            <motion.div
              key={candidate.id || index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="h-full border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300 group">
                <CardHeader className="text-center pb-4">
                  <div className="w-24 h-24 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                    {candidate.photo_path ? (
                      <img src={candidate.photo_path} alt={candidate.name} className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle className="w-12 h-12 text-slate-300" />
                    )}
                  </div>
                  <Badge variant="secondary" className="w-fit mx-auto mb-2">No. Urut {candidate.sequence_number || index + 1}</Badge>
                  <CardTitle className="text-xl">{candidate.name}</CardTitle>
                  <CardDescription className="font-medium text-emerald-600">{candidate.title || "Kandidat"}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-slate-600 line-clamp-3">
                    {candidate.vision || "Kandidat ini belum mencantumkan detail visi secara publik."}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </MaxWidthWrapper>
    </section>
  )
}
