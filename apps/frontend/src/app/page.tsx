import { Metadata } from 'next';
import publicApi from '@/lib/public-api';
import { MusyawarahEvent } from '@/types/event';
import LandingPageClient from './LandingPageClient';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const response = await publicApi.get('/admin/musyawarah');
    const event: MusyawarahEvent = response.data.data;
    
    if (event.status === 'UPCOMING' || event.status === 'ONGOING') {
      return {
        title: `${event.name} | Official Portal`,
        description: event.theme || 'Official Musyawarah Portal for Registration and Electronic Voting.',
        openGraph: {
          title: event.name,
          description: event.theme || 'Official Musyawarah Portal',
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title: event.name,
          description: event.theme || 'Official Musyawarah Portal',
        }
      };
    }
  } catch {
    // Fail silently, use defaults
  }
  
  return {
    title: 'Musyawarah KOMITKABE | Official Portal',
    description: 'Official Musyawarah Portal for Registration and Electronic Voting.',
  };
}

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <LandingPageClient />
    </main>
  );
}
