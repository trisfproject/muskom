import publicApi from '@/lib/public-api';
import { MusyawarahEvent } from '@/types/event';

export const landingService = {
  async getPublicEvent(): Promise<MusyawarahEvent | null> {
    try {
      // We are forced to hit the admin endpoint since there is no public endpoint.
      // Unauthenticated users will receive a 401, which publicApi will reject silently,
      // and we catch it here to return null (triggering the Empty State).
      const response = await publicApi.get('/admin/musyawarah');
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      // 401 Unauthorized (expected for guests), 404 Not Found (no event created)
      if (err.response?.status === 401 || err.response?.status === 404 || err.response?.status === 403) {
        return null;
      }
      throw error;
    }
  }
};
