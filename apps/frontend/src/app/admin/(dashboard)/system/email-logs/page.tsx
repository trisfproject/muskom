"use client";

import React, { useEffect, useState } from "react";
import { Mail, RefreshCw, CheckCircle2, XCircle, Clock } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { SectionHeader } from "@/components/ui/section-header";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface NotificationHistory {
  id: string;
  job_id: string;
  channel: string;
  recipient: string;
  status: "SENT" | "FAILED";
  sent_at: string;
  error_message?: string;
}

export default function EmailLogsPage() {
  const [logs, setLogs] = useState<NotificationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/admin/notifications/history");
      if (res.data?.data) {
        setLogs(res.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memuat log email");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SENT":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "FAILED":
        return <XCircle className="w-5 h-5 text-rose-500" />;
      default:
        return <Clock className="w-5 h-5 text-slate-500" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "SENT":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case "FAILED":
        return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <SectionHeader
        title="Log Email"
        description="Riwayat pengiriman email notifikasi oleh sistem."
      >
        <button
          type="button"
          onClick={fetchLogs}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border pg-border bg-white dark:bg-slate-800 pg-text hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Log
        </button>
      </SectionHeader>

      <div className="pg-surface border pg-border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center items-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold pg-text">Belum ada riwayat email</h3>
            <p className="mt-1 text-sm">Sistem belum pernah mengirimkan email notifikasi.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b pg-border">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider pg-muted">
                    Waktu
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider pg-muted">
                    Penerima
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider pg-muted">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider pg-muted">
                    Keterangan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y pg-border">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium pg-text">
                        {log.sent_at ? format(new Date(log.sent_at), "dd MMM yyyy, HH:mm", { locale: id }) : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm pg-text font-medium truncate max-w-[200px]" title={log.recipient}>
                        {log.recipient}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${getStatusBadgeClass(log.status)}`}>
                        {getStatusIcon(log.status)}
                        <span>{log.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs pg-muted truncate max-w-sm" title={log.error_message || "-"}>
                        {log.error_message || "-"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
