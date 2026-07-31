import { CalendarX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-lg border border-slate-200 border-dashed p-8 text-center">
      <div className="bg-slate-50 p-6 rounded-full mb-6">
        <CalendarX className="h-12 w-12 text-slate-400" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">No Active Musyawarah Event</h2>
      <p className="text-slate-500 max-w-md mb-8">
        There is currently no event configured in the system. You need to create and configure a Musyawarah event before you can manage participants and candidates.
      </p>
      <Link href="/admin/events">
        <Button className="px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700 text-white">
          Configure Event Now
        </Button>
      </Link>
    </div>
  );
}
