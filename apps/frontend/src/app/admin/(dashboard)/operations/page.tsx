"use client";

import React from "react";
import { useOperationsDashboard } from "@/services/dashboard/queries";
import { Users, UserCheck, ShieldCheck, UserX, UserSearch, FileText, CheckCircle2, XCircle, AlertTriangle, Clock, RefreshCw, Server, Database, HardDrive, Mail, Activity, Eye, PlayCircle, StopCircle, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import Link from "next/link";
import Image from "next/image";

export default function OperationalDashboardPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useOperationsDashboard();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="pg-text font-medium">Memuat Operational Dashboard...</p>
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

  const { participants, candidates, attendance, voting, system_health, recent_registrations, recent_candidates, recent_activity } = data;

  const renderHealthStatus = (status: string) => {
    switch (status.toLowerCase()) {
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-black pg-text tracking-tight uppercase">Operational Dashboard</h1>
          <p className="text-sm pg-muted mt-1 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            Real-time monitoring panel
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Terakhir Diperbarui</div>
            <div className="text-sm font-bold pg-text">{format(new Date(), "HH:mm:ss", { locale: idLocale })}</div>
          </div>
          <button 
            onClick={() => refetch()} 
            disabled={isFetching}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left Column (Main Stats) */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Participants Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Peserta</div>
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Users className="w-5 h-5" /></div>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <div className="text-3xl font-black pg-text">{participants.total}</div>
                {participants.limit && participants.limit > 0 ? (
                  <div className="text-xs font-semibold text-slate-500">/ Kuota {participants.limit}</div>
                ) : null}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2">
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">{participants.verified}</div>
                  <div className="text-emerald-700/70 dark:text-emerald-400/70">Verified</div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2">
                  <div className="font-bold text-amber-600 dark:text-amber-400">{participants.pending}</div>
                  <div className="text-amber-700/70 dark:text-amber-400/70">Pending</div>
                </div>
                <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-2">
                  <div className="font-bold text-rose-600 dark:text-rose-400">{participants.rejected}</div>
                  <div className="text-rose-700/70 dark:text-rose-400/70">Rejected</div>
                </div>
              </div>
            </div>

            {/* Attendance Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/10 rounded-bl-full -mr-16 -mt-16 z-0"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Kehadiran (Verified)</div>
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg"><UserCheck className="w-5 h-5" /></div>
                </div>
                <div className="flex items-baseline gap-2 mb-4">
                  <div className="text-3xl font-black pg-text">{attendance.present}</div>
                  <div className="text-sm font-semibold text-slate-500">/ {participants.verified}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(attendance.percentage || 0, 100)}%` }}></div>
                  </div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{attendance.percentage.toFixed(1)}%</div>
                </div>
              </div>
            </div>

            {/* Voting Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">E-Voting</div>
                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                  {voting.session_state === "Open" ? <PlayCircle className="w-5 h-5" /> : <StopCircle className="w-5 h-5" />}
                </div>
              </div>
              
              {voting.session_state === "Open" ? (
                <>
                  <div className="flex items-baseline gap-2 mb-4">
                    <div className="text-3xl font-black pg-text">{voting.votes_submitted}</div>
                    <div className="text-sm font-semibold text-slate-500">masuk</div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500">Sisa Pemilih:</span>
                    <span className="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded-md">{voting.remaining_voters} orang</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-20 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div className="text-sm font-bold text-slate-400 uppercase">Belum Dimulai / Selesai</div>
                </div>
              )}
            </div>

            {/* Candidates Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Kandidat</div>
                <div className="p-2 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg"><UserSearch className="w-5 h-5" /></div>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <div className="text-3xl font-black pg-text">{candidates.total}</div>
                <div className="text-sm font-semibold text-slate-500">total</div>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">Dipublikasi:</span>
                <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md">{candidates.published} kandidat</span>
              </div>
            </div>

          </div>

          {/* Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Recent Registrations */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-bold pg-text flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-slate-400" />
                  Registrasi Terbaru
                </h3>
                <Link href="/admin/participants" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  Lihat Semua <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="p-0 overflow-x-auto flex-1">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3 whitespace-nowrap">Peserta</th>
                      <th className="px-4 py-3 whitespace-nowrap">Status</th>
                      <th className="px-4 py-3 whitespace-nowrap text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {recent_registrations.length === 0 ? (
                      <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-500">Belum ada registrasi</td></tr>
                    ) : (
                      recent_registrations.map((reg: any) => (
                        <tr key={reg.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-bold pg-text">{reg.full_name}</div>
                            <div className="text-xs text-slate-500 font-mono mt-0.5">{reg.registration_number || reg.email}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              reg.status === 'Verified' || reg.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                              reg.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                              'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                            }`}>
                              {reg.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link href={`/admin/verifications?q=${reg.email}`} className="p-1.5 inline-flex bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors">
                              <Eye className="w-4 h-4" />
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Candidates */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-bold pg-text flex items-center gap-2">
                  <UserSearch className="w-5 h-5 text-slate-400" />
                  Update Kandidat
                </h3>
                <Link href="/admin/candidates" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  Lihat Semua <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="p-0 overflow-x-auto flex-1">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3 whitespace-nowrap">Kandidat</th>
                      <th className="px-4 py-3 whitespace-nowrap">Publikasi</th>
                      <th className="px-4 py-3 whitespace-nowrap text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {recent_candidates.length === 0 ? (
                      <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-500">Belum ada kandidat</td></tr>
                    ) : (
                      recent_candidates.map((cand: any) => (
                        <tr key={cand.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="px-4 py-3 flex items-center gap-3">
                            {cand.photo_url ? (
                              <div className="w-8 h-8 rounded-full overflow-hidden relative shrink-0">
                                <Image src={cand.photo_url} alt={cand.name} fill className="object-cover" unoptimized={cand.photo_url?.startsWith('/uploads/')} />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                            )}
                            <div className="font-bold pg-text truncate max-w-[150px]">{cand.name}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              cand.publication_status === 'Published' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                              'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              {cand.publication_status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link href={`/admin/candidates/${cand.id}`} className="p-1.5 inline-flex bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors">
                              <Eye className="w-4 h-4" />
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
          
          {/* System Health */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold pg-text flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-slate-400" />
              System Health
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                <Server className="w-6 h-6 text-slate-400 mb-2" />
                <div className="text-xs font-bold text-slate-500 uppercase mb-1">API Backend</div>
                {renderHealthStatus(system_health.api)}
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                <Database className="w-6 h-6 text-slate-400 mb-2" />
                <div className="text-xs font-bold text-slate-500 uppercase mb-1">Database</div>
                {renderHealthStatus(system_health.database)}
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                <Database className="w-6 h-6 text-slate-400 mb-2" />
                <div className="text-xs font-bold text-slate-500 uppercase mb-1">Redis Cache</div>
                {renderHealthStatus(system_health.redis)}
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                <HardDrive className="w-6 h-6 text-slate-400 mb-2" />
                <div className="text-xs font-bold text-slate-500 uppercase mb-1">File Storage</div>
                {renderHealthStatus(system_health.storage)}
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                <Mail className="w-6 h-6 text-slate-400 mb-2" />
                <div className="text-xs font-bold text-slate-500 uppercase mb-1">SMTP Mailer</div>
                {renderHealthStatus(system_health.smtp)}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (Activity Feed) */}
        <div className="xl:col-span-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-full flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold pg-text flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" />
                Live Activity
              </h3>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto">
              {recent_activity.length === 0 ? (
                <div className="text-center py-8 text-slate-500 font-medium">Belum ada aktivitas</div>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="space-y-4 flex-1">
                    {recent_activity.map((activity: any, idx: number) => (
                      <div key={activity.id || idx} className="flex gap-3 items-start group">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 shrink-0">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="text-sm font-semibold pg-text truncate">
                            {activity.action.replace(/_/g, ' ')}
                          </div>
                          <div className="text-xs text-slate-500 truncate mb-1">
                            {activity.actor}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(activity.timestamp), "dd MMM yyyy, HH:mm", { locale: idLocale })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Link href="/admin/audit" className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                      Lihat Semua <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
