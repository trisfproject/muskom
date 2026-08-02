import { Metadata } from "next";
import { websiteService } from "@/services/website";
import { ThemeWrapper } from "@/components/landing/ThemeWrapper";
import { Container } from "@/components/ui/layout";
import { Footer } from "@/components/landing/Footer";
import { landingService } from "@/services/landing";
import { FileText, ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const page = await websiteService.getPublicInformationPage(params.slug);
    if (!page) {
      return { title: "Halaman Tidak Ditemukan" };
    }
    return {
      title: `${page.title} — Pusat Informasi MUSKOM`,
      description: "Panduan dan tata tertib resmi pelaksanaan Musyawarah KOMITKABE.",
      openGraph: {
        title: `${page.title} — MUSKOM`,
        description: "Panduan resmi pelaksanaan Musyawarah KOMITKABE.",
      },
    };
  } catch (error) {
    return { title: "Pusat Informasi MUSKOM" };
  }
}

export default async function InformationPageDetail({ params }: Props) {
  let page = null;
  try {
    page = await websiteService.getPublicInformationPage(params.slug);
  } catch (err) {
    // If error or 404, page will remain null
  }

  if (!page) {
    notFound();
  }

  const homeData = await landingService.getPublicHome();
  const dateStr = page.updated_at || page.created_at;
  const formattedDate = dateStr
    ? new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <ThemeWrapper>
      <main className="min-h-screen pt-32 pb-24 relative">
        <Container className="max-w-4xl">
          {/* Back Navigation */}
          <Link
            href="/#informasi"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Pusat Informasi
          </Link>

          {/* Page Header */}
          <div className="mb-12 border-b border-white/[0.05] pb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-primary text-xs font-semibold tracking-wide uppercase mb-6">
              <FileText className="w-3.5 h-3.5" />
              Dokumen Resmi
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-6">
              {page.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Diperbarui pada: {formattedDate}</span>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="prose prose-invert prose-blue max-w-none">
            <ReactMarkdown>{page.content}</ReactMarkdown>
          </div>
        </Container>
      </main>
      <Footer data={homeData ?? null} />
    </ThemeWrapper>
  );
}
