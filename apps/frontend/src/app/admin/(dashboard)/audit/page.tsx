"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { auditService, AuditLog } from "@/services/admin/audit";
import { SectionHeader } from "@/components/ui/section-header";
import { format } from "date-fns";
import { 
  Download, 
  Search, 
  RefreshCw, 
  Activity, 
  Clock, 
  User, 
  ShieldAlert, 
  Eye, 
  X, 
  Layers,
  FileCode2,
  List,
  History
} from "lucide-react";
import api from "@/lib/api";

const MODULE_OPTIONS = [
  { label: "Semua Modul", value: "" },
  { label: "Verification", value: "verification" },
  { label: "Attendance", value: "attendance" },
  { label: "Candidate", value: "candidate" },
  { label: "Participant", value: "participant" },
  { label: "Website", value: "website" },
  { label: "System / SMTP", value: "system" },
  { label: "Auth / RBAC", value: "auth" },
];

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "timeline">("table");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await auditService.listLogs({ 
        search: search || undefined,
        module: selectedModule || undefined,
        limit: 100 
      });
      setLogs(res.items || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal mengambil audit log");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, selectedModule]);

  const handleExport = async () => {
    try {
      toast.loading("Mempersiapkan data ekspor...", { id: "export-csv" });
      const res = await api.get(`/admin/audit/export?format=csv`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `audit-logs-${format(new Date(), "yyyyMMdd-HHmmss")}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("Audit log berhasil diekspor!", { id: "export-csv" });
    } catch (e) {
      toast.error("Gagal mengekspor audit log", { id: "export-csv" });
    }
  };

  const getModuleBadgeColor = (mod: string) => {
    const m = (mod || "").toLowerCase();
    if (m.includes("verif")) return "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800";
    if (m.includes("attend")) return "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900";
    if (m.includes("cand")) return "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800";
    if (m.includes("partic")) return "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900";
    if (m.includes("auth") || m.includes("rbac")) return "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900";
    return "bg-slate-100 dark:bg-slate-800 pg-text border-slate-200 dark:border-slate-700";
  };

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Audit Log & Activity Timeline" 
        description="Pantau dan audit seluruh aktivitas operasional serta perubahan data dalam sistem MUSKOM."
      >
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border pg-border bg-white dark:bg-slate-800 pg-text hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Segarkan
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold bg-primary hover:bg-primary-active text-white rounded-lg transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Ekspor CSV
          </button>
        </div>
      </SectionHeader>

      {/* Control Bar */}
      <div className="pg-surface border pg-border rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pg-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari aktivitas, aksi, atau entitas..."
              className="w-full pl-9 pr-4 py-2 min-h-[40px] text-sm bg-slate-50 dark:bg-slate-800/60 border pg-border rounded-lg pg-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 min-h-[40px] text-xs font-semibold bg-slate-50 dark:bg-slate-800/60 border pg-border rounded-lg pg-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            {MODULE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg self-end md:self-auto">
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
              viewMode === "table" ? "bg-white dark:bg-slate-700 pg-text shadow-sm" : "pg-muted hover:pg-text"
            }`}
          >
            <List className="w-3.5 h-3.5" /> Tabel
          </button>
          <button
            onClick={() => setViewMode("timeline")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
              viewMode === "timeline" ? "bg-primary text-white shadow-sm" : "pg-muted hover:pg-text"
            }`}
          >
            <History className="w-3.5 h-3.5" /> Timeline
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === "table" ? (
        <div className="pg-surface border pg-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b pg-border text-xs font-bold uppercase tracking-wider pg-muted">
                <tr>
                  <th className="px-4 py-3">Waktu</th>
                  <th className="px-4 py-3">Aktor</th>
                  <th className="px-4 py-3">Modul</th>
                  <th className="px-4 py-3">Aktivitas / Aksi</th>
                  <th className="px-4 py-3">Entitas</th>
                  <th className="px-4 py-3">IP Address</th>
                  <th className="px-4 py-3 text-right">Rincian</th>
                </tr>
              </thead>
              <tbody className="divide-y pg-border pg-text">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center pg-muted">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                      Memuat data audit log...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center pg-muted">
                      Tidak ada catatan aktivitas audit yang sesuai.
                    </td>
                  </tr>
                ) : (
                  logs.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5 text-xs pg-muted">
                        {format(new Date(row.created_at), "dd MMM yyyy, HH:mm:ss")}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold pg-text text-xs">{row.actor_name || row.user_id || "Sistem"}</div>
                        <div className="text-[11px] pg-muted">{row.actor_role || "System"}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${getModuleBadgeColor(row.module)}`}>
                          {row.module}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold pg-text text-xs">{row.action}</div>
                        {row.reason && <div className="text-[11px] pg-muted mt-0.5 truncate max-w-xs">{row.reason}</div>}
                      </td>
                      <td className="px-4 py-3.5 text-xs pg-muted font-mono">
                        {row.entity} {row.entity_id ? `(${row.entity_id.slice(0, 8)}...)` : ""}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-mono pg-muted">
                        {row.ip_address || "-"}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedLog(row)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 pg-text transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Timeline View */
        <div className="pg-surface border pg-border rounded-xl p-6 shadow-sm">
          {loading ? (
            <div className="py-12 text-center pg-muted">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
              Memuat linimasa aktivitas...
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center pg-muted">Tidak ada aktivitas pada linimasa.</div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {logs.map((log) => (
                <div key={log.id} className="relative group cursor-pointer" onClick={() => setSelectedLog(log)}>
                  <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-primary ring-4 ring-white dark:ring-slate-900 group-hover:scale-125 transition-transform" />
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border pg-border group-hover:border-primary/50 transition-all">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getModuleBadgeColor(log.module)}`}>
                          {log.module}
                        </span>
                        <span className="font-bold text-sm pg-text">{log.action}</span>
                      </div>
                      <span className="text-xs pg-muted">
                        {format(new Date(log.created_at), "dd MMM yyyy, HH:mm:ss")}
                      </span>
                    </div>
                    <div className="mt-2 text-xs pg-muted flex items-center gap-4">
                      <span>Aktor: <strong>{log.actor_name || log.user_id || "Sistem"}</strong></span>
                      {log.entity && <span>Entitas: <strong className="font-mono">{log.entity}</strong></span>}
                      {log.ip_address && <span>IP: <strong className="font-mono">{log.ip_address}</strong></span>}
                    </div>
                    {log.reason && (
                      <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-2 rounded-lg border pg-border">
                        {log.reason}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detail Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border pg-border rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b pg-border flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-primary" />
                <h3 className="font-bold pg-text">Inspeksi Data Log Aktivitas</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 pg-muted hover:pg-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b pg-border">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider pg-muted block">ID Log</span>
                  <span className="text-xs font-mono pg-text">{selectedLog.id}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider pg-muted block">Waktu Kejadian</span>
                  <span className="text-xs pg-text">{format(new Date(selectedLog.created_at), "dd MMMM yyyy, HH:mm:ss")}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider pg-muted block">Modul</span>
                  <span className="text-xs font-semibold pg-text">{selectedLog.module}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider pg-muted block">Aksi / Operasi</span>
                  <span className="text-xs font-semibold pg-text">{selectedLog.action}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider pg-muted block">Aktor</span>
                  <span className="text-xs pg-text">{selectedLog.actor_name || selectedLog.user_id || "Sistem"} ({selectedLog.actor_role || "System"})</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider pg-muted block">IP Address</span>
                  <span className="text-xs font-mono pg-text">{selectedLog.ip_address || "-"}</span>
                </div>
              </div>

              {selectedLog.reason && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider pg-muted block">Catatan / Alasan</span>
                  <p className="text-xs pg-text p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border pg-border mt-1">
                    {selectedLog.reason}
                  </p>
                </div>
              )}

              {selectedLog.metadata && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider pg-muted block mb-1">Metadata / Perubahan Data</span>
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto">
                    {typeof selectedLog.metadata === "string" 
                      ? selectedLog.metadata 
                      : JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="p-4 border-t pg-border bg-slate-50 dark:bg-slate-800/30 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-xs font-bold bg-primary hover:bg-primary-active text-white rounded-lg transition-colors shadow-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
