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
      
      const mappedData: HomeResponse = {
        general: apiData?.general || {
          site_name: "MUSKOM 2026",
          tagline: "Musyawarah Komisariat",
          theme: "modern-tech",
          primary_color: "#2563eb",
          secondary_color: "#64748b",
          default_light_theme: true,
          default_dark_theme: false,
          registration_enabled: true,
          maintenance_mode: false,
          seo_title: "MUSKOM 2026",
          seo_description: "Musyawarah Komisariat 2026",
          seo_image_url: "",
          favicon_url: "",
        },
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
          copyright: "© 2026 MUSKOM",
          official_badge: "Official",
          tagline: "Together we build",
        },
        countdown: apiData?.countdown,
        currentPhase: {
          name: apiData?.currentPhase?.name || "Belum Ada Jadwal",
          end_date: apiData?.currentPhase?.end_date,
          is_active: apiData?.currentPhase?.is_active || false,
        },
        cta: apiData?.cta || {
          participant_registration: { label: "Daftar Peserta", url: "/register", open: false, style: "outline" },
          candidate_registration: { label: "Daftar Calon", url: "/register/candidate", open: false, style: "outline" },
        },
        timeline: apiData?.timeline || [],
        announcements: apiData?.announcements || [],
        candidate_cms: apiData?.candidate_cms || {
          section_title: "Bursa Calon",
          section_description: "Daftar Bakal Calon Ketua Umum",
          registration_status: "PENJARINGAN",
          empty_state_message: "Belum ada kandidat terdaftar.",
          publication_message: "",
        },
        candidates: apiData?.candidates || [],
        settings: apiData?.settings,
      };

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
