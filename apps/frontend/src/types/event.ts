export type EventPhase = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export type LifecycleState = 
  | 'DRAFT' 
  | 'PREPARATION' 
  | 'PARTICIPANT_REGISTRATION' 
  | 'PARTICIPANT_VERIFICATION' 
  | 'CANDIDATE_REGISTRATION' 
  | 'CANDIDATE_VERIFICATION' 
  | 'CANDIDATE_PUBLICATION' 
  | 'CAMPAIGN' 
  | 'COOLING_DOWN' 
  | 'ATTENDANCE' 
  | 'VOTING' 
  | 'RESULT_PUBLICATION' 
  | 'COMPLETED' 
  | 'ARCHIVED';

export interface MusyawarahEvent {
  id?: string;
  name: string;
  slug: string;
  theme?: string;
  tagline?: string;
  description?: string;
  year?: number;
  start_date?: string;
  end_date?: string;
  timezone?: string;
  venue?: string;
  address?: string;
  google_maps_url?: string;
  city?: string;
  province?: string;
  meeting_type?: string;
  location?: string;
  banner_path?: string;
  logo_path?: string;
  cover_path?: string;
  status: EventPhase;
  lifecycle_state?: LifecycleState;
  max_participants?: number;
  publish_result: boolean;
  allow_candidate_registration: boolean;
  stats?: {
    total_participants?: number;
    total_candidates?: number;
  };

  registration_start?: string;
  registration_end?: string;
  candidate_registration_start?: string;
  candidate_registration_end?: string;
  voting_start?: string;
  voting_end?: string;
}

export type UpdateEventPayload = Omit<MusyawarahEvent, 'id' | 'cover_path'>;
