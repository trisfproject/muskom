"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { musyawarahAdminService } from "@/services/admin/musyawarah";
import { Musyawarah, MusyawarahStatus } from "@/types/musyawarah";
import { SectionHeader } from "@/components/ui/section-header";
import Link from "next/link";

export default function PublicationPage() {
  const [event, setEvent] = useState<Musyawarah | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchActiveEvent = async () => {
    try {
      const events = await musyawarahAdminService.list();
      const active = events.find(e => e.is_active) || events[0];
      if (active) {
        const fullEvent = await musyawarahAdminService.getById(active.id);
        setEvent(fullEvent);
      }
    } catch (error) {
      toast.error("Gagal mengambil konfigurasi publikasi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveEvent();
  }, []);

  const handleStatusChange = async (newStatus: MusyawarahStatus) => {
    if (!event) return;
    setSaving(true);
    try {
      if (newStatus === 'SCHEDULED') {
        const updated = await musyawarahAdminService.publish(event.id);
        setEvent(updated);
      } else if (newStatus === 'ARCHIVED') {
        const updated = await musyawarahAdminService.archive(event.id);
        setEvent(updated);
      } else if (newStatus === 'DRAFT') {
        const payload = {
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
          status: 'DRAFT' as MusyawarahStatus,
        };
        const updated = await musyawarahAdminService.update(event.id, payload);
        setEvent(updated);
      }
      toast.success(`Status berhasil diubah menjadi ${newStatus}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Gagal mengubah status");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 pg-muted">Memuat...</div>;
  if (!event) return <div className="p-8 pg-muted">Musyawarah aktif tidak ditemukan. Silakan buat di menu General.</div>;

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Publication & Lifecycle" 
        description={`Kelola siklus hidup dari: ${event.name}`}
      />

      <div className="pg-surface border pg-border rounded-xl p-6 space-y-6 max-w-2xl">
        
        <div>
          <h3 className="text-sm font-medium text-slate-300 mb-4">Status Saat Ini</h3>
          
          <div className="flex gap-4">
            <button
              onClick={() => handleStatusChange('DRAFT')}
              disabled={saving || event.status === 'DRAFT'}
              className={`flex-1 p-4 rounded-xl border text-left transition-all ${
                event.status === 'DRAFT' 
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 ring-1 ring-blue-500/50' 
                  : 'pg-border pg-surface-elevated/50 hover:pg-surface-elevated opacity-70'
              }`}
            >
              <div className="font-semibold pg-text mb-1">Draft</div>
              <div className="text-xs pg-muted">Dalam tahap persiapan. Belum terlihat publik.</div>
            </button>

            <button
              onClick={() => handleStatusChange('SCHEDULED')}
              disabled={saving || event.status === 'SCHEDULED'}
              className={`flex-1 p-4 rounded-xl border text-left transition-all ${
                event.status === 'SCHEDULED' 
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 ring-1 ring-[var(--color-primary)]/50' 
                  : 'pg-border pg-surface-elevated/50 hover:pg-surface-elevated opacity-70'
              }`}
            >
              <div className="font-semibold pg-text mb-1">Scheduled</div>
              <div className="text-xs pg-muted">Musyawarah aktif dan publikasi berjalan.</div>
            </button>

            <button
              onClick={() => handleStatusChange('ARCHIVED')}
              disabled={saving || event.status === 'ARCHIVED'}
              className={`flex-1 p-4 rounded-xl border text-left transition-all ${
                event.status === 'ARCHIVED' 
                  ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/50' 
                  : 'pg-border pg-surface-elevated/50 hover:pg-surface-elevated opacity-70'
              }`}
            >
              <div className="font-semibold pg-text mb-1">Archived</div>
              <div className="text-xs pg-muted">Musyawarah telah selesai dan diarsipkan.</div>
            </button>
          </div>
        </div>

        {event.status === 'SCHEDULED' && (
          <div className="bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-lg p-5 mt-6">
            <h4 className="text-primary font-semibold mb-2">Musyawarah Aktif & Berjalan</h4>
            <p className="text-sm text-primary/80 mb-4">
              Website saat ini dapat diakses publik. Jadwal dan fase pendaftaran bergantung pada konfigurasi timeline Anda.
            </p>
            <div className="flex items-center gap-3">
              <Link 
                href="/admin/website/timeline" 
                className="bg-primary hover:bg-primary-active pg-text px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cek Timeline Operasional
              </Link>
              <Link 
                href={`/admin/musyawarah/${event.id}/general`}
                className="pg-surface-elevated hover:pg-surface-elevated/80 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors border pg-border"
              >
                Pengaturan Umum
              </Link>
            </div>
          </div>
        )}

        {event.status === 'DRAFT' && (
          <div className="bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-lg p-5 mt-6">
            <p className="text-sm text-blue-200">
              <strong>Catatan:</strong> Mengubah status ke <em>Published</em> mensyaratkan field wajib telah diisi di pengaturan General.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
