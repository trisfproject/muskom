"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Search, Clock, CheckCircle2, XCircle, Users, ExternalLink,
  Filter, RefreshCw, UserCheck, X, ChevronRight,
} from "lucide-react";
import { adminParticipantService, AdminParticipantResponse } from "@/services/participant-admin";

type StatusTab = "" | "Pending" | "Verified" | "Rejected";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  Pending:  { label: "Pending",     color: "amber",   icon: Clock },
  Verified: { label: "Terverifikasi", color: "emerald", icon: CheckCircle2 },
  Rejected: { label: "Ditolak",     color: "red",     icon: XCircle },
  Eligible: { label: "Eligible",    color: "blue",    icon: CheckCircle2 },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">{status}</span>;
  const Icon = cfg.icon;
  const color = cfg.color;
  const colorMap: Record<string, string> = {
    amber:   "bg-amber-50 text-amber-700 border border-amber-200/60",
    emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
    red:     "bg-red-50 text-red-700 border border-red-200/60",
    blue:    "bg-blue-50 text-blue-700 border border-blue-200/60",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colorMap[color] ?? ""}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

export default function AdminRegistrationsPage() {
  const [data, setData]           = useState<AdminParticipantResponse[]>([]);
  const [loading, setLoading]     = useState(true);
  const [statusTab, setStatusTab] = useState<StatusTab>("");
  const [search, setSearch]       = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminParticipantService.listParticipants();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [refreshKey]);

  // Client-side filtering for search + status tab
  const filtered = useMemo(() => {
    let result = data;

    if (statusTab) {
      result = result.filter((r) => r.status === statusTab);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.registration_number.toLowerCase().includes(q) ||
          r.full_name.toLowerCase().includes(q) ||
          r.company_name.toLowerCase().includes(q) ||
          r.industrial_area.toLowerCase().includes(q)
      );
    }

    return result;
  }, [data, statusTab, search]);

  // Stat counts (from full dataset, not filtered)
  const stats = useMemo(() => ({
    total:    data.length,
    pending:  data.filter((r) => r.status === "Pending").length,
    verified: data.filter((r) => r.status === "Verified").length,
    rejected: data.filter((r) => r.status === "Rejected").length,
  }), [data]);

  const TABS: { value: StatusTab; label: string }[] = [
    { value: "", label: "Semua" },
    { value: "Pending", label: "Pending" },
    { value: "Verified", label: "Terverifikasi" },
    { value: "Rejected", label: "Ditolak" },
  ];

  return (
    <main className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold pg-text">Peserta</h1>
          <p className="pg-muted text-sm mt-0.5">Kelola dan verifikasi pendaftaran peserta musyawarah.</p>
        </div>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          disabled={loading}
          className="flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors pg-text disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Peserta" value={stats.total} icon={Users} color="blue" onClick={() => setStatusTab("")} active={statusTab === ""} />
        <StatCard label="Menunggu" value={stats.pending} icon={Clock} color="amber" onClick={() => setStatusTab("Pending")} active={statusTab === "Pending"} />
        <StatCard label="Terverifikasi" value={stats.verified} icon={UserCheck} color="emerald" onClick={() => setStatusTab("Verified")} active={statusTab === "Verified"} />
        <StatCard label="Ditolak" value={stats.rejected} icon={XCircle} color="red" onClick={() => setStatusTab("Rejected")} active={statusTab === "Rejected"} />
      </div>

      {/* TABLE CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-slate-50/50 dark:bg-slate-800/30">
          {/* Search */}
          <div className="relative w-full sm:max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pg-muted" />
            <input
              type="text"
              id="participant-search"
              placeholder="Cari nama, nomor, perusahaan, area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-800 pg-text focus:outline-none focus:border-primary"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusTab(tab.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  statusTab === tab.value
                    ? "bg-white dark:bg-slate-700 pg-text shadow-sm"
                    : "pg-muted hover:pg-text"
                }`}
              >
                {tab.label}
                {tab.value !== "" && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    statusTab === tab.value ? "bg-primary text-white" : "bg-slate-200 dark:bg-slate-700 pg-muted"
                  }`}>
                    {tab.value === "Pending" ? stats.pending : tab.value === "Verified" ? stats.verified : stats.rejected}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Filter indicator */}
        {(search || statusTab) && (
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2 text-xs pg-muted bg-slate-50/30">
            <Filter className="w-3.5 h-3.5" />
            <span>Menampilkan <strong className="pg-text">{filtered.length}</strong> dari <strong className="pg-text">{data.length}</strong> peserta</span>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider pg-muted whitespace-nowrap">No. Reg.</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider pg-muted">Peserta</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider pg-muted hidden md:table-cell">Perusahaan</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider pg-muted hidden lg:table-cell">Area Industri</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider pg-muted hidden sm:table-cell">Jabatan</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider pg-muted">Status</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider pg-muted hidden lg:table-cell">Tanggal Daftar</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider pg-muted text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 pg-text">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-28" /></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-40 mb-1" /><div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-32" /></td>
                    <td className="px-5 py-4 hidden md:table-cell"><div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-32" /></td>
                    <td className="px-5 py-4 hidden lg:table-cell"><div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-24" /></td>
                    <td className="px-5 py-4 hidden sm:table-cell"><div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-28" /></td>
                    <td className="px-5 py-4"><div className="h-6 bg-slate-100 dark:bg-slate-700 rounded-full w-20" /></td>
                    <td className="px-5 py-4 hidden lg:table-cell"><div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-20" /></td>
                    <td className="px-5 py-4 text-right"><div className="h-7 bg-slate-100 dark:bg-slate-700 rounded w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Users className="w-12 h-12 text-slate-200 dark:text-slate-700" />
                      <p className="font-semibold pg-text">
                        {search || statusTab ? "Tidak ada hasil yang cocok" : "Belum ada peserta terdaftar"}
                      </p>
                      <p className="text-sm pg-muted max-w-xs">
                        {search || statusTab
                          ? "Coba ubah kata kunci atau filter status Anda."
                          : "Peserta yang mendaftar akan muncul di sini."}
                      </p>
                      {(search || statusTab) && (
                        <button
                          onClick={() => { setSearch(""); setStatusTab(""); }}
                          className="text-sm text-primary hover:underline font-medium"
                        >
                          Hapus filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs pg-muted font-semibold">{row.registration_number}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold pg-muted shrink-0">
                          {row.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold pg-text text-sm">{row.full_name}</div>
                          <div className="text-xs pg-muted">{row.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="text-sm font-medium pg-text">{row.company_name || "—"}</div>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-sm pg-muted">{row.industrial_area}</span>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="text-sm pg-muted">{row.job_title}</span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-xs pg-muted">
                        {new Date(row.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/registrations/${row.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-xs font-semibold pg-text hover:border-primary hover:text-primary dark:hover:border-primary transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/20">
            <span className="text-xs pg-muted">{filtered.length} peserta ditampilkan</span>
            <div className="flex items-center gap-1 text-xs pg-muted">
              <ChevronRight className="w-3.5 h-3.5" />
              <span>Klik Detail untuk kelola peserta</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, icon: Icon, color, onClick, active,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "amber" | "emerald" | "red";
  onClick: () => void;
  active: boolean;
}) {
  const colorMap = {
    blue:    { bg: "bg-blue-50 dark:bg-blue-900/20",    icon: "text-blue-500",    ring: "ring-blue-300" },
    amber:   { bg: "bg-amber-50 dark:bg-amber-900/20",  icon: "text-amber-500",  ring: "ring-amber-300" },
    emerald: { bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: "text-emerald-500", ring: "ring-emerald-300" },
    red:     { bg: "bg-red-50 dark:bg-red-900/20",      icon: "text-red-500",    ring: "ring-red-300" },
  };
  const c = colorMap[color];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        active
          ? `${c.bg} border-transparent ring-2 ${c.ring}`
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold pg-muted uppercase tracking-wider mb-1.5">{label}</p>
          <p className="text-3xl font-black pg-text">{value}</p>
        </div>
        <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
      </div>
    </button>
  );
}
