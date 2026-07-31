import { CalendarX2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LandingEmptyState() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-slate-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md text-center">
        <div className="mx-auto bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
          <CalendarX2 className="h-8 w-8 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">No Active Event</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          There are currently no active Musyawarah events scheduled or the portal is under maintenance. Please check back later.
        </p>
        <Button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full rounded-full"
        >
          Refresh Page
        </Button>
      </div>
    </div>
  );
}
