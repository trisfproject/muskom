import { landingService } from "@/services/landing"
import { ThemeWrapper } from "@/components/landing/ThemeWrapper"
import { Hero } from "@/components/landing/Hero"
import { Timeline } from "@/components/landing/Timeline"
import { CandidatePreview } from "@/components/landing/CandidatePreview"
import { Announcement } from "@/components/landing/Announcement"
import { FAQ } from "@/components/landing/FAQ"
import { Contact } from "@/components/landing/Contact"
import { Footer } from "@/components/landing/Footer"

export const revalidate = 60 // Enable ISR (60 seconds)

export default async function LandingPage() {
  const homeData = await landingService.getPublicHome()

  return (
    <ThemeWrapper>
      <main>
        <Hero data={homeData ?? null} />
        <Timeline data={homeData ?? null} />
        <CandidatePreview data={homeData ?? null} />
        <Announcement data={homeData ?? null} />
        <FAQ data={homeData ?? null} />
        <Contact data={homeData ?? null} />
      </main>
      <Footer data={homeData ?? null} />
    </ThemeWrapper>
  )
}
