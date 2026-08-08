"use client";

import { useEffect, useState } from "react";
import { websiteService, CandidateCMSSettings } from "@/services/website";
import { Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminWebsiteCandidateCMSPage() {
  const [formData, setFormData] = useState<CandidateCMSSettings>({
    section_title: "",
    section_description: "",
    registration_status: "PENJARINGAN",
    empty_state_message: "",
    publication_message: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await websiteService.getCandidateSettings();
        if (data) {
          setFormData(data);
        }
      } catch (err: unknown) {
        console.error("Failed to load candidate CMS settings:", err);
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
      const updated = await websiteService.updateCandidateSettings(formData);
      setFormData(updated);
      setMessage({ type: "success", text: "Pengaturan section calon berhasil disimpan." });
    } catch (err: unknown) {
      setMessage({ type: "error", text: "Gagal menyimpan pengaturan section calon." });
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
        <h1 className="text-2xl font-bold pg-text tracking-tight">Website — Section Calon Ketua</h1>
        <p className="text-sm pg-muted mt-1">
          Konfigurasi judul section, deskripsi pengantar, dan teks informasi verifikasi kandidat.
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
        {/* Section Heading */}
        <div className="pg-surface border pg-border rounded-2xl p-6">
          <h2 className="text-base font-semibold pg-text mb-4">Header Section Kandidat</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Judul Section</label>
              <input
                type="text"
                value={formData.section_title}
                onChange={(e) => setFormData({ ...formData, section_title: e.target.value })}
                className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Deskripsi Section</label>
              <textarea
                rows={3}
                value={formData.section_description}
                onChange={(e) => setFormData({ ...formData, section_description: e.target.value })}
                className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Messages & Status */}
        <div className="pg-surface border pg-border rounded-2xl p-6">
          <h2 className="text-base font-semibold pg-text mb-4">Pesan & Status Kandidat</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Status Penjaringan / Bursa</label>
              <select
                value={formData.registration_status}
                onChange={(e) => setFormData({ ...formData, registration_status: e.target.value })}
                className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value="PENJARINGAN">Penjaringan Sedang Berlangsung</option>
                <option value="VERIFIKASI">Verifikasi Administrasi</option>
                <option value="DITETAPKAN">Kandidat Telah Ditetapkan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Pesan Saat Belum Ada Kandidat (Empty State)</label>
              <input
                type="text"
                value={formData.empty_state_message}
                onChange={(e) => setFormData({ ...formData, empty_state_message: e.target.value })}
                className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Pesan Pengumuman Penetapan (Publication Message)</label>
              <input
                type="text"
                value={formData.publication_message}
                onChange={(e) => setFormData({ ...formData, publication_message: e.target.value })}
                className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)]"
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
