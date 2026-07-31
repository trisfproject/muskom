import { useAttendanceDetail } from "@/services/attendance/queries";
import { format } from "date-fns";
import { AttendanceStatusBadge } from "./AttendanceStatusBadge";
import { Building2, Phone, Mail, Clock, CalendarDays } from "lucide-react";

interface AttendanceDrawerProps {
  registrationId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AttendanceDrawer({ registrationId, isOpen, onClose }: AttendanceDrawerProps) {
  const { data: detail, isLoading, isError } = useAttendanceDetail(registrationId || '', isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
      <div className="w-full sm:max-w-md h-full bg-white shadow-xl animate-in slide-in-from-right overflow-y-auto">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
             &#x2715;
          </button>
          <h2 className="text-xl font-bold text-slate-900">Attendance Details</h2>
          <p className="text-sm text-slate-500">
            Detailed view of participant registration and check-in metadata.
          </p>
        </div>

        <div className="p-6">
          {isLoading && (
            <div className="space-y-6">
              <div className="h-20 w-full rounded-xl bg-slate-200 animate-pulse" />
              <div className="h-40 w-full rounded-xl bg-slate-200 animate-pulse" />
            </div>
          )}

          {isError && (
            <div className="text-center text-red-500 py-10 bg-red-50 rounded-xl border border-red-100">
              Failed to load participant details.
            </div>
          )}

          {detail && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-sm">
                  {detail.full_name.charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">{detail.full_name}</h3>
                <p className="text-slate-500 text-sm font-medium">{detail.registration_id}</p>
                <div className="mt-4 flex gap-2 justify-center">
                  <AttendanceStatusBadge type="attendance" status={detail.checked_in_at ? 'PRESENT' : 'ABSENT'} />
                </div>
              </div>

              {/* Check In Status */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-semibold text-slate-700 text-sm flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-slate-500" />
                  Check-in Information
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <span className="text-slate-500 text-sm">Timestamp</span>
                    <span className="font-medium text-slate-900">
                      {detail.checked_in_at ? format(new Date(detail.checked_in_at), 'dd MMM yyyy HH:mm:ss') : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm">Operator ID</span>
                    <span className="font-medium text-slate-900 font-mono text-xs max-w-[200px] truncate" title={detail.checked_in_by || '-'}>
                      {detail.checked_in_by || '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-semibold text-slate-700 text-sm flex items-center">
                  <Building2 className="w-4 h-4 mr-2 text-slate-500" />
                  Participant Profile
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <span className="text-slate-500 text-sm flex items-center gap-2"><Building2 className="w-4 h-4" /> Company</span>
                    <span className="font-medium text-slate-900 text-right">{detail.institution}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <span className="text-slate-500 text-sm flex items-center gap-2"><Mail className="w-4 h-4" /> Email</span>
                    <span className="font-medium text-slate-900 text-right">{detail.email}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <span className="text-slate-500 text-sm flex items-center gap-2"><Phone className="w-4 h-4" /> Phone</span>
                    <span className="font-medium text-slate-900 text-right">{detail.phone}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Registered At</span>
                    <span className="font-medium text-slate-900 text-right text-xs">
                      {format(new Date(detail.created_at), 'dd MMM yyyy')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
