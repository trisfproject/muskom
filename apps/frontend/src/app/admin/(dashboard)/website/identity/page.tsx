"use client";

import { useEffect, useState, useRef } from "react";
import { configService, FullSystemConfig } from "@/services/config";
import { websiteService, GeneralSettings } from "@/services/website";
import { useSystemConfig } from "@/contexts/ConfigContext";
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Globe,
  Lock,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";

export default function AdminWebsiteGeneralPage() {
  const { refreshConfig } = useSystemConfig();
  const [formData, setFormData] = useState<FullSystemConfig | null>(null);
  const [cmsGeneral, setCmsGeneral] = useState<GeneralSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const ogImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [configData, generalData] = await Promise.all([
          configService.getConfig().catch(() => null),
          websiteService.getGeneral().catch(() => null),
        ]);

        if (configData) {
          setFormData(configData);
        }
        if (generalData) {
          setCmsGeneral(generalData);
        }
      } catch (err: unknown) {
        console.error("Failed to load general settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "logo" | "favicon" | "og_image") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(field);
    try {
      const res = await websiteService.uploadMedia(file, "general");
      if (res?.url) {
        if (field === "logo" && formData) {
          // Logo in system config or cms
          setCmsGeneral((prev) => prev ? { ...prev, seo_image_url: res.url } : prev);
        } else if (field === "favicon") {
          setCmsGeneral((prev) => prev ? { ...prev, favicon_url: res.url } : prev);
        } else if (field === "og_image" && formData) {
          setFormData({
            ...formData,
            seo: { ...formData.seo, opengraph_image: res.url },
          });
          setCmsGeneral((prev) => prev ? { ...prev, seo_image_url: res.url } : prev);
        }
        setMessage({ type: "success", text: `File ${field} berhasil diunggah.` });
      }
    } catch (err: unknown) {
      console.error("Upload error:", err);
      setMessage({ type: "error", text: `Gagal mengunggah ${field}.` });
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setSaving(true);
    setMessage(null);
    try {
      // 1. Sync Website CMS General Settings
      if (cmsGeneral) {
        const updatedCMS: GeneralSettings = {
          ...cmsGeneral,
          site_name: formData.website_identity.website_title || cmsGeneral.site_name,
          tagline: formData.website_identity.website_description || cmsGeneral.tagline,
          registration_enabled: formData.feature_flags.enable_registration,
          maintenance_mode: formData.publication.maintenance_mode,
          seo_title: formData.seo.meta_title || cmsGeneral.seo_title,
          seo_description: formData.seo.meta_description || cmsGeneral.seo_description,
          seo_image_url: formData.seo.opengraph_image || cmsGeneral.seo_image_url,
          favicon_url: cmsGeneral.favicon_url,
        };
        await websiteService.updateGeneral(updatedCMS);
      }

      // 2. Sync System Configuration groups
      await configService.updateConfigGroup("website_identity", formData.website_identity);
      await configService.updateConfigGroup("event", formData.event);
      await configService.updateConfigGroup("publication", formData.publication);
      await configService.updateConfigGroup("registration", formData.registration);
      await configService.updateConfigGroup("contact", formData.contact);
      await configService.updateConfigGroup("seo", formData.seo);
      await configService.updateConfigGroup("feature_flags", formData.feature_flags);

      await refreshConfig();
      setMessage({ type: "success", text: "Konfigurasi website berhasil disimpan." });
    } catch (err: unknown) {
      console.error("Save config error:", err);
      setMessage({ type: "error", text: "Gagal menyimpan konfigurasi website." });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formData) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={logoInputRef}
        onChange={(e) => handleFileUpload(e, "logo")}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={faviconInputRef}
        onChange={(e) => handleFileUpload(e, "favicon")}
        accept="image/*,.ico"
        className="hidden"
      />
      <input
        type="file"
        ref={ogImageInputRef}
        onChange={(e) => handleFileUpload(e, "og_image")}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold pg-text tracking-tight">Website — Pengaturan Umum</h1>
        <p className="text-sm pg-muted mt-1">
          Pusat kendali identitas portal publik, tema visual, status registrasi, SEO, dan kontak sekretariat.
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm ${
            message.type === "success"
              ? "bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-primary"
              : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identitas Website & Brand */}
        <div className="pg-surface border pg-border rounded-2xl p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold pg-text">Website Identity & Brand</h2>
              <p className="text-xs pg-muted">Nama organisasi, judul situs, dan aset visual identitas.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Nama Komunitas / Organisasi</label>
              <input
                type="text"
                value={formData.website_identity.community_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    website_identity: { ...formData.website_identity, community_name: e.target.value },
                  })
                }
                className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Judul Website (Portal Title)</label>
              <input
                type="text"
                value={formData.website_identity.website_title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    website_identity: { ...formData.website_identity, website_title: e.target.value },
                  })
                }
                className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Website Base URL</label>
              <input
                type="url"
                placeholder="Contoh: https://muskom.komitkabe.com"
                value={formData.website_identity.website_base_url || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    website_identity: { ...formData.website_identity, website_base_url: e.target.value },
                  })
                }
                className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Favicon URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cmsGeneral?.favicon_url || ""}
                  onChange={(e) =>
                    setCmsGeneral((prev) => (prev ? { ...prev, favicon_url: e.target.value } : prev))
                  }
                  placeholder="https://... atau unggah"
                  className="flex-1 bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => faviconInputRef.current?.click()}
                  disabled={uploadingField === "favicon"}
                  className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 border pg-border rounded-xl text-xs font-medium pg-text flex items-center gap-1.5 transition-colors"
                >
                  {uploadingField === "favicon" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  Unggah
                </button>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Deskripsi / Tagline Website</label>
              <textarea
                rows={2}
                value={formData.website_identity.website_description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    website_identity: { ...formData.website_identity, website_description: e.target.value },
                  })
                }
                className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] resize-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Event Information */}
        <div className="pg-surface border pg-border rounded-2xl p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold pg-text">Informasi Acara</h2>
              <p className="text-xs pg-muted">Nama kegiatan, tanggal, waktu, dan lokasi acara (digunakan di email & website).</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Nama Kegiatan (Event Name)</label>
              <input
                type="text"
                value={formData.event.event_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    event: { ...formData.event, event_name: e.target.value },
                  })
                }
                className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Tanggal Acara</label>
              <input
                type="text"
                placeholder="Contoh: 29 Agustus 2026"
                value={formData.event.event_date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    event: { ...formData.event, event_date: e.target.value },
                  })
                }
                className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Waktu Acara</label>
              <input
                type="text"
                placeholder="Contoh: 09:00 WIB"
                value={formData.event.event_time}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    event: { ...formData.event, event_time: e.target.value },
                  })
                }
                className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Lokasi Acara</label>
              <input
                type="text"
                placeholder="Contoh: Gedung Serbaguna KOMITKABE"
                value={formData.event.event_location}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    event: { ...formData.event, event_location: e.target.value },
                  })
                }
                className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                required
              />
            </div>
          </div>
        </div>

        {/* Global Registration Master Toggle */}
        <div className="pg-surface border pg-border rounded-2xl p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold pg-text">Kendali Pendaftaran (Registration Control)</h2>
              <p className="text-xs pg-muted">
                Sakelar utama status pendaftaran. Jika dimatikan, semua formulir pendaftaran publik akan dikunci.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-[var(--color-bg)]/60 border pg-border rounded-xl cursor-pointer hover:border-[var(--color-primary)]/40 transition-colors">
              <div>
                <span className="text-sm font-medium pg-text block">Master Registration Enabled</span>
                <span className="text-xs pg-muted">
                  Buka/tutup seluruh akses pendaftaran publik (mengontrol Hero CTA dan form registrasi)
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.feature_flags.enable_registration}
                onChange={(e) => {
                  const val = e.target.checked;
                  setFormData({
                    ...formData,
                    feature_flags: { ...formData.feature_flags, enable_registration: val },
                    registration: { ...formData.registration, participant_registration: val },
                  });
                  setCmsGeneral((prev) => (prev ? { ...prev, registration_enabled: val } : prev));
                }}
                className="w-5 h-5 rounded accent-emerald-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-[var(--color-bg)]/60 border pg-border rounded-xl cursor-pointer hover:border-[var(--color-primary)]/40 transition-colors">
              <div>
                <span className="text-sm font-medium pg-text block">Pendaftaran Peserta (Participant Flow)</span>
                <span className="text-xs pg-muted">Aktifkan formulir pendaftaran peserta musyawarah</span>
              </div>
              <input
                type="checkbox"
                checked={formData.registration.participant_registration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    registration: { ...formData.registration, participant_registration: e.target.checked },
                  })
                }
                className="w-5 h-5 rounded accent-blue-600 cursor-pointer"
              />
            </label>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Informasi Tambahan Pendaftaran</label>
              <textarea
                rows={2}
                value={formData.registration.registration_information}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    registration: { ...formData.registration, registration_information: e.target.value },
                  })
                }
                placeholder="Petunjuk atau catatan penting bagi pendaftar..."
                className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Registration Capacity Management */}
        <div className="pg-surface border pg-border rounded-2xl p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold pg-text">Kapasitas Pendaftaran (Registration Capacity)</h2>
              <p className="text-xs pg-muted">
                Atur batas kuota peserta yang TERVERIFIKASI dan kebijakan sistem saat kuota terpenuhi.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Kapasitas Maksimum Peserta (Maximum Participant Capacity)
              </label>
              <input
                type="number"
                min={0}
                value={formData.registration.participant_limit ?? 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    registration: {
                      ...formData.registration,
                      participant_limit: parseInt(e.target.value, 10) || 0,
                    },
                  })
                }
                className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                placeholder="0 untuk tak terbatas (Unlimited)"
              />
              <p className="text-[11px] pg-muted mt-1.5">
                Isi <strong>0</strong> untuk kuota tak terbatas (Unlimited). Hanya peserta dengan status <strong>VERIFIED</strong> yang menggunakan kuota.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Mode Kapasitas (Capacity Mode)
              </label>
              <select
                value={formData.registration.capacity_mode || "CLOSE"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    registration: {
                      ...formData.registration,
                      capacity_mode: e.target.value,
                    },
                  })
                }
                className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              >
                <option value="CLOSE">Tutup Pendaftaran (Close Registration When Full)</option>
                <option value="WAITING_LIST">Daftar Tunggu (Waiting List)</option>
                <option value="UNLIMITED">Izinkan Pendaftaran (Allow Registration / Unlimited Queue)</option>
              </select>
              <p className="text-[11px] pg-muted mt-1.5">
                {formData.registration.capacity_mode === "WAITING_LIST"
                  ? "Pendaftar baru setelah kuota penuh akan otomatis berstatus Waiting List."
                  : formData.registration.capacity_mode === "UNLIMITED"
                  ? "Pendaftaran tetap dibuka normal tanpa batasan antrian."
                  : "Formulir pendaftaran publik akan langsung ditolak/ditutup ketika kuota terverifikasi terpenuhi."}
              </p>
            </div>
          </div>
        </div>

        {/* Publication & Maintenance */}
        <div className="pg-surface border pg-border rounded-2xl p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold pg-text">Publication & Mode Akses</h2>
              <p className="text-xs pg-muted">Konfigurasi visibilitas publik dan pemeliharaan sistem.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Website Status</label>
                <select
                  value={formData.publication.website_status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      publication: { ...formData.publication, website_status: e.target.value },
                    })
                  }
                  className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                >
                  <option value="PUBLISHED">Published (Publik Terbuka)</option>
                  <option value="DRAFT">Draft (Internal Saja)</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Offline / Maintenance Message</label>
                <textarea
                  rows={2}
                  value={formData.publication.offline_message}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      publication: { ...formData.publication, offline_message: e.target.value },
                    })
                  }
                  placeholder="Pesan yang ditampilkan saat website dalam mode pemeliharaan..."
                  className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] resize-none"
                />
              </div>
            </div>

            <label className="flex items-center justify-between p-3.5 bg-[var(--color-bg)]/60 border pg-border rounded-xl cursor-pointer hover:pg-border transition-colors">
              <div>
                <span className="text-sm font-medium pg-text block">Maintenance Mode</span>
                <span className="text-xs pg-muted">Kunci portal publik untuk pemeliharaan sistem darurat</span>
              </div>
              <input
                type="checkbox"
                checked={formData.publication.maintenance_mode}
                onChange={(e) => {
                  const val = e.target.checked;
                  setFormData({
                    ...formData,
                    publication: { ...formData.publication, maintenance_mode: val },
                  });
                  setCmsGeneral((prev) => (prev ? { ...prev, maintenance_mode: val } : prev));
                }}
                className="w-5 h-5 rounded accent-rose-600 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* SEO Configuration */}
        <div className="pg-surface border pg-border rounded-2xl p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold pg-text">SEO & OpenGraph Meta</h2>
              <p className="text-xs pg-muted">Optimasi mesin pencari dan tampilan preview tautan di media sosial.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Meta Title</label>
              <input
                type="text"
                value={formData.seo.meta_title}
                onChange={(e) =>
                  setFormData({ ...formData, seo: { ...formData.seo, meta_title: e.target.value } })
                }
                className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Meta Keywords</label>
              <input
                type="text"
                value={formData.seo.meta_keywords}
                onChange={(e) =>
                  setFormData({ ...formData, seo: { ...formData.seo, meta_keywords: e.target.value } })
                }
                className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                placeholder="musyawarah, komitkabe, pemilu"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Meta Description</label>
              <textarea
                rows={2}
                value={formData.seo.meta_description}
                onChange={(e) =>
                  setFormData({ ...formData, seo: { ...formData.seo, meta_description: e.target.value } })
                }
                className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] resize-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">OpenGraph Share Image URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.seo.opengraph_image}
                  onChange={(e) =>
                    setFormData({ ...formData, seo: { ...formData.seo, opengraph_image: e.target.value } })
                  }
                  className="flex-1 bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => ogImageInputRef.current?.click()}
                  disabled={uploadingField === "og_image"}
                  className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 border pg-border rounded-xl text-xs font-medium pg-text flex items-center gap-1.5 transition-colors"
                >
                  {uploadingField === "og_image" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  Unggah Gambar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Secretariat */}
        <div className="pg-surface border pg-border rounded-2xl p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold pg-text">Kontak & Alamat Sekretariat</h2>
              <p className="text-xs pg-muted">Informasi narahubung resmi dan peta lokasi kegiatan.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Resmi</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) =>
                    setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value } })
                  }
                  className="w-full bg-[var(--color-bg)] border pg-border rounded-xl pl-10 pr-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">WhatsApp / Hotline</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={formData.contact.whatsapp}
                  onChange={(e) =>
                    setFormData({ ...formData, contact: { ...formData.contact, whatsapp: e.target.value } })
                  }
                  className="w-full bg-[var(--color-bg)] border pg-border rounded-xl pl-10 pr-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Alamat Lengkap Sekretariat</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={formData.contact.secretariat}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contact: { ...formData.contact, secretariat: e.target.value },
                    })
                  }
                  className="w-full bg-[var(--color-bg)] border pg-border rounded-xl pl-10 pr-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Google Maps Embed URL</label>
              <input
                type="text"
                value={formData.contact.maps_embed}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact: { ...formData.contact, maps_embed: e.target.value },
                  })
                }
                placeholder="https://www.google.com/maps/embed?pb=..."
                className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-semibold text-sm transition-colors shadow-lg shadow-[var(--color-primary)]/30"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}

