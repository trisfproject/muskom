import { EventInfo } from '@/types/dashboard';
import { RefreshCw, CalendarDays, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  event: EventInfo | null;
  onRefresh: () => void;
  isRefetching: boolean;
}

export function DashboardHeader({ event, onRefresh, isRefetching }: DashboardHeaderProps) {
  if (!event) return null;

  const phaseColors = {
    DRAFT: 'bg-slate-100 text-slate-800',
    UPCOMING: 'bg-blue-100 text-blue-800',
    ONGOING: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-purple-100 text-purple-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
          <CalendarDays className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{event.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold", phaseColors[event.status])}>
              {event.status}
            </span>
            {event.publish_result && (
              <span className="flex items-center text-xs text-green-600 font-medium">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Results Published
              </span>
            )}
          </div>
        </div>
      </div>
      <Button 
        onClick={onRefresh} 
        disabled={isRefetching}
        className="border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-sm py-1.5 px-3"
      >
        <RefreshCw className={cn("h-4 w-4 mr-2", isRefetching && "animate-spin")} />
        Refresh
      </Button>
    </div>
  );
}
