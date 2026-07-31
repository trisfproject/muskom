import Link from 'next/link';
import { DoorClosed, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RegistrationClosedProps {
  reason?: 'CLOSED' | 'FULL' | 'NOT_FOUND';
}

export function RegistrationClosed({ reason = 'CLOSED' }: RegistrationClosedProps) {
  let title = 'Registration is Closed';
  let message = 'Participant registration for this Musyawarah is currently closed or not yet active.';
  let Icon = DoorClosed;

  if (reason === 'FULL') {
    title = 'Participant Quota Reached';
    message = 'We have reached the maximum number of participants for this event. No further registrations can be accepted at this time.';
  } else if (reason === 'NOT_FOUND') {
    title = 'Event Not Available';
    message = 'There is currently no active event available for registration.';
    Icon = CalendarClock;
  }

  return (
    <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center max-w-xl mx-auto">
      <div className="mx-auto bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mb-6">
        <Icon className="h-12 w-12 text-slate-400" />
      </div>
      
      <h2 className="text-3xl font-bold text-slate-900 mb-4">{title}</h2>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed max-w-md mx-auto">
        {message}
      </p>

      <Link href="/">
        <Button className="rounded-full bg-slate-900 text-white hover:bg-slate-800 px-8 py-6">
          Return to Landing Page
        </Button>
      </Link>
    </div>
  );
}
