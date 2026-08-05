import { landingService } from "@/services/landing"
import { ThemeWrapper } from "@/components/landing/ThemeWrapper"
import { Hero } from "@/components/landing/Hero"
import { Timeline } from "@/components/landing/Timeline"
import { CandidatePreview } from "@/components/landing/CandidatePreview"
import { InformationCenter } from "@/components/landing/InformationCenter"
import { Footer } from "@/components/landing/Footer"

// Allowed sections per ADR 0006: Navbar, Hero, Timeline, Candidates, Announcements, Footer
// FAQ and Contact/Help are permanently removed
export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const homeData = await landingService.getPublicHome()

  let config: any = null;
  try {
    const apiUrl = process.env.INTERNAL_API_URL || "http://localhost:8080/api/v1";
    const res = await fetch(`${apiUrl}/system/config`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      config = json.data;
    }
  } catch (error) {
    console.error("Failed to fetch config for maintenance mode check", error);
  }

  const isMaintenance = config?.publication?.maintenance_mode || config?.publication?.website_status === "MAINTENANCE";

  if (isMaintenance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="max-w-md text-center p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-xl">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Pemeliharaan Sistem</h1>
          <p className="text-slate-600 dark:text-slate-300">
            {config?.publication?.offline_message || "Website sedang dalam pemeliharaan. Silakan kembali lagi nanti."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ThemeWrapper>
      <main>
        <Hero data={homeData ?? null} />
        <Timeline data={homeData ?? null} />
        <CandidatePreview data={homeData ?? null} />
        <InformationCenter data={homeData ?? null} />
      </main>
      <Footer data={homeData ?? null} />
    </ThemeWrapper>
  )
}
