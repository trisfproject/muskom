import { PageHeader } from "@/components/shared/PageHeader";
import { SummaryMetricsGrid } from "@/components/dashboard/SummaryMetricsGrid";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed";
import { EventStatusCard } from "@/components/dashboard/EventStatusCard";
import { QuickActionsPanel } from "@/components/dashboard/QuickActionsPanel";
import { SystemHealthWidget } from "@/components/dashboard/SystemHealthWidget";

export default function AdminDashboardPage() {
  const mockData = {
    event_id: "evt-123",
    health: {
      api_status: "OPERATIONAL",
      database_status: "OPERATIONAL",
      worker_status: "IDLE"
    },
    status: {
      phase: "VOTING",
      registration_open: false,
      verification_active: false,
      voting_session_state: "RUNNING"
    },
    summary: {
      total_participants: 1500,
      approved_participants: 1450,
      total_candidates: 3,
      checked_in: 1400,
      votes_cast: 1350,
      pending_notifications: 12
    },
    recent_activity: [
      { id: "1", action: "Checked In at Booth 1", actor: "Operator Jane", role: "OPERATOR", timestamp: new Date(Date.now() - 60000).toISOString() },
      { id: "2", action: "Submitted Vote", actor: "Voter 091", role: "PARTICIPANT", timestamp: new Date(Date.now() - 120000).toISOString() },
      { id: "3", action: "Approved Participant", actor: "Admin Bob", role: "ADMIN", timestamp: new Date(Date.now() - 3600000).toISOString() },
    ]
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      <PageHeader 
        title="Operations Center" 
        description="Real-time telemetry and management controls for the active event." 
      />

      <SummaryMetricsGrid summary={mockData.summary} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <QuickActionsPanel />
          <RecentActivityFeed activities={mockData.recent_activity} />
        </div>
        
        <div className="lg:col-span-4 flex flex-col gap-6">
          <EventStatusCard status={mockData.status} />
          <SystemHealthWidget health={mockData.health} />
        </div>
      </div>
    </div>
  );
}
