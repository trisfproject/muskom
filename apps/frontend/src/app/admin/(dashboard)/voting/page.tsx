"use client";

import React, { useState, useEffect } from "react";
import { Vote, Play, Pause, Square, RefreshCw, BarChart2, Shield, Award, Users, Percent, Download, ExternalLink, AlertTriangle, CheckCircle2, User, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { PageHeader } from "@/components/admin/PageHeader";

interface VotingSession {
  id: string;
  event_id: string;
  status: "NOT_STARTED" | "RUNNING" | "PAUSED" | "CLOSED";
  started_at?: string;
  closed_at?: string;
}

interface VoteResult {
  candidate_id: string;
  candidate_name: string;
  total_votes: number;
}

interface SummaryData {
  total_voters: number;
  votes_cast: number;
  participation_pct: number;
  results: VoteResult[];
}

interface IntegrityData {
  not_yet_voted: number;
  receipts_count: number;
  ballots_count: number;
  reconciliation_ok: boolean;
  auth_failures: number;
  rate_limited: number;
  vote_failures: number;
  already_voted: number;
}

export default function AdminVotingPage() {
  const [session, setSession] = useState<VotingSession | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [integrity, setIntegrity] = useState<IntegrityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const fetchVotingData = async () => {
    try {
      setLoading(true);

      // Fetch Session
      try {
        const sessRes = await api.get("/admin/votes/session");
        if (sessRes.data?.data) {
          setSession(sessRes.data.data);
        }
      } catch (e) {
        console.warn("Failed to fetch voting session", e);
      }

      // Fetch Summary & Tally
      try {
        const sumRes = await api.get("/admin/votes/summary");
        if (sumRes.data?.data) {
          setSummary(sumRes.data.data);
        }
      } catch (e) {
        console.warn("Failed to fetch voting summary", e);
      }

      // Fetch Integrity / Reconciliation
      try {
        const opsRes = await api.get("/admin/dashboard/operations");
        if (opsRes.data?.data?.voting) {
          const v = opsRes.data.data.voting;
          setIntegrity({
            not_yet_voted: v.not_yet_voted ?? 0,
            receipts_count: v.receipts_count ?? 0,
            ballots_count: v.ballots_count ?? 0,
            reconciliation_ok: v.reconciliation_ok ?? true,
            auth_failures: v.auth_failures ?? 0,
            rate_limited: v.rate_limited ?? 0,
            vote_failures: v.vote_failures ?? 0,
            already_voted: v.already_voted ?? 0,
          });
        }
      } catch (e) {
        console.warn("Failed to fetch integrity data", e);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data e-voting");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVotingData();
    // Set auto-refresh interval for 30s if running
    let interval: NodeJS.Timeout;
    if (session?.status === "RUNNING") {
      interval = setInterval(fetchVotingData, 30000);
    }
    return () => clearInterval(interval);
  }, [session?.status]);

  const handleUpdateStatus = async (action: "start" | "pause" | "resume" | "stop") => {
    try {
      setActionLoading(true);
      const res = await api.post(`/admin/votes/session/${action}`);
      if (res.data?.success) {
        toast.success(`Sesi Voting Berhasil Didefinisikan: ${action.toUpperCase()}`);
        fetchVotingData();
        if (action === "stop") setShowCloseConfirm(false);
      } else {
        toast.error(`Gagal mengubah status sesi: ${res.data?.message || "Kesalahan server"}`);
      }
    } catch (err: any) {
      toast.error(`Gagal mengubah status sesi: ${err.response?.data?.message || "Terjadi kesalahan sistem."}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBanner = (st?: string) => {
    switch (st) {
      case "RUNNING":
        return (
          <div className="mb-6 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 p-4 flex items-center justify-between shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <div className="flex items-center gap-4">
              <div className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
              </div>
              <div>
                <h3 className="font-bold text-emerald-700 dark:text-emerald-400">STATUS: SESI PEMILIHAN BERJALAN</h3>
                <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 font-medium">Bilik suara digital saat ini terbuka untuk pemilih.</p>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">Waktu Mulai</p>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  {session?.started_at ? new Date(session.started_at).toLocaleTimeString('id-ID') : '-'}
                </p>
              </div>
            </div>
          </div>
        );
      case "PAUSED":
        return (
          <div className="mb-6 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 p-4 flex items-center gap-4">
            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-600 dark:text-amber-400">
              <Pause className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-amber-700 dark:text-amber-400">STATUS: SESI PEMILIHAN DIJEDA</h3>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/80 font-medium">Pemilih sementara tidak dapat memasukkan suara.</p>
            </div>
          </div>
        );
      case "CLOSED":
        return (
          <div className="mb-6 rounded-xl bg-gradient-to-r from-slate-500/10 via-slate-500/5 to-transparent border border-slate-500/20 p-4 flex items-center gap-4">
            <div className="p-2 bg-slate-500/20 rounded-lg text-slate-600 dark:text-slate-400">
              <Square className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-slate-700 dark:text-slate-400">STATUS: SESI PEMILIHAN DITUTUP FINAL</h3>
              <p className="text-xs text-slate-600/80 dark:text-slate-400/80 font-medium">Hasil rekapitulasi akhir sudah bersifat final.</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="mb-6 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-4">
            <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-700 dark:text-slate-300">STATUS: BELUM DIMULAI</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Silakan buka sesi ketika semua persiapan telah selesai.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Command Center: E-Voting"
        description="Kontrol Sesi Pemilihan dan Perhitungan Suara Rahasia Real-Time"
        actions={
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/evoting"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all font-semibold w-full sm:w-fit shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]"
            >
              <ExternalLink className="w-4 h-4" /> 
              <span>Buka Bilik Suara</span>
            </a>
            <button
              onClick={fetchVotingData}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-semibold w-full sm:w-fit shadow-sm border border-slate-200 dark:border-slate-700"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> 
              <span>Refresh Tally</span>
            </button>
          </div>
        }
      />

      {getStatusBanner(session?.status)}

      {/* Control Card & Turnout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session Control Panel */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 space-y-6">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5 text-indigo-500" /> Kontrol Sistem Pilihan
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gunakan kontrol di bawah dengan hati-hati. Aksi bersifat real-time untuk seluruh bilik suara.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button
                onClick={() => handleUpdateStatus("start")}
                disabled={actionLoading || session?.status !== "NOT_STARTED"}
                className={`group relative overflow-hidden p-4 min-h-[90px] rounded-xl flex flex-col items-center justify-center gap-2 transition-all shadow-sm ${
                  session?.status !== "NOT_STARTED"
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-50 cursor-not-allowed border border-slate-200 dark:border-slate-700" 
                    : "bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 border border-emerald-400/30"
                }`}
              >
                <Play className={`w-6 h-6 fill-current ${session?.status === "NOT_STARTED" ? "group-hover:scale-110 transition-transform" : ""}`} />
                <span className="font-bold tracking-wide text-xs">BUKA SESI</span>
              </button>
              
              <button
                onClick={() => handleUpdateStatus("pause")}
                disabled={actionLoading || session?.status !== "RUNNING"}
                className={`group relative overflow-hidden p-4 min-h-[90px] rounded-xl flex flex-col items-center justify-center gap-2 transition-all shadow-sm ${
                  session?.status !== "RUNNING" 
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-50 cursor-not-allowed border border-slate-200 dark:border-slate-700" 
                    : "bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-0.5 border border-amber-400/30"
                }`}
              >
                <Pause className={`w-6 h-6 fill-current ${session?.status === "RUNNING" ? "group-hover:scale-110 transition-transform" : ""}`} />
                <span className="font-bold tracking-wide text-xs">JEDA SESI</span>
              </button>
              
              <button
                onClick={() => handleUpdateStatus("resume")}
                disabled={actionLoading || session?.status !== "PAUSED"}
                className={`group relative overflow-hidden p-4 min-h-[90px] rounded-xl flex flex-col items-center justify-center gap-2 transition-all shadow-sm ${
                  session?.status !== "PAUSED" 
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-50 cursor-not-allowed border border-slate-200 dark:border-slate-700" 
                    : "bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 border border-indigo-400/30"
                }`}
              >
                <Play className={`w-6 h-6 fill-current ${session?.status === "PAUSED" ? "group-hover:scale-110 transition-transform" : ""}`} />
                <span className="font-bold tracking-wide text-xs">LANJUTKAN</span>
              </button>
              
              <button
                onClick={() => setShowCloseConfirm(true)}
                disabled={actionLoading || (session?.status !== "RUNNING" && session?.status !== "PAUSED")}
                className={`group relative overflow-hidden p-4 min-h-[90px] rounded-xl flex flex-col items-center justify-center gap-2 transition-all shadow-sm ${
                  (session?.status !== "RUNNING" && session?.status !== "PAUSED")
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-50 cursor-not-allowed border border-slate-200 dark:border-slate-700" 
                    : "bg-gradient-to-br from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white shadow-rose-500/20 hover:shadow-rose-500/40 hover:-translate-y-0.5 border border-rose-400/30"
                }`}
              >
                <Square className={`w-6 h-6 fill-current ${(session?.status === "RUNNING" || session?.status === "PAUSED") ? "group-hover:scale-110 transition-transform" : ""}`} />
                <span className="font-bold tracking-wide text-xs">TUTUP FINAL</span>
              </button>
            </div>
          </div>
        </div>

        {/* Turnout Gauge Card */}
        <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex-1 flex flex-col justify-between">
            <div>
              <h2 className="font-bold text-sm text-slate-300 flex items-center gap-2 uppercase tracking-wider">
                <Percent className="w-4 h-4 text-indigo-400" /> Partisipasi Pemilih
              </h2>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-5xl font-black text-white tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">
                  {summary?.participation_pct.toFixed(1) || 0}
                </span>
                <span className="text-xl font-bold text-slate-400 mb-1">%</span>
              </div>
            </div>

            <div className="space-y-4 mt-8">
              <div className="h-4 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50 backdrop-blur-sm shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                  style={{ width: `${Math.min(summary?.participation_pct || 0, 100)}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Suara Masuk</p>
                  <p className="text-xl font-bold text-white">{summary?.votes_cast || 0}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Total DPT Hadir</p>
                  <p className="text-xl font-bold text-white">{summary?.total_voters || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Voting Progress & Integrity Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Belum Memilih */}
        <div className="p-5 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">Belum Memilih</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {integrity?.not_yet_voted ?? "-"}
            </p>
          </div>
        </div>

        {/* Integrity / Reconciliation */}
        <div className={`p-5 rounded-2xl backdrop-blur-xl border shadow-sm flex items-center gap-4 ${
          integrity && !integrity.reconciliation_ok
            ? "bg-rose-50/50 dark:bg-rose-500/5 border-rose-300 dark:border-rose-500/30"
            : "bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
        }`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            integrity && !integrity.reconciliation_ok
              ? "bg-rose-500/10"
              : "bg-emerald-500/10"
          }`}>
            {integrity && !integrity.reconciliation_ok ? (
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            )}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
              Integritas Data
            </p>
            {integrity && !integrity.reconciliation_ok ? (
              <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                ⚠ Mismatch — Receipt: {integrity.receipts_count} / Ballot: {integrity.ballots_count}
              </p>
            ) : (
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                ✓ OK — Receipt: {integrity?.receipts_count ?? 0} = Ballot: {integrity?.ballots_count ?? 0}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Operational Failure Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Gagal Akses</p>
          <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums">{integrity?.auth_failures ?? 0}</p>
        </div>
        <div className="p-4 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Rate Limited</p>
          <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums">{integrity?.rate_limited ?? 0}</p>
        </div>
        <div className="p-4 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Gagal Submit</p>
          <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums">{integrity?.vote_failures ?? 0}</p>
        </div>
        <div className="p-4 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Sudah Memilih</p>
          <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums">{integrity?.already_voted ?? 0}</p>
        </div>
      </div>

      {/* Real-time Tally Results */}
      <div className="p-6 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <h2 className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="w-6 h-6 text-emerald-500" /> Tally Hasil Suara (Secret Ballot)
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Perolehan suara dihitung secara otomatis dan real-time.</p>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer w-full sm:w-auto shadow-sm hover:shadow-md"
            >
              <Download className="w-4 h-4" /> Cetak Laporan
            </button>
          </div>

          {summary?.results && summary.results.length > 0 ? (
            <div className="space-y-4 pt-2">
              {summary.results.sort((a,b) => b.total_votes - a.total_votes).map((cand, idx) => {
                const pct = summary.votes_cast > 0 ? ((cand.total_votes / summary.votes_cast) * 100).toFixed(1) : "0.0";
                const isWinner = idx === 0 && summary.results.length > 1 && cand.total_votes > summary.results[1].total_votes;
                
                return (
                  <div key={cand.candidate_id} className={`group p-4 sm:p-5 rounded-2xl border transition-all duration-300 hover:shadow-md ${isWinner ? 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'} relative overflow-hidden`}>
                    
                    {/* Background Progress Bar */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-slate-100/60 dark:bg-slate-800/40 transition-all duration-1000 ease-out z-0"
                      style={{ width: `${pct}%` }}
                    />
                    
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border-2 shadow-sm ${
                          idx === 0 
                            ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-white border-amber-200 shadow-amber-500/20' 
                            : idx === 1 
                              ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white border-slate-200' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}>
                          #{idx + 1}
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="hidden sm:flex w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 items-center justify-center overflow-hidden shrink-0">
                            <User className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                              {cand.candidate_name}
                              {isWinner && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Kandidat Ketua</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center sm:justify-end gap-6 sm:pl-0 pl-16">
                        <div className="text-left sm:text-right">
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Perolehan</p>
                          <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                            {cand.total_votes} <span className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-normal">Suara</span>
                          </p>
                        </div>
                        
                        <div className="w-px h-10 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
                        
                        <div className="text-right w-20">
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Persentase</p>
                          <p className={`text-xl font-black tabular-nums tracking-tight ${idx === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                            {pct}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/50">
              <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Award className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-1">Belum Ada Tally</h3>
              <p className="text-sm text-slate-500">Perolehan suara akan muncul secara otomatis saat pemilih memberikan suara.</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Tutup Sesi */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 transform transition-all scale-100">
            <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-6 ring-4 ring-rose-50 dark:ring-rose-500/10">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Tutup Sesi Final?</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
              Tindakan ini <strong className="text-slate-700 dark:text-slate-300">tidak dapat dibatalkan</strong>. Pemilih tidak akan dapat memberikan suara lagi dan hasil rekapitulasi akan ditutup secara permanen untuk sesi ini.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowCloseConfirm(false)}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => handleUpdateStatus("stop")}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-[0_4px_14px_0_rgb(225,29,72,0.39)] hover:shadow-[0_6px_20px_rgba(225,29,72,0.23)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {actionLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Ya, Tutup Sesi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
