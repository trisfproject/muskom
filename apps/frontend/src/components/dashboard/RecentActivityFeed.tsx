"use client";

import { Activity } from "lucide-react";

interface RecentActivity {
  id: string;
  action: string;
  actor: string;
  role: string;
  timestamp: string;
}

export function RecentActivityFeed({ activities }: { activities: RecentActivity[] }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <h3 className="text-lg font-medium text-slate-900 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-slate-500" /> Recent Activity
        </h3>
      </div>
      <div className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        {activities.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {activities.map((act) => (
              <li key={act.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {act.actor} <span className="text-slate-500 font-normal">({act.role})</span>
                    </p>
                    <p className="text-sm text-slate-600 mt-1">{act.action}</p>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-12 text-slate-500">
            <p>No recent activity found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
