"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Clock, CheckCircle2, XCircle, Users, ExternalLink, UserCheck, RefreshCw,
} from "lucide-react";
import { adminParticipantService, AdminParticipantResponse } from "@/services/participant-admin";
import { SectionHeader } from "@/components/ui/section-header";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { StatusChip } from "@/components/ui/status-chip";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

type StatusTab = "" | "Pending" | "Verified" | "Rejected";

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

  const columns: ColumnDef<AdminParticipantResponse>[] = [
    {
      key: "registration_number",
      header: "No. Reg.",
      render: (row) => <span className="font-mono text-xs pg-muted font-semibold">{row.registration_number}</span>
    },
    {
      key: "full_name",
      header: "Peserta",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold pg-muted shrink-0">
            {row.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold pg-text text-sm">{row.full_name}</div>
            <div className="text-xs pg-muted">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: "company_name",
      header: "Perusahaan",
      render: (row) => <div className="text-sm font-medium pg-text">{row.company_name || "—"}</div>
    },
    {
      key: "industrial_area",
      header: "Area Industri",
      render: (row) => <span className="text-sm pg-muted">{row.industrial_area}</span>
    },
    {
      key: "job_title",
      header: "Jabatan",
      render: (row) => <span className="text-sm pg-muted">{row.job_title}</span>
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusChip status={row.status} />
    },
    {
      key: "created_at",
      header: "Tanggal Daftar",
      render: (row) => <span className="text-xs pg-muted">{format(new Date(row.created_at), "dd MMM yyyy")}</span>
    },
    {
      key: "id",
      header: "Aksi",
      sortable: false,
      render: (row) => (
        <div className="flex justify-end">
          <Link href={`/admin/registrations/${row.id}`}>
            <Button variant="outline" size="sm">
              <ExternalLink className="w-3.5 h-3.5" />
              Detail
            </Button>
          </Link>
        </div>
      )
    }
  ];

  return (
    <main className="space-y-6">
      <SectionHeader 
        title="Manajemen Peserta" 
        description="Kelola dan verifikasi pendaftaran peserta musyawarah."
      >
        <Button 
          variant="secondary" 
          onClick={() => setRefreshKey((k) => k + 1)}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Data
        </Button>
      </SectionHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Peserta" value={stats.total} icon={Users} color="blue" onClick={() => setStatusTab("")} active={statusTab === ""} />
        <StatCard label="Menunggu" value={stats.pending} icon={Clock} color="amber" onClick={() => setStatusTab("Pending")} active={statusTab === "Pending"} />
        <StatCard label="Terverifikasi" value={stats.verified} icon={UserCheck} color="emerald" onClick={() => setStatusTab("Verified")} active={statusTab === "Verified"} />
        <StatCard label="Ditolak" value={stats.rejected} icon={XCircle} color="red" onClick={() => setStatusTab("Rejected")} active={statusTab === "Rejected"} />
      </div>

      <DataTable 
        data={filtered}
        columns={columns}
        loading={loading}
        onSearch={setSearch}
        searchPlaceholder="Cari nama, nomor, perusahaan, area..."
        emptyMessage={search || statusTab ? "Tidak ada hasil yang cocok dengan pencarian Anda." : "Belum ada peserta terdaftar."}
        actions={
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
              </button>
            ))}
          </div>
        }
      />
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
