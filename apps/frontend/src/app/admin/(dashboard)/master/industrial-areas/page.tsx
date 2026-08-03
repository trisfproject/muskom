"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Plus, Search, Pencil, Trash2, RotateCcw, MapPin,
  Building2, ChevronLeft, ChevronRight, X, CheckCircle2, XCircle
} from "lucide-react";
import {
  adminMasterDataService,
  IndustrialArea,
  CreateIndustrialAreaRequest,
} from "@/services/master-data";

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({
  open, onClose, title, children,
}: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg pg-surface border pg-border rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b pg-border">
          <h2 className="font-bold pg-text text-base">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:pg-surface-elevated pg-muted transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────
function AreaForm({
  initial, onSubmit, loading,
}: {
  initial?: Partial<CreateIndustrialAreaRequest>;
  onSubmit: (data: CreateIndustrialAreaRequest) => Promise<void>;
  loading: boolean;
}) {
  const [form, setForm] = useState<CreateIndustrialAreaRequest>({
    name: initial?.name ?? "",
    code: initial?.code ?? "",
    city: initial?.city ?? "",
    province: initial?.province ?? "",
    sort_order: initial?.sort_order ?? 0,
    is_active: initial?.is_active !== undefined ? initial.is_active : true,
  });

  const f = (key: keyof CreateIndustrialAreaRequest) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [key]: key === "sort_order" ? Number(e.target.value) : e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Nama harus diisi"); return; }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="text-xs font-semibold pg-muted mb-1.5 block">Nama Kawasan *</label>
          <input value={form.name} onChange={f("name")} className="w-full px-3.5 py-2.5 rounded-xl border pg-border pg-bg pg-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Nama kawasan industri" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold pg-muted mb-1.5 block">Kode</label>
            <input value={form.code ?? ""} onChange={f("code")} className="w-full px-3.5 py-2.5 rounded-xl border pg-border pg-bg pg-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="JBK" />
          </div>
          <div>
            <label className="text-xs font-semibold pg-muted mb-1.5 block">Urutan</label>
            <input type="number" value={form.sort_order ?? 0} onChange={f("sort_order")} className="w-full px-3.5 py-2.5 rounded-xl border pg-border pg-bg pg-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold pg-muted mb-1.5 block">Kota</label>
            <input value={form.city ?? ""} onChange={f("city")} className="w-full px-3.5 py-2.5 rounded-xl border pg-border pg-bg pg-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Cikarang" />
          </div>
          <div>
            <label className="text-xs font-semibold pg-muted mb-1.5 block">Provinsi</label>
            <input value={form.province ?? ""} onChange={f("province")} className="w-full px-3.5 py-2.5 rounded-xl border pg-border pg-bg pg-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Jawa Barat" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.is_active ? "bg-emerald-500" : "bg-slate-300"}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${form.is_active ? "translate-x-4" : "translate-x-0.5"}`} />
          </button>
          <span className="text-sm pg-text font-medium">{form.is_active ? "Aktif" : "Nonaktif"}</span>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="flex-1 bg-primary text-white font-semibold py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity text-sm">
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function IndustrialAreasPage() {
  const [items, setItems] = useState<IndustrialArea[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IndustrialArea | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IndustrialArea | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminMasterDataService.listIndustrialAreas({
        search, page, limit,
        ...(showDeleted ? {} : { is_active: undefined }),
      });
      setItems(res?.items ?? []);
      setTotal(res?.total ?? 0);
    } catch {
      toast.error("Gagal mengambil data kawasan industri");
    } finally {
      setLoading(false);
    }
  }, [search, page, showDeleted]);

  useEffect(() => { fetch(); }, [fetch]);

  const totalPages = Math.ceil(total / limit);

  const handleCreate = async (data: CreateIndustrialAreaRequest) => {
    setSaving(true);
    try {
      await adminMasterDataService.createIndustrialArea(data);
      toast.success("Kawasan industri berhasil dibuat");
      setModalOpen(false);
      fetch();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Gagal membuat data");
    } finally { setSaving(false); }
  };

  const handleUpdate = async (data: CreateIndustrialAreaRequest) => {
    if (!editing) return;
    setSaving(true);
    try {
      await adminMasterDataService.updateIndustrialArea(editing.id, data);
      toast.success("Kawasan industri diperbarui");
      setEditing(null);
      fetch();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Gagal memperbarui data");
    } finally { setSaving(false); }
  };

  const handleDelete = async (item: IndustrialArea) => {
    try {
      await adminMasterDataService.deleteIndustrialArea(item.id);
      toast.success(`"${item.name}" dihapus`);
      setDeleteTarget(null);
      fetch();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Gagal menghapus data");
    }
  };

  const handleRestore = async (item: IndustrialArea) => {
    try {
      await adminMasterDataService.restoreIndustrialArea(item.id);
      toast.success(`"${item.name}" dipulihkan`);
      fetch();
    } catch {
      toast.error("Gagal memulihkan data");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-xl font-bold pg-text">Kawasan Industri</h1>
          </div>
          <p className="text-sm pg-muted">Kelola data kawasan industri yang tersedia di platform</p>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-white font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm shadow-md shadow-primary/20">
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pg-muted" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari kawasan, kode, kota..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border pg-border pg-bg pg-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <label className="flex items-center gap-2 text-sm pg-text cursor-pointer">
          <input type="checkbox" checked={showDeleted} onChange={e => { setShowDeleted(e.target.checked); setPage(1); }}
            className="rounded" />
          Tampilkan terhapus
        </label>
        <span className="text-xs pg-muted">{total} data</span>
      </div>

      {/* Table */}
      <div className="pg-surface border pg-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b pg-border pg-muted">
                <th className="text-left px-4 py-3 font-semibold">Nama</th>
                <th className="text-left px-4 py-3 font-semibold">Kode</th>
                <th className="text-left px-4 py-3 font-semibold">Lokasi</th>
                <th className="text-left px-4 py-3 font-semibold">Urutan</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b pg-border">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 pg-border rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center pg-muted text-sm">
                  <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Belum ada data kawasan industri
                </td></tr>
              ) : items.map((item) => (
                <tr key={item.id} className={`border-b pg-border hover:pg-surface-elevated transition-colors`}>
                  <td className="px-4 py-3 font-medium pg-text">{item.name}</td>
                  <td className="px-4 py-3 pg-muted font-mono text-xs">{item.code || "—"}</td>
                  <td className="px-4 py-3 pg-muted">{[item.city, item.province].filter(Boolean).join(", ") || "—"}</td>
                  <td className="px-4 py-3 pg-muted text-center">{item.sort_order}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${item.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-500/10 text-slate-500"}`}>
                      {item.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {item.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => setEditing(item)} title="Edit"
                            className="p-1.5 rounded-lg hover:pg-surface-elevated pg-muted hover:pg-text transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteTarget(item)} title="Hapus"
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t pg-border">
            <span className="text-xs pg-muted">Halaman {page} dari {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-lg border pg-border disabled:opacity-30 hover:pg-surface-elevated transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-lg border pg-border disabled:opacity-30 hover:pg-surface-elevated transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Tambah Kawasan Industri">
        <AreaForm onSubmit={handleCreate} loading={saving} />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Kawasan Industri">
        {editing && (
          <AreaForm
            initial={{ name: editing.name, code: editing.code, city: editing.city, province: editing.province, sort_order: editing.sort_order, is_active: editing.is_active }}
            onSubmit={handleUpdate} loading={saving}
          />
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Hapus Kawasan Industri">
        {deleteTarget && (
          <div className="space-y-4">
            <p className="text-sm pg-text">Hapus <strong>"{deleteTarget.name}"</strong>? Data dapat dipulihkan setelah dihapus.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border pg-border pg-text text-sm font-semibold hover:pg-surface-elevated transition-colors">Batal</button>
              <button onClick={() => handleDelete(deleteTarget)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors">Hapus</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
