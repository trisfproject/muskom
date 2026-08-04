"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { musyawarahAdminService } from "@/services/admin/musyawarah";
import { Musyawarah, UpdateMusyawarahPayload, MusyawarahStatus } from "@/types/musyawarah";
import { SectionHeader } from "@/components/ui/section-header";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { ArrowLeft, Power, Archive, PowerOff, Globe } from "lucide-react";

export default function MusyawarahGeneralEditPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Musyawarah | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEvent = async () => {
    try {
      const data = await musyawarahAdminService.getById(id);
      setEvent(data);
    } catch {
      toast.error("Gagal mengambil data Musyawarah");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchEvent(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!event) return;
    const { name, value } = e.target;
    setEvent({ ...event, [name]: value });
  };

  const handleSave = async () => {
    if (!event) return;
    
    if (event.period_start && event.period_end && new Date(event.period_start) > new Date(event.period_end)) {
      toast.error("Waktu mulai periode harus sebelum waktu selesai");
      return;
    }
    if (event.registration_open && event.registration_close && new Date(event.registration_open) > new Date(event.registration_close)) {
      toast.error("Waktu buka registrasi peserta harus sebelum waktu tutup");
      return;
    }
    if (event.candidate_registration_open && event.candidate_registration_close && new Date(event.candidate_registration_open) > new Date(event.candidate_registration_close)) {
      toast.error("Waktu buka registrasi kandidat harus sebelum waktu tutup");
      return;
    }
    
    setSaving(true);
    try {
      const payload: UpdateMusyawarahPayload = {
        name: event.name,
        slug: event.slug,
        theme: event.theme,
        description: event.description,
        period_start: event.period_start,
        period_end: event.period_end,
        event_date: event.event_date,
        registration_open: event.registration_open,
        registration_close: event.registration_close,
        candidate_registration_open: event.candidate_registration_open,
        candidate_registration_close: event.candidate_registration_close,
        location_name: event.location_name,
        address: event.address,
        google_maps_url: event.google_maps_url,
        status: event.status as MusyawarahStatus,
        banner_path: event.banner_path,
        logo_path: event.logo_path,
      };
      const updated = await musyawarahAdminService.update(id, payload);
      setEvent(updated);
      toast.success("Perubahan berhasil disimpan");
    } catch {
      toast.error("Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async () => {
    if (!event) return;
    setActionLoading(true);
    try {
      const updated = await musyawarahAdminService.activate(id);
      setEvent(updated);
      toast.success(`${event.name} berhasil diaktifkan`);
    } catch {
      toast.error("Gagal mengaktifkan Musyawarah");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!event) return;
    setActionLoading(true);
    try {
      const updated = await musyawarahAdminService.deactivate(id);
      setEvent(updated);
      toast.success(`${event.name} dinonaktifkan`);
    } catch {
      toast.error("Gagal menonaktifkan Musyawarah");
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!event) return;
    if (!confirm(`Arsipkan "${event.name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setActionLoading(true);
    try {
      const updated = await musyawarahAdminService.archive(id);
      setEvent(updated);
      toast.success(`${event.name} berhasil diarsipkan`);
    } catch {
      toast.error("Gagal mengarsipkan Musyawarah");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!event) return;
    if (!confirm(`Publikasikan "${event.name}"? Ini akan membuat event dapat dilihat publik.`)) return;
    setActionLoading(true);
    try {
      const updated = await musyawarahAdminService.publish(id);
      setEvent(updated);
      toast.success(`${event.name} berhasil dipublikasikan`);
    } catch {
      toast.error("Gagal mempublikasikan Musyawarah");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8 pg-muted animate-pulse">Memuat...</div>;
  if (!event) return (
    <div className="p-8 text-center">
      <p className="pg-muted mb-4">Musyawarah tidak ditemukan</p>
      <Link href="/admin/musyawarah" className="text-primary hover:underline text-sm">← Kembali ke daftar</Link>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/musyawarah"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium pg-surface-elevated pg-muted hover:pg-text transition-colors border pg-border"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Semua Musyawarah
        </Link>
        {event.is_active && (
          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
            Aktif
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionHeader
          title="General Configuration"
          description={`Pengaturan informasi dasar: ${event.name}`}
        />
        {/* Lifecycle Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {event.status === "DRAFT" && (
            <button
              onClick={handlePublish}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors disabled:opacity-50"
            >
              <Globe className="w-3.5 h-3.5" />
              {actionLoading ? "..." : "Publikasi"}
            </button>
          )}
          {!event.is_active && event.status !== "ARCHIVED" && event.status !== "DRAFT" && (
            <button
              onClick={handleActivate}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors disabled:opacity-50"
            >
              <Power className="w-3.5 h-3.5" />
              {actionLoading ? "..." : "Aktifkan"}
            </button>
          )}
          {event.is_active && (
            <button
              onClick={handleDeactivate}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium pg-surface-elevated pg-muted hover:pg-text border pg-border transition-colors disabled:opacity-50"
            >
              <PowerOff className="w-3.5 h-3.5" />
              {actionLoading ? "..." : "Nonaktifkan"}
            </button>
          )}
          {event.status !== "ARCHIVED" && (
            <button
              onClick={handleArchive}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-colors disabled:opacity-50"
            >
              <Archive className="w-3.5 h-3.5" />
              {actionLoading ? "..." : "Arsipkan"}
            </button>
          )}
        </div>
      </div>

      <div className="pg-surface border pg-border rounded-xl p-6 space-y-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nama Musyawarah <span className="text-rose-500">*</span></label>
            <Input name="name" value={event.name || ""} onChange={handleChange} placeholder="MUBES KOMUNITAS 2026" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Slug <span className="text-rose-500">*</span></label>
            <Input name="slug" value={event.slug || ""} onChange={handleChange} placeholder="mubes-2026" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Tema</label>
            <Input name="theme" value={event.theme || ""} onChange={handleChange} placeholder="Bersama Membangun Komunitas" />
          </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
              <select
                name="status"
                value={event.status}
                onChange={handleChange}
                className="w-full bg-transparent border pg-border rounded-lg px-3 py-2 text-sm pg-text focus:outline-none focus:border-primary"
              >
                <option value="DRAFT">DRAFT</option>
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Mulai Periode Kepengurusan</label>
                <Input type="date" name="period_start" value={event.period_start ? event.period_start.substring(0, 10) : ""} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Akhir Periode Kepengurusan</label>
                <Input type="date" name="period_end" value={event.period_end ? event.period_end.substring(0, 10) : ""} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Tanggal Acara Musyawarah</label>
              <Input type="date" name="event_date" value={event.event_date ? event.event_date.substring(0, 10) : ""} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Buka Registrasi Peserta</label>
                <Input type="datetime-local" name="registration_open" value={event.registration_open ? event.registration_open.substring(0, 16) : ""} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tutup Registrasi Peserta</label>
                <Input type="datetime-local" name="registration_close" value={event.registration_close ? event.registration_close.substring(0, 16) : ""} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Buka Pendaftaran Kandidat</label>
                <Input type="datetime-local" name="candidate_registration_open" value={event.candidate_registration_open ? event.candidate_registration_open.substring(0, 16) : ""} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tutup Pendaftaran Kandidat</label>
                <Input type="datetime-local" name="candidate_registration_close" value={event.candidate_registration_close ? event.candidate_registration_close.substring(0, 16) : ""} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nama Lokasi/Gedung</label>
              <Input name="location_name" value={event.location_name || ""} onChange={handleChange} placeholder="Aula Utama Gedung A" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Alamat Lengkap</label>
              <Textarea name="address" value={event.address || ""} onChange={handleChange} placeholder="Jl. Jendral Sudirman No. 1..." className="min-h-[80px]" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Link Google Maps (Opsional)</label>
              <Input name="google_maps_url" value={event.google_maps_url || ""} onChange={handleChange} placeholder="https://maps.google.com/?q=..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Deskripsi/Informasi Tambahan</label>
              <Textarea
                name="description"
                value={event.description || ""}
                onChange={handleChange}
                placeholder="Deskripsi lengkap tentang musyawarah ini..."
                className="min-h-[120px]"
              />
            </div>
        </div>

        <div className="pt-4 border-t pg-border flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary hover:bg-primary-active pg-text px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}
