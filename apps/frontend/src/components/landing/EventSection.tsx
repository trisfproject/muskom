import Link from 'next/link';
import { Users, UserPlus, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { MusyawarahEvent } from '@/types/event';

interface EventSectionProps {
  event: MusyawarahEvent | null;
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

export function EventSection({ event }: EventSectionProps) {
  if (!event) return null;

  const now = new Date();

  const partStart = event.registration_start ? new Date(event.registration_start) : null;
  const partEnd = event.registration_end ? new Date(event.registration_end) : null;
  const isPartOpen = partStart && partEnd && now >= partStart && now <= partEnd;

  const candStart = event.candidate_registration_start ? new Date(event.candidate_registration_start) : null;
  const candEnd = event.candidate_registration_end ? new Date(event.candidate_registration_end) : null;
  const isCandOpen = event.allow_candidate_registration && candStart && candEnd && now >= candStart && now <= candEnd;

  return (
    <section id="pendaftaran" className="py-24 bg-white border-t border-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-100">
            Pendaftaran
          </div>
          <h2 className="heading-xl text-slate-900 mb-4">
            Status <span className="text-gradient">Pendaftaran</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Daftarkan diri Anda sebagai peserta atau kandidat sesuai periode yang tersedia.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Participant Registration */}
          <RegistrationCard
            icon={Users}
            title="Pendaftaran Peserta"
            description="Daftar sebagai peserta untuk hadir, mengikuti, dan memberikan suara dalam musyawarah."
            isOpen={!!isPartOpen}
            startDate={partStart ? formatDate(partStart.toISOString()) : null}
            endDate={partEnd ? formatDate(partEnd.toISOString()) : null}
            quota={event.max_participants}
            ctaLabel="Daftar sebagai Peserta"
            ctaHref="/register"
            colorScheme="emerald"
            disabledReason={
              !isPartOpen && partStart && now < partStart
                ? 'Pendaftaran belum dibuka'
                : !isPartOpen
                ? 'Pendaftaran telah ditutup'
                : undefined
            }
          />

          {/* Candidate Registration */}
          <RegistrationCard
            icon={UserPlus}
            title="Pendaftaran Kandidat"
            description="Ajukan pencalonan diri sebagai ketua dengan menyertakan profil, visi, misi, dan program kerja."
            isOpen={!!isCandOpen}
            startDate={candStart ? formatDate(candStart.toISOString()) : null}
            endDate={candEnd ? formatDate(candEnd.toISOString()) : null}
            ctaLabel="Daftar sebagai Kandidat"
            ctaHref="/register/candidate"
            colorScheme="purple"
            disabledReason={
              !event.allow_candidate_registration
                ? 'Pendaftaran kandidat tidak dibuka'
                : !isCandOpen && candStart && now < candStart
                ? 'Pendaftaran belum dibuka'
                : !isCandOpen
                ? 'Pendaftaran telah ditutup'
                : undefined
            }
          />
        </div>
      </div>
    </section>
  );
}

interface RegistrationCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  isOpen: boolean;
  startDate: string | null;
  endDate: string | null;
  quota?: number;
  ctaLabel: string;
  ctaHref: string;
  colorScheme: 'emerald' | 'purple';
  disabledReason?: string;
}

const colorMap = {
  emerald: {
    iconBg: 'bg-emerald-100 text-emerald-600',
    activeBorder: 'border-emerald-200 ring-1 ring-emerald-300',
    cta: 'gradient-primary text-white shadow-lg shadow-emerald-500/20 hover:opacity-90',
  },
  purple: {
    iconBg: 'bg-purple-100 text-purple-600',
    activeBorder: 'border-purple-200 ring-1 ring-purple-300',
    cta: 'bg-purple-600 text-white shadow-lg shadow-purple-500/20 hover:bg-purple-700',
  },
};

function RegistrationCard({
  icon: Icon,
  title,
  description,
  isOpen,
  startDate,
  endDate,
  quota,
  ctaLabel,
  ctaHref,
  colorScheme,
  disabledReason,
}: RegistrationCardProps) {
  const c = colorMap[colorScheme];

  return (
    <div
      className={`flex flex-col bg-white rounded-2xl border p-7 transition-all duration-300 ${
        isOpen ? c.activeBorder : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Top */}
      <div className="flex items-center justify-between mb-5">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
        {isOpen ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Dibuka
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 text-slate-500 text-xs font-bold border border-slate-200">
            <XCircle className="w-3.5 h-3.5" />
            Ditutup
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm mb-5 leading-relaxed">{description}</p>

      {/* Meta */}
      <div className="space-y-2 mb-6 text-sm">
        <div className="flex justify-between items-center py-2 border-b border-slate-100">
          <span className="text-slate-400 font-medium">Mulai</span>
          <span className="font-semibold text-slate-700">{startDate ?? 'TBA'}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-slate-100">
          <span className="text-slate-400 font-medium">Tutup</span>
          <span className="font-semibold text-slate-700">{endDate ?? 'TBA'}</span>
        </div>
        {quota && (
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-400 font-medium">Kuota</span>
            <span className="font-semibold text-slate-700">{quota} peserta</span>
          </div>
        )}
      </div>

      {/* CTA */}
      {isOpen ? (
        <Link
          href={ctaHref}
          className={`mt-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${c.cta}`}
        >
          {ctaLabel}
          <ArrowRight className="w-4 h-4" />
        </Link>
      ) : (
        <div className="mt-auto">
          {disabledReason && (
            <p className="text-xs text-slate-400 text-center mb-2">{disabledReason}</p>
          )}
          <div className="w-full text-center py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 font-semibold text-sm cursor-not-allowed">
            Pendaftaran Ditutup
          </div>
        </div>
      )}
    </div>
  );
}
