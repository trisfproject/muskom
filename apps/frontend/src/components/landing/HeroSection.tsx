'use client';

import Link from 'next/link';
import { ArrowRight, UserPlus, Users, ChevronDown, Calendar, MapPin } from 'lucide-react';
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
    <div className="flex items-center gap-3 justify-center flex-wrap">
      {[
        { label: 'Hari', value: timeLeft.days },
        { label: 'Jam', value: timeLeft.hours },
        { label: 'Menit', value: timeLeft.minutes },
        { label: 'Detik', value: timeLeft.seconds },
      ].map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center">
            <span className="text-2xl font-bold text-white tabular-nums">
              {String(value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-xs text-emerald-200 mt-1 font-medium">{label}</span>
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

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden gradient-hero">
      {/* Decorative orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-teal-400/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-emerald-900/20 blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-16">
        {/* Badge */}
        <div className="animate-fade-in-up inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-emerald-100 text-sm font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Portal Resmi Musyawarah Komunitas
        </div>

        {/* Main Heading */}
        <h1 className="animate-fade-in-up animate-delay-100 heading-display text-white mb-6">
          {event?.name || 'Musyawarah Komunitas'}
        </h1>

        {/* Theme / Tagline */}
        {event?.theme && (
          <p className="animate-fade-in-up animate-delay-200 text-xl md:text-2xl text-emerald-200 font-medium italic mb-6 max-w-3xl mx-auto">
            &ldquo;{event.theme}&rdquo;
          </p>
        )}

        {/* Description */}
        <p className="animate-fade-in-up animate-delay-300 text-lg text-emerald-100/80 mb-10 max-w-2xl mx-auto leading-relaxed">
          Platform resmi pendaftaran peserta, pendaftaran kandidat, dan pemungutan suara digital untuk Musyawarah Komunitas.
        </p>

        {/* Event meta */}
        {(event?.location || event?.voting_start) && (
          <div className="animate-fade-in-up animate-delay-300 flex flex-wrap justify-center gap-6 mb-10">
            {event.location && (
              <div className="flex items-center gap-2 text-emerald-100/80 text-sm">
                <MapPin className="w-4 h-4 text-emerald-300" />
                <span>{event.location}</span>
              </div>
            )}
            {event.voting_start && (
              <div className="flex items-center gap-2 text-emerald-100/80 text-sm">
                <Calendar className="w-4 h-4 text-emerald-300" />
                <span>{formatDate(event.voting_start)}</span>
              </div>
            )}
          </div>
        )}

        {/* Countdown */}
        {countdownTarget && (
          <div className="animate-fade-in-up animate-delay-400 mb-10">
            <p className="text-emerald-200 text-sm font-medium mb-4">Pendaftaran dibuka dalam:</p>
            <CountdownTimer targetDate={countdownTarget} />
          </div>
        )}

        {/* CTAs */}
        <div className="animate-fade-in-up animate-delay-400 flex flex-col sm:flex-row gap-4 justify-center items-center">
          {isParticipantRegOpen ? (
            <Link href="/register">
              <button className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-700 font-bold rounded-full shadow-xl hover:shadow-2xl hover:bg-emerald-50 transition-all duration-300 text-base">
                <Users className="w-5 h-5" />
                Daftar sebagai Peserta
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          ) : (
            <div className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white/60 font-semibold rounded-full text-base cursor-not-allowed">
              <Users className="w-5 h-5" />
              {isUpcoming ? 'Pendaftaran Segera Dibuka' : 'Pendaftaran Ditutup'}
            </div>
          )}

          {isCandidateRegOpen && (
            <Link href="/register/candidate">
              <button className="group inline-flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-white/40 text-white font-semibold rounded-full hover:bg-white/10 hover:border-white/60 transition-all duration-300 text-base">
                <UserPlus className="w-5 h-5" />
                Daftar sebagai Kandidat
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40">
        <span className="text-xs font-medium tracking-wider uppercase">Gulir ke bawah</span>
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </div>
    </section>
  );
}
