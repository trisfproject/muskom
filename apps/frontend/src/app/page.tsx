import { landingService } from "@/services/landing"
import { ThemeWrapper } from "@/components/landing/ThemeWrapper"
import { Hero } from "@/components/landing/Hero"
import { Timeline } from "@/components/landing/Timeline"
import { CandidatePreview } from "@/components/landing/CandidatePreview"
import { InformationCenter } from "@/components/landing/InformationCenter"
import { Footer } from "@/components/landing/Footer"

// Allowed sections per ADR 0006: Navbar, Hero, Timeline, Candidates, Announcements, Footer
// FAQ and Contact/Help are permanently removed
export const revalidate = 60

export default async function LandingPage() {
  const homeData = await landingService.getPublicHome()

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
