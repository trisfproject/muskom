import { useQuery } from '@tanstack/react-query';
import api from '@/lib/public-api';
import { AttendanceItem, AttendanceFilters, AttendanceSummary } from './types';
import { defaultPollingProvider } from '@/providers/PollingProvider';
import { useEffect } from 'react';

export function useAttendanceSearch(filters: AttendanceFilters) {
  const queryFn = async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    
    const res = await api.get(`/admin/attendance?${params.toString()}`);
    return {
      items: res.data.items as AttendanceItem[],
      total: res.data.total as number,
    };
  };

  const query = useQuery({
    queryKey: ['attendance', 'search', filters],
    queryFn,
  });

  // Enable Polling via LiveProvider abstraction
  useEffect(() => {
    defaultPollingProvider.connect();
    const unsubscribe = defaultPollingProvider.subscribe('attendance_search', () => {
      query.refetch();
    });
    return () => unsubscribe();
  }, [query]);

  return query;
}

export function useAttendanceSummary(eventId?: string) {
  const queryFn = async () => {
    if (!eventId) return null;
    const res = await api.get(`/admin/attendance/summary?event_id=${eventId}`);
    return res.data as AttendanceSummary;
  };

  const query = useQuery({
    queryKey: ['attendance', 'summary', eventId],
    queryFn,
    enabled: !!eventId,
  });

  useEffect(() => {
    defaultPollingProvider.connect();
    const unsubscribe = defaultPollingProvider.subscribe('attendance_summary', () => {
      query.refetch();
    });
    return () => unsubscribe();
  }, [query]);

  return query;
}
