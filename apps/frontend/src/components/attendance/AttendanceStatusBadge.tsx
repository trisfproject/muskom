import { Badge } from '@/components/ui/badge';
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
          <Badge variant="outline" className={cn("bg-green-50 text-green-700 border-green-200", className)}>
            <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="outline" className={cn("bg-red-50 text-red-700 border-red-200", className)}>
            <XCircle className="w-3 h-3 mr-1" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className={cn("bg-amber-50 text-amber-700 border-amber-200", className)}>
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
    }
  }

  // Attendance type
  switch (status) {
    case 'PRESENT':
      return (
        <Badge variant="outline" className={cn("bg-blue-50 text-blue-700 border-blue-200", className)}>
          <CheckCircle2 className="w-3 h-3 mr-1" /> Checked In
        </Badge>
      );
    case 'ABSENT':
    default:
      return (
        <Badge variant="outline" className={cn("bg-slate-100 text-slate-600 border-slate-200", className)}>
          <AlertCircle className="w-3 h-3 mr-1" /> Not Checked In
        </Badge>
      );
  }
}
