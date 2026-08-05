"use client";

import React, { useEffect, useState } from "react";
import { Mail, Send, CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface SMTPConfig {
  enabled: boolean;
  host: string;
  port: number;
  username: string;
  password: string;
  fromName: string;
  fromEmail: string;
}

export default function SMTPConfigurationPage() {
  const [config, setConfig] = useState<SMTPConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testEmail, setTestEmail] = useState("");
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/admin/system/config/smtp/config");
      setConfig(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Terjadi kesalahan memuat konfigurasi SMTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail) return;

    try {
      setIsTesting(true);
      await api.post("/admin/system/config/smtp/test", { email: testEmail });
      toast.success(`Email percobaan berhasil dikirim ke ${testEmail}`);
      setTestEmail("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengirim email, periksa konfigurasi SMTP Anda");
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight pg-text">Konfigurasi SMTP</h1>
        <p className="text-sm pg-muted mt-1">
          Pengaturan server email untuk notifikasi sistem. Konfigurasi ini dimuat dari Environment Variables.
        </p>
      </div>

      {!config?.enabled && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">SMTP Dinonaktifkan</h3>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
              Sistem tidak akan mengirim email apapun. Ubah MAIL_ENABLED menjadi true di environment variables untuk mengaktifkan.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="pg-surface border pg-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b pg-border flex items-center justify-between">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Mail className="w-4 h-4" /> Informasi Server
            </h2>
            {config?.enabled ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-medium text-rose-600 bg-rose-50 dark:bg-rose-900/30 px-2 py-1 rounded-full">
                <XCircle className="w-3.5 h-3.5" /> Nonaktif
              </span>
            )}
          </div>
          
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider pg-faint block mb-1">Host</label>
                <div className="text-sm font-medium pg-text">{config?.host || "-"}</div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider pg-faint block mb-1">Port</label>
                <div className="text-sm font-medium pg-text">{config?.port || "-"}</div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider pg-faint block mb-1">Username</label>
              <div className="text-sm font-medium pg-text">{config?.username || "-"}</div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider pg-faint block mb-1">Password</label>
              <div className="text-sm font-medium pg-text tracking-widest">{config?.password || "-"}</div>
            </div>

            <div className="pt-4 border-t pg-border">
              <h3 className="text-xs font-bold uppercase tracking-wider pg-text mb-3">Pengirim Email (Sender)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider pg-faint block mb-1">Nama Pengirim</label>
                  <div className="text-sm font-medium pg-text">{config?.fromName || "-"}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider pg-faint block mb-1">Email Pengirim</label>
                  <div className="text-sm font-medium pg-text">{config?.fromEmail || "-"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pg-surface border pg-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b pg-border">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Send className="w-4 h-4" /> Uji Pengiriman Email
            </h2>
          </div>
          <div className="p-5 flex-1 flex flex-col justify-center">
            <p className="text-sm pg-muted mb-4">
              Kirim email percobaan untuk memastikan konfigurasi SMTP Anda berfungsi dengan benar.
            </p>
            <form onSubmit={handleTestEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider pg-faint mb-1.5">
                  Alamat Email Tujuan
                </label>
                <input
                  type="email"
                  required
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full px-3 py-2 bg-transparent border pg-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  disabled={!config?.enabled || isTesting}
                />
              </div>
              <button
                type="submit"
                disabled={!config?.enabled || isTesting || !testEmail}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Kirim Email Percobaan
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
