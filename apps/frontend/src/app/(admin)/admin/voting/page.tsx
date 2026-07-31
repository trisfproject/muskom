import { PageHeader } from "@/components/shared/PageHeader";
import { VotingSessionPanel } from "@/components/voting/VotingSessionPanel";
import { LiveResultsBoard } from "@/components/voting/LiveResultsBoard";

export default function AdminVotingPage() {
  // In a real implementation, these would be fetched via React Query + useRealtimeSync
  const mockSummary = {
    total_voters: 1500,
    votes_cast: 850,
    participation_pct: 56.6,
    results: [
      { candidate_id: "1", candidate_name: "John Doe", total_votes: 450 },
      { candidate_id: "2", candidate_name: "Jane Smith", total_votes: 400 }
    ]
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <PageHeader 
        title="Voting Operations" 
        description="Manage the active voting session and monitor live telemetry." 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <VotingSessionPanel status="RUNNING" />
        </div>
        <div className="lg:col-span-2">
          <LiveResultsBoard summary={mockSummary} />
        </div>
      </div>
    </div>
  );
}
