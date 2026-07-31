import { Search, Filter } from "lucide-react";

export function EventLogViewer() {
  const logs = [
    { id: "1", type: "ParticipantApproved", provider: "EmailProvider", status: "SUCCESS", duration: "12ms", time: "2 mins ago" },
    { id: "2", type: "AttendanceCheckedIn", provider: "WebhookProvider", status: "SUCCESS", duration: "45ms", time: "5 mins ago" },
    { id: "3", type: "VotingStarted", provider: "TelegramProvider", status: "DISABLED", duration: "0ms", time: "1 hour ago" },
    { id: "4", type: "CandidateVerified", provider: "GoogleSheetsProvider", status: "FAILED", duration: "1205ms", time: "3 hours ago" },
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium text-slate-900">Event Dispatch Log</h3>
          <p className="text-sm text-slate-500">History of domain events routed to integrations.</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">Event Type</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">Provider</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-right font-medium text-slate-500 uppercase tracking-wider">Duration</th>
              <th scope="col" className="px-6 py-3 text-right font-medium text-slate-500 uppercase tracking-wider">Time</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{log.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-500">{log.provider}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                    log.status === 'SUCCESS' ? 'bg-green-50 text-green-700 border-green-200' :
                    log.status === 'FAILED' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {log.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">{log.duration}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">{log.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
