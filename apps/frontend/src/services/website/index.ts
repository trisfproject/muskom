import api from "@/lib/api";

export interface GeneralSettings {
  id?: string;
  site_name: string;
  tagline: string;
  theme: string;
  primary_color: string;
  secondary_color: string;
  default_light_theme: boolean;
  default_dark_theme: boolean;
  registration_enabled: boolean;
  maintenance_mode: boolean;
  seo_title: string;
  seo_description: string;
  seo_image_url: string;
  favicon_url: string;
}

export interface HeroSettings {
  id?: string;
  hero_badge: string;
  hero_title: string;
  hero_description: string;
  primary_cta_label: string;
  primary_cta_url: string;
  primary_cta_enabled: boolean;
  secondary_cta_label: string;
  secondary_cta_url: string;
  secondary_cta_enabled: boolean;
  background_mode: string;
  hero_status: string;
  is_published: boolean;
}

export interface TimelinePhase {
  id?: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  display_order: number;
  registration_type: "NONE" | "PARTICIPANT" | "CANDIDATE" | "BOTH";
  current_indicator: boolean;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Announcement {
  id?: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string;
  thumbnail_url: string;
  is_pinned: boolean;
  is_published: boolean;
  published_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface CandidateCMSSettings {
  id?: string;
  section_title: string;
  section_description: string;
  registration_status: string;
  empty_state_message: string;
  publication_message: string;
}

export interface FooterSettings {
  id?: string;
  organization_name: string;
  description: string;
  copyright: string;
  official_badge: string;
  tagline: string;
}

export const websiteService = {
  // General
  async getGeneral(): Promise<GeneralSettings> {
    const res = await api.get("/admin/website/general");
    return res.data.data;
  },
  async updateGeneral(data: GeneralSettings): Promise<GeneralSettings> {
    const res = await api.put("/admin/website/general", data);
    return res.data.data;
  },

  // Hero
  async getHero(): Promise<HeroSettings> {
    const res = await api.get("/admin/website/hero");
    return res.data.data;
  },
  async updateHero(data: HeroSettings): Promise<HeroSettings> {
    const res = await api.put("/admin/website/hero", data);
    return res.data.data;
  },

  // Timeline
  async getTimeline(): Promise<TimelinePhase[]> {
    const res = await api.get("/admin/website/timeline");
    return res.data.data;
  },
  async getTimelinePhase(id: string): Promise<TimelinePhase> {
    const res = await api.get(`/admin/website/timeline/${id}`);
    return res.data.data;
  },
  async createTimelinePhase(data: Partial<TimelinePhase>): Promise<TimelinePhase> {
    const res = await api.post("/admin/website/timeline", data);
    return res.data.data;
  },
  async updateTimelinePhase(id: string, data: Partial<TimelinePhase>): Promise<TimelinePhase> {
    const res = await api.put(`/admin/website/timeline/${id}`, data);
    return res.data.data;
  },
  async deleteTimelinePhase(id: string): Promise<void> {
    await api.delete(`/admin/website/timeline/${id}`);
  },
  async reorderTimeline(items: { id: string; display_order: number }[]): Promise<void> {
    await api.put("/admin/website/timeline/reorder", { items });
  },

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    const res = await api.get("/admin/website/announcements");
    return res.data.data;
  },
  async getAnnouncement(id: string): Promise<Announcement> {
    const res = await api.get(`/admin/website/announcements/${id}`);
    return res.data.data;
  },
  async createAnnouncement(data: Partial<Announcement>): Promise<Announcement> {
    const res = await api.post("/admin/website/announcements", data);
    return res.data.data;
  },
  async updateAnnouncement(id: string, data: Partial<Announcement>): Promise<Announcement> {
    const res = await api.put(`/admin/website/announcements/${id}`, data);
    return res.data.data;
  },
  async deleteAnnouncement(id: string): Promise<void> {
    await api.delete(`/admin/website/announcements/${id}`);
  },

  // Candidate CMS
  async getCandidateSettings(): Promise<CandidateCMSSettings> {
    const res = await api.get("/admin/website/candidate");
    return res.data.data;
  },
  async updateCandidateSettings(data: CandidateCMSSettings): Promise<CandidateCMSSettings> {
    const res = await api.put("/admin/website/candidate", data);
    return res.data.data;
  },

  // Footer
  async getFooter(): Promise<FooterSettings> {
    const res = await api.get("/admin/website/footer");
    return res.data.data;
  },
  async updateFooter(data: FooterSettings): Promise<FooterSettings> {
    const res = await api.put("/admin/website/footer", data);
    return res.data.data;
  },
};
