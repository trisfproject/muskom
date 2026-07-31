import { MusyawarahEvent } from '@/types/event';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle } from 'lucide-react';

interface TimelineSectionProps {
  event: MusyawarahEvent;
}

export function TimelineSection({ event }: TimelineSectionProps) {
  // Determine timeline order
  const phases = [
    {
      id: 'registration',
      name: 'Participant Registration',
      start: event.registration_start,
      end: event.registration_end,
    },
    {
      id: 'candidate',
      name: 'Candidate Registration',
      start: event.candidate_registration_start,
      end: event.candidate_registration_end,
    },
    {
      id: 'voting',
      name: 'Musyawarah & Voting',
      start: event.voting_start,
      end: event.voting_end,
    }
  ];

  const now = new Date();

  return (
    <section className="py-16 bg-slate-50 border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Event Timeline</h2>
          <p className="text-lg text-slate-600">Track the major milestones of the Musyawarah process.</p>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 transform md:-translate-x-1/2 hidden md:block"></div>
          
          <div className="space-y-12">
            {phases.map((phase, index) => {
              const start = phase.start ? new Date(phase.start) : null;
              const end = phase.end ? new Date(phase.end) : null;
              
              const isPast = end && now > end;
              const isActive = start && end && now >= start && now <= end;

              return (
                <div key={phase.id} className="relative flex flex-col md:flex-row items-start md:items-center">
                  
                  {/* Left Side (Date) */}
                  <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:order-3 md:pl-12 md:text-left'} mb-4 md:mb-0 ml-16 md:ml-0`}>
                    <div className="text-sm font-semibold text-blue-600 mb-1">
                      {start ? start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA'}
                      {end && start && end.getTime() !== start.getTime() ? ` - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
                    </div>
                  </div>

                  {/* Center Dot */}
                  <div className={`absolute left-0 md:left-1/2 w-16 md:w-auto flex justify-center transform md:-translate-x-1/2 ${index % 2 === 0 ? 'md:order-2' : 'md:order-2'}`}>
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center ring-4 ring-slate-50 z-10",
                      isActive ? "bg-blue-600 text-white shadow-lg" : 
                      isPast ? "bg-green-500 text-white" : 
                      "bg-white border-2 border-slate-300 text-slate-400"
                    )}>
                      {isPast ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-4 h-4 fill-current" />}
                    </div>
                  </div>

                  {/* Right Side (Content) */}
                  <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:order-3 md:pl-12' : 'md:pr-12 md:text-right'} ml-16 md:ml-0`}>
                    <div className={cn(
                      "bg-white p-6 rounded-xl shadow-sm border",
                      isActive ? "border-blue-200 ring-1 ring-blue-500" : "border-slate-200"
                    )}>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{phase.name}</h3>
                      <p className="text-slate-600 text-sm">
                        {isActive ? 'This phase is currently active.' : isPast ? 'This phase has been completed.' : 'This phase is scheduled for the future.'}
                      </p>
                    </div>
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
