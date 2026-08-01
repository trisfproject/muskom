export interface PublicEventDTO {
  name: string;
  theme?: string;
  location?: string;
  event_date?: string;
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
  start_date: string;
  end_date: string;
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

export interface HomeResponse {
  event: PublicEventDTO;
  settings: PublicSettingsDTO;
  timeline: PublicTimelineDTO[];
  currentPhase: PublicCurrentPhaseDTO;
  announcements: PublicAnnouncementDTO[];
  candidates: PublicCandidateDTO[];
}
