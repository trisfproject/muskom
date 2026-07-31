import { MusyawarahEvent } from '@/types/event';
import { CheckCircle2, Clock, Circle, CalendarDays } from 'lucide-react';

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

  const phases = [
    {
      id: 'registration',
      label: 'Pendaftaran Peserta',
      description: 'Anggota komunitas mendaftarkan diri sebagai peserta musyawarah.',
      start: event?.registration_start,
      end: event?.registration_end,
      step: 1,
    },
    {
      id: 'candidate',
      label: 'Pendaftaran Kandidat',
      description: 'Calon ketua mendaftarkan diri beserta visi, misi, dan program kerja.',
      start: event?.candidate_registration_start,
      end: event?.candidate_registration_end,
      step: 2,
    },
    {
      id: 'voting',
      label: 'Musyawarah & Pemilihan',
      description: 'Pelaksanaan musyawarah dan pemungutan suara secara digital.',
      start: event?.voting_start,
      end: event?.voting_end,
      step: 3,
    },
  ];

  return (
    <section id="timeline" className="py-24 bg-white border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-100">
            <CalendarDays className="w-4 h-4" />
            Jadwal Kegiatan
          </div>
          <h2 className="heading-xl text-slate-900 mb-4">
            Alur <span className="text-gradient">Musyawarah</span>
          </h2>
          <p className="text-lg text-slate-600">
            Pantau setiap tahapan pelaksanaan Musyawarah Komunitas.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical connector */}
          <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-emerald-300 via-emerald-200 to-slate-200 hidden sm:block" />

          <div className="space-y-6">
            {phases.map((phase, index) => {
              const start = phase.start ? new Date(phase.start) : null;
              const end = phase.end ? new Date(phase.end) : null;
              const isPast = end && now > end;
              const isActive = start && end && now >= start && now <= end;

              let statusColor = 'bg-white border-slate-200 text-slate-400';
              let dotBg = 'bg-white border-2 border-slate-200';
              let cardBg = 'bg-white border-slate-100';
              let labelColor = 'text-slate-700';
              let statusBadge = null;

              if (isActive) {
                statusColor = 'bg-emerald-600 text-white border-emerald-600';
                dotBg = 'bg-emerald-600 border-emerald-600 shadow-lg shadow-emerald-200';
                cardBg = 'bg-emerald-50 border-emerald-200';
                labelColor = 'text-emerald-900';
                statusBadge = (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Sedang Berlangsung
                  </span>
                );
              } else if (isPast) {
                statusColor = 'bg-slate-700 text-white border-slate-700';
                dotBg = 'bg-slate-400 border-slate-400';
                statusBadge = (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    Selesai
                  </span>
                );
              } else {
                statusBadge = (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
                    <Clock className="w-3 h-3" />
                    Akan Datang
                  </span>
                );
              }

              return (
                <div key={phase.id} className="relative flex gap-6 sm:pl-0 pl-0">
                  {/* Step dot */}
                  <div className="hidden sm:flex flex-shrink-0 w-12 h-12 rounded-full items-center justify-center z-10 self-start mt-3" >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border-2 ${statusColor}`}>
                      {isPast ? <CheckCircle2 className="w-5 h-5" /> : isActive ? <Circle className="w-4 h-4 fill-current animate-pulse" /> : phase.step}
                    </div>
                  </div>

                  {/* Card */}
                  <div className={`flex-1 p-6 rounded-2xl border transition-all duration-300 ${cardBg}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className={`font-bold text-lg ${labelColor}`}>{phase.label}</h3>
                        <p className="text-emerald-700 text-sm font-medium mt-0.5">
                          {formatDateRange(phase.start, phase.end)}
                        </p>
                      </div>
                      {statusBadge}
                    </div>
                    <p className="text-slate-600 text-sm">{phase.description}</p>
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
