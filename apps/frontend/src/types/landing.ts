import { MusyawarahEvent } from '@/types/event';

export interface TimelinePhase {
  id: string;
  name: string;
  start_at: string | null;
  end_at: string | null;
  is_active: boolean;
  is_past: boolean;
}

export interface RegistrationStatusInfo {
  isOpen: boolean;
  startDate: string | null;
  endDate: string | null;
  quota?: number;
}

export interface LandingPageData {
  event: MusyawarahEvent;
  timeline: TimelinePhase[];
  participantRegistration: RegistrationStatusInfo;
  candidateRegistration: RegistrationStatusInfo;
}
