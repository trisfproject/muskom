"use client";

import { useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboard";
import { DashboardData } from "@/types/dashboard";
import {
  Settings2,
  CheckCircle2,
  Clock,
  ArrowRight,
  History,
  Percent,
  Vote,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import Link from "next/link";
import { format } from "date-fns";
import api from "@/lib/api";

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [sessionStatus, setSessionStatus] = useState<string>("NOT_STARTED");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dashRes, sessRes] = await Promise.allSettled([
          dashboardService.getSummary(),
          api.get("/admin/votes/session"),
        ]);
        if (dashRes.status === "fulfilled") setData(dashRes.value);
        if (sessRes.status === "fulfilled" && sessRes.value.data?.data?.status) {
          setSessionStatus(sessRes.value.data.data.status);
        }
      } catch {
        // handled by individual checks
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
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
        <p className="pg-muted text-sm mb-6">Sistem tidak dapat memuat data operasional saat ini.</p>
      </div>
    );
  }

  const { summary, recent_activity } = data;

  const quorumPercentage = summary.approved_participants > 0
    ? Math.round((summary.checked_in / summary.approved_participants) * 100)
    : 0;
  const isQuorumReached = quorumPercentage >= 50;

  const turnoutPct = summary.checked_in > 0
    ? ((summary.votes_cast / summary.checked_in) * 100).toFixed(1)
    : "0.0";
  const notYetVoted = Math.max(summary.checked_in - summary.votes_cast, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Pemilihan"
        description="Ringkasan kesiapan peserta dan kondisi pemilihan."
      />

      {/* Election Status + Quick Link */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`lg:col-span-2 rounded-2xl p-5 border flex flex-col sm:flex-row sm:items-center gap-4 ${
          sessionStatus === "RUNNING"
            ? "bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20"
            : sessionStatus === "CLOSED"
            ? "bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
            : sessionStatus === "PAUSED"
            ? "bg-amber-50/50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20"
            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            sessionStatus === "RUNNING" ? "bg-emerald-500/10" : sessionStatus === "CLOSED" ? "bg-slate-500/10" : sessionStatus === "PAUSED" ? "bg-amber-500/10" : "bg-slate-100 dark:bg-slate-800"
          }`}>
            <Vote className={`w-5 h-5 ${
              sessionStatus === "RUNNING" ? "text-emerald-600" : sessionStatus === "CLOSED" ? "text-slate-500" : sessionStatus === "PAUSED" ? "text-amber-600" : "text-slate-400"
            }`} />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-sm pg-text">
              Sesi Pemilihan: {sessionStatus === "RUNNING" ? "BERJALAN" : sessionStatus === "CLOSED" ? "DITUTUP FINAL" : sessionStatus === "PAUSED" ? "DIJEDA" : "BELUM DIMULAI"}
            </h2>
            <p className="text-xs pg-muted mt-0.5">
              {sessionStatus === "RUNNING" ? "Bilik suara terbuka." : sessionStatus === "CLOSED" ? "Hasil bersifat final." : sessionStatus === "PAUSED" ? "Sesi dijeda sementara." : "Belum dimulai oleh panitia."}
            </p>
          </div>
          <Link href="/admin/voting" className="sm:ml-auto shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-4 py-2.5 rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors">
            Monitor E-Voting <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Quorum Mini */}
        <div className="pg-surface border pg-border rounded-2xl p-5 shadow-sm flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider pg-muted flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-emerald-500" /> Kuorum
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isQuorumReached ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
            }`}>
              {isQuorumReached ? "Sah ≥50%" : "Belum"}
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border pg-border">
            <div className={`h-full rounded-full transition-all duration-500 ${isQuorumReached ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${Math.min(quorumPercentage, 100)}%` }} />
          </div>
          <p className="text-xs font-semibold pg-text mt-2">{quorumPercentage}% ({summary.checked_in}/{summary.approved_participants})</p>
        </div>
      </div>

      {/* Key Election Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link href="/admin/attendance" className="px-4 py-5 sm:p-5 rounded-2xl pg-surface border pg-border shadow-sm hover:border-emerald-500/30 transition-colors">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 leading-tight">Peserta Hadir</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums leading-none">{summary.checked_in}</p>
          <p className="text-[10px] text-slate-400 mt-1.5">dari {summary.approved_participants} terverifikasi</p>
        </Link>
        <div className="px-4 py-5 sm:p-5 rounded-2xl pg-surface border pg-border shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 leading-tight">Sudah Memilih</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums leading-none">{summary.votes_cast}</p>
          <p className="text-[10px] text-slate-400 mt-1.5">turnout {turnoutPct}%</p>
        </div>
        <div className="px-4 py-5 sm:p-5 rounded-2xl pg-surface border pg-border shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 leading-tight">Belum Memilih</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums leading-none">{notYetVoted}</p>
          <p className="text-[10px] text-slate-400 mt-1.5">dari {summary.checked_in} hadir</p>
        </div>
        <Link href="/admin/candidates" className="px-4 py-5 sm:p-5 rounded-2xl pg-surface border pg-border shadow-sm hover:border-purple-500/30 transition-colors">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 leading-tight">Kandidat Aktif</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums leading-none">{summary.total_candidates}</p>
          <p className="text-[10px] text-slate-400 mt-1.5">terpublikasi</p>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="pg-surface border pg-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm pg-text">Aktivitas Terkini</h3>
          </div>
          <Link href="/admin/audit" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
            Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recent_activity && recent_activity.length > 0 ? (
          <div className="divide-y pg-border">
            {recent_activity.slice(0, 5).map((act) => (
              <div key={act.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Clock className="w-4 h-4 pg-muted" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold pg-text truncate">{act.action}</p>
                    <p className="text-[11px] pg-muted truncate">Oleh <strong>{act.actor || "Sistem"}</strong> ({act.role || "Admin"})</p>
                  </div>
                </div>
                <span className="text-[11px] pg-muted shrink-0 self-end sm:self-auto">
                  {format(new Date(act.timestamp), "dd MMM, HH:mm")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs pg-muted">Belum ada catatan aktivitas baru.</div>
        )}
      </div>
    </div>
  );
}
