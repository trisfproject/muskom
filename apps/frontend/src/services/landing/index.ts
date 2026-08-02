import publicApi from '@/lib/public-api';
import { HomeResponse } from '@/types/landing';
import { landingSeed } from '@/data/landing-seed';

export const landingService = {
  async getPublicHome(): Promise<HomeResponse | null> {
    try {
      const isServer = typeof window === 'undefined';
      const baseUrl = isServer
        ? process.env.INTERNAL_API_URL || 'http://api:8080/api/v1'
        : process.env.NEXT_PUBLIC_API_URL || '/api/v1';
      const res = await fetch(`${baseUrl}/public/home`, {
        next: { revalidate: 60 } // ISR Cache: 60 seconds
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
      }
      
      const json = await res.json();
      const apiData = json.data;

      // Transform API response to match frontend HomeResponse structure and inject lifecycle logic
      const lifecycle = apiData?.event?.lifecycle_state || 'PREPARATION';
      
      const mappedData: HomeResponse = {
        ...landingSeed, // fallback for static CMS parts
        currentPhase: {
          name: apiData?.currentPhase?.name || landingSeed.currentPhase.name,
          end_date: apiData?.currentPhase?.end_date,
          is_active: apiData?.currentPhase?.is_active || false,
        },
        event: apiData?.event, // Include event for downstream use
      };

      // Lifecycle-driven CTA overrides
      mappedData.cta = {
        participant_registration: { label: "Persiapan", url: "#", open: false, style: "outline" },
        candidate_registration: { label: "Persiapan", url: "#", open: false, style: "outline" }
      };

      if (lifecycle === 'PARTICIPANT_REGISTRATION') {
        mappedData.cta.participant_registration = { label: "Daftar Peserta", url: "/register", open: true, style: "primary" };
      } else if (lifecycle === 'CANDIDATE_REGISTRATION') {
        mappedData.cta.candidate_registration = { label: "Daftar Bakal Calon", url: "/register/candidate", open: true, style: "primary" };
      } else if (lifecycle === 'CAMPAIGN') {
        mappedData.cta.candidate_registration = { label: "Lihat Profil Kandidat", url: "#candidates", open: true, style: "primary" };
      } else if (lifecycle === 'VOTING') {
        mappedData.cta.participant_registration = { label: "Masuk Voting", url: "/voting", open: true, style: "primary" };
      } else if (lifecycle === 'COMPLETED' || lifecycle === 'RESULT_PUBLICATION') {
        mappedData.cta.participant_registration = { label: "Lihat Hasil Musyawarah", url: "#result", open: true, style: "primary" };
      } else if (lifecycle === 'PUBLISHED') {
         mappedData.cta.participant_registration = { label: "Lihat Jadwal", url: "#timeline", open: true, style: "primary" };
      }

      return mappedData;
    } catch (error: unknown) {
      console.warn("API unavailable, falling back to seed data:", error);
      return landingSeed;
    }
  },
  async registerParticipant(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    const response = await publicApi.post('/public/register', data);
    return response.data.data;
  }
};
