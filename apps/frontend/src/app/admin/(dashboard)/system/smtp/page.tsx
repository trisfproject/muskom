"use client";

import React, { useEffect, useState } from "react";
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Save, 
  Key, 
  Server, 
  UserCheck, 
  Eye, 
  EyeOff,
  Zap
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";

interface SMTPConfig {
  enabled: boolean;
  host: string;
  port: number;
  username: string;
  password?: string;
  fromName: string;
  fromEmail: string;
}

export default function SMTPConfigurationPage() {
  const [config, setConfig] = useState<SMTPConfig>({
    enabled: false,
    host: "",
    port: 587,
    username: "",
    password: "",
    fromName: "",
    fromEmail: "",
  });

  const [initialLoaded, setInitialLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/admin/system/config/smtp/config");
      if (res.data?.data) {
        const d = res.data.data;
        setConfig({
          enabled: d.enabled ?? false,
          host: d.host || "",
          port: d.port || 587,
          username: d.username || "",
          password: d.password || "",
          fromName: d.fromName || d.from_name || "",
          fromEmail: d.fromEmail || d.from_email || "",
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Terjadi kesalahan memuat konfigurasi SMTP");
    } finally {
      setIsLoading(false);
      setInitialLoaded(true);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.put("/admin/system/config/smtp/config", {
        enabled: config.enabled,
        host: config.host.trim(),
        port: Number(config.port),
        username: config.username.trim(),
        password: config.password,
        from_name: config.fromName.trim(),
        from_email: config.fromEmail.trim(),
      });
      toast.success("Konfigurasi SMTP berhasil disimpan dan diperbarui!");
      fetchConfig();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menyimpan konfigurasi SMTP");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setIsTestingConn(true);
      const res = await api.post("/admin/system/config/smtp/test-connection");
      if (res.data?.success) {
        toast.success("Koneksi ke server SMTP berhasil!");
      } else {
        toast.error(res.data?.message || "Koneksi SMTP gagal");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Koneksi ke server SMTP gagal. Periksa host, port, dan kredensial.");
    } finally {
      setIsTestingConn(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail.trim()) {
      toast.error("Masukkan alamat email tujuan");
      return;
    }

    try {
      setIsSendingTestEmail(true);
      const res = await api.post("/admin/system/config/smtp/test", { email: testEmail.trim() });
      if (res.data?.success) {
        toast.success(`Email percobaan berhasil dikirim ke ${testEmail}`);
        setTestEmail("");
      } else {
        toast.error(res.data?.message || "Gagal mengirim email percobaan");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengirim email. Pastikan server SMTP aktif dan kredensial valid.");
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  if (isLoading && !initialLoaded) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Konfigurasi Server SMTP"
        description="Kelola pengaturan server pengiriman email notifikasi, verifikasi, dan bukti pendaftaran musyawarah."
        actions={
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTestingConn}
            className="flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] text-xs font-semibold rounded-lg border pg-border bg-white dark:bg-slate-800 pg-text hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Zap className={`w-3.5 h-3.5 text-amber-500 ${isTestingConn ? "animate-spin" : ""}`} />
            {isTestingConn ? "Menguji Koneksi..." : "Uji Koneksi Server"}
          </button>
        }
      />

      {!config.enabled && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">Layanan Email Dinonaktifkan</h3>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
              Saat dinonaktifkan, sistem tidak akan mengirim email notifikasi ke peserta atau panitia. Aktifkan toggle di bawah untuk mengaktifkan pengiriman email.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main SMTP Config Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSaveConfig} className="pg-surface border pg-border rounded-xl shadow-sm overflow-hidden space-y-6 p-6">
            <div className="flex items-center justify-between pb-4 border-b pg-border">
              <div className="flex items-center gap-2.5">
                <Server className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-sm pg-text">Pengaturan Koneksi Mailer</h2>
              </div>

              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                <span className="ml-2.5 text-xs font-semibold pg-text">
                  {config.enabled ? (
                    <span className="text-emerald-600 dark:text-emerald-400">Aktif</span>
                  ) : (
                    <span className="text-slate-400">Nonaktif</span>
                  )}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider pg-muted mb-1.5">
                  SMTP Host *
                </label>
                <input
                  type="text"
                  required
                  value={config.host}
                  onChange={(e) => setConfig({ ...config, host: e.target.value })}
                  placeholder="smtp.example.com / mail.domain.com"
                  className="w-full px-3.5 py-2.5 min-h-[44px] bg-slate-50 dark:bg-slate-800/60 border pg-border rounded-lg text-sm pg-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider pg-muted mb-1.5">
                  SMTP Port *
                </label>
                <input
                  type="number"
                  required
                  value={config.port}
                  onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) || 587 })}
                  placeholder="587"
                  className="w-full px-3.5 py-2.5 min-h-[44px] bg-slate-50 dark:bg-slate-800/60 border pg-border rounded-lg text-sm pg-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider pg-muted mb-1.5">
                  Username SMTP
                </label>
                <input
                  type="text"
                  value={config.username}
                  onChange={(e) => setConfig({ ...config, username: e.target.value })}
                  placeholder="admin@domain.com / apikey"
                  className="w-full px-3.5 py-2.5 min-h-[44px] bg-slate-50 dark:bg-slate-800/60 border pg-border rounded-lg text-sm pg-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider pg-muted mb-1.5">
                  Password SMTP
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={config.password || ""}
                    onChange={(e) => setConfig({ ...config, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full pl-3.5 pr-10 py-2.5 min-h-[44px] bg-slate-50 dark:bg-slate-800/60 border pg-border rounded-lg text-sm pg-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:pg-text"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t pg-border">
              <h3 className="text-xs font-bold uppercase tracking-wider pg-text mb-3">Identitas Pengirim (Sender Identity)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider pg-muted mb-1.5">
                    Nama Pengirim
                  </label>
                  <input
                    type="text"
                    value={config.fromName}
                    onChange={(e) => setConfig({ ...config, fromName: e.target.value })}
                    placeholder="Panitia MUSKOM 2026"
                    className="w-full px-3.5 py-2.5 min-h-[44px] bg-slate-50 dark:bg-slate-800/60 border pg-border rounded-lg text-sm pg-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider pg-muted mb-1.5">
                    Email Pengirim
                  </label>
                  <input
                    type="email"
                    value={config.fromEmail}
                    onChange={(e) => setConfig({ ...config, fromEmail: e.target.value })}
                    placeholder="noreply@komitkabe.org"
                    className="w-full px-3.5 py-2.5 min-h-[44px] bg-slate-50 dark:bg-slate-800/60 border pg-border rounded-lg text-sm pg-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t pg-border flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 min-h-[44px] bg-primary hover:bg-primary-active text-white text-sm font-bold rounded-lg transition-all shadow-sm disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Simpan Konfigurasi
              </button>
            </div>
          </form>
        </div>

        {/* Test Email Box */}
        <div className="lg:col-span-1">
          <div className="pg-surface border pg-border rounded-xl shadow-sm overflow-hidden flex flex-col p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b pg-border">
              <Send className="w-5 h-5 text-indigo-500" />
              <h2 className="font-semibold text-sm pg-text">Uji Kirim Email</h2>
            </div>

            <p className="text-xs pg-muted leading-relaxed">
              Kirimkan email uji coba ke alamat Anda untuk memverifikasi apakah server SMTP mampu menghantarkan pesan dengan format HTML dan styling yang sesuai.
            </p>

            <form onSubmit={handleSendTestEmail} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider pg-muted mb-1.5">
                  Email Tujuan
                </label>
                <input
                  type="email"
                  required
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="admin@domain.com"
                  disabled={!config.enabled || isSendingTestEmail}
                  className="w-full px-3.5 py-2.5 min-h-[44px] bg-slate-50 dark:bg-slate-800/60 border pg-border rounded-lg text-sm pg-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={!config.enabled || isSendingTestEmail || !testEmail.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-all shadow-sm"
              >
                {isSendingTestEmail ? (
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

            <div className="pt-4 border-t pg-border text-xs pg-muted space-y-2">
              <div className="flex items-center justify-between">
                <span>Status Koneksi:</span>
                <span className="font-semibold pg-text">{config.host ? `${config.host}:${config.port}` : "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>TLS / SSL:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">STARTTLS / TLS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
