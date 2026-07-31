import { PageHeader } from "@/components/shared/PageHeader";
import { OfficialResultBoard } from "@/components/reporting/OfficialResultBoard";
import { ReportHistoryTable } from "@/components/reporting/ReportHistoryTable";
import { ExportToolbar } from "@/components/reporting/ExportToolbar";

export default function ReportingPage() {
  const mockResult = {
    total_registered: 1500,
    approved_participants: 1450,
    checked_in: 1400,
    eligible_voters: 1400,
    total_votes: 1350,
    abstain: 50,
    participation_pct: 96.42,
    winning_candidate: {
      candidate_id: "1",
      name: "John Doe",
      number: 1,
      total_votes: 750
    },
    candidate_results: [
      { candidate_id: "1", name: "John Doe", number: 1, total_votes: 750 },
      { candidate_id: "2", name: "Jane Smith", number: 2, total_votes: 600 }
    ]
  };

  const mockHistory = [
    {
      id: "h-1",
      report_type: "OFFICIAL_RESULT",
      file_format: "PDF",
      created_at: "2026-07-31T10:00:00.000Z",
      file_url: "#"
    },
    {
      id: "h-2",
      report_type: "ATTENDANCE_SUMMARY",
      file_format: "CSV",
      created_at: "2026-07-30T10:00:00.000Z",
      file_url: "#"
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <PageHeader 
        title="Reporting & Official Result" 
        description="Aggregate event data, view official results, and generate historical exports." 
      />

      <ExportToolbar />

      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Official Election Result</h2>
        <OfficialResultBoard result={mockResult} />
      </div>

      <div className="mt-8">
        <ReportHistoryTable history={mockHistory} />
      </div>
    </div>
  );
}
