"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { musyawarahAdminService } from "@/services/admin/musyawarah";
import { Musyawarah, UpdateMusyawarahPayload } from "@/types/musyawarah";
import { SectionHeader } from "@/components/ui/section-header";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function LocationPage() {
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
      toast.error("Gagal mengambil konfigurasi lokasi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveEvent();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!event) return;
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!event) return;
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
        status: event.status,
      };
      await musyawarahAdminService.update(event.id, payload);
      toast.success("Konfigurasi lokasi berhasil disimpan");
    } catch (error) {
      toast.error("Gagal menyimpan konfigurasi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 pg-muted">Memuat...</div>;
  if (!event) return <div className="p-8 pg-muted">Musyawarah aktif tidak ditemukan. Silakan buat di menu General.</div>;

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Location Configuration" 
        description={`Pengaturan lokasi dan alamat untuk: ${event.name}`}
      />

      <div className="pg-surface border pg-border rounded-xl p-6 space-y-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nama Lokasi/Gedung</label>
            <Input name="location_name" value={event.location_name || ''} onChange={handleChange} placeholder="Gedung Serbaguna..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Alamat Lengkap</label>
            <Textarea name="address" value={event.address || ''} onChange={handleChange} placeholder="Jl. Sudirman No 1..." className="min-h-[80px]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Google Maps URL</label>
            <Input name="google_maps_url" value={event.google_maps_url || ''} onChange={handleChange} placeholder="https://maps.google.com/..." />
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
