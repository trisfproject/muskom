"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { musyawarahAdminService } from "@/services/admin/musyawarah";
import { CreateMusyawarahPayload } from "@/types/musyawarah";
import { SectionHeader } from "@/components/ui/section-header";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CreateMusyawarahPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CreateMusyawarahPayload>({
    name: "",
    slug: "",
    theme: "",
    description: "",
    period_start: undefined,
    period_end: undefined,
    event_date: undefined,
    registration_open: undefined,
    registration_close: undefined,
    candidate_registration_open: undefined,
    candidate_registration_close: undefined,
    location_name: "",
    address: "",
    google_maps_url: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const autoSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setForm((prev) => ({
      ...prev,
      name,
      slug: prev.slug || autoSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) {
      toast.error("Nama dan slug wajib diisi");
      return;
    }
    if (form.period_start && form.period_end && new Date(form.period_start) > new Date(form.period_end)) {
      toast.error("Waktu mulai periode harus sebelum waktu selesai");
      return;
    }
    if (form.registration_open && form.registration_close && new Date(form.registration_open) > new Date(form.registration_close)) {
      toast.error("Waktu buka registrasi peserta harus sebelum waktu tutup");
      return;
    }
    if (form.candidate_registration_open && form.candidate_registration_close && new Date(form.candidate_registration_open) > new Date(form.candidate_registration_close)) {
      toast.error("Waktu buka registrasi kandidat harus sebelum waktu tutup");
      return;
    }
    
    setSaving(true);
    try {
      const created = await musyawarahAdminService.create(form);
      toast.success("Musyawarah berhasil dibuat");
      router.push(`/admin/musyawarah/${created.id}/general`);
    } catch {
      toast.error("Gagal membuat Musyawarah");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/musyawarah"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium pg-surface-elevated pg-muted hover:pg-text transition-colors border pg-border"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali
        </Link>
      </div>

      <SectionHeader
        title="Buat Musyawarah Baru"
        description="Isi informasi dasar untuk memulai sesi Musyawarah baru. Pengaturan lanjutan dapat dikonfigurasi setelah dibuat."
      />

      <form onSubmit={handleSubmit}>
        <div className="pg-surface border pg-border rounded-xl p-6 space-y-6 max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Nama Musyawarah <span className="text-rose-500">*</span>
              </label>
              <Input
                name="name"
                value={form.name}
                onChange={handleNameChange}
                placeholder="Musyawarah Besar KOMUNITAS 2026"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Slug <span className="text-rose-500">*</span>
              </label>
              <Input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="mubes-komunitas-2026"
              />
              <p className="text-xs pg-muted mt-1">Hanya huruf kecil, angka, dan tanda hubung</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Tema</label>
              <Input name="theme" value={form.theme || ""} onChange={handleChange} placeholder="Bersama Membangun Komunitas" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Mulai Periode Kepengurusan</label>
                <Input type="date" name="period_start" value={form.period_start || ""} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Akhir Periode Kepengurusan</label>
                <Input type="date" name="period_end" value={form.period_end || ""} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Tanggal Acara Musyawarah</label>
              <Input type="date" name="event_date" value={form.event_date || ""} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Buka Registrasi Peserta</label>
                <Input type="datetime-local" name="registration_open" value={form.registration_open ? String(form.registration_open).substring(0, 16) : ""} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tutup Registrasi Peserta</label>
                <Input type="datetime-local" name="registration_close" value={form.registration_close ? String(form.registration_close).substring(0, 16) : ""} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Buka Pendaftaran Kandidat</label>
                <Input type="datetime-local" name="candidate_registration_open" value={form.candidate_registration_open ? String(form.candidate_registration_open).substring(0, 16) : ""} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tutup Pendaftaran Kandidat</label>
                <Input type="datetime-local" name="candidate_registration_close" value={form.candidate_registration_close ? String(form.candidate_registration_close).substring(0, 16) : ""} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nama Lokasi/Gedung</label>
              <Input name="location_name" value={form.location_name || ""} onChange={handleChange} placeholder="Aula Utama Gedung A" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Alamat Lengkap</label>
              <Textarea name="address" value={form.address || ""} onChange={handleChange} placeholder="Jl. Jendral Sudirman No. 1..." className="min-h-[80px]" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Link Google Maps (Opsional)</label>
              <Input name="google_maps_url" value={form.google_maps_url || ""} onChange={handleChange} placeholder="https://maps.google.com/?q=..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Deskripsi/Informasi Tambahan</label>
              <Textarea
                name="description"
                value={form.description || ""}
                onChange={handleChange}
                placeholder="Deskripsi singkat tentang pelaksanaan Musyawarah..."
                className="min-h-[100px]"
              />
            </div>
          </div>

          <div className="pt-4 border-t pg-border flex items-center justify-between">
            <p className="text-xs pg-muted">Musyawarah akan dibuat dengan status DRAFT.</p>
            <button
              type="submit"
              disabled={saving}
              className="bg-primary hover:bg-primary-active pg-text px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {saving ? "Membuat..." : "Buat Musyawarah"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
