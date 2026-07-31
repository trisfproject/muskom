export interface AttendanceFilters {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_direction?: string;
  attendance_status?: string;
  participant_id?: string;
  participant_name?: string;
  check_in_date?: string;
  verification_status?: string;
}

export interface AttendanceItem {
  registration_id: string;
  participant_name: string;
  institution: string;
  verification_status: string;
  attendance_status: string;
  checked_in_at?: string;
}

export interface AttendanceDetail {
  id: string;
  registration_id: string;
  checked_in_at: string;
  checked_in_by?: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  email: string;
  phone: string;
  institution: string;
}

export interface AttendanceSummary {
  total_participants: number;
  total_present: number;
  total_absent: number;
}
