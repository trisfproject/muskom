import Link from 'next/link';
import { ArrowRight, UserPlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MusyawarahEvent } from '@/types/event';

interface HeroSectionProps {
  event: MusyawarahEvent | null;
}

export function HeroSection({ event }: HeroSectionProps) {
  const now = new Date();
  const regStart = event?.registration_start ? new Date(event.registration_start) : null;
  const regEnd = event?.registration_end ? new Date(event.registration_end) : null;
  
  const isParticipantRegOpen = regStart && regEnd && now >= regStart && now <= regEnd;

  const candStart = event?.candidate_registration_start ? new Date(event.candidate_registration_start) : null;
  const candEnd = event?.candidate_registration_end ? new Date(event.candidate_registration_end) : null;
  
  const isCandidateRegOpen = event?.allow_candidate_registration && candStart && candEnd && now >= candStart && now <= candEnd;

  return (
    <section className="relative overflow-hidden bg-white pt-24 pb-16 lg:pt-32 lg:pb-24">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-50 blur-3xl opacity-70"></div>
        <div className="absolute top-40 -left-40 w-96 h-96 rounded-full bg-purple-50 blur-3xl opacity-70"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-block mb-4 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold tracking-wide border border-blue-100">
          Official Portal
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
          {event?.name || 'Musyawarah KOMITKABE'}
        </h1>
        
        {event?.theme && (
          <p className="text-xl md:text-2xl text-blue-600 font-medium mb-6 max-w-3xl mx-auto">
            &quot;{event.theme}&quot;
          </p>
        )}
        
        <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
          Welcome to the official registration and information portal. Participate, vote, and shape the future of our organization.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {isParticipantRegOpen ? (
            <Link href="/register" className="w-full sm:w-auto">
              <Button className="w-full px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md">
                <Users className="mr-2 h-5 w-5" />
                Register as Participant
              </Button>
            </Link>
          ) : (
            <Button disabled className="w-full sm:w-auto px-8 py-3 text-lg bg-slate-100 text-slate-400 rounded-full">
              {event?.status === 'UPCOMING' ? 'Registration Opening Soon' : 'Registration Closed'}
            </Button>
          )}

          {isCandidateRegOpen && (
            <Link href="/register/candidate" className="w-full sm:w-auto">
              <Button className="w-full px-8 py-3 text-lg rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50">
                <UserPlus className="mr-2 h-5 w-5 text-slate-500" />
                Register as Candidate
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
