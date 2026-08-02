"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { auditService, AuditLog } from "@/services/admin/audit";
import { SectionHeader } from "@/components/ui/section-header";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { format } from "date-fns";

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await auditService.listLogs({ search });
      setLogs(res.items || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal mengambil audit log");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search]);

  const columns: ColumnDef<AuditLog>[] = [
    {
      key: "created_at",
      header: "Waktu",
      render: (row) => (
        <span className="pg-muted whitespace-nowrap">
          {format(new Date(row.created_at), "dd MMM yyyy, HH:mm")}
        </span>
      )
    },
    {
      key: "actor_name",
      header: "Aktor",
      render: (row) => (
        <div>
          <div className="font-medium pg-text">{row.actor_name || "Sistem"}</div>
          <div className="text-xs pg-muted">{row.actor_role || "-"}</div>
        </div>
      )
    },
    {
      key: "module",
      header: "Modul",
      render: (row) => (
        <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium pg-surface-elevated text-slate-300 border pg-border">
          {row.module}
        </span>
      )
    },
    {
      key: "action",
      header: "Aktivitas",
      render: (row) => (
        <div>
          <div className="font-medium text-slate-300">{row.action}</div>
          {row.reason && <div className="text-xs pg-muted mt-1">{row.reason}</div>}
        </div>
      )
    },
    {
      key: "ip_address",
      header: "IP Address",
      render: (row) => (
        <span className="pg-muted text-xs font-mono">{row.ip_address || "-"}</span>
      )
    }
  ];

  const handleExport = () => {
    window.location.href = `/api/v1/admin/audit/export?format=csv`;
  };

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Audit Log" 
        description="Pantau seluruh aktivitas yang terjadi di dalam sistem MUSKOM."
      >
        <button
          onClick={handleExport}
          className="inline-flex items-center px-4 py-2 text-sm font-medium pg-surface-elevated pg-text rounded-md hover:pg-surface-elevated/80 transition-colors border pg-border"
        >
          Export CSV
        </button>
      </SectionHeader>

      <DataTable 
        data={logs}
        columns={columns}
        loading={loading}
        onSearch={setSearch}
        searchPlaceholder="Cari aktivitas..."
        emptyMessage="No audit data available."
      />
    </div>
  );
}
