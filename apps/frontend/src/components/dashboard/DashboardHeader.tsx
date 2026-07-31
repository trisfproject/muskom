import { EventInfo } from '@/types/dashboard';
import { RefreshCw, CalendarDays, CheckCircle2, MapPin } from 'lucide-react';

interface DashboardHeaderProps {
  event: EventInfo | null;
  onRefresh: () => void;
  isRefetching: boolean;
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Draft',
  UPCOMING: 'Akan Datang',
  ONGOING: 'Sedang Berlangsung',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
};

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700 border border-slate-200',
  UPCOMING: 'bg-blue-50 text-blue-700 border border-blue-200',
  ONGOING: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  COMPLETED: 'bg-purple-50 text-purple-700 border border-purple-200',
  CANCELLED: 'bg-red-50 text-red-700 border border-red-200',
};

export function DashboardHeader({ event, onRefresh, isRefetching }: DashboardHeaderProps) {
  if (!event) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-sm">
          <CalendarDays className="h-6 w-6 text-white" />
        </div>

        {/* Info */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 leading-tight">{event.name}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyles[event.status] ?? statusStyles.DRAFT}`}>
              {event.status === 'ONGOING' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              )}
              {statusLabels[event.status] ?? event.status}
            </span>
            {event.publish_result && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                <CheckCircle2 className="h-3 h-3" />
                Hasil Dipublikasikan
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Refresh */}
      <button
        onClick={onRefresh}
        disabled={isRefetching}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all duration-150 disabled:opacity-50"
      >
        <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
        {isRefetching ? 'Memperbarui...' : 'Perbarui'}
      </button>
    </div>
  );
}
