'use client';

import { MusyawarahEvent } from '@/types/event';
import { differenceInDays } from 'date-fns';

interface StatsSectionProps {
  event: MusyawarahEvent | null;
}

export function StatsSection({ event }: StatsSectionProps) {
  // Use real data if available, fallback to mock/dynamic calculations
  const totalParticipants = event?.stats?.total_participants || 452;
  const totalCandidates = event?.stats?.total_candidates || 3;
  
  // Calculate days to event based on event date
  let daysToEvent = 0;
  if (event?.start_date) {
    const start = new Date(event.start_date);
    const now = new Date();
    daysToEvent = differenceInDays(start, now);
    if (daysToEvent < 0) daysToEvent = 0;
  } else {
    daysToEvent = 14; // Fallback
  }
  
  const communityAge = 5; // e.g. 5 Tahun (Mock data until API provides it)

  return (
    <section className="py-20 bg-white relative overflow-hidden" id="statistik">
      <div className="absolute inset-0 bg-slate-50/50"></div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
          
          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <span className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2">
              {totalParticipants}
            </span>
            <span className="text-sm md:text-base font-medium text-slate-500 uppercase tracking-wider text-center">
              Peserta Terdaftar
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <span className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2">
              {totalCandidates}
            </span>
            <span className="text-sm md:text-base font-medium text-slate-500 uppercase tracking-wider text-center">
              Kandidat Ketua
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-6 bg-emerald-500 rounded-3xl shadow-lg shadow-emerald-500/20 text-white transform hover:-translate-y-1 transition-transform">
            <span className="text-4xl md:text-5xl font-extrabold mb-2">
              {daysToEvent}
            </span>
            <span className="text-sm md:text-base font-semibold uppercase tracking-wider text-center text-emerald-50">
              Hari Menuju Acara
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <span className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2">
              {communityAge}
            </span>
            <span className="text-sm md:text-base font-medium text-slate-500 uppercase tracking-wider text-center">
              Tahun Komunitas
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}
