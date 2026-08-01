import publicApi from '@/lib/public-api';
import { HomeResponse } from '@/types/landing';
import { landingSeed } from '@/data/landing-seed';

export const landingService = {
  async getPublicHome(): Promise<HomeResponse | null> {
    try {
      const response = await publicApi.get('/public/home');
      return response.data.data;
    } catch (error: unknown) {
      // Fallback to CMS-ready seed data if API is unavailable or returns 404
      console.warn("API unavailable, falling back to seed data:", error);
      return landingSeed;
    }
  },
  async registerParticipant(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    const response = await publicApi.post('/public/register', data);
    return response.data.data;
  }
};
