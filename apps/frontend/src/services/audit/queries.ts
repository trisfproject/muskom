import { useQuery } from '@tanstack/react-query';
import api from '@/lib/public-api';
import { AuditEntry, AuditFilter } from './types';

export function useAuditSearch(filters: AuditFilter) {
  const queryFn = async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    
    const res = await api.get(`/admin/audit?${params.toString()}`);
    return {
      items: res.data.items as AuditEntry[],
      total: res.data.total as number,
    };
  };

  return useQuery({
    queryKey: ['audit', 'search', filters],
    queryFn,
  });
}
