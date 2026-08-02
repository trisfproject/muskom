"use client";

import { useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboard";
import { DashboardSummary } from "@/types/dashboard";
import { Users, UserCheck, ShieldAlert, Settings2, Calendar, FileText, ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import Link from "next/link";
import { StatusChip } from "@/components/ui/status-chip";

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getSummary().then(data => {
      setSummary(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 pg-muted animate-pulse">Memuat dashboard operasional...</div>;
  }

  if (!summary || !summary.event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto">
        <div className="w-16 h-16 pg-surface border pg-border rounded-2xl flex items-center justify-center mb-6">
          <Settings2 className="w-8 h-8 pg-muted" />
        </div>
        <h2 className="text-xl font-bold pg-text mb-2">Belum Ada Musyawarah Aktif</h2>
        <p className="pg-muted text-sm mb-6">
          Sistem membutuhkan setidaknya satu konfigurasi Musyawarah yang aktif untuk memulai operasional pendaftaran dan pemilihan.
        </p>
        <Link 
          href="/admin/musyawarah"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-active pg-text px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          Kelola Musyawarah
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const { event, pending_participants, pending_candidates, total_participants, total_candidates } = summary;
  const totalPending = pending_participants + pending_candidates;

  const lifecycle = event.lifecycle_state || 'PREPARATION';

  const formatLifecycleName = (lc: string) => {
    const map: Record<string, string> = {
      'DRAFT': 'Persiapan Sistem',
      'PREPARATION': 'Menunggu Jadwal',
      'PARTICIPANT_REGISTRATION': 'Pendaftaran Peserta',
      'PARTICIPANT_VERIFICATION': 'Verifikasi Peserta',
      'CANDIDATE_REGISTRATION': 'Pendaftaran Calon',
      'CANDIDATE_VERIFICATION': 'Verifikasi Calon',
      'CANDIDATE_PUBLICATION': 'Penetapan Calon',
      'CAMPAIGN': 'Masa Kampanye',
      'COOLING_DOWN': 'Masa Tenang',
      'ATTENDANCE': 'Registrasi Kehadiran',
      'VOTING': 'Sesi Pemilihan Aktif',
      'RESULT_PUBLICATION': 'Publikasi Hasil',
      'COMPLETED': 'Musyawarah Selesai',
      'ARCHIVED': 'Diarsipkan',
      'PUBLISHED': 'Berjalan',
    };
    return map[lc] || lc;
  }

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Dashboard Operasional" 
        description={`Mengelola ${event.name}`}
      >
        <StatusChip status={event.status} />
      </SectionHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Widget 1: Current Active Phase */}
        <div className="col-span-1 md:col-span-2 pg-surface border pg-border rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <h3 className="text-sm font-medium pg-muted mb-1">Fase Saat Ini</h3>
            <div className="text-2xl font-bold pg-text mb-4">
              {formatLifecycleName(lifecycle)}
            </div>
            
            <div className="flex flex-wrap gap-3 mt-6">
              {lifecycle === 'DRAFT' && (
                <Link href="/admin/musyawarah/publication" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-active pg-text px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  <ArrowRight className="w-4 h-4" /> Publikasikan Acara
                </Link>
              )}
              {lifecycle.includes('PARTICIPANT') && (
                <Link href="/admin/registrations" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-active pg-text px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-blue-700">
                  <Users className="w-4 h-4" /> Kelola Peserta
                </Link>
              )}
              {lifecycle.includes('CANDIDATE') && (
                <Link href="/admin/candidates" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-active pg-text px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-blue-700">
                  <UserCheck className="w-4 h-4" /> Kelola Kandidat
                </Link>
              )}
              <Link href="/admin/musyawarah/timeline" className="inline-flex items-center gap-2 pg-surface-elevated hover:pg-surface-elevated/80 pg-text px-4 py-2 rounded-lg text-sm font-medium transition-colors border pg-border">
                <Calendar className="w-4 h-4" /> Timeline
              </Link>
            </div>
          </div>
        </div>

        {/* Widget 2: Pending Verification Action Card */}
        <div className={`col-span-1 rounded-xl p-6 border flex flex-col justify-between ${
          totalPending > 0 
            ? 'bg-amber-500/10 border-amber-500/20' 
            : 'pg-surface pg-border'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className={`w-5 h-5 ${totalPending > 0 ? 'text-amber-500' : 'pg-muted'}`} />
              <h3 className={`text-sm font-medium ${totalPending > 0 ? 'text-amber-500' : 'pg-muted'}`}>
                Menunggu Verifikasi
              </h3>
            </div>
            <div className="text-3xl font-bold pg-text mb-2">{totalPending}</div>
            <p className="text-sm pg-muted">
              {pending_participants} Peserta, {pending_candidates} Kandidat
            </p>
          </div>
          
          <div className="mt-6">
            <Link 
              href="/admin/registrations"
              className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                totalPending > 0 
                  ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                  : 'pg-surface-elevated pg-muted hover:pg-text'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Tinjau Sekarang
            </Link>
          </div>
        </div>

        {/* Widget 3: Quick Stats */}
        <div className="col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="pg-surface border pg-border p-5 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold pg-text">{total_participants}</div>
              <div className="text-xs font-medium pg-muted uppercase tracking-wider">Total Peserta</div>
            </div>
          </div>
          
          <div className="pg-surface border pg-border p-5 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <div className="text-2xl font-bold pg-text">{total_candidates}</div>
              <div className="text-xs font-medium pg-muted uppercase tracking-wider">Total Kandidat</div>
            </div>
          </div>

          <div className="pg-surface border pg-border p-5 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold pg-text">{event.publish_result ? 'Publik' : 'Tertutup'}</div>
              <div className="text-xs font-medium pg-muted uppercase tracking-wider">Status Hasil</div>
            </div>
          </div>

          <div className="pg-surface border pg-border p-5 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg pg-surface-elevated flex items-center justify-center">
              <Settings2 className="w-5 h-5 pg-muted" />
            </div>
            <div>
              <div className="text-2xl font-bold pg-text">100%</div>
              <div className="text-xs font-medium pg-muted uppercase tracking-wider">System Health</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
