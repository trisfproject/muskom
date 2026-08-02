"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { eventService } from "@/services/event";
import { MusyawarahEvent, UpdateEventPayload } from "@/types/event";
import { SectionHeader } from "@/components/ui/section-header";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function LocationPage() {
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
      toast.success("Konfigurasi lokasi berhasil disimpan");
    } catch (error) {
      toast.error("Gagal menyimpan konfigurasi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-400">Memuat...</div>;
  if (!event) return <div className="p-8 text-slate-400">Konfigurasi tidak ditemukan</div>;

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Location Configuration" 
        description="Pengaturan lokasi dan alamat acara Musyawarah."
      />

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Tipe Pertemuan</label>
            <select 
              name="meeting_type" 
              value={event.meeting_type || 'OFFLINE'} 
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="OFFLINE">Offline</option>
              <option value="ONLINE">Online</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nama Tempat (Venue)</label>
            <Input name="venue" value={event.venue || ''} onChange={handleChange} placeholder="Gedung Serbaguna..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Alamat Lengkap</label>
            <Textarea name="address" value={event.address || ''} onChange={handleChange} placeholder="Jl. Sudirman No 1..." className="min-h-[80px]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Kota</label>
              <Input name="city" value={event.city || ''} onChange={handleChange} placeholder="Jakarta Pusat" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Provinsi</label>
              <Input name="province" value={event.province || ''} onChange={handleChange} placeholder="DKI Jakarta" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Google Maps URL</label>
            <Input name="google_maps_url" value={event.google_maps_url || ''} onChange={handleChange} placeholder="https://maps.google.com/..." />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}
