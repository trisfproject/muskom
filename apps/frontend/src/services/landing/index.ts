import publicApi from '@/lib/public-api';
import { HomeResponse } from '@/types/landing';
import { landingSeed } from '@/data/landing-seed';

export const landingService = {
  async getPublicHome(): Promise<HomeResponse | null> {
    try {
      // Use native fetch to leverage Next.js Data Cache in Server Components
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
      const res = await fetch(`${baseUrl}/public/home`, {
        next: { revalidate: 60 } // ISR Cache: 60 seconds
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
      }
      
      const json = await res.json();
      return json.data;
    } catch (error: unknown) {
      console.warn("API unavailable, falling back to seed data:", error);
      return landingSeed;
    }
  },
  async registerParticipant(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    const response = await publicApi.post('/public/register', data);
    return response.data.data;
  }
};
