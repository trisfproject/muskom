"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Mail, ArrowLeft, Save, RefreshCw } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { SectionHeader } from "@/components/ui/section-header";

interface Template {
  id: string;
  name: string;
  channel: string;
  subject?: string;
  body: string;
}

export default function EditEmailTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchTemplate();
  }, [params.id]);

  const fetchTemplate = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/admin/notifications/templates/${params.id}`);
      if (res.data?.data) {
        setTemplate(res.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memuat template");
      router.push("/admin/system/templates");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;

    try {
      setIsSaving(true);
      await api.put(`/admin/notifications/templates/${template.id}`, {
        subject: template.subject,
        body: template.body,
      });
      toast.success("Template berhasil disimpan");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menyimpan template");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!template) return null;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/admin/system/templates")}
          className="p-2 rounded-lg border pg-border bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 pg-text" />
        </button>
        <SectionHeader
          title={`Edit Template: ${template.name}`}
          description="Sesuaikan subjek dan isi email menggunakan sintaks HTML dan template variables."
        />
      </div>

      <form onSubmit={handleSave} className="pg-surface border pg-border rounded-xl shadow-sm overflow-hidden space-y-6 p-6">
        <div className="flex items-center gap-2 pb-4 border-b pg-border">
          <Mail className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-sm pg-text">Editor Template Email</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider pg-muted mb-1.5">
              Subjek Email *
            </label>
            <input
              type="text"
              required
              value={template.subject || ""}
              onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
              className="w-full px-3.5 py-2.5 min-h-[44px] bg-slate-50 dark:bg-slate-800/60 border pg-border rounded-lg text-sm pg-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider pg-muted mb-1.5">
              Isi Email (HTML) *
            </label>
            <p className="text-xs text-slate-500 mb-2">Anda dapat menggunakan variabel seperti {'{{.full_name}}'}, {'{{.email}}'}, dll yang tersedia pada event ini.</p>
            <textarea
              required
              rows={20}
              value={template.body}
              onChange={(e) => setTemplate({ ...template, body: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border pg-border rounded-lg text-sm pg-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono whitespace-pre"
            />
          </div>
        </div>

        <div className="pt-4 border-t pg-border flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 min-h-[44px] bg-primary hover:bg-primary-active text-white text-sm font-bold rounded-lg transition-all shadow-sm disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Template
          </button>
        </div>
      </form>
    </div>
  );
}
