"use client";

import { Activity } from "lucide-react";

interface Job {
  id: string;
  recipient: string;
  channel: string;
  status: string;
  created_at: string;
}

export function NotificationQueueTable({ jobs }: { jobs: Job[] }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-slate-900">Active Queue</h3>
          <p className="text-sm text-slate-500">Jobs currently pending or processing.</p>
        </div>
        <div className="flex items-center text-sm text-slate-500">
          <Activity className="w-4 h-4 mr-2 animate-pulse text-blue-600" /> Worker Idle
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">Recipient</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">Channel</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">Queued At</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{job.recipient}</td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-500">{job.channel}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    job.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                    job.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                  {new Date(job.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  Queue is empty.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
