"use client";

import React from "react";
import { useOperationsDashboard } from "@/services/dashboard/queries";
import {
  RefreshCw, Server, Database, HardDrive, Mail, Activity,
  AlertTriangle, History, CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import Link from "next/link";

export default function OperationalDashboardPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useOperationsDashboard();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="pg-text font-medium">Memuat Operational Control Center...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-rose-700 mb-2">Gagal Memuat Data</h2>
        <p className="pg-muted mb-6">{(error as any)?.message || "Terjadi kesalahan sistem"}</p>
        <button onClick={() => refetch()} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold text-sm">
          <RefreshCw className="w-4 h-4" /> Coba Lagi
        </button>
      </div>
    );
  }

  const { attendance, system_health, recent_activity } = data;

  // Determine operational issues
  const healthIssues: string[] = [];
  if (system_health?.api?.toLowerCase() !== "healthy" && system_health?.api?.toLowerCase() !== "operational") healthIssues.push("API Server tidak sehat");
  if (system_health?.database?.toLowerCase() !== "healthy" && system_health?.database?.toLowerCase() !== "operational") healthIssues.push("Database tidak sehat");
  if (system_health?.redis?.toLowerCase() !== "healthy" && system_health?.redis?.toLowerCase() !== "operational") healthIssues.push("Redis Cache tidak sehat");
  if (system_health?.smtp?.toLowerCase() !== "healthy" && system_health?.smtp?.toLowerCase() !== "operational") healthIssues.push("SMTP Mail tidak sehat");

  const absentCount = attendance?.absent || 0;
  const hasAbsentWarning = absentCount > 0;
  const hasOperationalIssues = healthIssues.length > 0;

  const renderHealthStatus = (status: string) => {
    const s = status?.toLowerCase();
    if (s === "healthy" || s === "operational") {
      return <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-sm"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Sehat</span>;
    }
    if (s === "warning" || s === "degraded") {
      return <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold text-sm"><span className="w-2 h-2 rounded-full bg-amber-500" /> Bermasalah</span>;
    }
    return <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold text-sm"><span className="w-2 h-2 rounded-full bg-rose-500" /> Offline</span>;
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 dark:bg-slate-950 p-5 sm:p-6 rounded-2xl border border-slate-800 text-white">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Activity className="w-6 h-6 text-emerald-400 shrink-0" /> Operational Control Center
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Monitoring kesehatan sistem dan operasional panitia.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pembaruan</div>
            <div className="text-sm font-bold">{format(new Date(), "HH:mm:ss", { locale: idLocale })}</div>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Operational Alerts */}
      <div className={`p-5 rounded-2xl border ${
        hasOperationalIssues
          ? "bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800/50"
          : "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50"
      }`}>
        <div className="flex items-center gap-2 mb-2">
          {hasOperationalIssues
            ? <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-500" />
            : <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
          }
          <h2 className={`font-bold text-base ${hasOperationalIssues ? "text-rose-800 dark:text-rose-400" : "text-emerald-800 dark:text-emerald-400"}`}>
            Tindakan Diperlukan
          </h2>
        </div>
        {hasOperationalIssues ? (
          <ul className="space-y-1 mt-2">
            {healthIssues.map((issue, i) => (
              <li key={i} className="text-sm text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" /> {issue}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
            ✅ Tidak ada masalah operasional yang perlu ditangani.
          </p>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* System Health */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold pg-text flex items-center gap-2 mb-5">
            <Server className="w-4 h-4 text-slate-500" /> System Health
          </h3>
          <div className="space-y-3">
            {[
              { icon: Server, label: "API Server", status: system_health?.api },
              { icon: Database, label: "Database", status: system_health?.database },
              { icon: HardDrive, label: "Redis Cache", status: system_health?.redis },
              { icon: Mail, label: "SMTP Mail", status: system_health?.smtp },
            ].map(({ icon: Icon, label, status }) => (
              <div key={label} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <Icon className="w-4.5 h-4.5 text-slate-400" />
                  <span className="text-sm font-semibold pg-text">{label}</span>
                </div>
                {renderHealthStatus(status || "unknown")}
              </div>
            ))}
          </div>
        </div>

        {/* Monitor Check-in */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold pg-text flex items-center gap-2 mb-5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Monitor Check-in
          </h3>
          <div className="text-center p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800/30 mb-4">
            <div className="text-5xl font-black text-emerald-600 dark:text-emerald-500">{attendance?.present || 0}</div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800/70 dark:text-emerald-400 mt-2">Peserta Hadir</div>
          </div>
          <div className="text-center mb-5">
            {absentCount > 0 ? (
              <p className="text-sm pg-muted">
                <span className="font-semibold text-amber-600">{absentCount}</span> peserta belum hadir
                {attendance?.percentage ? ` (${(100 - attendance.percentage).toFixed(0)}%)` : ""}
              </p>
            ) : (
              <p className="text-sm text-emerald-600 font-medium">Semua peserta sudah hadir.</p>
            )}
          </div>
          {/* Progress bar */}
          {attendance && attendance.present > 0 && (
            <div className="mb-5">
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min(attendance.percentage || 0, 100)}%` }}
                />
              </div>
              <p className="text-[11px] pg-muted text-right mt-1">{(attendance.percentage || 0).toFixed(0)}% kehadiran</p>
            </div>
          )}
          <Link href="/admin/checkin" className="block w-full text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold py-2.5 rounded-xl transition-colors">
            Buka Scanner QR
          </Link>
        </div>
      </div>

      {/* Bottom Row: Activity + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold pg-text flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
              Live Activity
            </h3>
            <Link href="/admin/audit" className="text-xs font-semibold text-primary hover:underline">Audit Log Lengkap</Link>
          </div>

          {recent_activity && recent_activity.length > 0 ? (
            <div className="space-y-3">
              {recent_activity.slice(0, 5).map((activity: any) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm mt-0.5 shrink-0">
                    <History className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 uppercase tracking-wider">{activity.action}</span>
                      <span className="text-xs text-slate-500">{format(new Date(activity.timestamp), "HH:mm:ss")}</span>
                    </div>
                    <div className="text-sm font-medium pg-text mt-1 truncate">{activity.actor || "Sistem"} <span className="text-xs pg-muted font-normal">({activity.role || "Admin"})</span></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-sm pg-muted">Tidak ada aktivitas real-time terdeteksi.</div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold pg-text flex items-center gap-2 mb-5">
            <Activity className="w-4 h-4 text-blue-500" /> Quick Links
          </h3>
          <div className="space-y-2.5">
            <Link href="/admin/voting" className="flex items-center justify-between p-3.5 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors group">
              <span className="text-sm font-bold text-primary">Monitor E-Voting</span>
              <span className="text-xs text-primary/60 group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
            <Link href="/admin/attendance" className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <span className="text-sm font-semibold pg-text">Presensi Kehadiran</span>
              <span className="text-xs pg-muted">→</span>
            </Link>
            <Link href="/admin/audit" className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <span className="text-sm font-semibold pg-text">Audit Log</span>
              <span className="text-xs pg-muted">→</span>
            </Link>
            <Link href="/admin/dashboard" className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <span className="text-sm font-semibold pg-text">Dashboard Pemilihan</span>
              <span className="text-xs pg-muted">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
