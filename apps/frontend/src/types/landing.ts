export interface PublicEventDTO {
  name: string;
  theme?: string;
  location?: string;
  mapsUrl?: string;
  event_date?: string;
  event_time?: string;
  status: string;
}

export interface PublicSettingsDTO {
  registration_approval_mode: string;
  show_candidate_list: boolean;
  show_timeline: boolean;
  show_announcements: boolean;
}

export interface PublicTimelineDTO {
  id: string;
  title: string;
  description?: string;
  date?: string;
  start_date: string;
  end_date: string;
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
  content: string;
  published_at?: string;
  created_at: string;
}

export interface PublicCandidateDTO {
  id: string;
  sequence_number?: number;
  name?: string;
  title?: string;
  vision?: string;
  photo_url?: string;
}

export interface PublicFaqDTO {
  question: string;
  answer: string;
}

export interface PublicCtaDTO {
  primary?: { label: string; url: string; style?: string };
  secondary?: { label: string; url: string; style?: string };
}

export interface PublicFooterDTO {
  email: string;
  whatsapp: string;
  whatsapp_url: string;
  address: string;
  copyright: string;
  tagline: string;
  links: Array<{ label: string; url: string }>;
  socials: Array<{ platform: string; url: string }>;
}

export interface HomeResponse {
  event: PublicEventDTO;
  settings: PublicSettingsDTO;
  timeline: PublicTimelineDTO[];
  currentPhase: PublicCurrentPhaseDTO;
  countdown?: { target_date: string; label?: string };
  announcements: PublicAnnouncementDTO[];
  candidates: PublicCandidateDTO[];
  faq: PublicFaqDTO[];
  cta: PublicCtaDTO;
  footer: PublicFooterDTO;
}
