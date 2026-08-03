"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Plus, Search, Pencil, Trash2, RotateCcw, Building,
  ChevronLeft, ChevronRight, X, CheckCircle2, XCircle
} from "lucide-react";
import {
  adminMasterDataService, publicMasterDataService,
  Company, CreateCompanyRequest, IndustrialArea,
} from "@/services/master-data";

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
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

function CompanyForm({ initial, areas, onSubmit, loading }: {
  initial?: Partial<CreateCompanyRequest>;
  areas: IndustrialArea[];
  onSubmit: (data: CreateCompanyRequest) => Promise<void>;
  loading: boolean;
}) {
  const [form, setForm] = useState<CreateCompanyRequest>({
    name: initial?.name ?? "",
    industrial_area_id: initial?.industrial_area_id ?? "",
    address: initial?.address ?? "",
    is_active: initial?.is_active !== undefined ? initial.is_active : true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Nama harus diisi"); return; }
    const payload = { ...form, industrial_area_id: form.industrial_area_id || undefined };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-semibold pg-muted mb-1.5 block">Nama Perusahaan *</label>
        <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          className="w-full px-3.5 py-2.5 rounded-xl border pg-border pg-bg pg-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Nama perusahaan" />
      </div>
      <div>
        <label className="text-xs font-semibold pg-muted mb-1.5 block">Kawasan Industri</label>
        <select value={form.industrial_area_id ?? ""} onChange={e => setForm(p => ({ ...p, industrial_area_id: e.target.value }))}
          className="w-full px-3.5 py-2.5 rounded-xl border pg-border pg-bg pg-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option value="">— Pilih kawasan (opsional) —</option>
          {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold pg-muted mb-1.5 block">Alamat</label>
        <textarea value={form.address ?? ""} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} rows={3}
          className="w-full px-3.5 py-2.5 rounded-xl border pg-border pg-bg pg-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" placeholder="Alamat lengkap (opsional)" />
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.is_active ? "bg-emerald-500" : "bg-slate-300"}`}>
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${form.is_active ? "translate-x-4" : "translate-x-0.5"}`} />
        </button>
        <span className="text-sm pg-text font-medium">{form.is_active ? "Aktif" : "Nonaktif"}</span>
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

export default function CompaniesPage() {
  const [items, setItems] = useState<Company[]>([]);
  const [areas, setAreas] = useState<IndustrialArea[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);

  useEffect(() => {
    publicMasterDataService.getIndustrialAreas().then(setAreas).catch(() => {});
  }, []);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminMasterDataService.listCompanies({ search, page, limit, area_id: areaFilter || undefined });
      setItems(res?.items ?? []);
      setTotal(res?.total ?? 0);
    } catch {
      toast.error("Gagal mengambil data perusahaan");
    } finally { setLoading(false); }
  }, [search, page, areaFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const totalPages = Math.ceil(total / limit);

  const handleCreate = async (data: CreateCompanyRequest) => {
    setSaving(true);
    try {
      await adminMasterDataService.createCompany(data);
      toast.success("Perusahaan berhasil ditambahkan");
      setModalOpen(false); fetch();
    } catch (e: any) { toast.error(e?.response?.data?.message || "Gagal membuat data"); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (data: CreateCompanyRequest) => {
    if (!editing) return;
    setSaving(true);
    try {
      await adminMasterDataService.updateCompany(editing.id, data);
      toast.success("Perusahaan diperbarui");
      setEditing(null); fetch();
    } catch (e: any) { toast.error(e?.response?.data?.message || "Gagal memperbarui data"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (item: Company) => {
    try {
      await adminMasterDataService.deleteCompany(item.id);
      toast.success(`"${item.name}" dihapus`);
      setDeleteTarget(null); fetch();
    } catch (e: any) { toast.error(e?.response?.data?.message || "Gagal menghapus data"); }
  };

  const handleRestore = async (item: Company) => {
    try {
      await adminMasterDataService.restoreCompany(item.id);
      toast.success(`"${item.name}" dipulihkan`); fetch();
    } catch { toast.error("Gagal memulihkan data"); }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-xl font-bold pg-text">Perusahaan</h1>
          </div>
          <p className="text-sm pg-muted">Kelola data perusahaan yang tersedia di platform</p>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-white font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm shadow-md shadow-primary/20">
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pg-muted" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari perusahaan..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border pg-border pg-bg pg-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <select value={areaFilter} onChange={e => { setAreaFilter(e.target.value); setPage(1); }}
          className="px-3.5 py-2.5 rounded-xl border pg-border pg-bg pg-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option value="">Semua Kawasan</option>
          {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <span className="text-xs pg-muted">{total} data</span>
      </div>

      <div className="pg-surface border pg-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b pg-border pg-muted">
                <th className="text-left px-4 py-3 font-semibold">Nama Perusahaan</th>
                <th className="text-left px-4 py-3 font-semibold">Kawasan</th>
                <th className="text-left px-4 py-3 font-semibold">Alamat</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b pg-border">
                    {[...Array(5)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 pg-border rounded animate-pulse" /></td>)}
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center pg-muted text-sm">
                  <Building className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Belum ada data perusahaan
                </td></tr>
              ) : items.map(item => (
                <tr key={item.id} className="border-b pg-border hover:pg-surface-elevated transition-colors">
                  <td className="px-4 py-3 font-medium pg-text">{item.name}</td>
                  <td className="px-4 py-3 pg-muted">{item.industrial_area || "—"}</td>
                  <td className="px-4 py-3 pg-muted max-w-[200px] truncate">{item.address || "—"}</td>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Tambah Perusahaan">
        <CompanyForm areas={areas} onSubmit={handleCreate} loading={saving} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Perusahaan">
        {editing && (
          <CompanyForm areas={areas}
            initial={{ name: editing.name, industrial_area_id: editing.industrial_area_id, address: editing.address, is_active: editing.is_active }}
            onSubmit={handleUpdate} loading={saving} />
        )}
      </Modal>
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Hapus Perusahaan">
        {deleteTarget && (
          <div className="space-y-4">
            <p className="text-sm pg-text">Hapus <strong>"{deleteTarget.name}"</strong>?</p>
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
