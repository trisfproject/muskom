import { CalendarX2 } from 'lucide-react';

export function LandingEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 w-full max-w-4xl mx-auto my-12 text-center">
      <div className="mx-auto bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
        <CalendarX2 className="h-10 w-10 text-slate-400" />
      </div>
      <h2 className="text-3xl font-bold text-slate-900 mb-3">No Active Event</h2>
      <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
        There is currently no active Musyawarah event. Please check back later for announcements and registration details.
      </p>
    </div>
  );
}
