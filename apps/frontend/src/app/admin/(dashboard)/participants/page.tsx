"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users, Clock, CheckCircle2, XCircle, TrendingUp,
  Search, RefreshCw, ExternalLink, BarChart3, Building2,
  MapPin, ArrowRight, Filter, X, Download, ChevronRight,
  CalendarDays, UserCheck,
} from "lucide-react";
import {
  adminParticipantService,
  ParticipantStats,
  RecentParticipant,
} from "@/services/participant-admin";

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { label: string; dot: string; badge: string }> = {
  Pending:  { label: "Pending",       dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 border-amber-200" },
  Verified: { label: "Terverifikasi", dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  Rejected: { label: "Ditolak",       dot: "bg-red-400",     badge: "bg-red-50 text-red-700 border-red-200" },
  Eligible: { label: "Eligible",      dot: "bg-blue-400",    badge: "bg-blue-50 text-blue-700 border-blue-200" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? { label: status, dot: "bg-slate-400", badge: "bg-slate-100 text-slate-600 border-slate-200" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Horizontal bar chart (pure CSS) ─────────────────────────────────────────
function BarChart({
  data,
  title,
  icon: Icon,
  colorClass,
}: {
  data: { label: string; count: number }[];
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}) {
  const max = data.reduce((m, d) => Math.max(m, d.count), 1);
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Icon className="w-4 h-4 pg-muted" />
        </div>
        <h3 className="text-sm font-bold pg-text">{title}</h3>
      </div>
      {data.length === 0 ? (
        <p className="text-xs pg-muted text-center py-6">Belum ada data</p>
      ) : (
        <ol className="space-y-3">
          {data.map((d, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="text-xs pg-muted w-4 shrink-0 font-bold">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium pg-text truncate max-w-[70%]">{d.label}</span>
                  <span className="text-xs font-bold pg-text ml-2">{d.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${colorClass} transition-all duration-700`}
                    style={{ width: `${Math.round((d.count / max) * 100)}%` }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// ─── Daily trend chart (SVG sparkline) ────────────────────────────────────────
function TrendChart({ data }: { data: { date: string; count: number }[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const W = 400;
  const H = 80;
  const PAD = { t: 8, r: 8, b: 24, l: 32 };
  const inner = { w: W - PAD.l - PAD.r, h: H - PAD.t - PAD.b };

  // Fill in missing dates for the last 14 days
  const today = new Date();
  const filled = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (13 - i));
    const key = d.toISOString().slice(0, 10);
    const found = data.find((x) => x.date === key);
    return { date: key, count: found?.count ?? 0 };
  });

  const max = Math.max(...filled.map((d) => d.count), 1);
  const pts = filled.map((d, i) => {
    const x = PAD.l + (i / (filled.length - 1)) * inner.w;
    const y = PAD.t + (1 - d.count / max) * inner.h;
    return { x, y, ...d };
  });
  const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `M${pts[0].x},${PAD.t + inner.h} ` +
    pts.map((p) => `L${p.x},${p.y}`).join(" ") +
    ` L${pts[pts.length - 1].x},${PAD.t + inner.h} Z`;

  // Axis labels: first, middle, last
  const axisLabels = [0, Math.floor(filled.length / 2), filled.length - 1].map((i) => ({
    x: pts[i].x,
    label: filled[i].date.slice(5), // MM-DD
  }));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 pg-muted" />
          </div>
          <h3 className="text-sm font-bold pg-text">Tren Pendaftaran (14 Hari)</h3>
        </div>
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: H }}
        aria-label="Registration trend chart"
      >
        {/* Grid lines */}
        {[0, 0.5, 1].map((f) => (
          <line
            key={f}
            x1={PAD.l}
            x2={W - PAD.r}
            y1={PAD.t + f * inner.h}
            y2={PAD.t + f * inner.h}
            stroke="currentColor"
            strokeOpacity={0.08}
            strokeWidth={1}
          />
        ))}
        {/* Area fill */}
        <path d={area} fill="url(#trendGrad)" />
        {/* Line */}
        <polyline
          points={polyline}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Dots */}
        {pts.map((p) =>
          p.count > 0 ? (
            <circle key={p.date} cx={p.x} cy={p.y} r={3} fill="var(--color-primary)" />
          ) : null
        )}
        {/* X-axis labels */}
        {axisLabels.map((l) => (
          <text
            key={l.label}
            x={l.x}
            y={H - 4}
            textAnchor="middle"
            fontSize={9}
            fill="currentColor"
            opacity={0.45}
          >
            {l.label}
          </text>
        ))}
        {/* Y-axis max label */}
        <text x={PAD.l - 4} y={PAD.t + 4} textAnchor="end" fontSize={9} fill="currentColor" opacity={0.45}>
          {max}
        </text>
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.25} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// ─── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, colorBg, colorIcon, href,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  colorBg: string;
  colorIcon: string;
  href?: string;
}) {
  const inner = (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm flex items-start gap-4 ${href ? "hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all" : ""}`}>
      <div className={`w-11 h-11 rounded-xl ${colorBg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${colorIcon}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider pg-muted mb-1">{label}</p>
        <p className="text-3xl font-black pg-text leading-none">{value.toLocaleString()}</p>
        {sub && <p className="text-xs pg-muted mt-1">{sub}</p>}
      </div>
      {href && <ChevronRight className="w-4 h-4 pg-muted shrink-0 ml-auto mt-1" />}
    </div>
  );
  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ParticipantDashboardPage() {
  const router = useRouter();
  const [stats, setStats]       = useState<ParticipantStats | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Search & filter
  const [search, setSearch]           = useState("");
  const [filterArea, setFilterArea]   = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [filterStatus, setFilterStatus]   = useState("");
  const [filterDate, setFilterDate]       = useState("");
  const [showFilters, setShowFilters]     = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminParticipantService.getStats();
      setStats(data);
    } catch {
      setError("Gagal memuat data dashboard. Pastikan server API aktif.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply search+filters to recent list
  const filteredRecent = useMemo<RecentParticipant[]>(() => {
    if (!stats) return [];
    let r = stats.recent;
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (p) =>
          p.registration_number.toLowerCase().includes(q) ||
          p.full_name.toLowerCase().includes(q) ||
          p.company_name.toLowerCase().includes(q)
      );
    }
    if (filterArea)    r = r.filter((p) => p.industrial_area === filterArea);
    if (filterCompany) r = r.filter((p) => p.company_name === filterCompany);
    if (filterStatus)  r = r.filter((p) => p.status === filterStatus);
    if (filterDate)    r = r.filter((p) => p.created_at.slice(0, 10) === filterDate);
    return r;
  }, [stats, search, filterArea, filterCompany, filterStatus, filterDate]);

  const hasActiveFilters = filterArea || filterCompany || filterStatus || filterDate;
  const clearFilters = () => {
    setFilterArea(""); setFilterCompany(""); setFilterStatus(""); setFilterDate("");
  };

  const uniqueAreas     = useMemo(() => [...new Set(stats?.recent.map((p) => p.industrial_area) ?? [])], [stats]);
  const uniqueCompanies = useMemo(() => [...new Set(stats?.recent.map((p) => p.company_name) ?? [])], [stats]);

  // ─── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-slate-100 dark:bg-slate-700 rounded w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 dark:bg-slate-700 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 h-48 bg-slate-100 dark:bg-slate-700 rounded-xl" />
          <div className="h-48 bg-slate-100 dark:bg-slate-700 rounded-xl" />
        </div>
        <div className="h-64 bg-slate-100 dark:bg-slate-700 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <XCircle className="w-12 h-12 text-red-300" />
        <p className="font-semibold pg-text text-center">{error}</p>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="text-sm text-primary hover:underline font-medium"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  if (!stats) return null;

  // ─── Export architecture stubs ────────────────────────────────────────────────
  // TODO(export): Implement when backend export endpoints are ready.
  // exportCSV()  → GET /admin/participants/export?format=csv
  // exportExcel() → GET /admin/participants/export?format=xlsx

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold pg-text">Dashboard Peserta</h1>
          <p className="pg-muted text-sm mt-0.5">Visibilitas real-time pendaftaran peserta musyawarah.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Export stubs — architecture prepared, not implemented */}
          <button
            disabled
            title="CSV Export — coming soon"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 pg-muted cursor-not-allowed opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
          <button
            disabled
            title="Excel Export — coming soon"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 pg-muted cursor-not-allowed opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            Excel
          </button>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 pg-text hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Peserta" value={stats.total}
          icon={Users} colorBg="bg-blue-50 dark:bg-blue-900/20" colorIcon="text-blue-500"
          href="/admin/registrations"
        />
        <StatCard
          label="Pending" value={stats.pending}
          icon={Clock} colorBg="bg-amber-50 dark:bg-amber-900/20" colorIcon="text-amber-500"
          href="/admin/registrations?status=Pending"
        />
        <StatCard
          label="Terverifikasi" value={stats.verified}
          icon={CheckCircle2} colorBg="bg-emerald-50 dark:bg-emerald-900/20" colorIcon="text-emerald-500"
          href="/admin/registrations?status=Verified"
        />
        <StatCard
          label="Ditolak" value={stats.rejected}
          icon={XCircle} colorBg="bg-red-50 dark:bg-red-900/20" colorIcon="text-red-500"
          href="/admin/registrations?status=Rejected"
        />
        <StatCard
          label="Hari Ini" value={stats.today}
          icon={CalendarDays} colorBg="bg-indigo-50 dark:bg-indigo-900/20" colorIcon="text-indigo-500"
          sub={new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long" })}
        />
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/registrations"
          id="quick-view-pending"
          className="flex items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md hover:border-amber-300 dark:hover:border-amber-600 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-bold pg-text">Lihat Pending</p>
              <p className="text-xs pg-muted">{stats.pending} menunggu verifikasi</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 pg-muted group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          href="/admin/registrations"
          id="quick-verify-participant"
          className="flex items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-600 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-bold pg-text">Verifikasi Peserta</p>
              <p className="text-xs pg-muted">Buka halaman manajemen</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 pg-muted group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <button
          id="quick-search-participant"
          onClick={() => {
            setShowFilters(true);
            setTimeout(() => document.getElementById("dashboard-search")?.focus(), 100);
          }}
          className="flex items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md hover:border-primary dark:hover:border-primary transition-all group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Search className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-bold pg-text">Cari Peserta</p>
              <p className="text-xs pg-muted">Nomor reg., nama, perusahaan</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 pg-muted group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Trend chart — spans 2 columns */}
        <div className="lg:col-span-2">
          <TrendChart data={stats.by_date} />
        </div>

        {/* Donut-style status summary */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 pg-muted" />
            </div>
            <h3 className="text-sm font-bold pg-text">Distribusi Status</h3>
          </div>
          {stats.total === 0 ? (
            <p className="text-xs pg-muted text-center py-6">Belum ada peserta</p>
          ) : (
            <div className="space-y-4">
              {[
                { status: "Verified", count: stats.verified, color: "bg-emerald-400" },
                { status: "Pending",  count: stats.pending,  color: "bg-amber-400" },
                { status: "Rejected", count: stats.rejected, color: "bg-red-400" },
              ].map(({ status, count, color }) => {
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${color}`} />
                        <span className="text-xs font-medium pg-text">{STATUS_CFG[status]?.label ?? status}</span>
                      </div>
                      <span className="text-xs font-bold pg-text">{count} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {/* Overall progress bar */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs pg-muted">Tingkat Verifikasi</span>
                  <span className="text-xs font-bold text-emerald-600">
                    {stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-700"
                    style={{ width: `${stats.total > 0 ? (stats.verified / stats.total) * 100 : 0}%` }}
                  />
                  <div
                    className="h-full bg-amber-400 transition-all duration-700"
                    style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}
                  />
                  <div
                    className="h-full bg-red-400 transition-all duration-700"
                    style={{ width: `${stats.total > 0 ? (stats.rejected / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BREAKDOWN CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <BarChart
          data={stats.by_industrial_area}
          title="Peserta per Kawasan Industri"
          icon={MapPin}
          colorClass="bg-blue-400"
        />
        <BarChart
          data={stats.by_company}
          title="Peserta per Perusahaan"
          icon={Building2}
          colorClass="bg-indigo-400"
        />
      </div>

      {/* RECENT REGISTRATIONS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <div>
            <h3 className="text-sm font-bold pg-text">Pendaftaran Terbaru</h3>
            <p className="text-xs pg-muted mt-0.5">10 peserta yang baru mendaftar</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Global search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pg-muted" />
              <input
                id="dashboard-search"
                type="text"
                placeholder="Cari nomor reg., nama, perusahaan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-8 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 pg-text focus:outline-none focus:border-primary"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 pg-muted hover:pg-text">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-colors ${
                showFilters || hasActiveFilters
                  ? "bg-primary text-white border-primary"
                  : "border-slate-200 dark:border-slate-600 pg-text hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Filter
              {hasActiveFilters && (
                <span className="w-4 h-4 rounded-full bg-white text-primary text-[10px] font-black flex items-center justify-center">
                  {[filterArea, filterCompany, filterStatus, filterDate].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-bold pg-muted uppercase tracking-wider mb-1.5">Area Industri</label>
                <select
                  value={filterArea}
                  onChange={(e) => setFilterArea(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 pg-text focus:outline-none focus:border-primary"
                >
                  <option value="">Semua</option>
                  {uniqueAreas.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold pg-muted uppercase tracking-wider mb-1.5">Perusahaan</label>
                <select
                  value={filterCompany}
                  onChange={(e) => setFilterCompany(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 pg-text focus:outline-none focus:border-primary"
                >
                  <option value="">Semua</option>
                  {uniqueCompanies.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold pg-muted uppercase tracking-wider mb-1.5">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 pg-text focus:outline-none focus:border-primary"
                >
                  <option value="">Semua</option>
                  <option value="Pending">Pending</option>
                  <option value="Verified">Terverifikasi</option>
                  <option value="Rejected">Ditolak</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold pg-muted uppercase tracking-wider mb-1.5">Tanggal Daftar</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 pg-text focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-3 text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Hapus semua filter
              </button>
            )}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider pg-muted whitespace-nowrap">No. Reg.</th>
                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider pg-muted">Nama</th>
                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider pg-muted hidden sm:table-cell">Perusahaan</th>
                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider pg-muted hidden md:table-cell">Area Industri</th>
                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider pg-muted">Status</th>
                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider pg-muted hidden lg:table-cell">Waktu Daftar</th>
                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider pg-muted text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 pg-text">
              {filteredRecent.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-10 h-10 text-slate-200 dark:text-slate-700" />
                      <p className="text-sm font-medium pg-muted">Tidak ada peserta yang cocok</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecent.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-slate-400 font-semibold whitespace-nowrap">
                      {p.registration_number}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold pg-muted shrink-0">
                          {p.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold pg-text text-sm whitespace-nowrap">{p.full_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="text-sm pg-text">{p.company_name}</span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm pg-muted">{p.industrial_area}</span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-xs pg-muted whitespace-nowrap">
                        {new Date(p.created_at).toLocaleString("id-ID", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/registrations/${p.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
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

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/20">
          <span className="text-xs pg-muted">{filteredRecent.length} dari {stats.recent.length} pendaftaran terbaru</span>
          <Link
            href="/admin/registrations"
            className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            Lihat semua <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
