"use client";

import { useEffect, useState } from "react";
import { websiteService, InformationPage } from "@/services/website";
import {
  FileText,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
} from "lucide-react";
import Link from "next/link";

export default function AdminInformationPages() {
  const [pages, setPages] = useState<InformationPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InformationPage | null>(null);
  const [formState, setFormState] = useState<Partial<InformationPage>>({
    title: "",
    slug: "",
    content: "",
    is_published: true,
  });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const data = await websiteService.getInformationPages();
      setPages(data || []);
    } catch (err: unknown) {
      console.error("Failed to load information pages:", err);
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
      content: "",
      is_published: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: InformationPage) => {
    setEditingItem(item);
    setFormState({
      title: item.title,
      slug: item.slug,
      content: item.content,
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
      const payload: Partial<InformationPage> = {
        ...formState,
        slug: generatedSlug,
      };

      if (editingItem && editingItem.id) {
        await websiteService.updateInformationPage(editingItem.id, payload);
        setMessage({ type: "success", text: "Halaman informasi berhasil diperbarui." });
      } else {
        await websiteService.createInformationPage(payload);
        setMessage({ type: "success", text: "Halaman informasi baru berhasil diterbitkan." });
      }
      setModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      setMessage({ type: "error", text: "Gagal menyimpan halaman informasi." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus halaman ini?")) return;
    try {
      await websiteService.deleteInformationPage(id);
      setMessage({ type: "success", text: "Halaman berhasil dihapus." });
      await loadData();
    } catch (err: unknown) {
      setMessage({ type: "error", text: "Gagal menghapus halaman." });
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
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold pg-text tracking-tight">Website — Pusat Informasi</h1>
          <p className="text-sm pg-muted mt-1">
            Kelola halaman panduan, tata tertib, dan informasi dinamis lainnya.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover pg-text font-semibold text-sm transition-colors shadow-lg shadow-[var(--color-primary)]/30 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Buat Halaman
        </button>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm ${
            message.type === "success"
              ? "bg-[var(--color-primary)]/10 text-primary border border-[var(--color-primary)]/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <p>{message.text}</p>
        </div>
      )}

      {/* Pages List */}
      <div className="bg-[#1A1F2E] border pg-border rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b pg-border pg-surface/50">
                <th className="px-6 py-4 text-xs font-semibold pg-muted uppercase tracking-wider w-[40%]">Halaman</th>
                <th className="px-6 py-4 text-xs font-semibold pg-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold pg-muted uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {pages.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center pg-muted">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>Belum ada halaman informasi.</p>
                  </td>
                </tr>
              ) : (
                pages.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0 border border-[var(--color-primary)]/20">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="pg-text font-medium mb-1">{p.title}</p>
                          <div className="flex items-center gap-3 text-xs pg-muted">
                            <span>/{p.slug}</span>
                            <span className="w-1 h-1 rounded-full pg-surface-elevated"></span>
                            <span>{new Date(p.created_at || "").toLocaleDateString("id-ID")}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          p.is_published
                            ? "bg-[var(--color-primary)]/10 text-primary border-[var(--color-primary)]/20"
                            : "pg-surface-elevated pg-muted pg-border"
                        }`}
                      >
                        {p.is_published ? "Dipublikasikan" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/informasi/${p.slug}`}
                          target="_blank"
                          className="p-2 pg-muted hover:pg-text pg-surface-elevated/50 hover:pg-surface-elevated/80 rounded-lg transition-colors"
                          title="Lihat"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-2 text-primary hover:text-primary-hover bg-[var(--color-primary)]/10 hover:bg-primary-hover/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => p.id && handleDelete(p.id)}
                          className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-3xl bg-[#1A1F2E] border pg-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b pg-border">
              <h2 className="text-xl font-bold pg-text">
                {editingItem ? "Edit Halaman" : "Buat Halaman Baru"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="pg-muted hover:pg-text transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="page-form" onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Judul Halaman <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      required
                      value={formState.title}
                      onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                      className="w-full pg-surface border pg-border rounded-xl px-4 py-2.5 pg-text placeholder:pg-muted focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                      placeholder="Masukkan judul halaman..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">URL Slug</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 pg-border pg-surface-elevated/50 pg-muted text-sm">
                        /informasi/
                      </span>
                      <input
                        type="text"
                        value={formState.slug}
                        onChange={(e) => setFormState({ ...formState, slug: e.target.value })}
                        className="flex-1 min-w-0 pg-surface border pg-border rounded-r-xl px-4 py-2.5 pg-text placeholder:pg-muted focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                        placeholder="Otomatis dari judul jika kosong"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Konten (Markdown/HTML) <span className="text-red-400">*</span></label>
                  <p className="text-xs pg-muted mb-2">Gunakan Markdown untuk memformat teks (misal: **Tebal**, # Judul, - Daftar).</p>
                  <textarea
                    required
                    rows={12}
                    value={formState.content}
                    onChange={(e) => setFormState({ ...formState, content: e.target.value })}
                    className="w-full pg-surface border pg-border rounded-xl px-4 py-3 pg-text placeholder:pg-muted focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all font-mono text-sm"
                    placeholder="Tulis konten halaman di sini..."
                  />
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl border pg-border pg-surface">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={formState.is_published}
                    onChange={(e) => setFormState({ ...formState, is_published: e.target.checked })}
                    className="w-4 h-4 rounded pg-border pg-surface-elevated text-primary focus:ring-[var(--color-primary)] focus:ring-offset-slate-900"
                  />
                  <label htmlFor="is_published" className="text-sm text-slate-300 font-medium select-none cursor-pointer">
                    Publikasikan halaman ini (Bisa diakses publik)
                  </label>
                </div>
              </form>
            </div>

            <div className="p-6 border-t pg-border bg-[#1A1F2E] rounded-b-2xl flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:pg-text transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                form="page-form"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover pg-text font-semibold text-sm transition-all shadow-lg shadow-[var(--color-primary)]/20 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Simpan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
