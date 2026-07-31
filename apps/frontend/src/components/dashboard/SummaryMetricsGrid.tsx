"use client";

import { Users, UserCheck, Inbox, PieChart, Bell, Award } from "lucide-react";
import { SummaryCard } from "@/components/shared/SummaryCard";

interface DashboardSummary {
  total_participants: number;
  approved_participants: number;
  total_candidates: number;
  checked_in: number;
  votes_cast: number;
  pending_notifications: number;
}

export function SummaryMetricsGrid({ summary }: { summary: DashboardSummary }) {
  let attendancePct = 0;
  if (summary.approved_participants > 0) {
    attendancePct = (summary.checked_in / summary.approved_participants) * 100;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      <SummaryCard title="Total Registrations" value={summary.total_participants} icon={<Users />} />
      <SummaryCard title="Approved Participants" value={summary.approved_participants} icon={<UserCheck />} />
      <SummaryCard title="Candidates" value={summary.total_candidates} icon={<Award />} />
      <SummaryCard title="Checked In" value={`${summary.checked_in} (${attendancePct.toFixed(1)}%)`} icon={<Inbox />} />
      <SummaryCard title="Votes Cast" value={summary.votes_cast} icon={<PieChart />} />
      <SummaryCard title="Pending Notifications" value={summary.pending_notifications} icon={<Bell />} />
    </div>
  );
}
