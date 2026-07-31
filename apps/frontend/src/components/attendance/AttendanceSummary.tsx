import { Users, UserCheck, UserMinus, Percent } from "lucide-react";
import { useAttendances } from "@/services/attendance/queries";

export function AttendanceSummary() {
  // We use empty filters to get the total count of Approved Participants
  const { data: totalApprovedData } = useAttendances({ verification_status: 'APPROVED', limit: 1 });
  const { data: checkedInData } = useAttendances({ verification_status: 'APPROVED', attendance_status: 'PRESENT', limit: 1 });

  const totalRegistered = totalApprovedData?.total || 0;
  const totalCheckedIn = checkedInData?.total || 0;
  const notArrived = Math.max(0, totalRegistered - totalCheckedIn);
  const percentage = totalRegistered > 0 ? Math.round((totalCheckedIn / totalRegistered) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-500 font-medium text-sm">Total Approved</h3>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <div className="text-3xl font-bold text-slate-900">{totalRegistered}</div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-500 font-medium text-sm">Checked In</h3>
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-green-600" />
          </div>
        </div>
        <div className="text-3xl font-bold text-slate-900">{totalCheckedIn}</div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-500 font-medium text-sm">Not Yet Arrived</h3>
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
            <UserMinus className="w-5 h-5 text-slate-600" />
          </div>
        </div>
        <div className="text-3xl font-bold text-slate-900">{notArrived}</div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-500 font-medium text-sm">Attendance</h3>
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
            <Percent className="w-5 h-5 text-purple-600" />
          </div>
        </div>
        <div className="flex items-end gap-2">
          <div className="text-3xl font-bold text-slate-900">{percentage}</div>
          <div className="text-slate-500 text-sm font-medium pb-1">%</div>
        </div>
      </div>
    </div>
  );
}
