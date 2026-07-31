"use client";

import { FileText, Download } from "lucide-react";

interface History {
  id: string;
  report_type: string;
  file_format: string;
  created_at: string;
  file_url: string;
}

export function ReportHistoryTable({ history }: { history: History[] }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200">
        <h3 className="text-lg font-medium text-slate-900">Report History</h3>
        <p className="text-sm text-slate-500">Audit trail of generated reports and exports.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">Report Type</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">Format</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">Generated At</th>
              <th scope="col" className="px-6 py-3 text-right font-medium text-slate-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {history.map((h) => (
              <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-slate-400 mr-2" />
                    <span className="font-medium text-slate-900">{h.report_type.replace(/_/g, ' ')}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                    h.file_format === 'PDF' ? 'bg-red-50 text-red-700 border-red-200' :
                    h.file_format === 'CSV' ? 'bg-green-50 text-green-700 border-green-200' :
                    'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {h.file_format}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                  {new Date(h.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <a href={h.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center text-blue-600 hover:text-blue-900 font-medium">
                    <Download className="w-4 h-4 mr-1" /> Download
                  </a>
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  No reports have been generated yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
