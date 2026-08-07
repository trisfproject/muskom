"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, CheckCircle2, XCircle, Search, RefreshCw, X, FileText } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface VerificationItem {
  id: string;
  queue_type: "participant" | "candidate";
  applicant_name: string;
  status: string;
  created_at: string;
}

export default function AdminVerificationsPage() {
  const [items, setItems] = useState<VerificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [queueType, setQueueType] = useState<"all" | "participant" | "candidate">("all");
  const [search, setSearch] = useState("");

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      let url = `/admin/verifications?queue_type=${queueType}&limit=50`;
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
  }, [queueType]);

  const handleUpdateStatus = async (item: VerificationItem, newStatus: "Verified" | "Rejected") => {
    try {
      const endpoint = item.queue_type === "participant" 
        ? `/admin/verifications/participants/${item.id}`
        : `/admin/verifications/candidates/${item.id}`;

      const res = await api.patch(endpoint, {
        status: newStatus === "Verified" ? "APPROVED" : "REJECTED",
        rejection_reason: newStatus === "Rejected" ? "Ditolak oleh admin" : undefined,
        notes: newStatus === "Rejected" ? "Ditolak oleh admin" : undefined,
      });

      if (res.data?.success) {
        toast.success(`Berhasil update status menjadi ${newStatus}`);
        fetchVerifications();
      } else {
        toast.error(res.data?.message || "Gagal update status");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Terjadi kesalahan sistem saat verifikasi");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold pg-text tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" /> Antrean Verifikasi
          </h1>
          <p className="pg-muted text-sm mt-1">Review dan verifikasi pendaftaran peserta maupun kandidat.</p>
        </div>
        <button
          onClick={fetchVerifications}
          disabled={loading}
          className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pg-text hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Segarkan
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pg-muted" />
            <input
              type="text"
              placeholder="Cari nama pendaftar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchVerifications()}
              className="w-full pl-9 pr-8 py-2 min-h-[44px] text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 pg-text focus:outline-none focus:border-primary transition-colors"
            />
            {search && (
              <button onClick={() => { setSearch(""); setTimeout(fetchVerifications, 100); }} className="absolute right-3 top-1/2 -translate-y-1/2 pg-muted hover:pg-text">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {(["all", "participant", "candidate"] as const).map(t => (
              <button
                key={t}
                onClick={() => setQueueType(t)}
                className={`px-4 py-2 text-xs font-semibold rounded-md capitalize transition-colors ${
                  queueType === t 
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                {t === "all" ? "Semua" : t === "participant" ? "Peserta" : "Kandidat"}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider pg-muted w-24">Tipe</th>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider pg-muted">Pemohon</th>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider pg-muted">Status</th>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider pg-muted">Waktu Pengajuan</th>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider pg-muted text-right">Keputusan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 pg-text">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-sm pg-muted">
                    Memuat antrean...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <FileText className="w-6 h-6 pg-muted" />
                      </div>
                      <p className="text-sm font-medium pg-muted">Tidak ada pengajuan pending saat ini.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4">
                      {item.queue_type === "participant" ? (
                        <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-[10px] font-bold uppercase">Peserta</span>
                      ) : (
                        <span className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase">Kandidat</span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-bold pg-text text-sm">
                      {item.applicant_name}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-amber-50 text-amber-700 border-amber-200 uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs pg-muted">
                      {new Date(item.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleUpdateStatus(item, "Verified")}
                          className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors border border-emerald-200"
                          title="Setujui (Verify)"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(item, "Rejected")}
                          className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-colors border border-red-200"
                          title="Tolak (Reject)"
                        >
                          <XCircle className="w-4 h-4" />
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
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/20">
          <p className="text-xs pg-muted font-medium">Menampilkan {items.length} dari {total} pengajuan</p>
        </div>
      </div>
    </div>
  );
}
