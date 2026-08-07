"use client";

import React, { useState, useEffect } from "react";
import { UserCheck, Search, QrCode, RefreshCw, Undo2, CheckCircle2, XCircle, Users, Percent } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface AttendanceItem {
  participant_id: string;
  participant_name: string;
  institution: string;
  verification_status: string;
  attendance_status: "PRESENT" | "ABSENT";
  checked_in_at?: string;
}

interface SummaryData {
  total_participants: number;
  total_present: number;
  total_absent: number;
}

export default function AdminAttendancePage() {
  const [attendances, setAttendances] = useState<AttendanceItem[]>([]);
  const [summary, setSummary] = useState<SummaryData>({ total_participants: 0, total_present: 0, total_absent: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [scanToken, setScanToken] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);

      // Fetch summary
      try {
        const sumRes = await api.get("/admin/attendance/summary");
        if (sumRes.data?.data) {
          setSummary(sumRes.data.data);
        }
      } catch (e) {
        console.warn("Failed to fetch attendance summary", e);
      }

      // Fetch list
      let url = `/admin/attendance?limit=50`;
      if (statusFilter !== "ALL") {
        url += `&attendance_status=${statusFilter}`;
      }
      if (search) {
        url += `&participant_name=${encodeURIComponent(search)}`;
      }

      const listRes = await api.get(url);
      const items = listRes.data?.data?.items ?? listRes.data?.data ?? listRes.data?.items ?? [];
      setAttendances(items);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data presensi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [statusFilter]);

  const handleManualCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanToken.trim()) return;

    try {
      setSubmitting(true);
      const res = await api.post("/admin/attendance/check-in", {
        participant_id: scanToken.trim(),
        registration_id: scanToken.trim(),
      });

      if (res.data?.success) {
        toast.success("Check-in Berhasil!", {
          description: res.data?.data?.is_new ? "Peserta baru saja di-check-in." : "Peserta sudah check-in sebelumnya.",
        });
        setScanToken("");
        fetchAttendanceData();
      } else {
        toast.error("Check-in Gagal", {
          description: res.data?.message || "Peserta tidak ditemukan atau belum diverifikasi.",
        });
      }
    } catch (err: any) {
      toast.error("Check-in Gagal", {
        description: err.response?.data?.message || "Peserta tidak ditemukan atau belum diverifikasi.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const quorumPercentage = summary.total_participants > 0 
    ? Math.round((summary.total_present / summary.total_participants) * 100)
    : 0;
  const isQuorumReached = quorumPercentage >= 50;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-primary" /> Presensi & Live Quorum
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Scanner QR Code dan Manajemen Kehadiran Peserta Musyawarah
          </p>
        </div>
        <button
          onClick={fetchAttendanceData}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm font-medium w-fit"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh Data
        </button>
      </div>

      {/* Live Quorum Gauge & Scanner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quorum Summary Gauge */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Percent className="w-5 h-5 text-indigo-500" /> Gauge Kuorum Musyawarah
            </h2>
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full ${
                isQuorumReached
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
              }`}
            >
              {isQuorumReached ? "✓ Kuorum Tercapai (≥50%)" : "⚠ Belum Kuorum (<50%)"}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium text-slate-600 dark:text-slate-300">
              <span>Kehadiran Peserta</span>
              <span className="font-bold text-slate-900 dark:text-white">{quorumPercentage}% ({summary.total_present} / {summary.total_participants})</span>
            </div>
            <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isQuorumReached ? "bg-emerald-500" : "bg-amber-500"
                }`}
                style={{ width: `${Math.min(quorumPercentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Peserta</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{summary.total_participants}</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-center">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Hadir (Checked-In)</p>
              <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">{summary.total_present}</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 text-center">
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Belum Hadir</p>
              <p className="text-xl font-bold text-amber-700 dark:text-amber-300 mt-1">{summary.total_absent}</p>
            </div>
          </div>
        </div>

        {/* Scanner Input Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white border border-indigo-800 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <QrCode className="w-6 h-6 text-indigo-400" />
              <h2 className="font-bold text-lg">Quick QR Check-In</h2>
            </div>
            <p className="text-xs text-indigo-200 leading-relaxed">
              Ketikkan Participant ID / Token QR atau gunakan barcode scanner fisik untuk melakukan registrasi kehadiran secara instan.
            </p>
          </div>

          <form onSubmit={handleManualCheckIn} className="mt-4 space-y-3">
            <input
              type="text"
              value={scanToken}
              onChange={(e) => setScanToken(e.target.value)}
              placeholder="Masukkan Participant ID / Token QR..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-indigo-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              type="submit"
              disabled={submitting || !scanToken.trim()}
              className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Proses Check-In
            </button>
          </form>
        </div>
      </div>

      {/* Attendance List */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchAttendanceData()}
              placeholder="Cari nama peserta..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {["ALL", "PRESENT", "ABSENT"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  statusFilter === st
                    ? "bg-primary text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                {st === "ALL" ? "Semua" : st === "PRESENT" ? "Hadir" : "Belum Hadir"}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold">
              <tr>
                <th className="p-3">Peserta</th>
                <th className="p-3">Instansi / Perusahaan</th>
                <th className="p-3">Status Verifikasi</th>
                <th className="p-3">Status Presensi</th>
                <th className="p-3">Waktu Check-in</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" /> Memuat daftar presensi...
                  </td>
                </tr>
              ) : attendances.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    Tidak ada peserta yang ditemukan.
                  </td>
                </tr>
              ) : (
                attendances.map((item) => (
                  <tr key={item.participant_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-medium text-slate-900 dark:text-white">
                      {item.participant_name}
                      <p className="text-[11px] text-slate-400 font-mono">{item.participant_id}</p>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{item.institution || "-"}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-blue-50 text-blue-600 border border-blue-200">
                        {item.verification_status}
                      </span>
                    </td>
                    <td className="p-3">
                      {item.attendance_status === "PRESENT" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> HADIR
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                          <XCircle className="w-3.5 h-3.5" /> BELUM HADIR
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-500 text-xs">
                      {item.checked_in_at ? new Date(item.checked_in_at).toLocaleString("id-ID") : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
