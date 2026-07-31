'use client';

import { MusyawarahEvent } from '@/types/event';
import { CheckCircle2, Circle, CalendarDays } from 'lucide-react';

interface TimelineSectionProps {
  event: MusyawarahEvent | null;
}

const formatDateRange = (start?: string, end?: string) => {
  if (!start) return 'TBA';
  const s = new Date(start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  if (!end) return s;
  const e = new Date(end).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${s} – ${e}`;
};

export function TimelineSection({ event }: TimelineSectionProps) {
  const now = new Date();

  // Add the additional steps requested: Pendaftaran, Verifikasi, Kampanye, Musyawarah, Voting, Pengumuman
  const phases = [
    {
      id: 'registration',
      label: 'Pendaftaran Peserta & Kandidat',
      description: 'Masa pendaftaran bagi anggota komunitas yang ingin berpartisipasi atau mencalonkan diri.',
      start: event?.registration_start,
      end: event?.registration_end,
      step: 1,
    },
    {
      id: 'verification',
      label: 'Verifikasi Berkas',
      description: 'Panitia melakukan verifikasi terhadap data peserta dan persyaratan kandidat ketua.',
      start: undefined, // Mock until API supports
      end: undefined,
      step: 2,
    },
    {
      id: 'campaign',
      label: 'Masa Kampanye',
      description: 'Kandidat yang lolos verifikasi menyampaikan visi, misi, dan program kerja.',
      start: undefined,
      end: undefined,
      step: 3,
    },
    {
      id: 'musyawarah',
      label: 'Sidang Musyawarah',
      description: 'Pelaksanaan sidang musyawarah secara luring maupun daring.',
      start: event?.voting_start,
      end: event?.voting_start,
      step: 4,
    },
    {
      id: 'voting',
      label: 'Pemungutan Suara (Voting)',
      description: 'Proses pemilihan ketua secara digital melalui portal resmi.',
      start: event?.voting_start,
      end: event?.voting_end,
      step: 5,
    },
    {
      id: 'announcement',
      label: 'Pengumuman Hasil',
      description: 'Penetapan dan pengumuman hasil pemilihan ketua baru.',
      start: event?.voting_end,
      end: event?.voting_end,
      step: 6,
    },
  ];

  return (
    <section id="timeline" className="py-24 bg-white relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Alur Pelaksanaan
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Rangkaian tahapan penyelenggaraan musyawarah dari awal hingga akhir.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical connector */}
          <div className="absolute left-6 top-8 bottom-8 w-px bg-slate-200 hidden sm:block" />

          <div className="space-y-8">
            {phases.map((phase) => {
              const start = phase.start ? new Date(phase.start) : null;
              const end = phase.end ? new Date(phase.end) : null;
              const isPast = end && now > end;
              const isActive = start && end && now >= start && now <= end;

              let dotColor = 'bg-slate-100 border-slate-200 text-slate-400';
              let cardStyle = 'bg-white border-slate-100 text-slate-900 hover:border-slate-200 hover:shadow-sm shadow-sm';
              let statusBadge = null;

              if (isActive) {
                dotColor = 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30';
                cardStyle = 'bg-emerald-50/50 border-emerald-200 shadow-md shadow-emerald-500/5';
                statusBadge = (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Berlangsung
                  </span>
                );
              } else if (isPast) {
                dotColor = 'bg-slate-800 border-slate-800 text-white';
                cardStyle = 'bg-slate-50 border-slate-100 text-slate-500 opacity-80';
                statusBadge = (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                    Selesai
                  </span>
                );
              } else {
                statusBadge = (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    Akan Datang
                  </span>
                );
              }

              return (
                <div key={phase.id} className="relative flex gap-8 sm:pl-0 pl-0 group">
                  {/* Step dot */}
                  <div className="hidden sm:flex flex-shrink-0 w-12 h-12 rounded-full items-center justify-center z-10 self-start mt-1 bg-white" >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors duration-300 ${dotColor}`}>
                      {isPast ? <CheckCircle2 className="w-5 h-5" /> : isActive ? <Circle className="w-4 h-4 fill-current animate-pulse" /> : phase.step}
                    </div>
                  </div>

                  {/* Card */}
                  <div className={`flex-1 p-6 md:p-8 rounded-3xl border transition-all duration-300 ${cardStyle}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <h3 className="font-bold text-xl mb-1">{phase.label}</h3>
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                          <CalendarDays className="w-4 h-4" />
                          <span>{formatDateRange(phase.start, phase.end)}</span>
                        </div>
                      </div>
                      <div className="shrink-0">{statusBadge}</div>
                    </div>
                    <p className={`text-sm leading-relaxed ${isActive ? 'text-slate-700' : 'text-slate-500'}`}>
                      {phase.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
