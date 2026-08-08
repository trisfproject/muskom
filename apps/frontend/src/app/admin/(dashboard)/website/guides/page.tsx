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
import { PageHeader } from "@/components/admin/PageHeader";

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
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Website — Pusat Informasi"
        description="Kelola halaman panduan, tata tertib, dan informasi dinamis lainnya."
        actions={
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center min-h-[44px] gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-xs transition-colors shadow-sm shrink-0 w-full sm:w-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Buat Halaman
          </button>
        }
      />

      {message && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm ${
            message.type === "success"
              ? "bg-[var(--color-primary)]/10 text-primary border border-[var(--color-primary)]/20"
              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <p>{message.text}</p>
        </div>
      )}

      {/* Pages List */}
      <div className="pg-surface border pg-border rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left md:table flex flex-col">
            <thead className="hidden md:table-header-group">
              <tr className="border-b pg-border pg-surface/50">
                <th className="px-6 py-4 text-xs font-semibold pg-muted uppercase tracking-wider w-[40%]">Halaman</th>
                <th className="px-6 py-4 text-xs font-semibold pg-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold pg-muted uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] flex flex-col md:table-row-group">
              {pages.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center pg-muted block md:table-cell">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>Belum ada halaman informasi.</p>
                  </td>
                </tr>
              ) : (
                pages.map((p) => (
                  <tr key={p.id} className="hover:pg-surface-elevated transition-colors group flex flex-col md:table-row p-4 md:p-0 border-b md:border-none pg-border">
                    <td className="px-0 py-2 md:px-6 md:py-4 flex justify-between md:items-start md:table-cell gap-4 border-b md:border-none pg-border/50 items-center">
                      <span className="md:hidden font-bold pg-muted text-[10px] uppercase tracking-wider shrink-0">Halaman</span>
                      <div className="flex items-start gap-4 text-right md:text-left justify-end md:justify-start">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 hidden md:flex items-center justify-center shrink-0 border border-[var(--color-primary)]/20">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="pg-text font-medium mb-1">{p.title}</p>
                          <div className="flex items-center md:justify-start justify-end gap-3 text-xs pg-muted flex-wrap">
                            <span>/{p.slug}</span>
                            <span className="w-1 h-1 rounded-full pg-surface-elevated hidden sm:inline-block"></span>
                            <span className="hidden sm:inline-block">{new Date(p.created_at || "").toLocaleDateString("id-ID")}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-0 py-2 md:px-6 md:py-4 flex justify-between items-center md:table-cell gap-4 border-b md:border-none pg-border/50">
                      <span className="md:hidden font-bold pg-muted text-[10px] uppercase tracking-wider shrink-0">Status</span>
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
                    <td className="px-0 py-3 md:px-6 md:py-4 flex justify-between items-center md:table-cell gap-4 md:border-none">
                      <span className="md:hidden font-bold pg-muted text-[10px] uppercase tracking-wider shrink-0">Aksi</span>
                      <div className="flex items-center justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/informasi/${p.slug}`}
                          target="_blank"
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center pg-muted hover:pg-text pg-surface-elevated/50 hover:pg-surface-elevated/80 rounded-lg transition-colors"
                          title="Lihat"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openEditModal(p)}
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-primary hover:text-primary-hover bg-[var(--color-primary)]/10 hover:bg-primary-hover/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => p.id && handleDelete(p.id)}
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors"
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
          <div className="relative w-full max-w-3xl pg-surface border pg-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
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
                    <label className="text-sm font-medium pg-text">Judul Halaman <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formState.title}
                      onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                      className="w-full min-h-[44px] pg-surface border pg-border rounded-xl px-4 py-2.5 pg-text placeholder:pg-muted focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                      placeholder="Masukkan judul halaman..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium pg-text">URL Slug</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 pg-border pg-surface-elevated/50 pg-muted text-sm">
                        /informasi/
                      </span>
                      <input
                        type="text"
                        value={formState.slug}
                        onChange={(e) => setFormState({ ...formState, slug: e.target.value })}
                        className="flex-1 min-w-0 min-h-[44px] pg-surface border pg-border rounded-r-xl px-4 py-2.5 pg-text placeholder:pg-muted focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                        placeholder="Otomatis dari judul jika kosong"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium pg-text">Konten (Markdown/HTML) <span className="text-rose-500">*</span></label>
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
                    className="w-4 h-4 rounded pg-border pg-surface-elevated text-primary focus:ring-[var(--color-primary)] focus:ring-offset-[var(--color-surface)]"
                  />
                  <label htmlFor="is_published" className="text-sm pg-text font-medium select-none cursor-pointer">
                    Publikasikan halaman ini (Bisa diakses publik)
                  </label>
                </div>
              </form>
            </div>

            <div className="p-6 border-t pg-border pg-surface rounded-b-2xl flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="min-h-[44px] px-5 py-2.5 text-sm font-medium pg-text hover:pg-muted transition-colors w-full sm:w-auto text-center"
              >
                Batal
              </button>
              <button
                type="submit"
                form="page-form"
                disabled={saving}
                className="inline-flex items-center justify-center min-h-[44px] gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover pg-text font-semibold text-sm transition-all shadow-lg shadow-[var(--color-primary)]/20 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto min-w-[120px]"
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
