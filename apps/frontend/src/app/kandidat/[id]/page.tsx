import { Metadata } from "next";
import { websiteService } from "@/services/website";
import { landingService } from "@/services/landing";
import { ThemeWrapper } from "@/components/landing/ThemeWrapper";
import { Footer } from "@/components/landing/Footer";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Building, ChevronLeft, MapPin } from "lucide-react";
import { FormattedCandidateContent } from "@/components/ui/FormattedCandidateContent";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const candidate = await websiteService.getPublicCandidateDetail(id);
    if (!candidate) {
      return { title: "Kandidat Tidak Ditemukan" };
    }
    return {
      title: `${candidate.name} — Calon Ketua Umum MUSKOM`,
      description: candidate.vision || "Profil calon ketua umum MUSKOM.",
      openGraph: {
        title: `${candidate.name} — Calon Ketua Umum MUSKOM`,
        description: candidate.vision || "Profil calon ketua umum MUSKOM.",
        ...(candidate.photo_url && {
          images: [{ url: candidate.photo_url }],
        }),
      },
    };
  } catch (error) {
    return { title: "Profil Kandidat" };
  }
}

export default async function CandidateDetailPage({ params }: Props) {
  const { id } = await params;
  let candidate = null;
  try {
    candidate = await websiteService.getPublicCandidateDetail(id);
  } catch (err) {
    // Handled below
  }

  if (!candidate) {
    notFound();
  }

  const homeData = await landingService.getPublicHome();

  return (
    <ThemeWrapper>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16">
        <div className="container-landing max-w-6xl mx-auto px-4 md:px-6">
          {/* Back Button */}
          <Link
            href="/#kandidat"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            Kembali ke Bursa Calon
          </Link>

          <div className="bg-white dark:bg-slate-900 rounded-[20px] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
            {/* Header Section */}
            <div className="relative p-7 md:p-9 flex flex-col md:flex-row gap-10 md:gap-12 items-center text-center md:text-left bg-white dark:bg-slate-900">
              <div className="shrink-0 w-[220px] md:w-[240px]">
                {candidate.photo_url ? (
                  <div className="w-full relative shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 rounded-2xl overflow-hidden" style={{ aspectRatio: "1 / 1" }}>
                    <Image
                      src={candidate.photo_url}
                      alt={candidate.name || "Candidate"}
                      fill
                      className="object-cover object-center"
                      priority
                      sizes="(max-width: 640px) 220px, 240px"
                    />
                  </div>
                ) : (
                  <div className="w-full relative bg-slate-100 dark:bg-slate-800 flex items-center justify-center ring-1 ring-slate-100 dark:ring-slate-800 rounded-2xl" style={{ aspectRatio: "1 / 1" }}>
                    <span className="text-6xl font-bold text-slate-400">
                      {candidate.name?.charAt(0) || "?"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-center mt-2 md:mt-0">
                <div className="mb-4">
                  <div className="text-5xl md:text-6xl font-black text-primary tracking-tighter leading-none">
                    {candidate.sequence_number ? candidate.sequence_number.toString().padStart(2, "0") : "??"}
                  </div>
                </div>

                <h1 className="text-4xl md:text-[44px] font-black text-slate-900 dark:text-white tracking-tight mb-5 md:mb-6 leading-tight">
                  {candidate.name}
                </h1>

                <div className="flex flex-wrap items-center gap-2 text-[15px] md:text-base font-medium justify-center md:justify-start text-slate-600 dark:text-slate-400">
                  {candidate.organization && (
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 opacity-70" />
                      <span className="text-slate-800 dark:text-slate-200">{candidate.organization}</span>
                    </div>
                  )}
                  {candidate.organization && candidate.industrial_area && (
                    <span className="text-slate-300 dark:text-slate-600 px-1 font-bold">·</span>
                  )}
                  {candidate.industrial_area && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 opacity-70" />
                      <span className="text-slate-800 dark:text-slate-200">{candidate.industrial_area}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Information Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[20px] shadow-sm border border-slate-200 dark:border-slate-800 px-6 py-6 md:px-10 md:py-8 w-full mb-16">
            
            {/* Biografi Singkat */}
            <section>
              <div className="flex items-center gap-3 mb-3 md:mb-4">
                <div className="w-1 h-5 md:h-6 bg-primary rounded-full" />
                <h2 className="text-[20px] md:text-[22px] font-bold text-slate-900 dark:text-white">Biografi Singkat</h2>
              </div>
              <FormattedCandidateContent content={candidate.biography} />
            </section>

            <hr className="my-7 border-t border-slate-200 dark:border-slate-800" />

            {/* Visi */}
            <section>
              <div className="flex items-center gap-3 mb-3 md:mb-4">
                <div className="w-1 h-5 md:h-6 bg-primary rounded-full" />
                <h2 className="text-[20px] md:text-[22px] font-bold text-slate-900 dark:text-white">Visi</h2>
              </div>
              <FormattedCandidateContent content={candidate.vision} />
            </section>

            <hr className="my-7 border-t border-slate-200 dark:border-slate-800" />

            {/* Misi */}
            <section>
              <div className="flex items-center gap-3 mb-3 md:mb-4">
                <div className="w-1 h-5 md:h-6 bg-primary rounded-full" />
                <h2 className="text-[20px] md:text-[22px] font-bold text-slate-900 dark:text-white">Misi</h2>
              </div>
              <FormattedCandidateContent content={candidate.mission} />
            </section>

          </div>
        </div>

        {/* Optional Bottom CTA */}
        <div className="container-landing max-w-3xl mx-auto px-4 md:px-6 text-center mt-8">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Siap Memilih?</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Pastikan Anda telah mengenal kandidat dan memahami gagasan yang ditawarkan.
          </p>
          <Link
            href="/#kandidat"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold transition-colors"
          >
            Kembali ke Daftar Kandidat
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <Footer data={homeData ?? null} />
    </ThemeWrapper>
  );
}
