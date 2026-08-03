"use client";

import { useState, useMemo } from "react";
import { HomeResponse } from "@/types/landing"
import { ArrowRight, Search, ArrowDownAz, ListOrdered } from "lucide-react"
import { SlideUp, EmptyState, CandidateSkeleton } from "@/components/landing/Shared"
import { SectionPill } from "@/components/ui/section-pill"
import { useSystemConfig } from "@/contexts/ConfigContext"
import Image from "next/image"
import Link from "next/link"

export function CandidatePreview({ data }: { data: HomeResponse | null }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"number" | "alphabetical">("number");

  const candidates = data?.candidates;
  const sectionTitle = data?.candidate_cms?.section_title || "Bursa Calon Ketua";
  const sectionDesc = data?.candidate_cms?.section_description || "Mengenal lebih dekat visi dan misi calon pemimpin yang akan membawa perubahan untuk komunitas.";
  const emptyMsg = data?.candidate_cms?.empty_state_message || "Belum ada calon yang dipublikasikan.";

  const { config } = useSystemConfig();

  const filteredCandidates = useMemo(() => {
    if (!candidates) return [];
    let filtered = candidates;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(c => c.name?.toLowerCase().includes(q));
    }

    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "alphabetical") {
        return (a.name || "").localeCompare(b.name || "");
      }
      return (a.sequence_number || 0) - (b.sequence_number || 0);
    });

    return filtered;
  }, [candidates, searchQuery, sortBy]);

  if (config?.feature_flags && !config.feature_flags.show_candidate) {
    return null;
  }

  return (
    <section id="kandidat" className="relative overflow-hidden">
      <div className="section-divider" />
      <div className="container-landing py-16 md:py-24 lg:py-32 relative z-10">
        
        <SlideUp className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 mb-12 lg:mb-16">
          <div className="max-w-2xl flex flex-col items-start">
            <SectionPill label="Kandidat" className="mb-4" />
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black pg-text tracking-tight mb-3 md:mb-4">{sectionTitle}</h2>
            <p className="pg-muted text-base md:text-lg leading-relaxed">
              {sectionDesc}
            </p>
          </div>
        </SlideUp>

        {data && candidates && candidates.length > 0 && (
          <SlideUp className="mb-10 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/50 dark:bg-slate-900/50 p-4 rounded-2xl backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari nama kandidat..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl w-full sm:w-auto">
              <button 
                onClick={() => setSortBy("number")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${sortBy === "number" ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                <ListOrdered className="w-4 h-4" />
                Nomor
              </button>
              <button 
                onClick={() => setSortBy("alphabetical")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${sortBy === "alphabetical" ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                <ArrowDownAz className="w-4 h-4" />
                Abjad
              </button>
            </div>
          </SlideUp>
        )}

        {/* Loading state */}
        {!data && <CandidateSkeleton />}

        {/* Empty state */}
        {data && (!candidates || candidates.length === 0) && (
          <EmptyState
            icon="user"
            title="Kandidat Belum Tersedia"
            description={emptyMsg}
          />
        )}

        {/* Not Found State */}
        {data && candidates && candidates.length > 0 && filteredCandidates.length === 0 && (
           <div className="text-center py-12 px-4 bg-white/30 dark:bg-slate-900/30 rounded-3xl border border-slate-200/50 dark:border-slate-800/50">
             <p className="text-slate-500 dark:text-slate-400">Tidak ada kandidat yang cocok dengan pencarian &quot;{searchQuery}&quot;.</p>
           </div>
        )}

        {filteredCandidates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredCandidates.map((c, i) => (
              <SlideUp key={c.id} delay={i * 0.1}>
                <div className="group bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-700/30 p-6 md:p-8 rounded-3xl flex flex-col h-full hover:shadow-xl hover:shadow-blue-500/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-blue-600/20 text-primary font-black shadow-sm z-10">
                    {c.sequence_number ?? "?"}
                  </div>
                  <div className="mb-6 flex justify-center">
                    {c.photo_url ? (
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden relative shadow-lg ring-4 ring-white dark:ring-slate-800">
                        <Image src={c.photo_url} alt={c.name || "Candidate"} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center ring-4 ring-white dark:ring-slate-800 text-slate-400 shadow-lg">
                        <span className="text-3xl font-bold">{c.name?.charAt(0) || "?"}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-center mb-4">
                    <h3 className="text-xl md:text-2xl font-bold pg-text group-hover:text-primary transition-colors">{c.name}</h3>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">{c.organization || "No Organization"}</p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-sm pg-muted leading-relaxed line-clamp-3">{c.biography || c.vision || ""}</p>
                  </div>
                  <div className="mt-6 pt-6 border-t border-slate-200/50 dark:border-slate-700/50 text-center">
                    <Link href={`/kandidat/${c.id}`} className="text-sm font-semibold text-primary hover:text-blue-700 transition-colors inline-flex items-center gap-1">
                      Lihat Profil Lengkap <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </SlideUp>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
