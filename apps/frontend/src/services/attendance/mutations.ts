import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (registrationId: string) => {
      const res = await api.post('/admin/attendance/check-in', {
        registration_id: registrationId,
      });
      return res.data?.data ?? res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
}

export function useUndoCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ checkInId, notes }: { checkInId: string; notes: string }) => {
      const res = await api.delete(`/admin/attendance/${checkInId}`, {
        data: { notes },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
}
