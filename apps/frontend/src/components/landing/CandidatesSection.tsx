'use client';

import Link from 'next/link';
import { User, ExternalLink, Hash } from 'lucide-react';

export interface CandidateCard {
  id: string;
  number: number;
  name: string;
  organization?: string;
  motto?: string;
  vision_summary?: string;
  photo_url?: string;
}

interface CandidatesSectionProps {
  candidates?: CandidateCard[];
}

function CandidateCardItem({ candidate }: { candidate: CandidateCard }) {
  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-emerald-200 hover:shadow-xl transition-all duration-300">
      {/* Photo area */}
      <div className="relative h-52 bg-gradient-to-br from-emerald-50 to-teal-100 overflow-hidden">
        {candidate.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={candidate.photo_url}
            alt={candidate.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-emerald-100 border-4 border-white shadow-md flex items-center justify-center">
              <User className="w-12 h-12 text-emerald-400" />
            </div>
          </div>
        )}
        {/* Number badge */}
        <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-lg">
          <Hash className="w-3 h-3 mr-0.5" />
          {candidate.number}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight">{candidate.name}</h3>

        {candidate.organization && (
          <p className="text-sm text-emerald-700 font-medium mb-3 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            {candidate.organization}
          </p>
        )}

        {candidate.motto && (
          <blockquote className="text-sm italic text-slate-500 border-l-2 border-emerald-200 pl-3 mb-4 line-clamp-2">
            &ldquo;{candidate.motto}&rdquo;
          </blockquote>
        )}

        {candidate.vision_summary && (
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4 flex-1">
            {candidate.vision_summary}
          </p>
        )}

        <Link
          href={`/candidates/${candidate.id}`}
          className="mt-auto inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-emerald-200 text-emerald-700 font-semibold text-sm hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200"
        >
          Lihat Profil Lengkap
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

// Placeholder candidates when no data is available (coming soon state)
const PLACEHOLDER_CANDIDATES: CandidateCard[] = [
  { id: '1', number: 1, name: 'Kandidat I', organization: 'Divisi A', motto: 'Bersama membangun komunitas yang lebih kuat', vision_summary: 'Visi dan misi kandidat akan segera diumumkan.' },
  { id: '2', number: 2, name: 'Kandidat II', organization: 'Divisi B', motto: 'Inovasi untuk komunitas yang lebih baik', vision_summary: 'Visi dan misi kandidat akan segera diumumkan.' },
  { id: '3', number: 3, name: 'Kandidat III', organization: 'Divisi C', motto: 'Kepemimpinan yang amanah dan transparan', vision_summary: 'Visi dan misi kandidat akan segera diumumkan.' },
];

export function CandidatesSection({ candidates }: CandidatesSectionProps) {
  const displayCandidates = (candidates && candidates.length > 0) ? candidates : null;
  const isPlaceholder = !displayCandidates;

  // Dynamic grid: 1 col for 1, 2 cols for 2, 3 cols for 3+
  const gridClass =
    displayCandidates && displayCandidates.length === 1
      ? 'grid-cols-1 max-w-sm mx-auto'
      : displayCandidates && displayCandidates.length === 2
      ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <section id="kandidat" className="py-24 bg-slate-50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-100">
            Calon Ketua
          </div>
          <h2 className="heading-xl text-slate-900 mb-4">
            Kandidat <span className="text-gradient">Ketua Komunitas</span>
          </h2>
          <p className="text-lg text-slate-600">
            Kenali para kandidat yang akan memimpin komunitas untuk periode berikutnya.
          </p>
        </div>

        {isPlaceholder ? (
          /* Coming soon state */
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Kandidat Belum Diumumkan</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Daftar kandidat ketua akan diumumkan setelah masa pendaftaran kandidat selesai. Pantau terus portal ini untuk informasi terbaru.
            </p>
          </div>
        ) : (
          <div className={`grid gap-6 ${gridClass}`}>
            {displayCandidates!.map((candidate) => (
              <CandidateCardItem key={candidate.id} candidate={candidate} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
