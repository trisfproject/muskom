// ============================================================================
// Public Landing Types & DTOs
// ============================================================================

export interface WebsiteGeneralDTO {
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

export interface WebsiteHeroDTO {
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

export interface PublicRegistrationCTA {
  label: string;
  url: string;
  open: boolean; // set by backend based on active timeline phase — frontend never calculates this
  style: "primary" | "outline"; // visual priority set by backend per active phase
}

export interface PublicCtaDTO {
  candidate_registration?: PublicRegistrationCTA;
  participant_registration?: PublicRegistrationCTA;
}

export interface PublicTimelineDTO {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  display_order?: number;
  registration_type?: string;
  status: "past" | "active" | "upcoming";
}

export interface PublicCurrentPhaseDTO {
  name: string;
  end_date?: string;
  is_active: boolean;
}

export interface PublicAnnouncementDTO {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string;
  thumbnail_url?: string;
  is_pinned: boolean;
  published_at?: string;
  created_at: string;
}

export interface WebsiteCandidateCMSDTO {
  section_title: string;
  section_description: string;
  registration_status: string;
  empty_state_message: string;
  publication_message: string;
}

export interface PublicCandidateDTO {
  id: string;
  sequence_number?: number;
  name?: string;
  title?: string;
  vision?: string;
  biography?: string;
  mission?: string;
  organization?: string;
  musyawarah_id?: string;
  photo_url?: string;
}

export interface WebsiteFooterDTO {
  organization_name: string;
  description: string;
  copyright: string;
  official_badge: string;
  tagline: string;
}

export interface HomeResponse {
  general: WebsiteGeneralDTO;
  hero: WebsiteHeroDTO;
  currentPhase: PublicCurrentPhaseDTO;
  countdown?: { target_date: string; label?: string };
  cta: PublicCtaDTO;
  timeline: PublicTimelineDTO[];
  announcements: PublicAnnouncementDTO[];
  candidate_cms: WebsiteCandidateCMSDTO;
  candidates: PublicCandidateDTO[];
  footer: WebsiteFooterDTO;
  event?: PublicEventDTO;
  settings?: PublicSettingsDTO;
}

// Backward compatibility helper if needed
export type PublicEventDTO = {
  id?: string;
  name: string;
  theme?: string;
  location?: string;
  event_date?: string;
  status: string;
  lifecycle_state?: string;
};
export type PublicSettingsDTO = {
  registration_approval_mode: string;
  show_candidate_list: boolean;
  show_timeline: boolean;
  show_announcements: boolean;
  participant_limit?: number;
  participant_count?: number;
};
