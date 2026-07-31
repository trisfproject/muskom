import { useState } from "react";
import { format } from "date-fns";
import { MoreHorizontal, ShieldCheck, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AttendanceItemResponse } from "@/types/attendance";
import { AttendanceStatusBadge } from "./AttendanceStatusBadge";
import { useCheckInMutation } from "@/services/attendance/mutations";

interface AttendanceTableProps {
  data: AttendanceItemResponse[];
  onViewDetail: (id: string) => void;
}

export function AttendanceTable({ data, onViewDetail }: AttendanceTableProps) {
  const checkInMutation = useCheckInMutation();
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; registrationId: string; participantName: string } | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleCheckIn = (registrationId: string) => {
    checkInMutation.mutate({ registration_id: registrationId }, {
      onSuccess: () => {
        setConfirmDialog(null);
      }
    });
  };

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 py-16 text-center shadow-sm">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">No Participants Found</h3>
        <p className="text-slate-500">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Reg No</th>
                <th className="px-6 py-4">Participant</th>
                <th className="px-6 py-4 hidden md:table-cell">Company</th>
                <th className="px-6 py-4">Verification</th>
                <th className="px-6 py-4">Attendance</th>
                <th className="px-6 py-4 hidden lg:table-cell">Check-in Time</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row) => (
                <tr key={row.registration_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500 truncate max-w-[120px]" title={row.registration_id}>
                    {row.registration_id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{row.participant_name}</div>
                    <div className="text-slate-500 text-xs md:hidden mt-1">{row.institution}</div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell text-slate-600">
                    {row.institution}
                  </td>
                  <td className="px-6 py-4">
                    <AttendanceStatusBadge type="verification" status={row.verification_status} />
                  </td>
                  <td className="px-6 py-4">
                    <AttendanceStatusBadge type="attendance" status={row.attendance_status} />
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell text-slate-500">
                    {row.checked_in_at ? format(new Date(row.checked_in_at), 'HH:mm:ss') : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 relative">
                      {row.verification_status === 'APPROVED' && row.attendance_status === 'ABSENT' && (
                        <Button
                          className="hidden sm:inline-flex h-8 px-3 text-xs bg-blue-600 text-white hover:bg-blue-700"
                          onClick={() => setConfirmDialog({ isOpen: true, registrationId: row.registration_id, participantName: row.participant_name })}
                          disabled={checkInMutation.isPending}
                        >
                          Check In
                        </Button>
                      )}
                      
                      <div className="relative">
                        <Button 
                          className="h-8 w-8 p-0 bg-transparent text-slate-900 hover:bg-slate-100"
                          onClick={() => setOpenDropdown(openDropdown === row.registration_id ? null : row.registration_id)}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        
                        {openDropdown === row.registration_id && (
                          <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-50 border border-slate-200 py-1">
                            {row.verification_status === 'APPROVED' && row.attendance_status === 'ABSENT' && (
                              <button 
                                className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-slate-50 flex items-center sm:hidden font-medium"
                                onClick={() => {
                                  setOpenDropdown(null);
                                  setConfirmDialog({ isOpen: true, registrationId: row.registration_id, participantName: row.participant_name });
                                }}
                              >
                                <ShieldCheck className="w-4 h-4 mr-2" />
                                Check In
                              </button>
                            )}
                            <button 
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                              onClick={() => {
                                setOpenDropdown(null);
                                onViewDetail(row.registration_id);
                              }}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              View Details
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-2">Confirm Check-In</h2>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to check in <strong className="text-slate-900">{confirmDialog?.participantName}</strong>? This action will record their attendance for the event.
            </p>
            <div className="flex justify-end gap-2">
              <Button 
                className="bg-transparent text-slate-900 border border-slate-200 hover:bg-slate-100" 
                onClick={() => setConfirmDialog(null)} 
                disabled={checkInMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                className="bg-blue-600 text-white hover:bg-blue-700" 
                onClick={() => confirmDialog && handleCheckIn(confirmDialog.registrationId)}
                disabled={checkInMutation.isPending}
              >
                {checkInMutation.isPending ? 'Checking In...' : 'Confirm Check-In'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
