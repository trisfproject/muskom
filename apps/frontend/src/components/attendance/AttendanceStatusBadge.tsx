import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttendanceStatusBadgeProps {
  status: string;
  type: 'verification' | 'attendance';
  className?: string;
}

export function AttendanceStatusBadge({ status, type, className }: AttendanceStatusBadgeProps) {
  if (type === 'verification') {
    switch (status) {
      case 'APPROVED':
        return (
          <span className={cn("inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200", className)}>
            <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className={cn("inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200", className)}>
            <XCircle className="w-3 h-3 mr-1" /> Rejected
          </span>
        );
      default:
        return (
          <span className={cn("inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200", className)}>
            <Clock className="w-3 h-3 mr-1" /> Pending
          </span>
        );
    }
  }

  // Attendance type
  switch (status) {
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
