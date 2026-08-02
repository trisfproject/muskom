"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { eventService } from "@/services/event";
import { MusyawarahEvent, UpdateEventPayload } from "@/types/event";
import { SectionHeader } from "@/components/ui/section-header";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function GeneralPage() {
  const [event, setEvent] = useState<MusyawarahEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchEvent = async () => {
    try {
      const data = await eventService.getEvent();
      setEvent(data);
    } catch {
      toast.error("Gagal mengambil konfigurasi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!event) return;
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!event) return;
    setSaving(true);
    try {
      const payload: UpdateEventPayload = {
        name: event.name,
        slug: event.slug,
        theme: event.theme,
        tagline: event.tagline,
        description: event.description,
        year: event.year ? Number(event.year) : undefined,
        start_date: event.start_date,
        end_date: event.end_date,
        timezone: event.timezone,
        venue: event.venue,
        address: event.address,
        google_maps_url: event.google_maps_url,
        city: event.city,
        province: event.province,
        meeting_type: event.meeting_type,
        location: event.location,
        status: event.status,
        max_participants: event.max_participants,
        publish_result: event.publish_result,
        allow_candidate_registration: event.allow_candidate_registration
      };
      await eventService.updateEvent(payload);
      toast.success("Konfigurasi general berhasil disimpan");
    } catch {
      toast.error("Gagal menyimpan konfigurasi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 pg-muted animate-pulse">Memuat...</div>;

  if (!event) return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center max-w-md mx-auto">
      <h2 className="text-xl font-bold pg-text mb-2">Tidak Ada Musyawarah Aktif</h2>
      <p className="pg-muted text-sm mb-6">
        Aktifkan sebuah Musyawarah dari halaman daftar untuk mengatur konfigurasi general.
      </p>
      <Link
        href="/admin/musyawarah"
        className="inline-flex items-center gap-2 bg-primary hover:bg-primary-active pg-text px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
      >
        Lihat Daftar Musyawarah
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="General Configuration" 
        description={`Pengaturan informasi dasar Musyawarah aktif: ${event.name}`}
      />

      <div className="pg-surface border pg-border rounded-xl p-6 space-y-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nama Musyawarah <span className="text-rose-500">*</span></label>
            <Input name="name" value={event.name || ''} onChange={handleChange} placeholder="MUBES KOMUNITAS 2026" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Slug <span className="text-rose-500">*</span></label>
            <Input name="slug" value={event.slug || ''} onChange={handleChange} placeholder="mubes-2026" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Tahun</label>
            <Input type="number" name="year" value={event.year || ''} onChange={handleChange} placeholder="2026" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Tema</label>
            <Input name="theme" value={event.theme || ''} onChange={handleChange} placeholder="Bersama Membangun Komunitas" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Tagline</label>
            <Input name="tagline" value={event.tagline || ''} onChange={handleChange} placeholder="Kolaborasi untuk Inovasi" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Deskripsi</label>
            <Textarea name="description" value={event.description || ''} onChange={handleChange} placeholder="Deskripsi lengkap tentang musyawarah ini..." className="min-h-[120px]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Waktu Mulai</label>
              <Input type="datetime-local" name="start_date" value={event.start_date ? event.start_date.substring(0, 16) : ''} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Waktu Selesai</label>
              <Input type="datetime-local" name="end_date" value={event.end_date ? event.end_date.substring(0, 16) : ''} onChange={handleChange} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Zona Waktu</label>
            <Input name="timezone" value={event.timezone || ''} onChange={handleChange} placeholder="Asia/Jakarta" />
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
