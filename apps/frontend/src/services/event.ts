import api from '@/lib/api';
import { MusyawarahEvent, UpdateEventPayload } from '@/types/event';

export const eventService = {
  async getEvent(): Promise<MusyawarahEvent | null> {
    try {
      const response = await api.get('/admin/musyawarah');
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async updateEvent(payload: UpdateEventPayload): Promise<MusyawarahEvent> {
    const response = await api.put('/admin/musyawarah', payload);
    return response.data.data;
  }
};
