"use client";

import { useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboard";
import { DashboardData } from "@/types/dashboard";
import { 
  Users, 
  UserCheck, 
  ShieldAlert, 
  Settings2, 
  Calendar, 
  Activity, 
  Database, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Server,
  Layers,
  History,
  QrCode,
  Percent
} from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import Link from "next/link";
import { StatusChip } from "@/components/ui/status-chip";
import { format } from "date-fns";

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
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 h-48 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          <div className="col-span-1 h-48 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        </div>
      </div>
    );
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

  const { status, summary, health, recent_activity } = data;
  const isHealthy = health.api_status === 'OPERATIONAL' || health.api_status === 'OK';
  
  const quorumPercentage = summary.approved_participants > 0
    ? Math.round((summary.checked_in / summary.approved_participants) * 100)
    : 0;
  const isQuorumReached = quorumPercentage >= 50;

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Dashboard Operasional" 
        description="Monitoring kuorum, kepesertaan, dan seluruh aktivitas musyawarah secara langsung."
      >
        <StatusChip status={status.phase} />
      </SectionHeader>

      {/* Main Highlights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Phase & Timeline Widget */}
        <div className="lg:col-span-2 pg-surface border pg-border rounded-2xl p-6 relative overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider pg-muted flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-primary" /> Linimasa Acara Berjalan
              </span>
              <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                Official Timeline Active
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold pg-text tracking-tight capitalize">
                {status.phase.replace(/_/g, ' ').toLowerCase() || 'Belum Dimulai'}
              </h2>
              <p className="text-xs pg-muted mt-1">
                Website Timeline adalah sumber otoritas tunggal jalannya registrasi, verifikasi, presensi, dan pemilihan musyawarah.
              </p>
            </div>

            {/* Quick Operational Actions */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              <Link 
                href="/admin/attendance" 
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg bg-primary hover:bg-primary-active text-white transition-colors shadow-sm"
              >
                <QrCode className="w-3.5 h-3.5" /> Presensi & Quorum
              </Link>
              <Link 
                href="/admin/verifications" 
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg border pg-border bg-white dark:bg-slate-800 pg-text hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" /> Verifikasi ({summary.pending_notifications || 0})
              </Link>
              <Link 
                href="/admin/audit" 
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg border pg-border bg-white dark:bg-slate-800 pg-text hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
              >
                <History className="w-3.5 h-3.5 text-blue-500" /> Audit Log
              </Link>
            </div>
          </div>
        </div>

        {/* Live Quorum Gauge Mini */}
        <div className="pg-surface border pg-border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider pg-muted flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-emerald-500" /> Status Kuorum
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                isQuorumReached 
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
              }`}>
                {isQuorumReached ? "Kuorum Sah (≥50%)" : "Belum Kuorum"}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold pg-text">
                <span>Kehadiran Peserta</span>
                <span className="font-bold">{quorumPercentage}% ({summary.checked_in}/{summary.approved_participants})</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border pg-border">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${isQuorumReached ? "bg-emerald-500" : "bg-amber-500"}`} 
                  style={{ width: `${Math.min(quorumPercentage, 100)}%` }} 
                />
              </div>
            </div>
          </div>

          {/* System Health Info */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border pg-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold pg-text">Status Sistem</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Normal
            </span>
          </div>
        </div>
      </div>

      {/* Participant Capacity Quota Management Widget */}
      <div className="pg-surface border pg-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold pg-text">Kapasitas Kuota Peserta Terverifikasi</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  summary.capacity_status === 'Full' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' :
                  summary.capacity_status === 'Critical' ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' :
                  summary.capacity_status === 'Warning' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' :
                  'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                }`}>
                  Status: {summary.capacity_status || (summary.participant_limit && summary.participant_limit > 0 ? (summary.approved_participants >= summary.participant_limit ? 'Full' : 'Normal') : 'Normal')}
                </span>
              </div>
              <p className="text-xs pg-muted">
                Hanya peserta berstatus <strong>VERIFIED</strong> yang mengonsumsi kuota peserta acara.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/website/identity"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20"
            >
              <Settings2 className="w-3.5 h-3.5" /> Konfigurasi Kapasitas
            </Link>
          </div>
        </div>

        {/* Progress Bar & Details */}
        <div className="space-y-3 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-semibold gap-2">
            <div className="flex items-center gap-2">
              <span className="pg-muted">Peserta Terverifikasi:</span>
              <span className="text-sm font-bold pg-text">
                {summary.approved_participants} / {summary.participant_limit && summary.participant_limit > 0 ? summary.participant_limit : "∞ (Tak Terbatas)"}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <span className="pg-muted">Sisa Kursi: </span>
                <span className={`font-bold ${summary.remaining_capacity === 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {summary.remaining_capacity != null ? `${summary.remaining_capacity} kursi` : "Tak Terbatas"}
                </span>
              </div>
              <div>
                <span className="pg-muted">Mode: </span>
                <span className="font-bold pg-text">
                  {summary.capacity_mode === 'WAITING_LIST' ? 'Waiting List' : summary.capacity_mode === 'UNLIMITED' ? 'Antrian Bebas' : 'Tutup saat Penuh'}
                </span>
              </div>
            </div>
          </div>

          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border pg-border">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                summary.capacity_status === 'Full' ? 'bg-rose-500' :
                summary.capacity_status === 'Critical' ? 'bg-orange-500' :
                summary.capacity_status === 'Warning' ? 'bg-amber-500' :
                'bg-emerald-500'
              }`}
              style={{
                width: `${
                  summary.participant_limit && summary.participant_limit > 0
                    ? Math.min(Math.round((summary.approved_participants / summary.participant_limit) * 100), 100)
                    : 100
                }%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/participants" className="pg-surface border pg-border p-5 rounded-2xl flex items-center gap-4 hover:border-primary/50 transition-all shadow-sm group">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Users className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <div className="text-2xl font-bold pg-text">{summary.approved_participants} <span className="text-xs pg-muted font-normal">/ {summary.total_participants}</span></div>
            <div className="text-xs font-bold uppercase tracking-wider pg-muted">Peserta Terverifikasi</div>
          </div>
        </Link>
        
        <Link href="/admin/candidates" className="pg-surface border pg-border p-5 rounded-2xl flex items-center gap-4 hover:border-purple-500/50 transition-all shadow-sm group">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-105 transition-transform">
            <UserCheck className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <div className="text-2xl font-bold pg-text">{summary.total_candidates}</div>
            <div className="text-xs font-bold uppercase tracking-wider pg-muted">Kandidat Terdaftar</div>
          </div>
        </Link>

        <Link href="/admin/attendance" className="pg-surface border pg-border p-5 rounded-2xl flex items-center gap-4 hover:border-emerald-500/50 transition-all shadow-sm group">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl font-bold pg-text">{summary.checked_in}</div>
            <div className="text-xs font-bold uppercase tracking-wider pg-muted">Peserta Hadir Fisik</div>
          </div>
        </Link>

        <div className="pg-surface border pg-border p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
            <Activity className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <div className="text-2xl font-bold pg-text">{summary.votes_cast}</div>
            <div className="text-xs font-bold uppercase tracking-wider pg-muted">Suara Pemilihan</div>
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline Widget */}
      <div className="pg-surface border pg-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm pg-text">Linimasa Aktivitas Terkini</h3>
          </div>
          <Link href="/admin/audit" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
            Lihat Semua Log <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recent_activity && recent_activity.length > 0 ? (
          <div className="divide-y pg-border">
            {recent_activity.slice(0, 6).map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold pg-muted">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold pg-text">{act.action}</p>
                    <p className="text-[11px] pg-muted">Oleh <strong>{act.actor || "Sistem"}</strong> ({act.role || "Admin"})</p>
                  </div>
                </div>
                <span className="text-[11px] pg-muted whitespace-nowrap">
                  {format(new Date(act.timestamp), "dd MMM, HH:mm")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs pg-muted">
            Belum ada catatan aktivitas baru.
          </div>
        )}
      </div>
    </div>
  );
}
