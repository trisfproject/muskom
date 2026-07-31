import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type BadgeStatus = 'APPROVED' | 'REJECTED' | 'PENDING' | 'PRESENT' | 'ABSENT' | 'SUBMITTED' | 'REVIEWING' | 'ACCEPTED';

interface StatusBadgeProps {
  status: BadgeStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  switch (status) {
    case 'APPROVED':
    case 'ACCEPTED':
      return (
        <span className={cn("inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200", className)}>
          <CheckCircle2 className="w-3 h-3 mr-1" /> {status === 'APPROVED' ? 'Approved' : 'Accepted'}
        </span>
      );
    case 'REJECTED':
      return (
        <span className={cn("inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200", className)}>
          <XCircle className="w-3 h-3 mr-1" /> Rejected
        </span>
      );
    case 'PENDING':
    case 'SUBMITTED':
    case 'REVIEWING':
      return (
        <span className={cn("inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200", className)}>
          <Clock className="w-3 h-3 mr-1" /> {status.charAt(0) + status.slice(1).toLowerCase()}
        </span>
      );
    case 'PRESENT':
      return (
        <span className={cn("inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200", className)}>
          <CheckCircle2 className="w-3 h-3 mr-1" /> Checked In
        </span>
      );
    case 'ABSENT':
    default:
      return (
        <span className={cn("inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200", className)}>
          <AlertCircle className="w-3 h-3 mr-1" /> Not Checked In
        </span>
      );
  }
}
