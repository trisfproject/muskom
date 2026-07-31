export type EventPhase = 'DRAFT' | 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface MusyawarahEvent {
  id?: string;
  name: string;
  theme?: string;
  location?: string;
  banner_path?: string;
  logo_path?: string;
  cover_path?: string;
  status: EventPhase;
  max_participants?: number;
  publish_result: boolean;
  allow_candidate_registration: boolean;

  registration_start?: string;
  registration_end?: string;
  candidate_registration_start?: string;
  candidate_registration_end?: string;
  voting_start?: string;
  voting_end?: string;
}

export type UpdateEventPayload = Omit<MusyawarahEvent, 'id' | 'cover_path'>;
