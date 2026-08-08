"use client";

import React from "react";
import { useOperationsDashboard } from "@/services/dashboard/queries";
import { 
  Users, UserSearch, CheckCircle2, AlertTriangle, 
  RefreshCw, Server, Database, HardDrive, Mail, Activity, 
  Eye, FileText, ArrowRight, ShieldAlert, Clock, 
  History, CheckSquare, XCircle
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
        <button onClick={() => refetch()} className="btn btn-primary flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Coba Lagi
        </button>
      </div>
    );
  }

  const { pending_registrations, pending_candidates, attendance, voting, system_health, recent_activity } = data;

  const totalPendingAction = (pending_registrations?.length || 0) + (pending_candidates?.length || 0);

  const renderHealthStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case "healthy":
      case "operational":
        return <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-sm"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Sehat</span>;
      case "warning":
      case "degraded":
        return <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold text-sm"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Warning</span>;
      default:
        return <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold text-sm"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Offline</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 dark:bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm text-white">
        <div>
          <h1 className="text-2xl font-black tracking-tight uppercase flex items-center gap-3">
            <Activity className="w-7 h-7 text-emerald-400" /> Operational Control Center
          </h1>
          <p className="text-sm text-slate-300 mt-1 flex items-center gap-2">
            Panel monitoring operasional real-time dan antrean tindakan panitia
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pembaruan Terakhir</div>
            <div className="text-sm font-bold">{format(new Date(), "HH:mm:ss", { locale: idLocale })}</div>
          </div>
          <button 
            onClick={() => refetch()} 
            disabled={isFetching}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* A. PERLU TINDAKAN (ACTION REQUIRED) */}
      <div className={`p-5 rounded-2xl border ${totalPendingAction > 0 ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/50' : 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50'}`}>
        <div className="flex items-center gap-2 mb-4">
          {totalPendingAction > 0 ? <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />}
          <h2 className={`font-bold text-lg ${totalPendingAction > 0 ? 'text-amber-800 dark:text-amber-500' : 'text-emerald-800 dark:text-emerald-500'}`}>
            Tindakan Diperlukan
          </h2>
        </div>
        
        {totalPendingAction === 0 ? (
          <p className="text-emerald-700 dark:text-emerald-400 font-medium">✨ Tidak ada antrean registrasi atau kandidat saat ini. Semua tugas selesai.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pending_registrations && pending_registrations.length > 0 && (
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-amber-800 dark:text-amber-500">{pending_registrations.length} Peserta Menunggu Verifikasi</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Berkas pendaftaran perlu ditinjau.</div>
                </div>
                <Link href="/admin/verifications" className="btn bg-amber-500 hover:bg-amber-600 text-white text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 shadow-sm">
                  Verifikasi Sekarang <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
            
            {pending_candidates && pending_candidates.length > 0 && (
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-amber-800 dark:text-amber-500">{pending_candidates.length} Kandidat Perlu Ditinjau</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Status draft atau pending publikasi.</div>
                </div>
                <Link href="/admin/candidates" className="btn bg-amber-500 hover:bg-amber-600 text-white text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 shadow-sm">
                  Tinjau Kandidat <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left/Main Column - QUEUES */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* B. REGISTRASI & VERIFIKASI QUEUE */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold pg-text flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-amber-500" /> Antrean Registrasi & Verifikasi</h3>
              <Link href="/admin/verifications" className="text-xs font-semibold text-primary hover:underline">Lihat Semua Antrean</Link>
            </div>
            
            {pending_registrations && pending_registrations.length > 0 ? (
              <div className="divide-y pg-border border-t border-b">
                {pending_registrations.map((participant: any) => (
                  <div key={participant.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 shrink-0 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center font-bold text-amber-700 dark:text-amber-500">
                        {participant.full_name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm pg-text truncate">{participant.full_name}</div>
                        <div className="text-xs text-slate-500 truncate">
                          {participant.email} • Mendaftar: {format(new Date(participant.created_at), "dd MMM, HH:mm")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        {participant.status}
                      </span>
                      <Link href={`/admin/participants/${participant.id}`} className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3.5 py-2 min-h-[40px] flex items-center rounded-lg transition-colors">
                        [Review]
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium pg-text">Tidak ada antrean registrasi.</p>
                <p className="text-xs pg-muted">Semua peserta telah diverifikasi.</p>
              </div>
            )}
          </div>

          {/* C. KANDIDAT QUEUE */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold pg-text flex items-center gap-2"><UserSearch className="w-4 h-4 text-indigo-500" /> Kandidat Menunggu Tindakan</h3>
              <Link href="/admin/candidates" className="text-xs font-semibold text-primary hover:underline">Kelola Kandidat</Link>
            </div>
            
            {pending_candidates && pending_candidates.length > 0 ? (
              <div className="divide-y pg-border border-t border-b">
                {pending_candidates.map((candidate: any) => (
                  <div key={candidate.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 shrink-0 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-500">
                        <UserSearch className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm pg-text truncate">{candidate.name}</div>
                        <div className="text-xs text-slate-500 truncate">Kandidat Ketua Umum</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400">
                        {candidate.status}
                      </span>
                      <Link href={`/admin/candidates`} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-3.5 py-2 min-h-[40px] flex items-center rounded-lg transition-colors">
                        {candidate.status === 'Draft' ? '[Publish]' : '[Review]'}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium pg-text">Tidak ada kandidat tertunda.</p>
                <p className="text-xs pg-muted">Semua kandidat aktif telah dipublikasikan.</p>
              </div>
            )}
          </div>
          
          {/* G. LIVE ACTIVITY (Real-time logs) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold pg-text flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                Live Activity (Audit Log)
              </h3>
              <Link href="/admin/audit" className="text-xs font-semibold text-primary hover:underline">Buka Audit Log Lengkap</Link>
            </div>
            
            {recent_activity && recent_activity.length > 0 ? (
              <div className="space-y-4">
                {recent_activity.slice(0, 3).map((activity: any) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm mt-0.5">
                      <History className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 uppercase tracking-wider">{activity.action}</span>
                        <span className="text-xs text-slate-500">{format(new Date(activity.timestamp), "HH:mm:ss")}</span>
                      </div>
                      <div className="text-sm font-medium pg-text mt-1">{activity.actor || "Sistem"} <span className="text-xs pg-muted font-normal">({activity.role || "Admin"})</span></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm pg-muted">Tidak ada aktivitas real-time terdeteksi.</div>
            )}
          </div>

        </div>
        
        {/* Right Column - REAL-TIME MONITORS */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* D. KEHADIRAN / CHECK-IN */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold pg-text flex items-center gap-2 mb-4"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Monitor Check-in</h3>
            <div className="text-center p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800/30 mb-4">
              <div className="text-4xl font-black text-emerald-600 dark:text-emerald-500">{attendance?.present || 0}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800/70 dark:text-emerald-400 mt-1">Peserta Hadir</div>
            </div>
            <Link href="/admin/checkin" className="btn w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm justify-center py-2">
              Buka Scanner QR
            </Link>
          </div>

          {/* E. E-VOTING */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold pg-text flex items-center gap-2 mb-4"><Activity className="w-4 h-4 text-purple-500" /> Monitor Pemilihan</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold pg-muted uppercase tracking-wider">Suara Masuk</span>
                <span className="font-bold pg-text">{voting?.votes_submitted || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold pg-muted uppercase tracking-wider">Total Pemilih</span>
                <span className="font-bold pg-text">{voting?.remaining_voters || 0}</span>
              </div>
              
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, voting?.remaining_voters > 0 ? (voting.votes_submitted / voting.remaining_voters) * 100 : 0)}%` }}></div>
              </div>
              <div className="text-right text-xs font-bold text-slate-500">
                {voting?.remaining_voters > 0 ? Math.round((voting.votes_submitted / voting.remaining_voters) * 100) : 0}% Partisipasi
              </div>
            </div>
          </div>

          {/* F. SYSTEM HEALTH */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold pg-text flex items-center gap-2 mb-4"><Server className="w-4 h-4 text-slate-500" /> System Health</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2"><Server className="w-4 h-4 text-slate-400" /> <span className="text-sm font-semibold">API Server</span></div>
                {renderHealthStatus(system_health?.api)}
              </div>
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2"><Database className="w-4 h-4 text-slate-400" /> <span className="text-sm font-semibold">Database</span></div>
                {renderHealthStatus(system_health?.database)}
              </div>
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2"><HardDrive className="w-4 h-4 text-slate-400" /> <span className="text-sm font-semibold">Redis Cache</span></div>
                {renderHealthStatus(system_health?.redis)}
              </div>
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /> <span className="text-sm font-semibold">SMTP Mail</span></div>
                {renderHealthStatus(system_health?.smtp)}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
