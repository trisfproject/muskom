"use client";

import { CheckCircle2, XCircle } from "lucide-react";

interface History {
  id: string;
  recipient: string;
  channel: string;
  status: string;
  sent_at: string;
  error_message?: string;
}

export function NotificationHistoryTable({ history }: { history: History[] }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200">
        <h3 className="text-lg font-medium text-slate-900">Broadcast History</h3>
        <p className="text-sm text-slate-500">Log of all finalized notification deliveries.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">Recipient</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">Channel</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">Result</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">Timestamp</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {history.map((h) => (
              <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                  {h.recipient}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                  {h.channel}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {h.status === 'SENT' ? (
                    <span className="inline-flex items-center text-green-700">
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Sent
                    </span>
                  ) : (
                    <div className="flex flex-col">
                      <span className="inline-flex items-center text-red-700">
                        <XCircle className="w-4 h-4 mr-1.5" /> Failed
                      </span>
                      <span className="text-xs text-red-500 mt-1 max-w-[200px] truncate" title={h.error_message}>
                        {h.error_message}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                  {h.sent_at ? new Date(h.sent_at).toLocaleString() : '-'}
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  No historical records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
