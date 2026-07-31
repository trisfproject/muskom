'use client';

import { useQuery } from '@tanstack/react-query';
import { landingService } from '@/services/landing';
import { ArrowRight, Building2, Quote, User } from 'lucide-react';
import Link from 'next/link';

export function CandidatesSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['public-candidates'],
    queryFn: landingService.getPublicCandidates,
    staleTime: 60 * 1000 * 5, // 5 minutes
    gcTime: 60 * 1000 * 30, // 30 minutes
    retry: 1,
  });

  const candidates = data || [];

  if (isLoading || candidates.length === 0) return null;

  return (
    <section id="kandidat" className="py-24 bg-slate-50 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Kandidat Ketua
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Mengenal lebih dekat para calon pemimpin yang akan membawa arah baru komunitas kita.
          </p>
        </div>

        {/* Candidates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {candidates.map((candidate) => (
            <div 
              key={candidate.id} 
              className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 overflow-hidden flex flex-col h-full"
            >
              {/* Image Area */}
              <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                {candidate.photo_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={candidate.photo_url}
                    alt={candidate.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                    <User size={80} strokeWidth={1} />
                  </div>
                )}
                
                {/* Number Badge */}
                <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl font-black text-slate-900 shadow-md">
                  {candidate.number}
                </div>
              </div>

              {/* Content Area */}
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">
                  {candidate.name}
                </h3>
                
                <div className="flex items-center gap-2 text-emerald-600 font-medium text-sm mb-6">
                  <Building2 size={16} />
                  <span>{candidate.organization || 'Delegasi Mandiri'}</span>
                </div>

                <div className="relative mb-6">
                  <Quote size={24} className="absolute -top-2 -left-2 text-slate-100 rotate-180" />
                  <p className="text-slate-600 font-medium italic relative z-10 text-sm leading-relaxed pl-4 border-l-2 border-emerald-100">
                    &quot;{candidate.motto || 'Membangun komunitas yang lebih baik bersama-sama.'}&quot;
                  </p>
                </div>

                {/* Visi Summary (mocking it if not strictly short) */}
                <div className="mb-8 flex-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Ringkasan Visi</h4>
                  <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                    {candidate.vision || 'Berkomitmen untuk mewujudkan komunitas yang inklusif, inovatif, dan berdaya saing global melalui kolaborasi aktif seluruh anggota.'}
                  </p>
                </div>

                {/* CTA */}
                <Link 
                  href={`/candidates/${candidate.id}`}
                  className="mt-auto flex items-center justify-center gap-2 w-full py-4 bg-slate-50 text-slate-900 font-semibold rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-colors duration-300"
                >
                  Lihat Profil Lengkap
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
