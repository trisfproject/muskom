export type MusyawarahStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export type MusyawarahLifecycle =
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
  | 'ARCHIVED'
  | 'PUBLISHED';

export interface MusyawarahListItem {
  id: string;
  name: string;
  slug: string;
  theme?: string;
  period_start?: string;
  period_end?: string;
  event_date?: string;
  status: MusyawarahStatus;
  is_active: boolean;
  created_at: string;
}

export interface Musyawarah {
  id: string;
  name: string;
  slug: string;
  theme?: string;
  description?: string;
  period_start?: string;
  period_end?: string;
  event_date?: string;
  registration_open?: string;
  registration_close?: string;
  candidate_registration_open?: string;
  candidate_registration_close?: string;
  location_name?: string;
  address?: string;
  google_maps_url?: string;
  banner_path?: string;
  logo_path?: string;
  cover_path?: string;
  status: MusyawarahStatus;
  is_active: boolean;
  lifecycle_state?: MusyawarahLifecycle;
  created_at: string;
  updated_at: string;
}

export type CreateMusyawarahPayload = {
  name: string;
  slug: string;
  theme?: string;
  description?: string;
  period_start?: string;
  period_end?: string;
  event_date?: string;
  registration_open?: string;
  registration_close?: string;
  candidate_registration_open?: string;
  candidate_registration_close?: string;
  location_name?: string;
  address?: string;
  google_maps_url?: string;
};

export type UpdateMusyawarahPayload = Omit<Musyawarah, 'id' | 'cover_path' | 'lifecycle_state' | 'created_at' | 'updated_at' | 'is_active' | 'banner_path' | 'logo_path'> & {
  banner_path?: string;
  logo_path?: string;
};
