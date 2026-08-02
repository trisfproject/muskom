import { Metadata } from "next";
import { websiteService } from "@/services/website";
import { ThemeWrapper } from "@/components/landing/ThemeWrapper";
import { Footer } from "@/components/landing/Footer";
import { landingService } from "@/services/landing";
import { notFound } from "next/navigation";
import { DocumentationLayout } from "@/components/layout/DocumentationLayout";

type Props = {
  params: Promise<{ slug: string }>;
};



export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const page = await websiteService.getPublicInformationPage(slug);
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
  const { slug } = await params;
  let page = null;
  try {
    page = await websiteService.getPublicInformationPage(slug);
  } catch (err) {
    // Let it be null, which triggers notFound() below
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
      <DocumentationLayout
        title={page.title}
        content={page.content}
        lastUpdated={formattedDate}
        backLink={{ href: "/#informasi", label: "Kembali ke Pusat Informasi" }}
      />
      <Footer data={homeData ?? null} />
    </ThemeWrapper>
  );
}
