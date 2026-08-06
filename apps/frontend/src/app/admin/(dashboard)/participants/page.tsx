"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, ExternalLink, RefreshCw, Filter, X, Users, MapPin, Building2, CalendarDays } from "lucide-react";
import { adminParticipantService, AdminParticipantResponse } from "@/services/participant-admin";
import Link from "next/link";
import { toast } from "sonner";

const STATUS_CFG: Record<string, { label: string; dot: string; badge: string }> = {
  Pending:  { label: "Pending",       dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 border-amber-200" },
  Verified: { label: "Terverifikasi", dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  Rejected: { label: "Ditolak",       dot: "bg-red-400",     badge: "bg-red-50 text-red-700 border-red-200" },
  Eligible: { label: "Eligible",      dot: "bg-blue-400",    badge: "bg-blue-50 text-blue-700 border-blue-200" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? { label: status, dot: "bg-slate-400", badge: "bg-slate-100 text-slate-600 border-slate-200" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold border ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export default function AdminParticipantsPage() {
  const [data, setData] = useState<AdminParticipantResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminParticipantService.listParticipants();
      setData(res);
    } catch (err) {
      toast.error("Gagal memuat daftar peserta.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let result = data;
    if (statusFilter) {
      result = result.filter(r => r.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        r =>
          r.registration_number.toLowerCase().includes(q) ||
          r.full_name.toLowerCase().includes(q) ||
          r.company_name.toLowerCase().includes(q) ||
          r.industrial_area.toLowerCase().includes(q)
      );
    }
    return result;
  }, [data, statusFilter, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold pg-text tracking-tight">Data Induk Peserta</h1>
          <p className="pg-muted text-sm mt-1">Daftar lengkap seluruh peserta yang mendaftar musyawarah.</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pg-text hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Segarkan Data
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
              placeholder="Cari no. reg, nama, atau perusahaan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 min-h-[44px] text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 pg-text focus:outline-none focus:border-primary transition-colors"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 pg-muted hover:pg-text">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 min-h-[44px] rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-primary min-w-[180px] transition-colors"
          >
            <option value="">Semua Status</option>
            <option value="Verified">Terverifikasi</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Ditolak</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider pg-muted">No. Reg</th>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider pg-muted">Peserta</th>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider pg-muted">Instansi</th>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider pg-muted">Status</th>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider pg-muted text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 pg-text">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-sm pg-muted">
                    Memuat data peserta...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Users className="w-6 h-6 pg-muted" />
                      </div>
                      <p className="text-sm font-medium pg-muted">Data tidak ditemukan</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs pg-muted font-medium">
                      {p.registration_number}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold pg-text text-sm">{p.full_name}</div>
                      <div className="text-xs pg-muted mt-0.5">{p.email}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-sm pg-text">{p.company_name}</div>
                      <div className="text-xs pg-muted mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {p.industrial_area}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      {/* TODO: Add proper link to detail page once consolidated */}
                      <span className="text-xs pg-muted">--</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/20">
          <p className="text-xs pg-muted font-medium">Menampilkan {filtered.length} dari {data.length} peserta</p>
        </div>
      </div>
    </div>
  );
}
