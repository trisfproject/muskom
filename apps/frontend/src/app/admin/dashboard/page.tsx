'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { LoadingSkeleton } from '@/components/dashboard/LoadingSkeleton';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Button } from '@/components/ui/button';
import { Users, UsersIcon, FileBadge, FileCheck2, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardService.getSummary,
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-red-50 rounded-lg border border-red-200 p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-900 mb-2">Failed to load dashboard</h2>
        <p className="text-red-700 mb-6">There was a problem retrieving the latest metrics. Please try again.</p>
        <Button onClick={() => refetch()} className="bg-red-600 hover:bg-red-700 text-white">
          Retry Connection
        </Button>
      </div>
    );
  }

  if (!data?.event) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      <DashboardHeader 
        event={data.event} 
        onRefresh={() => {
          queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
        }} 
        isRefetching={isFetching}
      />

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Participants"
          value={data.total_participants}
          description="Registered participants"
          icon={Users}
          colorClassName="text-blue-500"
        />
        <DashboardCard
          title="Pending Verification"
          value={data.pending_participants}
          description="Participants awaiting review"
          icon={UsersIcon}
          colorClassName="text-orange-500"
        />
        <DashboardCard
          title="Total Candidates"
          value={data.total_candidates}
          description="Registered candidates"
          icon={FileBadge}
          colorClassName="text-purple-500"
        />
        <DashboardCard
          title="Pending Candidates"
          value={data.pending_candidates}
          description="Candidates awaiting review"
          icon={FileCheck2}
          colorClassName="text-orange-500"
        />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 mt-6">
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
