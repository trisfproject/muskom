"use client";

import { DownloadCloud, Filter } from "lucide-react";
import { useState } from "react";

export function ExportToolbar() {
  const [reportType, setReportType] = useState("OFFICIAL_RESULT");
  const [format, setFormat] = useState("PDF");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    // Mock POST /api/v1/reporting/export
    setTimeout(() => {
      alert(`Exporting ${reportType} as ${format}`);
      setIsExporting(false);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row gap-4 items-end justify-between">
      <div className="flex flex-col sm:flex-row gap-4 flex-1">
        <div className="w-full sm:w-auto">
          <label className="block text-xs font-medium text-slate-500 mb-1">Report Type</label>
          <div className="relative">
            <select 
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="OFFICIAL_RESULT">Official Result</option>
              <option value="ATTENDANCE_SUMMARY">Attendance Summary</option>
              <option value="PARTICIPANT_LIST">Participant List</option>
              <option value="CANDIDATE_LIST">Candidate List</option>
            </select>
          </div>
        </div>
        <div className="w-full sm:w-auto">
          <label className="block text-xs font-medium text-slate-500 mb-1">Format</label>
          <div className="relative">
            <select 
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="PDF">PDF Document (.pdf)</option>
              <option value="CSV">Comma Separated Values (.csv)</option>
              <option value="XLSX">Excel Spreadsheet (.xlsx)</option>
              <option value="JSON">JSON Data (.json)</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 w-full sm:w-auto">
        <button className="flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">
          <Filter className="w-4 h-4 mr-2 text-slate-400" /> Options
        </button>
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <DownloadCloud className="w-4 h-4 mr-2" /> 
          {isExporting ? "Generating..." : "Generate Export"}
        </button>
      </div>
    </div>
  );
}
