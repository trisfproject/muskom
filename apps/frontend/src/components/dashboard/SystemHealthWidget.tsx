"use client";

import { Server, Database, Activity } from "lucide-react";

interface SystemHealth {
  api_status: string;
  database_status: string;
  worker_status: string;
}

export function SystemHealthWidget({ health }: { health: SystemHealth }) {
  const getStatusColor = (status: string) => {
    if (status === 'OPERATIONAL' || status === 'IDLE') return 'text-green-500';
    if (status === 'DEGRADED') return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
      <h3 className="text-lg font-medium text-slate-900 mb-6">System Health</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Server className="w-5 h-5 text-slate-400 mr-3" />
            <span className="text-sm font-medium text-slate-700">API Gateway</span>
          </div>
          <span className={`text-xs font-bold uppercase ${getStatusColor(health.api_status)}`}>
            {health.api_status}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Database className="w-5 h-5 text-slate-400 mr-3" />
            <span className="text-sm font-medium text-slate-700">Primary Database</span>
          </div>
          <span className={`text-xs font-bold uppercase ${getStatusColor(health.database_status)}`}>
            {health.database_status}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Activity className="w-5 h-5 text-slate-400 mr-3" />
            <span className="text-sm font-medium text-slate-700">Background Worker</span>
          </div>
          <span className={`text-xs font-bold uppercase ${getStatusColor(health.worker_status)}`}>
            {health.worker_status}
          </span>
        </div>
      </div>
    </div>
  );
}
