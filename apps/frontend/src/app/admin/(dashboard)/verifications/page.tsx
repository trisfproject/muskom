"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Search, 
  RefreshCw, 
  X, 
  FileText, 
  Eye, 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  AlertTriangle,
  Users,
  Award
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { SectionHeader } from "@/components/ui/section-header";

interface VerificationItem {
  id: string;
  queue_type: "participant" | "candidate";
  applicant_name: string;
  status: string;
  created_at: string;
}

interface VerificationSummary {
  total_pending: number;
  pending_participants: number;
  pending_candidates: number;
}

interface DetailData {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  institution?: string;
  status: string;
  rejection_reason?: string;
  created_at: string;
  vision?: string;
  mission?: string;
  work_program?: string;
  photo_path?: string;
}

export default function AdminVerificationsPage() {
  const [items, setItems] = useState<VerificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<VerificationSummary>({
    total_pending: 0,
    pending_participants: 0,
    pending_candidates: 0,
  });
  const [loading, setLoading] = useState(true);
  const [queueType, setQueueType] = useState<"all" | "participant" | "candidate">("all");
  const [statusFilter, setStatusFilter] = useState<"Pending" | "APPROVED" | "REJECTED" | "ALL">("Pending");
  const [search, setSearch] = useState("");

  // Detail Modal State
  const [selectedItem, setSelectedItem] = useState<VerificationItem | null>(null);
  const [detailData, setDetailData] = useState<DetailData | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Rejection Dialog State
  const [rejectItem, setRejectItem] = useState<VerificationItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchVerifications = async () => {
    try {
      setLoading(true);

      // Fetch summary
      try {
        const sumRes = await api.get("/admin/verifications/summary");
        if (sumRes.data?.data) {
          setSummary(sumRes.data.data);
        }
      } catch (e) {}

      // Fetch list
      let url = `/admin/verifications?queue_type=${queueType}&limit=50`;
      if (statusFilter !== "ALL") {
        url += `&status=${statusFilter}`;
      }
      if (search) {
        url += `&applicant_name=${encodeURIComponent(search)}`;
      }

      const res = await api.get(url);
      const resData = res.data?.data ?? res.data;
      const list = resData?.items ?? resData?.data ?? (Array.isArray(resData) ? resData : []);
      const totalCount = resData?.total ?? list.length ?? 0;
      setItems(list);
      setTotal(totalCount);
    } catch (err) {
      toast.error("Gagal memuat daftar verifikasi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueType, statusFilter]);

  const handleOpenDetail = async (item: VerificationItem) => {
    setSelectedItem(item);
    setLoadingDetail(true);
    try {
      const endpoint = item.queue_type === "participant" 
        ? `/admin/verifications/participants/${item.id}`
        : `/admin/verifications/candidates/${item.id}`;
      const res = await api.get(endpoint);
      if (res.data?.data) {
        setDetailData(res.data.data);
      }
    } catch (e) {
      toast.error("Gagal memuat rincian data pemohon");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleApprove = async (item: VerificationItem) => {
    try {
      setActionLoading(true);
      const endpoint = item.queue_type === "participant" 
        ? `/admin/verifications/participants/${item.id}`
        : `/admin/verifications/candidates/${item.id}`;

      const res = await api.patch(endpoint, {
        status: item.queue_type === "candidate" ? "ACCEPTED" : "APPROVED",
      });

      if (res.data?.success) {
        toast.success(`Pengajuan ${item.applicant_name} berhasil disetujui!`);
        if (selectedItem?.id === item.id) {
          setSelectedItem(null);
          setDetailData(null);
        }
        fetchVerifications();
      } else {
        toast.error(res.data?.message || "Gagal menyetujui pengajuan");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Terjadi kesalahan saat memproses verifikasi");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectItem) return;

    try {
      setActionLoading(true);
      const endpoint = rejectItem.queue_type === "participant" 
        ? `/admin/verifications/participants/${rejectItem.id}`
        : `/admin/verifications/candidates/${rejectItem.id}`;

      const reason = rejectionReason.trim() || "Berkas atau persyaratan belum memenuhi kriteria.";

      const res = await api.patch(endpoint, {
        status: "REJECTED",
        rejection_reason: reason,
        notes: reason,
      });

      if (res.data?.success) {
        toast.success(`Pengajuan ${rejectItem.applicant_name} telah ditolak.`);
        setRejectItem(null);
        setRejectionReason("");
        if (selectedItem?.id === rejectItem.id) {
          setSelectedItem(null);
          setDetailData(null);
        }
        fetchVerifications();
      } else {
        toast.error(res.data?.message || "Gagal menolak pengajuan");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Terjadi kesalahan saat memproses verifikasi");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (st: string) => {
    const s = (st || "").toUpperCase();
    if (s === "APPROVED" || s === "VERIFIED" || s === "ACCEPTED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
          <CheckCircle2 className="w-3 h-3" /> Disetujui
        </span>
      );
    }
    if (s === "REJECTED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
          <XCircle className="w-3 h-3" /> Ditolak
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Menunggu Review
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Antrean Verifikasi"
        description="Review berkas dan validasi kepesertaan musyawarah serta kandidat ketua umum."
      >
        <button
          onClick={fetchVerifications}
          disabled={loading}
          className="flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-lg border pg-border bg-white dark:bg-slate-800 pg-text hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Segarkan
        </button>
      </SectionHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="pg-surface border pg-border p-4 rounded-xl flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-bold pg-text">{summary.total_pending}</div>
            <div className="text-xs font-bold uppercase tracking-wider pg-muted">Total Pending</div>
          </div>
        </div>

        <div className="pg-surface border pg-border p-4 rounded-xl flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <div className="text-2xl font-bold pg-text">{summary.pending_participants}</div>
            <div className="text-xs font-bold uppercase tracking-wider pg-muted">Pending Peserta</div>
          </div>
        </div>

        <div className="pg-surface border pg-border p-4 rounded-xl flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Award className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <div className="text-2xl font-bold pg-text">{summary.pending_candidates}</div>
            <div className="text-xs font-bold uppercase tracking-wider pg-muted">Pending Kandidat</div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="pg-surface border pg-border rounded-xl shadow-sm overflow-hidden space-y-4 p-6">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
          <div className="relative flex-1 max-w-full lg:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pg-muted" />
            <input
              type="text"
              placeholder="Cari nama pendaftar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchVerifications()}
              className="w-full pl-9 pr-8 py-2 min-h-[44px] text-sm rounded-lg border pg-border bg-slate-50 dark:bg-slate-800/60 pg-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setTimeout(fetchVerifications, 100);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 pg-muted hover:pg-text p-1 min-h-[32px] min-w-[32px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Tabs */}
            <div className="flex flex-wrap bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              {(["Pending", "APPROVED", "REJECTED", "ALL"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-2 min-h-[38px] text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                    statusFilter === st
                      ? "bg-white dark:bg-slate-700 pg-text shadow-sm"
                      : "pg-muted hover:pg-text"
                  }`}
                >
                  {st === "Pending" ? "Pending" : st === "APPROVED" ? "Disetujui" : st === "REJECTED" ? "Ditolak" : "Semua"}
                </button>
              ))}
            </div>

            {/* Type Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              {(["all", "participant", "candidate"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setQueueType(t)}
                  className={`px-3 py-2 min-h-[38px] text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                    queueType === t
                      ? "bg-primary text-white shadow-sm"
                      : "pg-muted hover:pg-text"
                  }`}
                >
                  {t === "all" ? "Semua" : t === "participant" ? "Peserta" : "Kandidat"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b pg-border text-xs font-bold uppercase tracking-wider pg-muted">
              <tr>
                <th className="px-4 py-3 w-28">Tipe</th>
                <th className="px-4 py-3">Nama Pemohon</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Waktu Pengajuan</th>
                <th className="px-4 py-3 text-right">Keputusan & Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y pg-border pg-text">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm pg-muted">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Memuat antrean verifikasi...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <FileText className="w-6 h-6 pg-muted" />
                      </div>
                      <p className="text-sm font-medium pg-muted">Tidak ada pengajuan yang sesuai kriteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5">
                      {item.queue_type === "participant" ? (
                        <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase border border-blue-200 dark:border-blue-800">
                          Peserta
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[10px] font-bold uppercase border border-purple-200 dark:border-purple-800">
                          Kandidat
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold pg-text">{item.applicant_name}</div>
                      <div className="text-[11px] pg-muted font-mono">{item.id}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-4 py-3.5 text-xs pg-muted">
                      {new Date(item.created_at).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(item)}
                          className="flex items-center gap-1 px-3 py-2 min-h-[38px] text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 pg-text transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Detail
                        </button>
                        <button
                          onClick={() => handleApprove(item)}
                          disabled={actionLoading || item.status === "APPROVED" || item.status === "Verified"}
                          className="flex items-center gap-1 px-3 py-2 min-h-[38px] text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-200 dark:border-emerald-900 disabled:opacity-40"
                          title="Setujui"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Setujui
                        </button>
                        <button
                          onClick={() => setRejectItem(item)}
                          disabled={actionLoading || item.status === "REJECTED"}
                          className="flex items-center gap-1 px-3 py-2 min-h-[38px] text-xs font-semibold rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-all border border-rose-200 dark:border-rose-900 disabled:opacity-40"
                          title="Tolak"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Tolak
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t pg-border flex items-center justify-between">
          <p className="text-xs pg-muted font-medium">Menampilkan {items.length} dari {total} pengajuan</p>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border pg-border rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b pg-border flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-bold pg-text">Rincian Pengajuan Verifikasi</h3>
              </div>
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setDetailData(null);
                }}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 pg-muted hover:pg-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {loadingDetail ? (
                <div className="py-12 text-center pg-muted">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                  Memuat rincian berkas...
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between pb-3 border-b pg-border">
                    <span className="text-xs font-bold uppercase tracking-wider pg-muted">Tipe Pengajuan</span>
                    <span className="text-xs font-bold uppercase text-primary">
                      {selectedItem.queue_type === "participant" ? "Peserta Musyawarah" : "Kandidat Ketua"}
                    </span>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider pg-muted block">Nama Lengkap</span>
                      <span className="font-semibold pg-text text-base">{detailData?.full_name || selectedItem.applicant_name}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider pg-muted block">Email</span>
                        <span className="pg-text text-xs">{detailData?.email || "-"}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider pg-muted block">Nomor Telepon</span>
                        <span className="pg-text text-xs">{detailData?.phone || "-"}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider pg-muted block">Instansi / Organisasi</span>
                      <span className="pg-text text-xs">{detailData?.institution || "-"}</span>
                    </div>

                    {selectedItem.queue_type === "candidate" && detailData?.vision && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border pg-border space-y-2">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">Visi Kandidat</span>
                          <p className="text-xs pg-text mt-0.5">{detailData.vision}</p>
                        </div>
                        {detailData.mission && (
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">Misi Kandidat</span>
                            <p className="text-xs pg-text mt-0.5">{detailData.mission}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between border-t pg-border">
                      <span className="text-xs font-bold uppercase tracking-wider pg-muted">Status Terkini</span>
                      {getStatusBadge(detailData?.status || selectedItem.status)}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t pg-border bg-slate-50 dark:bg-slate-800/30 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectItem(selectedItem)}
                className="px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-900 transition-colors"
              >
                Tolak Pengajuan
              </button>
              <button
                type="button"
                onClick={() => handleApprove(selectedItem)}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold bg-primary hover:bg-primary-active text-white rounded-lg transition-colors shadow-sm"
              >
                Setujui Pengajuan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border pg-border rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b pg-border flex items-center justify-between bg-rose-50/50 dark:bg-rose-950/20">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-rose-800 dark:text-rose-300">Tolak Pengajuan Verifikasi</h3>
              </div>
              <button
                onClick={() => setRejectItem(null)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 pg-muted hover:pg-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="p-6 space-y-4">
              <p className="text-xs pg-muted">
                Anda akan menolak pengajuan verifikasi untuk <strong>{rejectItem.applicant_name}</strong>. Silakan masukkan alasan penolakan agar pemohon dapat melengkapi kembali berkas yang diperlukan.
              </p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider pg-muted mb-1.5">
                  Alasan Penolakan
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Contoh: Bukti identitas tidak jelas atau berkas belum lengkap."
                  className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800/60 border pg-border rounded-lg pg-text focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                />
              </div>

              <div className="pt-3 border-t pg-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectItem(null)}
                  className="px-4 py-2 text-xs font-bold pg-muted hover:pg-text transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? "Memproses..." : "Konfirmasi Tolak"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
