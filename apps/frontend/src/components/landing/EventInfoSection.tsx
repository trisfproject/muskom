import { MapPin, CalendarDays, Activity } from 'lucide-react';
import { MusyawarahEvent } from '@/types/event';

interface EventInfoSectionProps {
  event: MusyawarahEvent;
}

export function EventInfoSection({ event }: EventInfoSectionProps) {
  // Format the primary event date span based on the timeline if possible, 
  // or just fallback to registration start as an anchor point if timeline is complex.
  let dateDisplay = 'Date to be announced';
  if (event.voting_start && event.voting_end) {
    const start = new Date(event.voting_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const end = new Date(event.voting_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    dateDisplay = start === end ? start : `${start} - ${end}`;
  }

  return (
    <section className="bg-slate-50 py-12 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-slate-200">
          
          <div className="flex flex-col items-center md:items-start pt-6 md:pt-0 md:pl-0 px-6">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 mb-4 inline-flex">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Location</h3>
            <p className="text-lg font-medium text-slate-900">{event.location || 'Location to be announced'}</p>
          </div>

          <div className="flex flex-col items-center md:items-start pt-6 md:pt-0 px-6">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 mb-4 inline-flex">
              <CalendarDays className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Date</h3>
            <p className="text-lg font-medium text-slate-900">{dateDisplay}</p>
          </div>

          <div className="flex flex-col items-center md:items-start pt-6 md:pt-0 px-6">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 mb-4 inline-flex">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Current Phase</h3>
            <p className="text-lg font-medium text-slate-900 capitalize">{event.status.toLowerCase()}</p>
          </div>

        </div>
      </div>
    </section>
  );
}
