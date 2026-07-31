import Link from 'next/link';
import { Users, FileBadge, Settings } from 'lucide-react';

export function QuickActions() {
  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
      </div>
      <div className="flex-1 p-4 grid grid-cols-1 gap-3">
        <Link 
          href="/admin/participants" 
          className="flex items-center justify-between p-4 rounded-md border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded text-blue-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600">Verify Participants</p>
              <p className="text-xs text-slate-500">Review participant applications</p>
            </div>
          </div>
        </Link>
        
        <Link 
          href="/admin/candidates" 
          className="flex items-center justify-between p-4 rounded-md border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded text-purple-600">
              <FileBadge className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 group-hover:text-purple-600">Verify Candidates</p>
              <p className="text-xs text-slate-500">Review candidate requirements</p>
            </div>
          </div>
        </Link>

        <Link 
          href="/admin/events" 
          className="flex items-center justify-between p-4 rounded-md border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-2 rounded text-slate-600">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 group-hover:text-slate-700">Manage Event</p>
              <p className="text-xs text-slate-500">Configure event settings</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
