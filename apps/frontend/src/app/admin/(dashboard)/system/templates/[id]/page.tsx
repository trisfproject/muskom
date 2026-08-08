"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Mail, ArrowLeft, Save, RefreshCw, Eye, Code, Smartphone, Monitor, Moon, Sun, Send } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";

interface Template {
  id: string;
  name: string;
  channel: string;
  subject?: string;
  body: string;
}

const DEFAULT_VARS: Record<string, string> = {
  full_name: "Budi Santoso",
  participant_name: "Budi Santoso",
  name: "Budi Santoso",
  registration_number: "PENDING-A1B2C3D4",
  reg_number: "PENDING-A1B2C3D4",
  candidate_number: "CAND-001",
  company: "PT. Maju Jaya",
  company_name: "PT. Maju Jaya",
  job_title: "Direktur",
  event_name: "MUSKOM",
  event_date: "12 Oktober 2026",
  venue: "Hotel Mulia Senayan",
  verification_url: "https://congress.trisf.my.id/verify-email?token=123",
  lookup_url: "https://congress.trisf.my.id/peserta",
  participant_lookup_url: "https://congress.trisf.my.id/peserta",
  candidate_profile_url: "https://congress.trisf.my.id/kandidat/CAND-001",
  candidate_public_url: "https://congress.trisf.my.id/kandidat/CAND-001",
  qr_code: "https://congress.trisf.my.id/api/v1/public/qr/PENDING-A1B2C3D4.png",
  qr_code_url: "https://congress.trisf.my.id/api/v1/public/qr/PENDING-A1B2C3D4.png",
  timestamp: new Date().toLocaleString(),
  reason: "Persyaratan tidak lengkap",
  rejection_reason: "Persyaratan tidak lengkap",
};

export default function EditEmailTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [previewDark, setPreviewDark] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [testEmail, setTestEmail] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [dummyVars, setDummyVars] = useState<Record<string, string>>(DEFAULT_VARS);

  useEffect(() => {
    fetchTemplate();
    fetchConfig();
  }, [params.id]);

  const fetchConfig = async () => {
    try {
      const res = await api.get("/system/config");
      const cfg = res.data?.data;
      if (cfg) {
        const portalTitle = cfg.website_identity?.website_title || "MUSKOM";
        setDummyVars(prev => ({
          ...prev,
          community_name: cfg.website_identity?.community_name || portalTitle,
          portal_title: portalTitle,
          event_name: portalTitle,
          portal_description: cfg.website_identity?.website_description || "",
          logo_url: cfg.website_identity?.logo_url || "",
          website_url: window.location.origin,
          contact_email: cfg.contact?.email || "",
          contact_phone: cfg.contact?.whatsapp || "",
        }));
      }
    } catch (err) {
      console.error("Failed to load config", err);
    }
  };

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

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error("Masukkan alamat email test");
      return;
    }

    try {
      setIsTesting(true);
      await api.post(`/admin/notifications/templates/${params.id}/test`, {
        email: testEmail,
      });
      toast.success(`Email test telah dikirim ke ${testEmail}`);
      setTestEmail("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengirim email test");
    } finally {
      setIsTesting(false);
    }
  };

  const renderPreviewHtml = () => {
    if (!template) return "";
    let html = template.body;
    
    // Replace dummy variables (handles both {{.key}} and {{key}})
    Object.keys(dummyVars).forEach(key => {
      const regexDot = new RegExp(`{{\\.${key}}}`, 'g');
      const regexNoDot = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regexDot, dummyVars[key]).replace(regexNoDot, dummyVars[key]);
    });
    
    // For dark mode, inject prefer-color-scheme via style if supported, or wrap in a div
    if (previewDark) {
      html = html.replace('</head>', '<style>@media (prefers-color-scheme: light) { body { background: #0f172a !important; color: #e2e8f0 !important; } .content { background: #1e293b !important; border-color: #334155 !important; } }</style></head>');
      // A trick to force dark mode rendering: add color-scheme: dark
      html = html.replace('<body>', '<body style="color-scheme: dark;">');
    }
    
    return html;
  };

  useEffect(() => {
    if (activeTab === "preview" && iframeRef.current) {
      const doc = iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(renderPreviewHtml());
        doc.close();
      }
    }
  }, [activeTab, template?.body, previewDark]);

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!template) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={
          <Link
            href="/admin/system/templates"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold transition-colors min-h-[36px]"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Template
          </Link>
        }
        title={`Template: ${template.name}`}
        description="Sesuaikan template menggunakan HTML dan template variables."
        actions={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
            <input
              type="email"
              placeholder="Email uji coba..."
              value={testEmail}
              onChange={e => setTestEmail(e.target.value)}
              className="px-3.5 py-2.5 min-h-[44px] text-sm border pg-border rounded-lg bg-white dark:bg-slate-800 pg-text focus:ring-primary focus:border-primary w-full sm:w-64"
            />
            <button
              onClick={handleTestEmail}
              disabled={!testEmail || isTesting}
              className="flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 pg-text text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 border pg-border cursor-pointer"
            >
              {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Kirim Test
            </button>
          </div>
        }
      />

      <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg w-fit mb-4">
        <button
          onClick={() => setActiveTab("editor")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === "editor"
              ? "bg-white dark:bg-slate-700 shadow-sm text-primary"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <Code className="w-4 h-4" />
          Editor
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === "preview"
              ? "bg-white dark:bg-slate-700 shadow-sm text-primary"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>
      </div>

      <div className="pg-surface border pg-border rounded-xl shadow-sm overflow-hidden">
        {activeTab === "editor" ? (
          <form onSubmit={handleSave} className="space-y-6 p-6">
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
        ) : (
          <div className="flex flex-col h-[700px] bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between p-4 border-b pg-border bg-white dark:bg-slate-800">
              <div className="text-sm font-semibold flex items-center gap-2">
                <span className="pg-muted">Subjek:</span> 
                {template.subject}
              </div>
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg">
                <button
                  onClick={() => setPreviewMode("desktop")}
                  className={`p-1.5 rounded-md transition-colors ${previewMode === "desktop" ? "bg-white dark:bg-slate-600 shadow-sm text-primary" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                  title="Desktop View"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewMode("mobile")}
                  className={`p-1.5 rounded-md transition-colors ${previewMode === "mobile" ? "bg-white dark:bg-slate-600 shadow-sm text-primary" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                  title="Mobile View"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <div className="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-1"></div>
                <button
                  onClick={() => setPreviewDark(false)}
                  className={`p-1.5 rounded-md transition-colors ${!previewDark ? "bg-white dark:bg-slate-600 shadow-sm text-amber-500" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                  title="Light Mode"
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewDark(true)}
                  className={`p-1.5 rounded-md transition-colors ${previewDark ? "bg-slate-700 shadow-sm text-indigo-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                  title="Dark Mode"
                >
                  <Moon className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto flex justify-center p-6 bg-slate-200 dark:bg-slate-900">
              <div className={`transition-all duration-300 ease-in-out bg-white ${previewMode === 'mobile' ? 'w-[375px]' : 'w-full max-w-3xl'} shadow-lg h-full rounded-b-lg overflow-hidden border-x border-b border-slate-300 dark:border-slate-700`}>
                <iframe
                  ref={iframeRef}
                  className="w-full h-full border-0 bg-white"
                  title="Email Preview"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
