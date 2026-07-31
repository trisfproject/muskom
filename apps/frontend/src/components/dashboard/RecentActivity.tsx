import { Activity } from 'lucide-react';

export function RecentActivity() {
  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
        <Activity className="h-5 w-5 text-slate-500" />
        <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
      </div>
      <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
        <div className="bg-slate-50 p-4 rounded-full mb-4">
          <Activity className="h-8 w-8 text-slate-300" />
        </div>
        <h4 className="text-sm font-medium text-slate-900 mb-1">No recent activity</h4>
        <p className="text-xs text-slate-500 max-w-[200px]">
          There has been no recorded activity in the system yet.
        </p>
      </div>
    </div>
  );
}
