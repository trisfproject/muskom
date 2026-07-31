import api from '@/lib/api';
import { ApiResponse } from '@/types/api';
import { 
  AttendanceListRequest, 
  PaginatedAttendanceResponse, 
  AttendanceDetailResponse,
  CheckInRequest,
  CheckInResponse
} from '@/types/attendance';

export const attendanceService = {
  getAttendances: async (params: AttendanceListRequest): Promise<PaginatedAttendanceResponse> => {
    const { data } = await api.get<ApiResponse<PaginatedAttendanceResponse>>('/api/v1/admin/attendance', { params });
    return data.data;
  },

  getAttendanceDetail: async (id: string): Promise<AttendanceDetailResponse> => {
    const { data } = await api.get<ApiResponse<AttendanceDetailResponse>>(`/api/v1/admin/attendance/${id}`);
    return data.data;
  },

  checkIn: async (payload: CheckInRequest): Promise<CheckInResponse> => {
    const { data } = await api.post<ApiResponse<CheckInResponse>>('/api/v1/admin/attendance/check-in', payload);
    return data.data;
  }
};
