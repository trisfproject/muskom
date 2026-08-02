"use client";

import { useEffect, useState } from "react";
import { HomeResponse } from "@/types/landing";
import { SlideUp, EmptyState, AnnouncementSkeleton } from "@/components/landing/Shared";
import { Container, Section } from "@/components/ui/layout";
import { SectionHeader } from "@/components/ui/section-header";
import { AnnouncementCard } from "@/components/ui/announcement-card";
import { websiteService, InformationPage } from "@/services/website";
import Link from "next/link";
import { FileText, BookOpen, ShieldCheck, ChevronRight, X, Calendar, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface AnnouncementItem {
  id: string;
  title: string;
  category?: string;
  summary?: string;
  content: string;
  published_at?: string;
  created_at: string;
  is_pinned?: boolean;
}

export function InformationCenter({ data }: { data: HomeResponse | null }) {
  const announcements = (data?.announcements as AnnouncementItem[] | undefined) || [];
  const [pages, setPages] = useState<InformationPage[]>([]);
  const [loadingPages, setLoadingPages] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);

  useEffect(() => {
    async function loadPages() {
      try {
        const result = await websiteService.getPublicInformationPages();
        setPages(result || []);
      } catch (err) {
        console.error("Failed to load information pages:", err);
      } finally {
        setLoadingPages(false);
      }
    }
    loadPages();
  }, []);

  return (
    <Section id="informasi" className="relative overflow-hidden">
      <div className="section-divider" />
      {/* Subtle soft ambient glow for visual depth */}
      <div
        className="absolute top-1/2 left-0 w-[500px] h-[400px] pointer-events-none bg-glow -translate-y-1/2"
        style={{ filter: "blur(70px)", opacity: 0.6 }}
      />

      <Container className="py-24 lg:py-32 relative z-10">
        <SlideUp className="text-center max-w-2xl mx-auto mb-16 lg:mb-20">
          <p className="text-info text-xs font-bold tracking-[0.16em] uppercase mb-3">Pusat Informasi</p>
          <SectionHeader 
            title="Pusat Informasi" 
            description="Pembaruan terbaru, pengumuman resmi, dan panduan penting terkait pelaksanaan musyawarah."
            centered
          />
        </SlideUp>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 max-w-7xl mx-auto items-start">
          {/* Left Column: Pengumuman */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Pengumuman Terbaru
                </h3>
              </div>
              {announcements.length > 0 && (
                <span className="text-xs font-semibold text-muted bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-full border border-light dark:border-slate-700">
                  {announcements.length} Pengumuman
                </span>
              )}
            </div>

            {!data && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnnouncementSkeleton />
                <AnnouncementSkeleton />
              </div>
            )}

            {data && announcements.length === 0 && (
              <EmptyState
                icon="calendar"
                title="Belum Ada Pengumuman"
                description="Pengumuman dan pembaruan resmi akan segera dipublikasikan di sini segera setelah dirilis oleh panitia."
                className="py-16"
              />
            )}

            {announcements.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {announcements.map((a, i) => {
                  const isLatest = a.is_pinned || i === 0;
                  const dateStr = a.published_at || a.created_at;
                  const formattedDate = dateStr
                    ? new Date(dateStr).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "";

                  return (
                    <SlideUp key={a.id} delay={i * 0.08}>
                      <AnnouncementCard
                        category={a.category || "Pengumuman"}
                        title={a.title}
                        summary={a.summary || a.content}
                        date={formattedDate}
                        isLatest={isLatest}
                        onClick={() => setSelectedAnnouncement(a)}
                      />
                    </SlideUp>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Panduan & Tata Tertib (Official Pages) */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-info" />
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Panduan & Tata Tertib
                </h3>
              </div>
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                Resmi
              </span>
            </div>
            
            <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl border border-white/60 dark:border-slate-800/60 rounded-2xl p-3 shadow-sm transition-all duration-300">
              {loadingPages ? (
                <div className="p-8 text-center text-slate-500">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs font-medium">Memuat informasi...</p>
                </div>
              ) : pages.length === 0 ? (
                <EmptyState
                  icon="book"
                  title="Belum Ada Panduan"
                  description="Panduan dan tata tertib akan segera dipublikasikan."
                />
              ) : (
                <div className="space-y-1.5">
                  {pages.map((p, i) => (
                    <SlideUp key={p.id || p.slug} delay={i * 0.08}>
                      <Link
                        href={`/informasi/${p.slug}`}
                        className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-white/40 hover:bg-white/80 dark:bg-slate-800/30 dark:hover:bg-slate-800/60 border border-transparent hover:border-white/80 dark:hover:border-slate-700/60 hover:shadow-sm hover:shadow-blue-500/5 transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 shrink-0 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors truncate">
                              {p.title}
                            </p>
                            <p className="text-[11px] text-muted mt-0.5 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-info" />
                              Baca halaman resmi &rarr;
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all ml-2" />
                      </Link>
                    </SlideUp>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>

      {/* Interactive Announcement Reader Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-2xl max-h-[85vh] bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl rounded-3xl border border-white/60 dark:border-slate-700/60 shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                    {selectedAnnouncement.category || "Pengumuman"}
                  </span>
                  {(selectedAnnouncement.published_at || selectedAnnouncement.created_at) && (
                    <span className="flex items-center gap-1.5 text-xs text-muted font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(selectedAnnouncement.published_at || selectedAnnouncement.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
                  {selectedAnnouncement.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors shrink-0"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 prose prose-slate dark:prose-invert prose-blue max-w-none text-sm sm:text-base leading-relaxed">
              <ReactMarkdown>{selectedAnnouncement.content || selectedAnnouncement.summary || ""}</ReactMarkdown>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}
