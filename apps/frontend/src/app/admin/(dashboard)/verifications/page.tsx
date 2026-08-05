"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, CheckCircle2, XCircle, Search, RefreshCw, UserCheck, Award } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";

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
      const token = Cookies.get("access_token");
      let url = `/api/v1/admin/verifications?queue_type=${queueType}&limit=50`;
      if (search) {
        url += `&applicant_name=${encodeURIComponent(search)}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setItems(data.data.items || []);
        setTotal(data.data.total || 0);
      }
    } catch (err) {
      toast.error("Gagal memuat daftar verifikasi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, [queueType]);

  const handleUpdateStatus = async (item: VerificationItem, newStatus: "Verified" | "Rejected") => {
    try {
      const token = Cookies.get("access_token");
      const endpoint = item.queue_type === "participant" 
        ? `/api/v1/admin/verifications/participant/${item.id}/status`
        : `/api/v1/admin/verifications/candidate/${item.id}/status`;

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Status ${item.applicant_name} diubah menjadi ${newStatus}`);
        fetchVerifications();
      } else {
        toast.error(`Gagal mengubah status: ${data.message || "Kesalahan server"}`);
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-primary" /> Antrean Verifikasi Pendaftaran
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Verifikasi kelayakan berkas Peserta dan Bakal Calon Musyawarah
          </p>
        </div>
        <button
          onClick={fetchVerifications}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm font-medium w-fit"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {[
              { id: "all", label: "Semua Antrean" },
              { id: "participant", label: "Peserta" },
              { id: "candidate", label: "Kandidat" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setQueueType(t.id as any)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  queueType === t.id
                    ? "bg-primary text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchVerifications()}
              placeholder="Cari pemohon..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold">
              <tr>
                <th className="p-3">Nama Pemohon</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Tanggal Daftar</th>
                <th className="p-3">Status Saat Ini</th>
                <th className="p-3 text-right">Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" /> Memuat data verifikasi...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    Tidak ada antrean pendaftaran.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-medium text-slate-900 dark:text-white">{item.applicant_name}</td>
                    <td className="p-3">
                      {item.queue_type === "participant" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-md bg-blue-50 text-blue-600 border border-blue-200">
                          <UserCheck className="w-3 h-3" /> PESERTA
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-md bg-purple-50 text-purple-600 border border-purple-200">
                          <Award className="w-3 h-3" /> KANDIDAT
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-500 text-xs">{new Date(item.created_at).toLocaleDateString("id-ID")}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                          item.status === "Verified" || item.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            : item.status === "Rejected"
                            ? "bg-rose-50 text-rose-600 border border-rose-200"
                            : "bg-amber-50 text-amber-600 border border-amber-200"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleUpdateStatus(item, "Verified")}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Disetujui
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(item, "Rejected")}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
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
      </div>
    </div>
  );
}
