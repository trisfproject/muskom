"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { eventService } from "@/services/event";
import { MusyawarahEvent, UpdateEventPayload } from "@/types/event";
import { SectionHeader } from "@/components/ui/section-header";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowRight, UserCheck, CheckSquare, Clock } from "lucide-react";

export default function TimelinePage() {
  const [event, setEvent] = useState<MusyawarahEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    fetchEvent();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        allow_candidate_registration: event.allow_candidate_registration,
        registration_start: event.registration_start,
        registration_end: event.registration_end,
        candidate_registration_start: event.candidate_registration_start,
        candidate_registration_end: event.candidate_registration_end,
        voting_start: event.voting_start,
        voting_end: event.voting_end,
      };
      await eventService.updateEvent(payload);
      toast.success("Timeline berhasil disimpan");
    } catch (error) {
      toast.error("Gagal menyimpan timeline");
    } finally {
      setSaving(false);
    }
  };

  // Workflow Context Logic
  const getContextualAction = () => {
    if (!event) return null;
    const now = new Date();
    
    // Check Registration Phase
    const regStart = event.registration_start ? new Date(event.registration_start) : null;
    const regEnd = event.registration_end ? new Date(event.registration_end) : null;
    
    if (regStart && regEnd && now >= regStart && now <= regEnd) {
      return {
        title: "Pendaftaran Sedang Berlangsung",
        desc: "Pantau pendaftar dan lakukan verifikasi agar mereka dapat login.",
        href: "/admin/registrations",
        label: "Verifikasi Peserta",
        icon: UserCheck,
        color: "blue"
      };
    }
    
    // Check Candidate Phase
    const candStart = event.candidate_registration_start ? new Date(event.candidate_registration_start) : null;
    const candEnd = event.candidate_registration_end ? new Date(event.candidate_registration_end) : null;
    
    if (candStart && candEnd && now >= candStart && now <= candEnd) {
      return {
        title: "Pendaftaran Kandidat Dibuka",
        desc: "Tinjau berkas pendaftaran kandidat dan verifikasi pencalonan mereka.",
        href: "/admin/candidates",
        label: "Verifikasi Kandidat",
        icon: UserCheck,
        color: "purple"
      };
    }
    
    // Check Voting Phase
    const voteStart = event.voting_start ? new Date(event.voting_start) : null;
    const voteEnd = event.voting_end ? new Date(event.voting_end) : null;
    
    if (voteStart && voteEnd && now >= voteStart && now <= voteEnd) {
      return {
        title: "Sesi Pemilihan Sedang Berjalan",
        desc: "Pemilih saat ini sedang memberikan suara. Pantau integritas sistem.",
        href: "/admin/voting",
        label: "Monitor Voting",
        icon: CheckSquare,
        color: "emerald"
      };
    }
    
    // Default action if no phase is active but event is published
    if (event.status === 'SCHEDULED' || event.status === 'ACTIVE') {
      return {
        title: "Menunggu Fase Selanjutnya",
        desc: "Tidak ada jadwal operasional yang sedang berjalan pada saat ini.",
        href: "/admin/dashboard",
        label: "Lihat Dashboard",
        icon: Clock,
        color: "slate"
      };
    }

    return null;
  };

  const action = getContextualAction();

  const toDatetimeLocal = (val?: string) => {
    if (!val) return "";
    return val.substring(0, 16);
  };

  if (loading) return <div className="p-8 pg-muted">Memuat...</div>;
  if (!event) return <div className="p-8 pg-muted">Konfigurasi tidak ditemukan</div>;

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Timeline & Penjadwalan" 
        description="Atur jadwal operasional untuk setiap fase musyawarah."
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Timeline Form */}
        <div className="col-span-1 xl:col-span-2 pg-surface border pg-border rounded-xl p-6 space-y-8">
          
          <div className="space-y-4">
            <h3 className="text-sm font-semibold pg-text border-b pg-border pb-2">1. Fase Registrasi Peserta</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Waktu Buka</label>
                <Input type="datetime-local" name="registration_start" value={toDatetimeLocal(event.registration_start)} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Waktu Tutup</label>
                <Input type="datetime-local" name="registration_end" value={toDatetimeLocal(event.registration_end)} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold pg-text border-b pg-border pb-2">2. Fase Bursa Calon (Kandidat)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Waktu Buka</label>
                <Input type="datetime-local" name="candidate_registration_start" value={toDatetimeLocal(event.candidate_registration_start)} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Waktu Tutup</label>
                <Input type="datetime-local" name="candidate_registration_end" value={toDatetimeLocal(event.candidate_registration_end)} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold pg-text border-b pg-border pb-2">3. Fase Pemilihan (Voting)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Waktu Buka</label>
                <Input type="datetime-local" name="voting_start" value={toDatetimeLocal(event.voting_start)} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Waktu Tutup</label>
                <Input type="datetime-local" name="voting_end" value={toDatetimeLocal(event.voting_end)} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t pg-border flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary hover:bg-primary-active pg-text px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Jadwal"}
            </button>
          </div>
        </div>

        {/* Contextual Action Panel */}
        <div className="col-span-1">
          {action ? (
            <div className={`bg-${action.color}-500/10 border border-${action.color}-500/20 rounded-xl p-6 sticky top-24`}>
              <div className={`w-10 h-10 rounded-lg bg-${action.color}-500/20 flex items-center justify-center mb-4`}>
                <action.icon className={`w-5 h-5 text-${action.color}-400`} />
              </div>
              <h3 className="text-lg font-bold pg-text mb-2">{action.title}</h3>
              <p className="text-sm text-slate-300 mb-6">{action.desc}</p>
              
              <Link 
                href={action.href}
                className={`w-full flex items-center justify-center gap-2 bg-${action.color}-600 hover:bg-${action.color}-700 pg-text px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
              >
                {action.label}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="pg-surface border pg-border rounded-xl p-6 text-center sticky top-24">
              <Clock className="w-10 h-10 text-slate-600 mx-auto mb-4" />
              <h3 className="text-base font-semibold pg-muted mb-2">Tidak Ada Aktivitas Saat Ini</h3>
              <p className="text-xs pg-muted">
                Lengkapi timeline atau publikasikan acara untuk melihat saran tindakan operasional selanjutnya.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
