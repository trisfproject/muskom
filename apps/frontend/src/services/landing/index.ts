import publicApi from '@/lib/public-api';
import { HomeResponse } from '@/types/landing';

export const landingService = {
  async getPublicHome(): Promise<HomeResponse | null> {
    try {
      const response = await publicApi.get('/public/home');
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 401 || err.response?.status === 404 || err.response?.status === 403) {
        return null;
      }
      throw error;
    }
  }
};
