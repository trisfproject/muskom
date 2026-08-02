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
    return <div className="p-8 text-slate-400 animate-pulse">Memuat dashboard operasional...</div>;
  }

  if (!summary || !summary.event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mb-6">
          <Settings2 className="w-8 h-8 text-slate-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Belum Ada Musyawarah Aktif</h2>
        <p className="text-slate-400 text-sm mb-6">
          Sistem membutuhkan setidaknya satu konfigurasi Musyawarah yang aktif untuk memulai operasional pendaftaran dan pemilihan.
        </p>
        <Link 
          href="/admin/musyawarah/general"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          Konfigurasi Sekarang
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const { event, pending_participants, pending_candidates, total_participants, total_candidates } = summary;
  const totalPending = pending_participants + pending_candidates;

  // Determine Current Phase loosely based on dates (Mock logic for now as real dates aren't parsed strictly here, but good for UI demo)
  const isRegistrationOpen = event.registration_start && new Date() >= new Date(event.registration_start) && (!event.registration_end || new Date() <= new Date(event.registration_end));

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
        <div className="col-span-1 md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <h3 className="text-sm font-medium text-slate-400 mb-1">Fase Saat Ini</h3>
            <div className="text-2xl font-bold text-white mb-4">
              {event.status === 'DRAFT' ? 'Persiapan Sistem' : 
               event.status === 'PUBLISHED' && isRegistrationOpen ? 'Registrasi Peserta Dibuka' :
               event.status === 'PUBLISHED' ? 'Pendaftaran Ditutup' : 'Musyawarah Selesai'}
            </div>
            
            <div className="flex flex-wrap gap-3 mt-6">
              {event.status === 'DRAFT' && (
                <Link href="/admin/musyawarah/publication" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  <ArrowRight className="w-4 h-4" /> Publikasikan Acara
                </Link>
              )}
              {event.status === 'PUBLISHED' && (
                <Link href="/admin/registrations" className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700">
                  <Users className="w-4 h-4" /> Kelola Peserta
                </Link>
              )}
              {event.status === 'PUBLISHED' && (
                <Link href="/admin/musyawarah/timeline" className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700">
                  <Calendar className="w-4 h-4" /> Ubah Timeline
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Widget 2: Pending Verification Action Card */}
        <div className={`col-span-1 rounded-xl p-6 border flex flex-col justify-between ${
          totalPending > 0 
            ? 'bg-amber-500/10 border-amber-500/20' 
            : 'bg-slate-900 border-slate-800'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className={`w-5 h-5 ${totalPending > 0 ? 'text-amber-500' : 'text-slate-500'}`} />
              <h3 className={`text-sm font-medium ${totalPending > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                Menunggu Verifikasi
              </h3>
            </div>
            <div className="text-3xl font-bold text-white mb-2">{totalPending}</div>
            <p className="text-sm text-slate-400">
              {pending_participants} Peserta, {pending_candidates} Kandidat
            </p>
          </div>
          
          <div className="mt-6">
            <Link 
              href="/admin/registrations"
              className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                totalPending > 0 
                  ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Tinjau Sekarang
            </Link>
          </div>
        </div>

        {/* Widget 3: Quick Stats */}
        <div className="col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{total_participants}</div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Peserta</div>
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{total_candidates}</div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Kandidat</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{event.publish_result ? 'Publik' : 'Tertutup'}</div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Status Hasil</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
              <Settings2 className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">100%</div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">System Health</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
