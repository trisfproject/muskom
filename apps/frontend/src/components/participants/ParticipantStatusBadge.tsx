import { cn } from '@/lib/utils';

interface ParticipantStatusBadgeProps {
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
}

export function ParticipantStatusBadge({ status }: ParticipantStatusBadgeProps) {
  const styles: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    APPROVED: 'bg-green-100 text-green-800 border-green-200',
    REJECTED: 'bg-red-100 text-red-800 border-red-200',
  };

  const style = styles[status] || 'bg-slate-100 text-slate-800 border-slate-200';

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", style)}>
      {status}
    </span>
  );
}
