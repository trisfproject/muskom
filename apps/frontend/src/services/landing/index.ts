import publicApi from '@/lib/public-api';
import { HomeResponse } from '@/types/landing';
export const landingService = {
  async getPublicHome(): Promise<HomeResponse | null> {
    try {
      const isServer = typeof window === 'undefined';
      const baseUrl = isServer
        ? process.env.INTERNAL_API_URL || 'http://api:8080/api/v1'
        : process.env.NEXT_PUBLIC_API_URL || '/api/v1';
      const res = await fetch(`${baseUrl}/public/home`, {
        cache: 'no-store'
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
      }
      
      const json = await res.json();
      const apiData = json.data;
      
      let eventData = apiData?.event;
      if (!eventData) {
        try {
          const musyRes = await fetch(`${baseUrl}/public/musyawarah`, { cache: 'no-store' });
          if (musyRes.ok) {
            const musyJson = await musyRes.json();
            eventData = musyJson.data;
          }
        } catch (e) {
          // ignore error, fail gracefully
        }
      }

      // Transform API response to match frontend HomeResponse structure and inject lifecycle logic
      const lifecycle = eventData?.lifecycle_state || 'PREPARATION';
      const mappedData = {
        ...apiData,
        hero: apiData?.hero || {
          hero_badge: "Welcome",
          hero_title: "MUSKOM 2026",
          hero_description: "Musyawarah Komisariat",
          primary_cta_label: "Daftar",
          primary_cta_url: "/register",
          primary_cta_enabled: false,
          secondary_cta_label: "Info",
          secondary_cta_url: "#",
          secondary_cta_enabled: false,
          background_mode: "default",
          hero_status: "ACTIVE",
          is_published: true,
        },
        footer: apiData?.footer || {
          organization_name: "MUSKOM",
          description: "Musyawarah Komisariat",
          copyright: "2026 MUSKOM",
          official_badge: "Official",
          tagline: "Together we build",
        },
        countdown: apiData?.countdown,
        currentPhase: {
          name: apiData?.currentPhase?.name || "Belum Ada Jadwal",
          end_date: apiData?.currentPhase?.end_date,
          is_active: apiData?.currentPhase?.is_active || false,
        },
        event: eventData, // Include event for downstream use
      } as HomeResponse;

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
      console.error("API request failed:", error);
      throw new Error("Gagal memuat data dari server. Pastikan API berjalan dengan baik.");
    }
  },
  async registerParticipant(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    const response = await publicApi.post('/public/register', data);
    return response.data.data;
  }
};
