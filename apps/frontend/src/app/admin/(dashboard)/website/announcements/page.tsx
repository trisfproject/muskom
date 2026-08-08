"use client";

import { useEffect, useState } from "react";
import { websiteService, Announcement } from "@/services/website";
import {
  Megaphone,
  Plus,
  Trash2,
  Edit2,
  Pin,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
} from "lucide-react";

export default function AdminWebsiteAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);
  const [formState, setFormState] = useState<Partial<Announcement>>({
    title: "",
    slug: "",
    category: "Pengumuman",
    summary: "",
    content: "",
    thumbnail_url: "",
    is_pinned: false,
    is_published: true,
  });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const data = await websiteService.getAnnouncements();
      setAnnouncements(data || []);
    } catch (err: unknown) {
      console.error("Failed to load announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormState({
      title: "",
      slug: "",
      category: "Pengumuman",
      summary: "",
      content: "",
      thumbnail_url: "",
      is_pinned: false,
      is_published: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: Announcement) => {
    setEditingItem(item);
    setFormState({
      title: item.title,
      slug: item.slug,
      category: item.category,
      summary: item.summary,
      content: item.content,
      thumbnail_url: item.thumbnail_url,
      is_pinned: item.is_pinned,
      is_published: item.is_published,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const generatedSlug = formState.slug || formState.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const payload: Partial<Announcement> = {
        ...formState,
        slug: generatedSlug,
      };

      if (editingItem && editingItem.id) {
        await websiteService.updateAnnouncement(editingItem.id, payload);
        setMessage({ type: "success", text: "Pengumuman berhasil diperbarui." });
      } else {
        await websiteService.createAnnouncement(payload);
        setMessage({ type: "success", text: "Pengumuman baru berhasil diterbitkan." });
      }
      setModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      setMessage({ type: "error", text: "Gagal menyimpan pengumuman." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengumuman ini?")) return;
    try {
      await websiteService.deleteAnnouncement(id);
      setMessage({ type: "success", text: "Pengumuman berhasil dihapus." });
      await loadData();
    } catch (err: unknown) {
      setMessage({ type: "error", text: "Gagal menghapus pengumuman." });
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold pg-text tracking-tight">Website — Pusat Informasi & Pengumuman</h1>
          <p className="text-sm pg-muted mt-1">
            Publikasikan rilis resmi, panduan, dan pembaruan berkas untuk publik.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover pg-text font-semibold text-sm transition-colors shadow-lg shadow-[var(--color-primary)]/30 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Buat Pengumuman
        </button>
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

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.length === 0 ? (
          <div className="p-12 text-center pg-surface border pg-border rounded-2xl">
            <Megaphone className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="pg-muted text-sm font-medium">Belum ada pengumuman</p>
            <p className="text-slate-600 text-xs mt-1">Klik tombol &quot;Buat Pengumuman&quot; untuk menambahkan konten pertama.</p>
          </div>
        ) : (
          announcements.map((item) => (
            <div
              key={item.id}
              className="pg-surface border pg-border rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:pg-border transition-colors"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-primary text-xs font-semibold">
                    {item.category || "Pengumuman"}
                  </span>
                  {item.is_pinned && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold flex items-center gap-1">
                      <Pin className="w-2.5 h-2.5" /> Disematkan
                    </span>
                  )}
                  {!item.is_published && (
                    <span className="px-2 py-0.5 rounded-full pg-surface-elevated pg-muted text-[10px] font-medium">
                      Draft
                    </span>
                  )}
                </div>
                <h3 className="font-bold pg-text text-base mb-1">{item.title}</h3>
                <p className="text-xs pg-muted line-clamp-2">{item.summary || item.content}</p>
                <p className="text-[11px] pg-muted font-mono mt-2">
                  Diterbitkan: {item.published_at ? new Date(item.published_at).toLocaleDateString("id-ID") : "-"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <button
                  onClick={() => openEditModal(item)}
                  className="p-2 rounded-lg pg-surface-elevated hover:pg-surface-elevated/80 text-slate-300 transition-colors"
                  title="Edit Pengumuman"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id!)}
                  className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                  title="Hapus Pengumuman"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="pg-surface border pg-border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b pg-border flex items-center justify-between">
              <h2 className="text-base font-bold pg-text">
                {editingItem ? "Edit Pengumuman" : "Buat Pengumuman Baru"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 pg-muted hover:pg-text rounded-lg hover:pg-surface-elevated transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Judul Pengumuman</label>
                <input
                  type="text"
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Kategori</label>
                  <input
                    type="text"
                    value={formState.category}
                    onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                    className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)]"
                    placeholder="Tahapan, Panduan, Berita"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Slug URL (Opsional)</label>
                  <input
                    type="text"
                    value={formState.slug}
                    onChange={(e) => setFormState({ ...formState, slug: e.target.value })}
                    className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text font-mono focus:outline-none focus:border-[var(--color-primary)]"
                    placeholder="otomatis jika kosong"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Ringkasan (Summary)</label>
                <textarea
                  rows={2}
                  value={formState.summary}
                  onChange={(e) => setFormState({ ...formState, summary: e.target.value })}
                  className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Konten Lengkap</label>
                <textarea
                  rows={5}
                  value={formState.content}
                  onChange={(e) => setFormState({ ...formState, content: e.target.value })}
                  className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] resize-none"
                  required
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-3 p-3 bg-[var(--color-bg)]/60 border pg-border rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.is_pinned}
                    onChange={(e) => setFormState({ ...formState, is_pinned: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold pg-text block">Sematkan di Atas (Pin)</span>
                    <span className="text-[11px] pg-muted">Tampilkan sebagai berita prioritas/terbaru</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-[var(--color-bg)]/60 border pg-border rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.is_published}
                    onChange={(e) => setFormState({ ...formState, is_published: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold pg-text block">Publikasikan</span>
                    <span className="text-[11px] pg-muted">Tampilkan di halaman portal publik</span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t pg-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl pg-surface-elevated hover:pg-surface-elevated/80 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 pg-text text-xs font-semibold transition-colors"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
