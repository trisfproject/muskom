"use client";

import { useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboard";
import { DashboardData } from "@/types/dashboard";
import { Users, UserCheck, ShieldAlert, Settings2, Calendar, FileText, ArrowRight, Activity, Database, CheckCircle2 } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import Link from "next/link";
import { StatusChip } from "@/components/ui/status-chip";

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getSummary().then(res => {
      setData(res);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 pg-muted animate-pulse">Memuat dashboard operasional...</div>;
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto">
        <div className="w-16 h-16 pg-surface border pg-border rounded-2xl flex items-center justify-center mb-6">
          <Settings2 className="w-8 h-8 pg-muted" />
        </div>
        <h2 className="text-xl font-bold pg-text mb-2">Gagal Memuat Dashboard</h2>
        <p className="pg-muted text-sm mb-6">
          Sistem tidak dapat memuat data operasional saat ini.
        </p>
      </div>
    );
  }

  const { status, summary, health } = data;
  
  const isHealthy = health.api_status === 'OK' && health.database_status === 'OK';
  const totalPending = summary.total_participants - summary.approved_participants; // simplified pending calculation

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Dashboard Operasional" 
        description="Monitoring dan manajemen status musyawarah"
      >
        <StatusChip status={status.phase} />
      </SectionHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Widget 1: Current Active Phase */}
        <div className="col-span-1 md:col-span-2 pg-surface border pg-border rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <h3 className="text-sm font-medium pg-muted mb-1">Fase Saat Ini</h3>
            <div className="text-3xl font-bold pg-text mb-4 capitalize">
              {status.phase.replace(/_/g, ' ').toLowerCase() || 'BELUM DIMULAI'}
            </div>
            
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-6">
              <Link href="/admin/website/timeline" className="inline-flex items-center justify-center min-h-[44px] gap-2 bg-primary hover:bg-primary-active pg-text px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-blue-700 w-full sm:w-auto">
                <Calendar className="w-4 h-4" /> Kelola Timeline
              </Link>
              <Link href="/admin/verifications" className="inline-flex items-center justify-center min-h-[44px] gap-2 pg-surface-elevated hover:pg-surface-elevated/80 pg-text px-4 py-2 rounded-lg text-sm font-medium transition-colors border pg-border w-full sm:w-auto">
                <ShieldAlert className="w-4 h-4" /> Verifikasi ({summary.pending_notifications})
              </Link>
              {status.phase === 'VOTING' && (
                <Link href="/admin/voting" className="inline-flex items-center justify-center min-h-[44px] gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-rose-600 w-full sm:w-auto">
                  <Activity className="w-4 h-4" /> Monitor Voting
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Widget 2: Health Status */}
        <div className="col-span-1 rounded-xl p-6 border flex flex-col justify-between pg-surface pg-border">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-5 h-5 pg-muted" />
              <h3 className="text-sm font-medium pg-muted">System Health</h3>
            </div>
            <div className={`text-2xl font-bold mb-2 ${isHealthy ? 'text-emerald-500' : 'text-amber-500'}`}>
              {isHealthy ? 'All Systems Operational' : 'Degraded'}
            </div>
            <p className="text-sm pg-muted">
              API: {health.api_status} | DB: {health.database_status}
            </p>
          </div>
        </div>

        {/* Widget 3: Quick Stats */}
        <div className="col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="pg-surface border pg-border p-5 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold pg-text">{summary.approved_participants} / {summary.total_participants}</div>
              <div className="text-xs font-medium pg-muted uppercase tracking-wider">Peserta Disetujui</div>
            </div>
          </div>
          
          <div className="pg-surface border pg-border p-5 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <div className="text-2xl font-bold pg-text">{summary.total_candidates}</div>
              <div className="text-xs font-medium pg-muted uppercase tracking-wider">Total Kandidat</div>
            </div>
          </div>

          <div className="pg-surface border pg-border p-5 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <div className="text-2xl font-bold pg-text">{summary.checked_in}</div>
              <div className="text-xs font-medium pg-muted uppercase tracking-wider">Peserta Hadir</div>
            </div>
          </div>

          <div className="pg-surface border pg-border p-5 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <div className="text-2xl font-bold pg-text">{summary.votes_cast}</div>
              <div className="text-xs font-medium pg-muted uppercase tracking-wider">Suara Masuk</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
