import { useEffect, useState } from "react";
import { HomeResponse } from "@/types/landing";
import { SlideUp, EmptyState, AnnouncementSkeleton } from "@/components/landing/Shared";
import { Container, Section } from "@/components/ui/layout";
import { SectionHeader } from "@/components/ui/section-header";
import { AnnouncementCard } from "@/components/ui/announcement-card";
import { websiteService, InformationPage } from "@/services/website";
import Link from "next/link";
import { FileText, ChevronRight } from "lucide-react";

export function InformationCenter({ data }: { data: HomeResponse | null }) {
  const announcements = data?.announcements;
  const [pages, setPages] = useState<InformationPage[]>([]);
  const [loadingPages, setLoadingPages] = useState(true);

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
    <Section id="informasi" className="relative">
      <div className="section-divider" />
      <Container className="py-24 lg:py-32">
        <SlideUp className="text-center max-w-2xl mx-auto mb-16 lg:mb-24">
          <p className="text-info text-xs font-semibold tracking-widest uppercase mb-3">Pusat Informasi</p>
          <SectionHeader 
            title="Informasi & Dokumen" 
            description="Pembaruan terbaru, pengumuman resmi, dan dokumen panduan penting terkait pelaksanaan musyawarah."
            centered
          />
        </SlideUp>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
          {/* Left Column: Announcements */}
          <div className="lg:col-span-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-8 h-px bg-blue-500"></span>
              Pengumuman Terbaru
            </h3>

            {!data && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnnouncementSkeleton />
                <AnnouncementSkeleton />
              </div>
            )}

            {data && (!announcements || announcements.length === 0) && (
              <EmptyState
                icon="calendar"
                title="Belum Ada Pengumuman"
                description="Pengumuman terbaru akan segera diterbitkan di sini."
              />
            )}

            {announcements && announcements.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {announcements.map((a, i) => {
                  const isLatest = a.is_pinned || i === 0;
                  const dateStr = a.published_at || a.created_at;
                  const formattedDate = dateStr ? new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "";

                  return (
                    <SlideUp key={a.id} delay={i * 0.1}>
                      <AnnouncementCard
                        category={a.category || "Pengumuman"}
                        title={a.title}
                        summary={a.summary || a.content}
                        date={formattedDate}
                        isLatest={isLatest}
                      />
                    </SlideUp>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Information Pages */}
          <div className="lg:col-span-4">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-8 h-px bg-blue-500"></span>
              Panduan & Tata Tertib
            </h3>
            
            <div className="bg-[#141824]/80 backdrop-blur-md border border-white/[0.05] rounded-2xl overflow-hidden shadow-2xl">
              {loadingPages ? (
                <div className="p-8 text-center text-slate-500">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-sm">Memuat dokumen...</p>
                </div>
              ) : pages.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <FileText className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Belum ada dokumen tersedia.</p>
                </div>
              ) : (
                <ul className="divide-y divide-white/[0.05]">
                  {pages.map((p, i) => (
                    <SlideUp key={p.id || p.slug} delay={i * 0.1}>
                      <li>
                        <Link
                          href={`/informasi/${p.slug}`}
                          className="flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 group-hover:border-blue-500/40 transition-all">
                              <FileText className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                                {p.title}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">Lihat dokumen &rarr;</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors transform group-hover:translate-x-1" />
                        </Link>
                      </li>
                    </SlideUp>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
