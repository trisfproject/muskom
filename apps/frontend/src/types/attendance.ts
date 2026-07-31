export interface AttendanceItemResponse {
  registration_id: string;
  participant_name: string;
  institution: string;
  verification_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  attendance_status: 'PRESENT' | 'ABSENT';
  checked_in_at?: string;
}

export interface AttendanceDetailResponse {
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

export interface AttendanceListRequest {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  attendance_status?: string;
  participant_id?: string;
  participant_name?: string;
  check_in_date?: string;
  verification_status?: string;
}

export interface CheckInRequest {
  registration_id: string;
}

export interface CheckInResponse {
  success: boolean;
  is_new: boolean;
}

export interface PaginatedAttendanceResponse {
  items: AttendanceItemResponse[];
  total: number;
}
