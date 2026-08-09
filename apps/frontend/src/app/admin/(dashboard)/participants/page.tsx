"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Search,
  RefreshCw,
  X,
  Users,
  MapPin,
  Building2,
  Phone,
  Mail,
  Briefcase,
  Calendar,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Edit3,
  Check,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Send,
  Filter,
  MoreVertical,
  Edit,
  Download,
} from "lucide-react";
import {
  adminParticipantService,
  AdminParticipantResponse,
  ParticipantAuditEntry,
  EmailLogResponse,
} from "@/services/participant-admin";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";

const STATUS_CFG: Record<string, { label: string; dot: string; badge: string }> = {
  PENDING: {
    label: "Pending",
    dot: "bg-slate-400",
    badge: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/40 dark:text-slate-300 dark:border-slate-800",
  },
  VERIFIED: {
    label: "Terverifikasi",
    dot: "bg-blue-400",
    badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
  },
  APPROVED: {
    label: "Approved",
    dot: "bg-emerald-400",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  },
  REJECTED: {
    label: "Ditolak",
    dot: "bg-red-400",
    badge: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
  },
  WAITING_EMAIL: {
    label: "Menunggu Email",
    dot: "bg-orange-400",
    badge: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800",
  },
  FAILED_EMAIL: {
    label: "Gagal Email",
    dot: "bg-red-500",
    badge: "bg-transparent text-red-700 border-red-400 dark:text-red-300 dark:border-red-600 border-dashed",
  },
  EMAIL_SENT: {
    label: "Email Terkirim",
    dot: "bg-emerald-400",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  },
  ELIGIBLE: {
    label: "Eligible",
    dot: "bg-indigo-400",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800",
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status.toUpperCase()] ?? {
    label: status,
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export default function AdminParticipantsPage() {
  const [data, setData] = useState<AdminParticipantResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modals & Drawers
  const [detailItem, setDetailItem] = useState<AdminParticipantResponse | null>(null);
  const [auditLogs, setAuditLogs] = useState<ParticipantAuditEntry[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLogResponse[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  // Edit Modal
  const [editItem, setEditItem] = useState<AdminParticipantResponse | null>(null);
  const [editForm, setEditForm] = useState<Partial<AdminParticipantResponse>>({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Confirm Modal
  const [deleteTarget, setDeleteTarget] = useState<{ id?: string; bulk?: boolean; count?: number } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [exporting, setExporting] = useState(false);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      await adminParticipantService.exportCSV({
        status: statusFilter || undefined,
        search: search || undefined,
      });
      toast.success("Data peserta berhasil diekspor.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal mengekspor data peserta.");
    } finally {
      setExporting(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminParticipantService.listParticipants({
        page: currentPage,
        limit: pageSize,
        status: statusFilter || undefined,
        search: search || undefined,
      });
      setData(res.data || []);
      setTotalItems(res.total || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err) {
      toast.error("Gagal memuat daftar peserta.");
    } finally {
      setLoading(false);
    }
  };

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [search, statusFilter, pageSize]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, search, statusFilter]);

  const paginatedData = data;

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedData.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isAllSelected =
    paginatedData.length > 0 &&
    paginatedData.every((item) => selectedIds.includes(item.id));

  // Open Detail
  const openDetail = async (p: AdminParticipantResponse) => {
    setDetailItem(p);
    setLoadingLogs(true);
    try {
      const [logs, emails] = await Promise.all([
        adminParticipantService.getAuditLogs(p.id).catch(() => []),
        adminParticipantService.getEmailHistory(p.id).catch(() => [])
      ]);
      setAuditLogs(logs || []);
      setEmailLogs(emails || []);
    } catch {
      setAuditLogs([]);
      setEmailLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleResendEmail = async (emailType: string) => {
    if (!detailItem) return;
    setResendingEmail(true);
    try {
      await adminParticipantService.resendEmail(detailItem.id, emailType);
      toast.success("Email berhasil dimasukkan ke antrean pengiriman ulang.");
      // Refresh email logs
      const emails = await adminParticipantService.getEmailHistory(detailItem.id);
      setEmailLogs(emails || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal mengirim ulang email.");
    } finally {
      setResendingEmail(false);
    }
  };

  // Open Edit
  const openEdit = (p: AdminParticipantResponse) => {
    setEditItem(p);
    setEditForm({
      participant_name: p.participant_name,
      nickname: p.nickname,
      email: p.email,
      phone: p.phone,
      company: p.company,
      job_title: p.job_title,
      region: p.region,
      community: p.community,
      special_notes: p.special_notes,
      registration_number: p.registration_number,
    });
  };

  // Submit Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setSavingEdit(true);
    try {
      await adminParticipantService.updateParticipant(editItem.id, editForm);
      toast.success("Data peserta berhasil diperbarui.");
      setEditItem(null);
      if (detailItem && detailItem.id === editItem.id) {
        setDetailItem((prev) => (prev ? { ...prev, ...editForm } : null));
      }
      fetchData();
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        toast.error(`Validasi gagal: ${data.errors[0].field} ${data.errors[0].message}`);
      } else {
        toast.error(data?.message || "Gagal memperbarui data peserta.");
      }
    } finally {
      setSavingEdit(false);
    }
  };

  // Single & Bulk Delete
  const handleExecuteDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.bulk) {
        await adminParticipantService.bulkDelete(selectedIds);
        toast.success(`${selectedIds.length} peserta berhasil dihapus.`);
        setSelectedIds([]);
      } else if (deleteTarget.id) {
        await adminParticipantService.deleteParticipant(deleteTarget.id);
        toast.success("Peserta berhasil dihapus.");
        if (detailItem?.id === deleteTarget.id) setDetailItem(null);
      }
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal menghapus peserta.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Induk Peserta"
        description="Kelola dan verifikasi seluruh peserta musyawarah KOMITKABE."
        actions={
          <>
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2.5 min-h-[44px] rounded-lg border border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Download className={`w-3.5 h-3.5 ${exporting ? "animate-spin" : ""}`} />
              {exporting ? "Mengekspor..." : "Export CSV"}
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2.5 min-h-[44px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pg-text hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Segarkan Data
            </button>
          </>
        }
      />

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
        {/* Filters & Search */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="relative flex-1 max-w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pg-muted" />
            <input
              type="text"
              placeholder="Cari no. reg, nama, email, perusahaan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 min-h-[44px] text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 pg-text focus:outline-none focus:border-blue-600 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 pg-muted hover:pg-text p-1 min-h-[32px] min-w-[32px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 min-h-[44px] rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-blue-600 min-w-full sm:min-w-[180px] transition-colors"
            >
              <option value="">Semua Status</option>
              <option value="Verified">Terverifikasi</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Ditolak</option>
              <option value="Eligible">Eligible</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950/50 border-b border-blue-100 dark:border-blue-900 px-5 py-3 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-200">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              {selectedIds.length} peserta terpilih
            </div>
            <div className="flex items-center gap-2">
              {/* Verification actions have been moved to /admin/verifications */}
              <button
                onClick={() => setDeleteTarget({ bulk: true, count: selectedIds.length })}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Terpilih
              </button>
            </div>
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
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider pg-muted">No. Reg</th>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider pg-muted">Peserta</th>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider pg-muted">Instansi / Area</th>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider pg-muted">Status</th>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider pg-muted text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 pg-text">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-sm pg-muted">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Memuat data peserta...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Users className="w-6 h-6 pg-muted" />
                      </div>
                      <p className="text-sm font-medium pg-muted">Tidak ada data peserta ditemukan</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? "bg-blue-50/40 dark:bg-blue-950/20" : ""
                      }`}
                    >
                      <td className="px-5 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(p.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {p.registration_number}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold pg-text text-sm">{p.participant_name}</div>
                        <div className="text-xs pg-muted mt-0.5">{p.email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-sm pg-text">{p.company || p.company_name || "-"}</div>
                        <div className="text-xs pg-muted mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> {p.region || p.industrial_area || "-"}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openDetail(p)}
                            className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 transition-colors cursor-pointer text-slate-600 dark:text-slate-400"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEdit(p)}
                            className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:border-amber-500 hover:text-amber-600 transition-colors cursor-pointer text-slate-600 dark:text-slate-400"
                            title="Edit Data"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ id: p.id })}
                            className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:border-red-500 hover:text-red-600 transition-colors cursor-pointer text-slate-600 dark:text-slate-400"
                            title="Hapus Peserta"
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

        {/* Footer & Pagination */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xs pg-muted font-medium">
            Menampilkan {totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{" "}
            {Math.min(currentPage * pageSize, totalItems)} dari {totalItems} peserta
          </div>

          <div className="flex items-center gap-3">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text"
            >
              <option value={10}>10 baris</option>
              <option value={25}>25 baris</option>
              <option value={50}>50 baris</option>
            </select>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Detail Modal / Drawer ─── */}
      {detailItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Detail Peserta
                </span>
                <h2 className="text-xl font-bold pg-text mt-0.5">{detailItem.participant_name}</h2>
                <p className="font-mono text-xs pg-muted mt-1">REG: {detailItem.registration_number}</p>
              </div>
              <button
                onClick={() => setDetailItem(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs pg-muted block font-medium">Email</span>
                <span className="font-semibold pg-text flex items-center gap-1.5 mt-1">
                  <Mail className="w-3.5 h-3.5 text-blue-500" /> {detailItem.email}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs pg-muted block font-medium">Telepon / WhatsApp</span>
                <span className="font-semibold pg-text flex items-center gap-1.5 mt-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" /> {detailItem.phone}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs pg-muted block font-medium">Perusahaan / Instansi</span>
                <span className="font-semibold pg-text flex items-center gap-1.5 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-purple-500" /> {detailItem.company || "-"}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs pg-muted block font-medium">Kawasan Industri</span>
                <span className="font-semibold pg-text flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500" /> {detailItem.region || "-"}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs pg-muted block font-medium">Jabatan</span>
                <span className="font-semibold pg-text flex items-center gap-1.5 mt-1">
                  <Briefcase className="w-3.5 h-3.5 text-amber-500" /> {detailItem.job_title || "-"}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs pg-muted block font-medium">Departemen</span>
                <span className="font-semibold pg-text mt-1 block">{detailItem.community || "-"}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end mt-2">
              <button
                onClick={() => openEdit(detailItem)}
                className="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 pg-text transition-colors cursor-pointer flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" /> Edit Data
              </button>
            </div>

            {/* Email History */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <h3 className="text-sm font-bold pg-text mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" /> Riwayat Pengiriman Email
              </h3>
              {loadingLogs ? (
                <p className="text-xs pg-muted">Memuat data email...</p>
              ) : emailLogs.length === 0 ? (
                <p className="text-xs pg-muted">Belum ada riwayat email.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {emailLogs.map((log) => (
                    <div
                      key={log.id}
                      className="text-xs p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <span className="font-semibold pg-text">{log.email_type}</span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            log.status === "SENT"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : log.status === "FAILED"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          }`}
                        >
                          {log.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] pg-muted">
                        <div>Penerima: {log.recipient_email}</div>
                        <div>Terkirim: {log.sent_at ? new Date(log.sent_at).toLocaleString('id-ID') : '-'}</div>
                        <div>Upaya Gagal: {log.retry_count}</div>
                        <div>Last Retry: {log.last_retry_at ? new Date(log.last_retry_at).toLocaleString('id-ID') : '-'}</div>
                      </div>
                      {log.last_error && (
                        <div className="mt-2 text-[10px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-1.5 rounded">
                          Error: {log.last_error}
                        </div>
                      )}
                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          disabled={resendingEmail}
                          onClick={async () => {
                            setResendingEmail(true);
                            try {
                              await adminParticipantService.retryEmailLog(log.id);
                              toast.success("Email log berhasil di-reset untuk dikirim ulang.");
                              const emails = await adminParticipantService.getEmailHistory(detailItem!.id);
                              setEmailLogs(emails || []);
                            } catch (err: any) {
                              toast.error(err?.response?.data?.message || "Gagal melakukan retry email log.");
                            } finally {
                              setResendingEmail(false);
                            }
                          }}
                          className="px-2 py-1 text-[10px] font-semibold rounded bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" /> Kirim Ulang (Retry)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Audit Logs */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <h3 className="text-sm font-bold pg-text mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" /> Riwayat Perubahan & Audit
              </h3>
              {loadingLogs ? (
                <p className="text-xs pg-muted">Memuat log...</p>
              ) : auditLogs.length === 0 ? (
                <p className="text-xs pg-muted">Belum ada riwayat aktivitas.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs flex justify-between items-center"
                    >
                      <div>
                        <span className="font-semibold pg-text">{log.action}</span>
                        {log.reason && <p className="text-slate-500 mt-0.5 text-[11px]">Alasan: {log.reason}</p>}
                      </div>
                      <span className="text-[10px] pg-muted">
                        {new Date(log.created_at).toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setDetailItem(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 pg-text transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Edit Modal ─── */}
      {editItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-bold pg-text">Edit Data Peserta</h2>
                <p className="text-xs pg-muted">{editItem.participant_name} &bull; {editItem.registration_number}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold pg-text block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editForm.email || ""}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold pg-text block mb-1">Telepon</label>
                  <input
                    type="text"
                    value={editForm.phone || ""}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold pg-text block mb-1">Perusahaan</label>
                  <input
                    type="text"
                    value={editForm.company || ""}
                    onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold pg-text block mb-1">Jabatan</label>
                  <input
                    type="text"
                    value={editForm.job_title || ""}
                    onChange={(e) => setEditForm({ ...editForm, job_title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold pg-text block mb-1">Area</label>
                  <input
                    type="text"
                    value={editForm.region || ""}
                    onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold pg-text block mb-1">Departemen</label>
                  <input
                    type="text"
                    value={editForm.community || ""}
                    onChange={(e) => setEditForm({ ...editForm, community: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold pg-text block mb-1">Catatan Tambahan</label>
                <textarea
                  rows={3}
                  value={editForm.special_notes || ""}
                  onChange={(e) => setEditForm({ ...editForm, special_notes: e.target.value })}
                  placeholder="Catatan tambahan (opsional)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-sm focus:outline-none focus:border-blue-600 resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 pg-text transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  {savingEdit ? "Menyimpan..." : "Simpan Perubahan"}
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
                <h3 className="text-lg font-bold pg-text">Konfirmasi Hapus</h3>
                <p className="text-xs pg-muted">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <p className="text-sm pg-text">
              {deleteTarget.bulk
                ? `Apakah Anda yakin ingin menghapus ${deleteTarget.count} peserta yang dipilih?`
                : "Apakah Anda yakin ingin menghapus data peserta ini?"}
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
