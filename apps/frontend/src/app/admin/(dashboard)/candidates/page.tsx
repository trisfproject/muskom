"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  ExternalLink,
  RefreshCw,
  X,
  Plus,
  Trash2,
  User,
  MapPin,
  Building2,
  AlertTriangle,
  Upload,
  Eye,
  ArrowUpDown,
  ImageIcon,
} from "lucide-react";
import Image from "next/image";
import {
  candidateAdminService,
  CandidateAdminResponse,
} from "@/services/candidate-admin";
import { toast } from "sonner";

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "Verified":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs uppercase font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
        </span>
      );
    case "Rejected":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs uppercase font-bold bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800">
          <XCircle className="w-3.5 h-3.5" /> Rejected
        </span>
      );
    case "Under Review":
    case "Revision Required":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs uppercase font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
          <AlertCircle className="w-3.5 h-3.5" /> Menunggu Review
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs uppercase font-bold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
          {status}
        </span>
      );
  }
};

const PubBadge = ({ pubStatus }: { pubStatus: string }) => {
  if (pubStatus === "Published") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800">
        Dipublikasikan
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
      Draft / Tersembunyi
    </span>
  );
};

export default function AdminCandidatesPage() {
  const [data, setData] = useState<CandidateAdminResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    full_name: "",
    nickname: "",
    email: "",
    phone: "",
    company_name: "",
    industrial_area: "",
    job_title: "",
    department: "",
    biography: "",
    motivation: "",
    vision: "",
    mission: "",
    candidate_number: "" as number | "",
    display_order: 0,
  });
  const [createPhoto, setCreatePhoto] = useState<File | null>(null);

  // Delete Confirm Modal
  const [deleteTarget, setDeleteTarget] = useState<{ id?: string; bulk?: boolean; count?: number } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await candidateAdminService.getCandidates({
        status: statusFilter || undefined,
        search: search || undefined,
      });
      setData(res || []);
    } catch (err) {
      toast.error("Gagal memuat daftar kandidat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search]);

  // Selection Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(data.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isAllSelected = data.length > 0 && data.every((item) => selectedIds.includes(item.id));

  // Handle Create Candidate
  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.full_name || !createForm.email || !createForm.phone) {
      return toast.error("Nama lengkap, email, dan telepon wajib diisi.");
    }

    setCreating(true);
    try {
      const payload = {
        ...createForm,
        candidate_number: createForm.candidate_number === "" ? undefined : Number(createForm.candidate_number),
        display_order: Number(createForm.display_order) || 0,
      };

      const newCand = await candidateAdminService.createCandidate(payload);

      // Upload photo if selected
      if (createPhoto && newCand?.id) {
        try {
          await candidateAdminService.uploadPhoto(newCand.id, createPhoto);
        } catch {
          toast.warning("Kandidat berhasil dibuat, tetapi foto gagal diupload.");
        }
      }

      toast.success("Kandidat baru berhasil ditambahkan.");
      setShowCreateModal(false);
      setCreateForm({
        full_name: "",
        nickname: "",
        email: "",
        phone: "",
        company_name: "",
        industrial_area: "",
        job_title: "",
        department: "",
        biography: "",
        motivation: "",
        vision: "",
        mission: "",
        candidate_number: "",
        display_order: 0,
      });
      setCreatePhoto(null);
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal membuat kandidat.");
    } finally {
      setCreating(false);
    }
  };

  // Handle Delete Candidate(s)
  const handleExecuteDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.bulk) {
        await candidateAdminService.bulkDeleteCandidates(selectedIds);
        toast.success(`${selectedIds.length} kandidat berhasil dihapus.`);
        setSelectedIds([]);
      } else if (deleteTarget.id) {
        await candidateAdminService.deleteCandidate(deleteTarget.id);
        toast.success("Kandidat berhasil dihapus.");
      }
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal menghapus kandidat.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold pg-text tracking-tight">Data Induk Kandidat</h1>
          <p className="pg-muted text-sm mt-1">
            Kelola, verifikasi, dan publikasikan seluruh bakal calon pimpinan.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Kandidat
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pg-text hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Segarkan
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pg-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama atau nomor registrasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 min-h-[44px] text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 pg-text focus:outline-none focus:border-blue-600 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 pg-muted hover:pg-text"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 min-h-[44px] rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-blue-600 min-w-[180px] transition-colors"
          >
            <option value="">Semua Status</option>
            <option value="Verified">Verified</option>
            <option value="Under Review">Under Review</option>
            <option value="Draft">Draft</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950/50 border-b border-blue-100 dark:border-blue-900 px-5 py-3 flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-200">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              {selectedIds.length} kandidat terpilih
            </div>
            <button
              onClick={() => setDeleteTarget({ bulk: true, count: selectedIds.length })}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hapus Terpilih
            </button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-5 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider pg-muted">No. Urut</th>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider pg-muted">Kandidat</th>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider pg-muted">Perusahaan / Area</th>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider pg-muted">Status</th>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider pg-muted text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 pg-text">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-sm pg-muted">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Memuat data kandidat...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Users className="w-6 h-6 pg-muted" />
                      </div>
                      <p className="text-sm font-medium pg-muted">Tidak ada data kandidat</p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="text-xs text-blue-600 hover:underline font-semibold"
                      >
                        + Tambah kandidat sekarang
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row) => {
                  const isSelected = selectedIds.includes(row.id);
                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? "bg-blue-50/40 dark:bg-blue-950/20" : ""
                      }`}
                    >
                      <td className="px-5 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(row.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-extrabold text-blue-600 dark:text-blue-400 text-lg">
                          {row.candidate_number ? `#${row.candidate_number}` : "-"}
                        </div>
                        <div className="font-mono text-[10px] pg-muted font-medium uppercase">
                          REG: {row.registration_number}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                            {row.profile_photo ? (
                              <Image
                                src={row.profile_photo}
                                alt={row.full_name}
                                fill
                                className="object-cover"
                                unoptimized={row.profile_photo?.startsWith('/uploads/')}
                              />
                            ) : (
                              <User className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold pg-text text-sm">{row.full_name}</div>
                            <div className="text-xs pg-muted">{row.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-sm pg-text">
                          {row.company_name || "-"}
                        </div>
                        <div className="text-xs pg-muted mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> {row.industrial_area || "-"}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col items-start gap-1.5">
                          <StatusBadge status={row.status} />
                          <PubBadge pubStatus={row.publication_status} />
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/candidates/${row.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Buka Detail
                          </Link>
                          <button
                            onClick={() => setDeleteTarget({ id: row.id })}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-red-500 hover:text-red-600 transition-colors cursor-pointer text-slate-600 dark:text-slate-400"
                            title="Hapus Kandidat"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/20">
          <p className="text-xs pg-muted font-medium">Menampilkan {data.length} kandidat</p>
        </div>
      </div>

      {/* ─── Create Candidate Modal ─── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-bold pg-text">Tambah Bakal Calon / Kandidat Baru</h2>
                <p className="text-xs pg-muted">
                  Registrasi kandidat dilakukan secara administratif oleh panitia.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCandidate} className="space-y-4 text-sm">
              {/* Photo Upload */}
              <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                  {createPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={URL.createObjectURL(createPhoto)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold pg-text block mb-1">
                    Foto Profil Kandidat (Opsional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file) {
                        const maxUploadSize = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE) || 10485760;
                        if (file.size > maxUploadSize) {
                          toast.error(`Ukuran file maksimal ${Math.round(maxUploadSize / (1024 * 1024))} MB.`);
                          e.target.value = "";
                          setCreatePhoto(null);
                          return;
                        }
                      }
                      setCreatePhoto(file);
                    }}
                    className="text-xs pg-muted file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold pg-text block mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="cth. Ir. Budi Santoso"
                    value={createForm.full_name}
                    onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold pg-text block mb-1">
                    Nama Panggilan
                  </label>
                  <input
                    type="text"
                    placeholder="cth. Budi"
                    value={createForm.nickname}
                    onChange={(e) => setCreateForm({ ...createForm, nickname: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold pg-text block mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="budi@example.com"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold pg-text block mb-1">Telepon / WA *</label>
                  <input
                    type="text"
                    required
                    placeholder="08123456789"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold pg-text block mb-1">Perusahaan</label>
                  <input
                    type="text"
                    placeholder="PT Industri Bersama"
                    value={createForm.company_name}
                    onChange={(e) => setCreateForm({ ...createForm, company_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold pg-text block mb-1">Kawasan Industri</label>
                  <input
                    type="text"
                    placeholder="Kawasan MM2100"
                    value={createForm.industrial_area}
                    onChange={(e) => setCreateForm({ ...createForm, industrial_area: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold pg-text block mb-1">Jabatan</label>
                  <input
                    type="text"
                    placeholder="Manager HRD"
                    value={createForm.job_title}
                    onChange={(e) => setCreateForm({ ...createForm, job_title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold pg-text block mb-1">Departemen</label>
                  <input
                    type="text"
                    placeholder="Human Resources"
                    value={createForm.department}
                    onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold pg-text block mb-1">
                    Nomor Urut Kandidat (Opsional)
                  </label>
                  <input
                    type="number"
                    placeholder="1, 2, 3..."
                    value={createForm.candidate_number}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        candidate_number: e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold pg-text block mb-1">
                    Urutan Tampilan
                  </label>
                  <input
                    type="number"
                    value={createForm.display_order}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, display_order: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold pg-text block mb-1">Biografi Singkat</label>
                <textarea
                  rows={2}
                  placeholder="Pengalaman dan latar belakang kandidat..."
                  value={createForm.biography}
                  onChange={(e) => setCreateForm({ ...createForm, biography: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-xs focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold pg-text block mb-1">Visi</label>
                  <textarea
                    rows={2}
                    placeholder="Visi kandidat..."
                    value={createForm.vision}
                    onChange={(e) => setCreateForm({ ...createForm, vision: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold pg-text block mb-1">Misi</label>
                  <textarea
                    rows={2}
                    placeholder="Misi kandidat..."
                    value={createForm.mission}
                    onChange={(e) => setCreateForm({ ...createForm, mission: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 pg-text transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  {creating ? "Menyimpan..." : "Simpan Kandidat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ─── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold pg-text">Konfirmasi Hapus Kandidat</h3>
                <p className="text-xs pg-muted">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <p className="text-sm pg-text">
              {deleteTarget.bulk
                ? `Apakah Anda yakin ingin menghapus ${deleteTarget.count} kandidat yang dipilih?`
                : "Apakah Anda yakin ingin menghapus kandidat ini beserta berkas terkait?"}
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 pg-text transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={deleting}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
