"use client";

import { useEffect, useState } from "react";
import { websiteService, HeroSettings } from "@/services/website";
import { Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminWebsiteHeroPage() {
  const [formData, setFormData] = useState<HeroSettings>({
    hero_badge: "",
    hero_title: "",
    hero_description: "",
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
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await websiteService.getHero();
        if (data) {
          setFormData(data);
        }
      } catch (err: unknown) {
        console.error("Failed to load hero settings:", err);
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
      const updated = await websiteService.updateHero(formData);
      setFormData(updated);
      setMessage({ type: "success", text: "Hero section berhasil diperbarui." });
    } catch (err: unknown) {
      setMessage({ type: "error", text: "Gagal memperbarui hero section." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Website — Hero Section</h1>
        <p className="text-sm text-slate-400 mt-1">
          Atur teks pembuka, badge identitas, tombol call-to-action (CTA), dan visual latar belakang.
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm ${
            message.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
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
        {/* Main Content */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Konten Utama Hero</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Hero Badge (Pill Atas)</label>
              <input
                type="text"
                value={formData.hero_badge}
                onChange={(e) => setFormData({ ...formData, hero_badge: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="Together We Shape the Future"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Judul Utama (Hero Title / H1)</label>
              <input
                type="text"
                value={formData.hero_title}
                onChange={(e) => setFormData({ ...formData, hero_title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Deskripsi Ringkas</label>
              <textarea
                rows={3}
                value={formData.hero_description}
                onChange={(e) => setFormData({ ...formData, hero_description: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Primary & Secondary CTAs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Tombol Aksi (Call To Action)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary CTA */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">CTA Utama</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-slate-400">Aktif</span>
                  <input
                    type="checkbox"
                    checked={formData.primary_cta_enabled}
                    onChange={(e) => setFormData({ ...formData, primary_cta_enabled: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                </label>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Label Tombol</label>
                <input
                  type="text"
                  value={formData.primary_cta_label}
                  onChange={(e) => setFormData({ ...formData, primary_cta_label: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">URL Target</label>
                <input
                  type="text"
                  value={formData.primary_cta_url}
                  onChange={(e) => setFormData({ ...formData, primary_cta_url: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* Secondary CTA */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">CTA Sekunder</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-slate-400">Aktif</span>
                  <input
                    type="checkbox"
                    checked={formData.secondary_cta_enabled}
                    onChange={(e) => setFormData({ ...formData, secondary_cta_enabled: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                </label>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Label Tombol</label>
                <input
                  type="text"
                  value={formData.secondary_cta_label}
                  onChange={(e) => setFormData({ ...formData, secondary_cta_label: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">URL Target</label>
                <input
                  type="text"
                  value={formData.secondary_cta_url}
                  onChange={(e) => setFormData({ ...formData, secondary_cta_url: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Visual Background Mode */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Mode Latar Belakang & Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Gaya Visual Latar</label>
              <select
                value={formData.background_mode}
                onChange={(e) => setFormData({ ...formData, background_mode: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
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
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors shadow-lg shadow-blue-600/30"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}
