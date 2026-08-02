"use client";

import { useEffect, useState } from "react";
import { configService, FullSystemConfig } from "@/services/config";
import { useSystemConfig } from "@/contexts/ConfigContext";
import { Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminWebsiteGeneralPage() {
  const { refreshConfig } = useSystemConfig();
  const [formData, setFormData] = useState<FullSystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await configService.getConfig();
        if (data) {
          setFormData(data);
        }
      } catch (err: unknown) {
        console.error("Failed to load general settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    
    setSaving(true);
    setMessage(null);
    try {
      await configService.updateConfigGroup("website_identity", formData.website_identity);
      await configService.updateConfigGroup("publication", formData.publication);
      await configService.updateConfigGroup("registration", formData.registration);
      await configService.updateConfigGroup("timeline", formData.timeline);
      await configService.updateConfigGroup("contact", formData.contact);
      await configService.updateConfigGroup("social_media", formData.social_media);
      
      await refreshConfig();
      setMessage({ type: "success", text: "Konfigurasi sistem berhasil disimpan." });
    } catch (err: unknown) {
      setMessage({ type: "error", text: "Gagal menyimpan konfigurasi sistem." });
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
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold pg-text tracking-tight">General Configuration</h1>
        <p className="text-sm pg-muted mt-1">
          Pusat konfigurasi identitas, publikasi, pendaftaran, dan kontak MUSKOM.
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm ${message.type === "success" ? "bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-primary" : "bg-rose-500/10 border border-rose-500/20 text-rose-400"}`}>
          {message.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identitas Website */}
        <div className="pg-surface border pg-border rounded-2xl p-6">
          <h2 className="text-base font-semibold pg-text mb-4">Website Identity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Community Name</label>
              <input type="text" value={formData.website_identity.community_name} onChange={(e) => setFormData({ ...formData, website_identity: { ...formData.website_identity, community_name: e.target.value }})} className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] transition-colors" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Event Name</label>
              <input type="text" value={formData.website_identity.event_name} onChange={(e) => setFormData({ ...formData, website_identity: { ...formData.website_identity, event_name: e.target.value }})} className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] transition-colors" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Event Year</label>
              <input type="text" value={formData.website_identity.event_year} onChange={(e) => setFormData({ ...formData, website_identity: { ...formData.website_identity, event_year: e.target.value }})} className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] transition-colors" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Website Title</label>
              <input type="text" value={formData.website_identity.website_title} onChange={(e) => setFormData({ ...formData, website_identity: { ...formData.website_identity, website_title: e.target.value }})} className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] transition-colors" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Website Description</label>
              <textarea rows={2} value={formData.website_identity.website_description} onChange={(e) => setFormData({ ...formData, website_identity: { ...formData.website_identity, website_description: e.target.value }})} className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] resize-none" required />
            </div>
          </div>
        </div>

        {/* Publication */}
        <div className="pg-surface border pg-border rounded-2xl p-6">
          <h2 className="text-base font-semibold pg-text mb-4">Publication</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Website Status</label>
                  <select value={formData.publication.website_status} onChange={(e) => setFormData({ ...formData, publication: { ...formData.publication, website_status: e.target.value }})} className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] transition-colors">
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                  </select>
               </div>
            </div>
            <label className="flex items-center justify-between p-3.5 bg-[var(--color-bg)]/60 border pg-border/80 rounded-xl cursor-pointer hover:pg-border transition-colors">
              <div>
                <span className="text-sm font-medium pg-text block">Maintenance Mode</span>
                <span className="text-xs pg-muted">Kunci portal publik untuk pemeliharaan sistem darurat</span>
              </div>
              <input type="checkbox" checked={formData.publication.maintenance_mode} onChange={(e) => setFormData({ ...formData, publication: { ...formData.publication, maintenance_mode: e.target.checked }})} className="w-5 h-5 rounded accent-rose-600 cursor-pointer" />
            </label>
            <label className="flex items-center justify-between p-3.5 bg-[var(--color-bg)]/60 border pg-border/80 rounded-xl cursor-pointer hover:pg-border transition-colors">
              <div>
                <span className="text-sm font-medium pg-text block">Public Visibility</span>
                <span className="text-xs pg-muted">Izinkan portal untuk dapat diakses oleh publik</span>
              </div>
              <input type="checkbox" checked={formData.publication.public_visibility} onChange={(e) => setFormData({ ...formData, publication: { ...formData.publication, public_visibility: e.target.checked }})} className="w-5 h-5 rounded accent-blue-600 cursor-pointer" />
            </label>
          </div>
        </div>

        {/* Registration */}
        <div className="pg-surface border pg-border rounded-2xl p-6">
          <h2 className="text-base font-semibold pg-text mb-4">Registration</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-3.5 bg-[var(--color-bg)]/60 border pg-border/80 rounded-xl cursor-pointer hover:pg-border transition-colors">
              <div>
                <span className="text-sm font-medium pg-text block">Candidate Registration</span>
                <span className="text-xs pg-muted">Buka formulir pendaftaran bakal calon</span>
              </div>
              <input type="checkbox" checked={formData.registration.candidate_registration} onChange={(e) => setFormData({ ...formData, registration: { ...formData.registration, candidate_registration: e.target.checked }})} className="w-5 h-5 rounded accent-blue-600 cursor-pointer" />
            </label>
            <label className="flex items-center justify-between p-3.5 bg-[var(--color-bg)]/60 border pg-border/80 rounded-xl cursor-pointer hover:pg-border transition-colors">
              <div>
                <span className="text-sm font-medium pg-text block">Participant Registration</span>
                <span className="text-xs pg-muted">Buka formulir pendaftaran peserta</span>
              </div>
              <input type="checkbox" checked={formData.registration.participant_registration} onChange={(e) => setFormData({ ...formData, registration: { ...formData.registration, participant_registration: e.target.checked }})} className="w-5 h-5 rounded accent-blue-600 cursor-pointer" />
            </label>
          </div>
        </div>

        {/* Timeline */}
        <div className="pg-surface border pg-border rounded-2xl p-6">
          <h2 className="text-base font-semibold pg-text mb-4">Timeline</h2>
          <div className="space-y-4">
             <label className="flex items-center justify-between p-3.5 bg-[var(--color-bg)]/60 border pg-border/80 rounded-xl cursor-pointer hover:pg-border transition-colors">
              <div>
                <span className="text-sm font-medium pg-text block">Active Timeline Mode</span>
                <span className="text-xs pg-muted">Tampilkan widget countdown dan timeline di landing page</span>
              </div>
              <input type="checkbox" checked={formData.timeline.active_timeline_mode} onChange={(e) => setFormData({ ...formData, timeline: { ...formData.timeline, active_timeline_mode: e.target.checked }})} className="w-5 h-5 rounded accent-blue-600 cursor-pointer" />
            </label>
          </div>
        </div>

        {/* Contact */}
        <div className="pg-surface border pg-border rounded-2xl p-6">
          <h2 className="text-base font-semibold pg-text mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email</label>
              <input type="email" value={formData.contact.email} onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value }})} className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">WhatsApp</label>
              <input type="text" value={formData.contact.whatsapp} onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, whatsapp: e.target.value }})} className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Secretariat Address</label>
              <input type="text" value={formData.contact.secretariat} onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, secretariat: e.target.value }})} className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="pg-surface border pg-border rounded-2xl p-6">
          <h2 className="text-base font-semibold pg-text mb-4">Social Media</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Instagram</label>
              <input type="text" value={formData.social_media.instagram} onChange={(e) => setFormData({ ...formData, social_media: { ...formData.social_media, instagram: e.target.value }})} className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Telegram</label>
              <input type="text" value={formData.social_media.telegram} onChange={(e) => setFormData({ ...formData, social_media: { ...formData.social_media, telegram: e.target.value }})} className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 pg-text font-semibold text-sm transition-colors shadow-lg shadow-[var(--color-primary)]/30">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}
