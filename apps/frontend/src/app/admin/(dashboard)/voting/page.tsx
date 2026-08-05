"use client";

import React, { useState, useEffect } from "react";
import { Vote, Play, Pause, Square, RefreshCw, BarChart2, Shield, Award, Users, Percent, Download } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";

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

export default function AdminVotingPage() {
  const [session, setSession] = useState<VotingSession | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchVotingData = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("access_token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch Session
      const sessRes = await fetch("/api/v1/admin/votes/session", { headers });
      const sessData = await sessRes.json();
      if (sessData.success) {
        setSession(sessData.data);
      }

      // Fetch Summary & Tally
      const sumRes = await fetch("/api/v1/admin/votes/summary", { headers });
      const sumData = await sumRes.json();
      if (sumData.success) {
        setSummary(sumData.data);
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
  }, []);

  const handleUpdateStatus = async (action: "start" | "pause" | "resume" | "stop") => {
    try {
      setActionLoading(true);
      const token = Cookies.get("access_token");
      const res = await fetch(`/api/v1/admin/votes/session/${action}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Sesi Voting Berhasil Didefinisikan: ${action.toUpperCase()}`);
        fetchVotingData();
      } else {
        toast.error(`Gagal mengubah status sesi: ${data.message || "Kesalahan server"}`);
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (st?: string) => {
    switch (st) {
      case "RUNNING":
        return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 rounded-full text-xs animate-pulse flex items-center gap-1.5"><Play className="w-3.5 h-3.5 fill-current" /> SESI BERJALAN</span>;
      case "PAUSED":
        return <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20 rounded-full text-xs flex items-center gap-1.5"><Pause className="w-3.5 h-3.5 fill-current" /> SESI DIJEDA</span>;
      case "CLOSED":
        return <span className="px-3 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20 rounded-full text-xs flex items-center gap-1.5"><Square className="w-3.5 h-3.5 fill-current" /> SESI DITUTUP</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 text-slate-600 font-bold border border-slate-200 rounded-full text-xs">BELUM DIMULAI</span>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Vote className="w-7 h-7 text-primary" /> E-Voting Control Panel & Tally Engine
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kontrol Sesi Pemilihan dan Perhitungan Suara Rahasia Real-Time
          </p>
        </div>
        <button
          onClick={fetchVotingData}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm font-medium w-fit"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh Tally
        </button>
      </div>

      {/* Control Card & Turnout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session Control Panel */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-500" /> Kontrol Sesi Pemilihan
              </h2>
              <p className="text-xs text-slate-500 mt-1">Kelola pembukaan dan penutupan bilik suara digital</p>
            </div>
            {getStatusBadge(session?.status)}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => handleUpdateStatus("start")}
              disabled={actionLoading || session?.status === "RUNNING"}
              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex flex-col items-center justify-center gap-1.5"
            >
              <Play className="w-4 h-4 fill-current" /> Buka Sesi
            </button>
            <button
              onClick={() => handleUpdateStatus("pause")}
              disabled={actionLoading || session?.status !== "RUNNING"}
              className="px-4 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex flex-col items-center justify-center gap-1.5"
            >
              <Pause className="w-4 h-4 fill-current" /> Jeda Sesi
            </button>
            <button
              onClick={() => handleUpdateStatus("resume")}
              disabled={actionLoading || session?.status !== "PAUSED"}
              className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex flex-col items-center justify-center gap-1.5"
            >
              <Play className="w-4 h-4 fill-current" /> Lanjutkan
            </button>
            <button
              onClick={() => handleUpdateStatus("stop")}
              disabled={actionLoading || session?.status === "CLOSED"}
              className="px-4 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex flex-col items-center justify-center gap-1.5"
            >
              <Square className="w-4 h-4 fill-current" /> Tutup Sesi
            </button>
          </div>
        </div>

        {/* Turnout Gauge Card */}
        <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <h2 className="font-semibold text-sm text-slate-300 flex items-center gap-2">
              <Percent className="w-4 h-4 text-indigo-400" /> Voter Turnout
            </h2>
            <p className="text-3xl font-black text-white">{summary?.participation_pct.toFixed(1) || 0}%</p>
          </div>

          <div className="space-y-3 mt-4">
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${Math.min(summary?.participation_pct || 0, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>Suara Masuk: <strong className="text-white">{summary?.votes_cast || 0}</strong></span>
              <span>Total DPT Hadir: <strong className="text-white">{summary?.total_voters || 0}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Tally Results */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-emerald-500" /> Perolehan Suara Kandidat (Secret Ballot Tally)
          </h2>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-200"
          >
            <Download className="w-3.5 h-3.5" /> Cetak Hasil
          </button>
        </div>

        {summary?.results && summary.results.length > 0 ? (
          <div className="space-y-4">
            {summary.results.map((cand, idx) => {
              const pct = summary.votes_cast > 0 ? Math.round((cand.total_votes / summary.votes_cast) * 100) : 0;
              return (
                <div key={cand.candidate_id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{cand.candidate_name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900 dark:text-white">{cand.total_votes} Suara</span>
                      <span className="text-xs text-slate-400 block font-medium">({pct}%)</span>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            <Award className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
            <p className="font-medium text-sm">Belum ada data perolehan suara.</p>
          </div>
        )}
      </div>
    </div>
  );
}
