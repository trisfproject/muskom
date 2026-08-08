"use client";

import { useEffect, useState } from "react";
import { websiteService, HeroSettings } from "@/services/website";
import { Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";

export default function AdminWebsiteHeroPage() {
  const [formData, setFormData] = useState<HeroSettings>({
    hero_badge: "",
    primary_cta_label: "",
    primary_cta_url: "",
    primary_cta_enabled: true,
    secondary_cta_label: "",
    secondary_cta_url: "",
    secondary_cta_enabled: true,
    background_mode: "aurora-blueprint",
    hero_status: "ACTIVE",
    is_published: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await websiteService.getHero();
        if (data) {
          setFormData(data);
        }
      } catch (err: unknown) {
        console.error("Failed to load hero settings:", err);
        toast.error("Gagal mengambil konfigurasi hero");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await websiteService.updateHero(formData);
      setFormData(updated);
      toast.success("Hero section berhasil diperbarui.");
    } catch (err: unknown) {
      toast.error("Gagal memperbarui hero section.");
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
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Website — Hero Section"
        description="Atur teks pembuka, badge identitas, tombol call-to-action (CTA), dan visual latar belakang."
      />



      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Content */}
        <div className="pg-surface border pg-border rounded-2xl p-6">
          <h2 className="text-base font-semibold pg-text mb-4">Konten Utama Hero</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-400">Judul Utama & Deskripsi Sinkron Otomatis</h3>
                <p className="text-xs text-blue-300/80 mt-1">
                  Untuk menjaga konsistensi Single Source of Truth, Judul Utama (Hero Title) dan Deskripsi diambil secara otomatis dari <strong>Website Identity & General Settings</strong>. Silakan perbarui Nama Portal dan Tagline di halaman General jika ingin mengubah teks utama.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Hero Badge (Pill Atas)</label>
              <input
                type="text"
                value={formData.hero_badge}
                onChange={(e) => setFormData({ ...formData, hero_badge: e.target.value })}
                className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)]"
                placeholder="Together We Shape the Future"
                required
              />
            </div>
          </div>
        </div>

        {/* Primary & Secondary CTAs */}
        <div className="pg-surface border pg-border rounded-2xl p-6">
          <h2 className="text-base font-semibold pg-text mb-4">Tombol Aksi (Call To Action)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary CTA */}
            <div className="p-4 bg-[var(--color-bg)]/60 border pg-border rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">CTA Utama</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs pg-muted">Aktif</span>
                  <input
                    type="checkbox"
                    checked={formData.primary_cta_enabled}
                    onChange={(e) => setFormData({ ...formData, primary_cta_enabled: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                </label>
              </div>
              <div>
                <label className="block text-[11px] font-medium pg-muted mb-1">Label Tombol</label>
                <input
                  type="text"
                  value={formData.primary_cta_label}
                  onChange={(e) => setFormData({ ...formData, primary_cta_label: e.target.value })}
                  className="w-full pg-surface border pg-border rounded-lg px-3 py-2 text-xs pg-text"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium pg-muted mb-1">URL Target</label>
                <input
                  type="text"
                  value={formData.primary_cta_url}
                  onChange={(e) => setFormData({ ...formData, primary_cta_url: e.target.value })}
                  className="w-full pg-surface border pg-border rounded-lg px-3 py-2 text-xs pg-text font-mono"
                />
              </div>
            </div>

            {/* Secondary CTA */}
            <div className="p-4 bg-[var(--color-bg)]/60 border pg-border rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold pg-muted uppercase tracking-wider">CTA Sekunder</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs pg-muted">Aktif</span>
                  <input
                    type="checkbox"
                    checked={formData.secondary_cta_enabled}
                    onChange={(e) => setFormData({ ...formData, secondary_cta_enabled: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                </label>
              </div>
              <div>
                <label className="block text-[11px] font-medium pg-muted mb-1">Label Tombol</label>
                <input
                  type="text"
                  value={formData.secondary_cta_label}
                  onChange={(e) => setFormData({ ...formData, secondary_cta_label: e.target.value })}
                  className="w-full pg-surface border pg-border rounded-lg px-3 py-2 text-xs pg-text"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium pg-muted mb-1">URL Target</label>
                <input
                  type="text"
                  value={formData.secondary_cta_url}
                  onChange={(e) => setFormData({ ...formData, secondary_cta_url: e.target.value })}
                  className="w-full pg-surface border pg-border rounded-lg px-3 py-2 text-xs pg-text font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Visual Background Mode */}
        <div className="pg-surface border pg-border rounded-2xl p-6">
          <h2 className="text-base font-semibold pg-text mb-4">Mode Latar Belakang & Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Gaya Visual Latar</label>
              <select
                value={formData.background_mode}
                onChange={(e) => setFormData({ ...formData, background_mode: e.target.value })}
                className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value="aurora-blueprint">Aurora + Blueprint (Modern Tech 60 FPS)</option>
                <option value="minimal-clean">Minimal Clean</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Status Hero</label>
              <select
                value={formData.hero_status}
                onChange={(e) => setFormData({ ...formData, hero_status: e.target.value })}
                className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value="ACTIVE">Aktif (Live)</option>
                <option value="PAUSED">Ditunda</option>
              </select>
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
