"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { eventService } from "@/services/event";
import { MusyawarahEvent, UpdateEventPayload, EventPhase } from "@/types/event";
import { SectionHeader } from "@/components/ui/section-header";

export default function PublicationPage() {
  const [event, setEvent] = useState<MusyawarahEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, []);

  const fetchEvent = async () => {
    try {
      const data = await eventService.getEvent();
      setEvent(data);
    } catch (error) {
      toast.error("Gagal mengambil konfigurasi");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: EventPhase) => {
    if (!event) return;
    setSaving(true);
    try {
      const payload: UpdateEventPayload = {
        ...event,
        status: newStatus
      };
      await eventService.updateEvent(payload);
      setEvent({ ...event, status: newStatus });
      toast.success(`Status berhasil diubah menjadi ${newStatus}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Gagal mengubah status");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-400">Memuat...</div>;
  if (!event) return <div className="p-8 text-slate-400">Konfigurasi tidak ditemukan</div>;

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Publication & Lifecycle" 
        description="Kelola siklus hidup dari Musyawarah aktif ini."
      />

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 max-w-2xl">
        
        <div>
          <h3 className="text-sm font-medium text-slate-300 mb-4">Status Saat Ini</h3>
          
          <div className="flex gap-4">
            <button
              onClick={() => handleStatusChange('DRAFT')}
              disabled={saving || event.status === 'DRAFT'}
              className={`flex-1 p-4 rounded-xl border text-left transition-all ${
                event.status === 'DRAFT' 
                  ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/50' 
                  : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 opacity-70'
              }`}
            >
              <div className="font-semibold text-white mb-1">Draft</div>
              <div className="text-xs text-slate-400">Dalam tahap persiapan. Belum terlihat publik.</div>
            </button>

            <button
              onClick={() => handleStatusChange('PUBLISHED')}
              disabled={saving || event.status === 'PUBLISHED'}
              className={`flex-1 p-4 rounded-xl border text-left transition-all ${
                event.status === 'PUBLISHED' 
                  ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/50' 
                  : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 opacity-70'
              }`}
            >
              <div className="font-semibold text-white mb-1">Published</div>
              <div className="text-xs text-slate-400">Musyawarah aktif dan publikasi berjalan.</div>
            </button>

            <button
              onClick={() => handleStatusChange('ARCHIVED')}
              disabled={saving || event.status === 'ARCHIVED'}
              className={`flex-1 p-4 rounded-xl border text-left transition-all ${
                event.status === 'ARCHIVED' 
                  ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/50' 
                  : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 opacity-70'
              }`}
            >
              <div className="font-semibold text-white mb-1">Archived</div>
              <div className="text-xs text-slate-400">Musyawarah telah selesai dan diarsipkan.</div>
            </button>
          </div>
        </div>

        {event.status === 'PUBLISHED' && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-5 mt-6">
            <h4 className="text-emerald-400 font-semibold mb-2">Musyawarah Aktif & Berjalan</h4>
            <p className="text-sm text-emerald-200/80 mb-4">
              Website saat ini dapat diakses publik. Jadwal dan fase pendaftaran bergantung pada konfigurasi timeline Anda.
            </p>
            <div className="flex items-center gap-3">
              <a 
                href="/admin/musyawarah/timeline" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cek Timeline Operasional
              </a>
              <a 
                href="/admin/dashboard" 
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700"
              >
                Ke Dashboard Utama
              </a>
            </div>
          </div>
        )}

        {event.status === 'DRAFT' && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-5 mt-6">
            <p className="text-sm text-blue-200">
              <strong>Catatan:</strong> Mengubah status ke <em>Published</em> mensyaratkan semua field wajib telah diisi. Pastikan General, Location, dan Timeline telah dikonfigurasi.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
