import { Metadata } from "next";
import { websiteService } from "@/services/website";
import { landingService } from "@/services/landing";
import { ThemeWrapper } from "@/components/landing/ThemeWrapper";
import { Footer } from "@/components/landing/Footer";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Briefcase, Building, ChevronLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";

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
        <div className="container-landing max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            href="/#kandidat"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            Kembali ke Bursa Calon
          </Link>

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header Section */}
            <div className="relative p-6 md:p-10 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-10 md:gap-12 items-center md:items-center text-center md:text-left bg-gradient-to-br from-blue-50/50 to-white dark:from-slate-800/30 dark:to-slate-900">
              <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary font-black text-xl shadow-sm">
                {candidate.sequence_number ?? "?"}
              </div>

              <div className="shrink-0">
                {candidate.photo_url ? (
                  <div className="w-[220px] h-[220px] rounded-xl overflow-hidden relative shadow-xl ring-4 ring-white dark:ring-slate-900">
                    <Image
                      src={candidate.photo_url}
                      alt={candidate.name || "Candidate"}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                ) : (
                  <div className="w-[220px] h-[220px] rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center ring-4 ring-white dark:ring-slate-900 text-slate-400 shadow-xl">
                    <span className="text-5xl font-bold">
                      {candidate.name?.charAt(0) || "?"}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 flex flex-col justify-center">
                <h1 className="text-3xl md:text-4xl font-black pg-text tracking-tight mb-3">
                  {candidate.name}
                </h1>
                
                <div className="flex flex-col gap-2 items-center md:items-start text-slate-600 dark:text-slate-400">
                  {candidate.title && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 shrink-0 text-primary" />
                      <span>{candidate.title}</span>
                    </div>
                  )}
                  {candidate.organization && (
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 shrink-0 text-primary" />
                      <span>{candidate.organization}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 md:p-10 space-y-6 md:space-y-6">
              {/* Biography */}
              <section>
                <h2 className="text-xl font-bold pg-text mb-4 inline-block border-b-2 border-primary pb-1">Biografi Singkat</h2>
                <div className="prose dark:prose-invert prose-blue max-w-none text-slate-600 dark:text-slate-300">
                  {candidate.biography ? (
                    <ReactMarkdown>{candidate.biography}</ReactMarkdown>
                  ) : (
                    <p className="text-slate-400 italic">Belum tersedia.</p>
                  )}
                </div>
              </section>

              {/* Vision & Mission */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 space-y-6">
                <section>
                  <h2 className="text-xl font-bold pg-text mb-3 inline-block border-b-2 border-primary pb-1">Visi</h2>
                  <div className="prose dark:prose-invert prose-blue max-w-none text-slate-600 dark:text-slate-300">
                    {candidate.vision ? (
                      <ReactMarkdown>{candidate.vision}</ReactMarkdown>
                    ) : (
                      <p className="text-slate-400 italic">Belum tersedia.</p>
                    )}
                  </div>
                </section>

                <hr className="border-slate-200 dark:border-slate-700" />

                <section>
                  <h2 className="text-xl font-bold pg-text mb-3 inline-block border-b-2 border-primary pb-1">Misi</h2>
                  <div className="prose dark:prose-invert prose-blue max-w-none text-slate-600 dark:text-slate-300">
                    {candidate.mission ? (
                      <ReactMarkdown>{candidate.mission}</ReactMarkdown>
                    ) : (
                      <p className="text-slate-400 italic">Belum tersedia.</p>
                    )}
                  </div>
                </section>
              </div>
            </div>
            
          </div>
        </div>
      </div>
      <Footer data={homeData ?? null} />
    </ThemeWrapper>
  );
}
