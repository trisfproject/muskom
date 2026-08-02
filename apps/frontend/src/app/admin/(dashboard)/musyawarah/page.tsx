"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { musyawarahAdminService } from "@/services/admin/musyawarah";
import { MusyawarahListItem } from "@/types/musyawarah";
import { SectionHeader } from "@/components/ui/section-header";
import Link from "next/link";
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Archive, 
  PowerOff, 
  Power,
  Edit,
  CalendarDays,
  BookOpen,
  Globe,
  Trash2,
} from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-slate-500/15 text-slate-400 border-slate-500/20",
  PUBLISHED: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  ARCHIVED: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  COMPLETED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  CANCELLED: "bg-rose-500/15 text-rose-400 border-rose-500/20",
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function MusyawarahListPage() {
  const [items, setItems] = useState<MusyawarahListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetch = async () => {
    try {
      const data = await musyawarahAdminService.list();
      setItems(data);
    } catch {
      toast.error("Gagal mengambil data Musyawarah");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleActivate = async (id: string, name: string) => {
    setActionLoading(id);
    try {
      await musyawarahAdminService.activate(id);
      toast.success(`${name} berhasil diaktifkan`);
      await fetch();
    } catch {
      toast.error("Gagal mengaktifkan Musyawarah");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivate = async (id: string, name: string) => {
    setActionLoading(id);
    try {
      await musyawarahAdminService.deactivate(id);
      toast.success(`${name} dinonaktifkan`);
      await fetch();
    } catch {
      toast.error("Gagal menonaktifkan Musyawarah");
    } finally {
      setActionLoading(null);
    }
  };

  const handleArchive = async (id: string, name: string) => {
    if (!confirm(`Arsipkan "${name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setActionLoading(id);
    try {
      await musyawarahAdminService.archive(id);
      toast.success(`${name} berhasil diarsipkan`);
      await fetch();
    } catch {
      toast.error("Gagal mengarsipkan Musyawarah");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePublish = async (id: string, name: string) => {
    if (!confirm(`Publikasikan "${name}"? Ini akan membuat event dapat dilihat publik.`)) return;
    setActionLoading(id);
    try {
      await musyawarahAdminService.publish(id);
      toast.success(`${name} berhasil dipublikasikan`);
      await fetch();
    } catch {
      toast.error("Gagal mempublikasikan Musyawarah");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus permanen "${name}"? Semua data yang terkait akan hilang.`)) return;
    setActionLoading(id);
    try {
      await musyawarahAdminService.delete(id);
      toast.success(`${name} berhasil dihapus`);
      await fetch();
    } catch {
      toast.error("Gagal menghapus Musyawarah");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Musyawarah"
        description="Kelola seluruh sesi Musyawarah. Hanya satu yang dapat aktif pada satu waktu."
      >
        <Link
          href="/admin/musyawarah/create"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-active pg-text px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Buat Baru
        </Link>
      </SectionHeader>

      {loading ? (
        <div className="pg-surface border pg-border rounded-xl p-8 text-center pg-muted animate-pulse">
          Memuat data Musyawarah...
        </div>
      ) : items.length === 0 ? (
        <div className="pg-surface border pg-border rounded-xl p-12 flex flex-col items-center text-center gap-4">
          <BookOpen className="w-12 h-12 pg-muted opacity-50" />
          <div>
            <h3 className="font-semibold pg-text mb-1">Belum Ada Musyawarah</h3>
            <p className="pg-muted text-sm">Buat Musyawarah pertama untuk memulai operasional sistem.</p>
          </div>
          <Link
            href="/admin/musyawarah/create"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-active pg-text px-5 py-2.5 rounded-lg text-sm font-medium transition-colors mt-2"
          >
            <Plus className="w-4 h-4" />
            Buat Musyawarah
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const isLoading = actionLoading === item.id;
            const statusStyle = STATUS_STYLES[item.status] || STATUS_STYLES.DRAFT;

            return (
              <div
                key={item.id}
                className={`pg-surface border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-all ${
                  item.is_active
                    ? "border-blue-500/40 bg-blue-500/5"
                    : "pg-border"
                }`}
              >
                {/* Active Indicator */}
                <div className="shrink-0">
                  {item.is_active ? (
                    <CheckCircle2 className="w-6 h-6 text-blue-400" />
                  ) : (
                    <Circle className="w-6 h-6 pg-muted opacity-40" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold pg-text text-base truncate">{item.name}</h3>
                    {item.is_active && (
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        Aktif
                      </span>
                    )}
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${statusStyle}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs pg-muted">
                    {item.theme && <span className="italic">&quot;{item.theme}&quot;</span>}
                    {(item.period_start || item.period_end) && (
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        Periode: {formatDate(item.period_start)} — {formatDate(item.period_end)}
                      </span>
                    )}
                    {item.event_date && (
                      <span className="flex items-center gap-1">
                        Acara: {formatDate(item.event_date)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <Link
                    href={`/admin/musyawarah/${item.id}/general`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium pg-surface-elevated hover:pg-text transition-colors border pg-border"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </Link>

                  {item.status === "DRAFT" && (
                    <button
                      onClick={() => handlePublish(item.id, item.name)}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors disabled:opacity-50"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      {isLoading ? "..." : "Publikasi"}
                    </button>
                  )}

                  {!item.is_active && item.status !== "ARCHIVED" && item.status !== "DRAFT" && (
                    <button
                      onClick={() => handleActivate(item.id, item.name)}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors disabled:opacity-50"
                    >
                      <Power className="w-3.5 h-3.5" />
                      {isLoading ? "..." : "Aktifkan"}
                    </button>
                  )}

                  {item.is_active && (
                    <button
                      onClick={() => handleDeactivate(item.id, item.name)}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-500/10 pg-muted hover:bg-slate-500/20 border pg-border transition-colors disabled:opacity-50"
                    >
                      <PowerOff className="w-3.5 h-3.5" />
                      {isLoading ? "..." : "Nonaktifkan"}
                    </button>
                  )}

                  {item.status !== "ARCHIVED" && (
                    <button
                      onClick={() => handleArchive(item.id, item.name)}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-colors disabled:opacity-50"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      {isLoading ? "..." : "Arsipkan"}
                    </button>
                  )}

                  {!item.is_active && (
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {isLoading ? "..." : "Hapus"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
