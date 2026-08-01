// Registration CTA — two independent workflows, gated by backend timeline
export interface PublicRegistrationCTA {
  label: string;
  url: string;
  open: boolean; // set by backend based on active timeline phase — frontend never calculates this
}

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

// CTA: two independent registration workflows — Participant and Candidate
export interface PublicCtaDTO {
  participant_registration?: PublicRegistrationCTA;
  candidate_registration?: PublicRegistrationCTA;
}

// Footer: minimal — navigation, contact, copyright only
// Legal, Social Media, and Admin Access are permanently removed (ADR 0006)
export interface PublicFooterDTO {
  email: string;
  whatsapp: string;
  whatsapp_url: string;
  address: string;
  copyright: string;
  tagline: string;
}

export interface HomeResponse {
  event: PublicEventDTO;
  settings: PublicSettingsDTO;
  timeline: PublicTimelineDTO[];
  currentPhase: PublicCurrentPhaseDTO;
  countdown?: { target_date: string; label?: string };
  announcements: PublicAnnouncementDTO[];
  candidates: PublicCandidateDTO[];
  cta: PublicCtaDTO;
  footer: PublicFooterDTO;
}
