import { useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from './index';
import { attendanceKeys } from './queries';
import { CheckInRequest } from '@/types/attendance';
import { toast } from 'sonner';

export const useCheckInMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CheckInRequest) => attendanceService.checkIn(payload),
    onSuccess: (data) => {
      if (data.is_new) {
        toast.success('Check-in successful', {
          description: 'Participant has been checked in.',
        });
      } else {
        toast.info('Already checked in', {
          description: 'This participant was already checked in previously.',
        });
      }
      // Invalidate attendance lists to update real-time
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err?.response?.data?.message || 'Failed to check in participant';
      toast.error('Check-in failed', {
        description: message,
      });
    }
  });
};
