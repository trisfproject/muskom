"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Download, CheckCircle2, XCircle, AlertCircle, Users, ExternalLink, RefreshCw, X } from "lucide-react";
import { candidateAdminService, CandidateAdminResponse } from "@/services/candidate-admin";
import { toast } from "sonner";

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "Verified":
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5"/> Verified</span>;
    case "Rejected":
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold bg-red-50 text-red-700 border border-red-200"><XCircle className="w-3.5 h-3.5"/> Rejected</span>;
    case "Under Review":
    case "Revision Required":
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold bg-amber-50 text-amber-700 border border-amber-200"><AlertCircle className="w-3.5 h-3.5"/> Menunggu Review</span>;
    default:
      return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase font-bold bg-slate-100 text-slate-600 border border-slate-200">{status}</span>;
  }
};

const PubBadge = ({ pubStatus }: { pubStatus: string }) => {
  if (pubStatus === "Published") {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Dipublikasikan</span>;
  }
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-slate-100 text-slate-500 border border-slate-200">Tersembunyi</span>;
};

export default function AdminCandidatesPage() {
  const [data, setData] = useState<CandidateAdminResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await candidateAdminService.getCandidates({ status: statusFilter, search });
      setData(res);
    } catch (err) {
      toast.error("Gagal memuat daftar kandidat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold pg-text tracking-tight">Data Induk Kandidat</h1>
          <p className="pg-muted text-sm mt-1">Kelola dan review seluruh bakal calon.</p>
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
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pg-muted pointer-events-none" />
            <input 
              type="text" 
              placeholder="Cari nama atau nomor registrasi..." 
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
            <option value="Verified">Verified</option>
            <option value="Under Review">Under Review</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider pg-muted">No. Urut / Reg</th>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider pg-muted">Kandidat</th>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider pg-muted">Status</th>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider pg-muted text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 pg-text">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center text-sm pg-muted">Memuat data...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Users className="w-6 h-6 pg-muted" />
                      </div>
                      <p className="text-sm font-medium pg-muted">Tidak ada data kandidat</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold pg-text text-lg">{row.candidate_number || '-'}</div>
                      <div className="font-mono text-[10px] pg-muted font-medium mt-1 uppercase">REG: {row.registration_number}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold pg-text text-sm">{row.full_name}</div>
                      <div className="text-xs pg-muted mt-0.5">{row.email}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col items-start gap-1.5">
                        <StatusBadge status={row.status} />
                        <PubBadge pubStatus={row.publication_status} />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link 
                        href={`/admin/candidates/${row.id}`}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary rounded-lg text-xs font-semibold transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Buka
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/20">
          <p className="text-xs pg-muted font-medium">Menampilkan {data.length} kandidat</p>
        </div>
      </div>
    </div>
  );
}
