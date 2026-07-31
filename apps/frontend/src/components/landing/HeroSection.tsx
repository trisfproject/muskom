'use client';

import Link from 'next/link';
import { ArrowRight, Users, ChevronDown, MapPin, CalendarDays, Activity } from 'lucide-react';
import { MusyawarahEvent } from '@/types/event';
import { useEffect, useState } from 'react';

interface HeroSectionProps {
  event: MusyawarahEvent | null;
}

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  return (
    <div className="inline-flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl">
      {[
        { label: 'Hari', value: timeLeft.days },
        { label: 'Jam', value: timeLeft.hours },
        { label: 'Menit', value: timeLeft.minutes },
        { label: 'Detik', value: timeLeft.seconds },
      ].map(({ label, value }, i) => (
        <div key={label} className="flex items-center gap-4">
          <div className="flex flex-col items-center min-w-[3rem]">
            <span className="text-2xl font-bold text-white tabular-nums tracking-tight">
              {String(value).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-1">
              {label}
            </span>
          </div>
          {i < 3 && <div className="w-px h-8 bg-white/10" />}
        </div>
      ))}
    </div>
  );
}

export function HeroSection({ event }: HeroSectionProps) {
  const now = new Date();
  const regStart = event?.registration_start ? new Date(event.registration_start) : null;
  const regEnd = event?.registration_end ? new Date(event.registration_end) : null;
  const isParticipantRegOpen = regStart && regEnd && now >= regStart && now <= regEnd;

  const candStart = event?.candidate_registration_start ? new Date(event.candidate_registration_start) : null;
  const candEnd = event?.candidate_registration_end ? new Date(event.candidate_registration_end) : null;
  const isCandidateRegOpen = event?.allow_candidate_registration && candStart && candEnd && now >= candStart && now <= candEnd;

  const isUpcoming = event?.status === 'UPCOMING';
  const countdownTarget = isUpcoming && regStart ? regStart.toISOString() : null;
  
  // Status tracker
  let currentStage = 'Persiapan';
  if (isParticipantRegOpen || isCandidateRegOpen) currentStage = 'Masa Pendaftaran';
  else if (event?.status === 'ONGOING') currentStage = 'Sedang Berlangsung';
  else if (event?.status === 'COMPLETED') currentStage = 'Selesai';

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-950">
      {/* Premium Dark Gradient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-emerald-500/20 to-transparent opacity-50 blur-3xl" />
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-emerald-900/20 blur-3xl" />
        
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center pt-32 pb-20">
        
        {/* Current Stage Badge */}
        <div className="animate-fade-in-up inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-slate-900/50 backdrop-blur-md border border-slate-800 shadow-2xl">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Status Tahapan:</span>
          <span className="text-white text-xs font-bold uppercase tracking-wider">{currentStage}</span>
        </div>

        {/* Title */}
        <h1 className="animate-fade-in-up animate-delay-100 text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 max-w-4xl leading-[1.1]">
          {event?.name || 'Musyawarah Komunitas'}
        </h1>

        {/* Theme/Description */}
        <p className="animate-fade-in-up animate-delay-200 text-lg md:text-xl text-slate-400 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
          {event?.theme ? (
            <span>&quot;{event.theme}&quot;<br/><br/></span>
          ) : null}
          Platform resmi pendaftaran peserta, kandidat, dan pemungutan suara digital untuk suksesi kepemimpinan.
        </p>

        {/* CTAs */}
        <div className="animate-fade-in-up animate-delay-300 flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto mb-16">
          {isParticipantRegOpen ? (
            <Link href="/register" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-950 font-bold rounded-2xl hover:bg-slate-100 transition-all duration-300 text-base shadow-xl">
                <Users className="w-5 h-5" />
                Daftar Peserta
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          ) : (
            <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 border border-slate-800 text-slate-500 font-semibold rounded-2xl text-base cursor-not-allowed">
              <Users className="w-5 h-5" />
              {isUpcoming ? 'Pendaftaran Peserta Segera Dibuka' : 'Pendaftaran Peserta Ditutup'}
            </div>
          )}

          <Link href="#kandidat" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 border border-slate-800 text-white font-semibold rounded-2xl hover:bg-slate-800 transition-all duration-300 text-base">
              <Activity className="w-5 h-5 text-emerald-400" />
              Lihat Kandidat
            </button>
          </Link>
        </div>

        {/* Event Meta Info Row */}
        {(event?.location || event?.voting_start || countdownTarget) && (
          <div className="animate-fade-in-up animate-delay-400 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 pt-8 border-t border-slate-800/50 w-full max-w-3xl">
            {countdownTarget && (
              <div className="flex flex-col items-center">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Sisa Waktu Pendaftaran</span>
                <CountdownTimer targetDate={countdownTarget} />
              </div>
            )}
            
            <div className="flex gap-12">
              {event?.voting_start && (
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-3 text-emerald-400">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <span className="text-white font-semibold">{formatDate(event.voting_start)}</span>
                  <span className="text-slate-500 text-xs mt-1 uppercase tracking-wider">Tanggal Pemilihan</span>
                </div>
              )}

              {event?.location && (
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-3 text-emerald-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="text-white font-semibold">{event.location}</span>
                  <span className="text-slate-500 text-xs mt-1 uppercase tracking-wider">Lokasi Acara</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500 transition-opacity hover:text-white cursor-pointer" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
        <span className="text-[10px] font-bold tracking-widest uppercase">Eksplorasi</span>
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </div>
    </section>
  );
}
