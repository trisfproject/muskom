"use client";

import React, { useState, useEffect } from "react";
import { 
  UserCheck, 
  Search, 
  QrCode, 
  RefreshCw, 
  Undo2, 
  CheckCircle2, 
  XCircle, 
  Users, 
  Percent, 
  Trash2,
  CheckSquare,
  Square,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { PageHeader } from "@/components/admin/PageHeader";

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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

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
      let url = `/admin/attendance?limit=100`;
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

  const handleQuickCheckIn = async (participantId: string) => {
    try {
      setActionLoadingId(participantId);
      const res = await api.post("/admin/attendance/check-in", {
        participant_id: participantId,
      });
      if (res.data?.success) {
        toast.success("Peserta berhasil dicatat hadir!");
        fetchAttendanceData();
      } else {
        toast.error(res.data?.message || "Gagal melakukan presensi");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal melakukan presensi");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUndoCheckIn = async (participantId: string) => {
    try {
      setActionLoadingId(participantId);
      const res = await api.delete(`/admin/attendance/${participantId}`);
      if (res.data?.success) {
        toast.success("Presensi kehadiran berhasil dibatalkan");
        fetchAttendanceData();
      } else {
        toast.error(res.data?.message || "Gagal membatalkan presensi");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal membatalkan presensi");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBulkUndo = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Batalkan presensi untuk ${selectedIds.length} peserta terpilih?`)) return;

    try {
      setSubmitting(true);
      const res = await api.post("/admin/attendance/bulk-undo", {
        participant_ids: selectedIds,
        reason: "Bulk undo by admin",
      });
      if (res.data?.success) {
        toast.success(`Berhasil membatalkan presensi ${selectedIds.length} peserta.`);
        setSelectedIds([]);
        fetchAttendanceData();
      } else {
        toast.error(res.data?.message || "Gagal membatalkan presensi massal");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal membatalkan presensi massal");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === attendances.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(attendances.map((a) => a.participant_id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const quorumPercentage = summary.total_participants > 0 
    ? Math.round((summary.total_present / summary.total_participants) * 100)
    : 0;
  const isQuorumReached = quorumPercentage >= 50;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Presensi & Live Quorum"
        description="Scanner QR Code, monitoring kuorum langsung, dan pencatatan kehadiran musyawarah."
        actions={
          <button
            onClick={fetchAttendanceData}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border pg-border bg-white dark:bg-slate-800 pg-text hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Data
          </button>
        }
      />

      {/* Live Quorum Gauge & Scanner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quorum Summary Gauge */}
        <div className="lg:col-span-2 p-6 rounded-xl pg-surface border pg-border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm pg-text flex items-center gap-2">
              <Percent className="w-4 h-4 text-primary" /> Gauge Kuorum Musyawarah
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
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider pg-muted">
              <span>Tingkat Kehadiran</span>
              <span className="pg-text">{quorumPercentage}% ({summary.total_present} dari {summary.total_participants} Peserta)</span>
            </div>
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border pg-border">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isQuorumReached ? "bg-emerald-500" : "bg-amber-500"
                }`}
                style={{ width: `${Math.min(quorumPercentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border pg-border text-center">
              <p className="text-[11px] font-bold uppercase tracking-wider pg-muted">Total DPT / Terdaftar</p>
              <p className="text-xl font-bold pg-text mt-1">{summary.total_participants}</p>
            </div>
            <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Hadir</p>
              <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">{summary.total_present}</p>
            </div>
            <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Belum Hadir</p>
              <p className="text-xl font-bold text-amber-700 dark:text-amber-300 mt-1">{summary.total_absent}</p>
            </div>
          </div>
        </div>

        {/* Scanner Input Box */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-900/50 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-indigo-400" />
              <h2 className="font-bold text-base">Quick QR Check-In</h2>
            </div>
            <p className="text-xs text-indigo-200 leading-relaxed">
              Scan barcode/QR Code peserta atau ketikkan Participant ID secara manual untuk presensi instan.
            </p>
          </div>

          <form onSubmit={handleManualCheckIn} className="mt-4 space-y-3">
            <input
              type="text"
              value={scanToken}
              onChange={(e) => setScanToken(e.target.value)}
              placeholder="ID Peserta / Token QR..."
              className="w-full px-3.5 py-2.5 min-h-[44px] bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono"
            />
            <button
              type="submit"
              disabled={submitting || !scanToken.trim()}
              className="w-full py-2.5 min-h-[44px] bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
            >
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Proses Presensi
            </button>
          </form>
        </div>
      </div>

      {/* Attendance List */}
      <div className="pg-surface border pg-border rounded-xl shadow-sm space-y-4 p-6">
        {/* Filter Bar & Bulk Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pg-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchAttendanceData()}
              placeholder="Cari nama peserta..."
              className="w-full pl-9 pr-4 py-2 min-h-[44px] bg-slate-50 dark:bg-slate-800/60 border pg-border rounded-lg text-sm pg-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkUndo}
                disabled={submitting}
                className="flex items-center gap-1.5 px-3 py-2 min-h-[40px] bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-all shadow-sm"
              >
                <Undo2 className="w-3.5 h-3.5" /> Batalkan Presensi ({selectedIds.length})
              </button>
            )}

            {["ALL", "PRESENT", "ABSENT"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`flex-1 sm:flex-initial px-3.5 py-2 min-h-[40px] text-xs font-bold uppercase tracking-wider rounded-lg transition-all text-center ${
                  statusFilter === st
                    ? "bg-primary text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 pg-muted hover:pg-text hover:bg-slate-200"
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
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b pg-border text-xs font-bold uppercase tracking-wider pg-muted">
              <tr>
                <th className="p-3 w-10">
                  <input
                    type="checkbox"
                    checked={attendances.length > 0 && selectedIds.length === attendances.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-primary focus:ring-primary"
                  />
                </th>
                <th className="p-3">Peserta</th>
                <th className="p-3">Instansi / Organisasi</th>
                <th className="p-3">Status Verifikasi</th>
                <th className="p-3">Status Presensi</th>
                <th className="p-3">Waktu Check-In</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y pg-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center pg-muted">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" /> Memuat data presensi...
                  </td>
                </tr>
              ) : attendances.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center pg-muted">
                    Tidak ada data presensi yang sesuai.
                  </td>
                </tr>
              ) : (
                attendances.map((item) => {
                  const isSelected = selectedIds.includes(item.participant_id);
                  const isPresent = item.attendance_status === "PRESENT";
                  const isRowLoading = actionLoadingId === item.participant_id;

                  return (
                    <tr key={item.participant_id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 ${isSelected ? "bg-primary/5" : ""}`}>
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(item.participant_id)}
                          className="rounded border-slate-300 text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="p-3 font-medium pg-text">
                        {item.participant_name}
                        <p className="text-[11px] pg-faint font-mono">{item.participant_id}</p>
                      </td>
                      <td className="p-3 pg-muted">{item.institution || "-"}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                          {item.verification_status}
                        </span>
                      </td>
                      <td className="p-3">
                        {isPresent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                            <CheckCircle2 className="w-3.5 h-3.5" /> HADIR
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-slate-100 dark:bg-slate-800 pg-muted border pg-border">
                            <XCircle className="w-3.5 h-3.5" /> BELUM HADIR
                          </span>
                        )}
                      </td>
                      <td className="p-3 pg-muted text-xs">
                        {item.checked_in_at ? new Date(item.checked_in_at).toLocaleString("id-ID") : "-"}
                      </td>
                      <td className="p-3 text-right">
                        {isPresent ? (
                          <button
                            onClick={() => handleUndoCheckIn(item.participant_id)}
                            disabled={isRowLoading}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-900 transition-colors"
                          >
                            <Undo2 className="w-3.5 h-3.5" /> Batalkan
                          </button>
                        ) : (
                          <button
                            onClick={() => handleQuickCheckIn(item.participant_id)}
                            disabled={isRowLoading}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-900 transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Check-In
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
