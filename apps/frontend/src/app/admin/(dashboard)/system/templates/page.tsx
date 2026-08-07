"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, Edit, RefreshCw, Eye } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { SectionHeader } from "@/components/ui/section-header";

interface Template {
  id: string;
  name: string;
  channel: string;
  subject?: string;
  created_at: string;
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/admin/notifications/templates");
      if (res.data?.data) {
        setTemplates(res.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memuat template email");
    } finally {
      setIsLoading(false);
    }
  };

  const getTemplateFriendlyName = (name: string) => {
    switch(name) {
      case "participant_registration_submitted": return "Registrasi Peserta Diterima";
      case "participant_registration_approved": return "Registrasi Peserta Disetujui";
      case "participant_registration_rejected": return "Registrasi Peserta Ditolak";
      case "candidate_registration_submitted": return "Registrasi Kandidat Diterima";
      case "candidate_registration_approved": return "Registrasi Kandidat Disetujui";
      case "candidate_registration_rejected": return "Registrasi Kandidat Ditolak";
      case "candidate_published": return "Kandidat Dipublikasikan";
      case "candidate_unpublished": return "Publikasi Kandidat Ditarik";
      case "voting_invitation": return "Undangan E-Voting";
      case "voting_reminder": return "Pengingat E-Voting";
      default: return name;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <SectionHeader
        title="Template Email"
        description="Kelola template pesan untuk notifikasi email sistem. Anda dapat menyesuaikan subjek dan isi email."
      >
        <button
          type="button"
          onClick={fetchTemplates}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border pg-border bg-white dark:bg-slate-800 pg-text hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </button>
      </SectionHeader>

      <div className="pg-surface border pg-border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center items-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : templates.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold pg-text">Belum ada template email</h3>
            <p className="mt-1 text-sm">Sistem belum menginisialisasi template default.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b pg-border">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider pg-muted w-1/3">
                    Workflow Event
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider pg-muted">
                    Subjek Default
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider pg-muted text-right w-24">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y pg-border">
                {templates.map((tpl) => (
                  <tr key={tpl.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-sm pg-text">
                        {getTemplateFriendlyName(tpl.name)}
                      </div>
                      <div className="text-xs pg-muted mt-1 font-mono">
                        {tpl.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm pg-text font-medium truncate max-w-sm">
                        {tpl.subject || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/system/templates/${tpl.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 rounded-md transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
