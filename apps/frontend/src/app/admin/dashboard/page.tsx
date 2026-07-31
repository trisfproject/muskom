'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Users, UserCheck, FileBadge, AlertCircle, RotateCcw, ClipboardCheck } from 'lucide-react';

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-28 rounded-2xl skeleton" />
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl skeleton" />
        ))}
      </div>
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="h-64 rounded-2xl skeleton" />
        <div className="lg:col-span-2 h-64 rounded-2xl skeleton" />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardService.getSummary,
  });

  if (isLoading) return <DashboardSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Gagal Memuat Dashboard</h2>
        <p className="text-slate-500 mb-6 max-w-sm">
          Terjadi kesalahan saat mengambil data. Periksa koneksi dan coba lagi.
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <RotateCcw className="w-4 h-4" />
          Coba Lagi
        </button>
      </div>
    );
  }

  if (!data?.event) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <DashboardHeader
        event={data.event}
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })}
        isRefetching={isFetching}
      />

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Peserta"
          value={data.total_participants ?? 0}
          description="Peserta terdaftar"
          icon={Users}
          colorScheme="blue"
        />
        <DashboardCard
          title="Menunggu Verifikasi"
          value={data.pending_participants ?? 0}
          description="Peserta belum diverifikasi"
          icon={UserCheck}
          colorScheme="amber"
        />
        <DashboardCard
          title="Total Kandidat"
          value={data.total_candidates ?? 0}
          description="Kandidat terdaftar"
          icon={FileBadge}
          colorScheme="purple"
        />
        <DashboardCard
          title="Kandidat Pending"
          value={data.pending_candidates ?? 0}
          description="Kandidat belum diverifikasi"
          icon={ClipboardCheck}
          colorScheme="rose"
        />
      </div>

      {/* Activity */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
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
