import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function useOperationsDashboard() {
  return useQuery({
    queryKey: ['operations-dashboard'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard/operations');
      return res.data?.data ?? res.data;
    },
    refetchInterval: 30000, // Auto refresh every 30 seconds
  });
}
