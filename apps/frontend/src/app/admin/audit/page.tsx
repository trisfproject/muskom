"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { auditService, AuditLog } from "@/services/admin/audit";
import { SectionHeader } from "@/components/ui/section-header";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { format } from "date-fns";

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await auditService.listLogs({ search });
      setLogs(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal mengambil audit log");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search]);

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Audit Log" 
        description="Pantau seluruh aktivitas yang terjadi di dalam sistem MUSKOM."
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input 
            placeholder="Cari aktivitas..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-800/50 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Waktu</th>
                <th className="px-4 py-3 font-medium">Aktor</th>
                <th className="px-4 py-3 font-medium">Modul</th>
                <th className="px-4 py-3 font-medium">Aktivitas</th>
                <th className="px-4 py-3 font-medium">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">Memuat data...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">Tidak ada log ditemukan</td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {format(new Date(log.created_at), "dd MMM yyyy, HH:mm")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{log.actor_name || "Sistem"}</div>
                      <div className="text-xs text-slate-500">{log.actor_role || "-"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {log.module}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-300">{log.action}</div>
                      {log.reason && <div className="text-xs text-slate-500 mt-1">{log.reason}</div>}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs font-mono">
                      {log.ip_address || "-"}
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
