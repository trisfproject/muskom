"use client";

import { useEffect, useState } from "react";
import { websiteService, FooterSettings } from "@/services/website";
import { Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminWebsiteFooterPage() {
  const [formData, setFormData] = useState<FooterSettings>({
    organization_name: "MUSKOM",
    description: "",
    copyright: "",
    official_badge: "OFFICIAL PORTAL",
    tagline: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await websiteService.getFooter();
        if (data) {
          setFormData(data);
        }
      } catch (err: unknown) {
        console.error("Failed to load footer settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const updated = await websiteService.updateFooter(formData);
      setFormData(updated);
      setMessage({ type: "success", text: "Pengaturan footer berhasil disimpan." });
    } catch (err: unknown) {
      setMessage({ type: "error", text: "Gagal menyimpan pengaturan footer." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold pg-text tracking-tight">Website — Footer Portal</h1>
        <p className="text-sm pg-muted mt-1">
          Konfigurasi teks penutup, badge portal resmi, hak cipta, dan tagline komunitas.
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm ${
            message.type === "success"
              ? "bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-primary"
              : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Kolom Kiri - Identitas */}
        <div className="pg-surface border pg-border rounded-2xl p-6">
          <h2 className="text-base font-semibold pg-text mb-4">Area Kiri (Identitas & Penjelasan)</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Nama Organisasi / Event</label>
              <input
                type="text"
                value={formData.organization_name}
                onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Deskripsi Singkat</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Kolom Kanan - Badge & Copyright */}
        <div className="pg-surface border pg-border rounded-2xl p-6">
          <h2 className="text-base font-semibold pg-text mb-4">Area Kanan (Badge & Hak Cipta)</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Badge Teks</label>
              <input
                type="text"
                value={formData.official_badge}
                onChange={(e) => setFormData({ ...formData, official_badge: e.target.value })}
                className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)]"
                placeholder="OFFICIAL PORTAL"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Teks Hak Cipta (Copyright)</label>
              <input
                type="text"
                value={formData.copyright}
                onChange={(e) => setFormData({ ...formData, copyright: e.target.value })}
                className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Tagline Penutup</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)]"
                placeholder="Dibangun untuk kemajuan bersama."
              />
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 pg-text font-semibold text-sm transition-colors shadow-lg shadow-[var(--color-primary)]/30"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}
