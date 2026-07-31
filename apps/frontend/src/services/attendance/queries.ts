import { useQuery } from '@tanstack/react-query';
import { attendanceService } from './index';
import { AttendanceListRequest } from '@/types/attendance';

export const attendanceKeys = {
  all: ['attendances'] as const,
  lists: () => [...attendanceKeys.all, 'list'] as const,
  list: (params: AttendanceListRequest) => [...attendanceKeys.lists(), params] as const,
  details: () => [...attendanceKeys.all, 'detail'] as const,
  detail: (id: string) => [...attendanceKeys.details(), id] as const,
};

export const useAttendances = (params: AttendanceListRequest) => {
  return useQuery({
    queryKey: attendanceKeys.list(params),
    queryFn: () => attendanceService.getAttendances(params),
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useAttendanceDetail = (id: string, enabled = true) => {
  return useQuery({
    queryKey: attendanceKeys.detail(id),
    queryFn: () => attendanceService.getAttendanceDetail(id),
    enabled: !!id && enabled,
    staleTime: 1000 * 30, // 30 seconds
  });
};
