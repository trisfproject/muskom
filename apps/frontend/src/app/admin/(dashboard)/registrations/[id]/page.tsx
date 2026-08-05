"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, CheckCircle2, XCircle, Clock, RefreshCw, AlertCircle,
  Mail, Phone, Building2, MapPin, Briefcase, Layers, User, CalendarDays,
  ClipboardList, RotateCcw,
} from "lucide-react";
import {
  adminParticipantService,
  AdminParticipantResponse,
  ParticipantAuditEntry,
} from "@/services/participant-admin";
import { StatusChip } from "@/components/ui/status-chip";
import { Button } from "@/components/ui/button";

// ─── Audit action label helper ────────────────────────────────────────────────

function auditActionLabel(action: string): { label: string; dot: string } {
  switch (action) {
    case "PUBLIC_REGISTER":  return { label: "Peserta mendaftar",          dot: "bg-blue-400" };
    case "CREATE":           return { label: "Data dibuat (admin)",         dot: "bg-slate-400" };
    case "UPDATE":           return { label: "Data diperbarui",             dot: "bg-slate-400" };
    case "UPDATE_STATUS":    return { label: "Status diperbarui",           dot: "bg-indigo-400" };
    case "DELETE":           return { label: "Data dihapus",                dot: "bg-red-400" };
    default:                 return { label: action,                         dot: "bg-slate-300" };
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ParticipantDetailPage() {
  const { id } = useParams() as { id: string };
  const router  = useRouter();

  const [participant, setParticipant] = useState<AdminParticipantResponse | null>(null);
  const [audits, setAudits]           = useState<ParticipantAuditEntry[]>([]);
  const [loading, setLoading]         = useState(true);

  // Action state
  const [acting, setActing]           = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<"Verified" | "Rejected" | "Pending" | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [p, a] = await Promise.all([
        adminParticipantService.getParticipantDetail(id),
        adminParticipantService.getAuditLogs(id),
      ]);
      setParticipant(p);
      setAudits(a);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusUpdate = async (newStatus: "Verified" | "Rejected" | "Pending") => {
    setActing(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await adminParticipantService.updateStatus(id, { 
        status: newStatus,
        reason: newStatus === "Rejected" && rejectReason.trim() ? rejectReason.trim() : undefined,
      });
      setActionSuccess(`Status berhasil diubah ke ${newStatus}.`);
      setConfirmAction(null);
      setRejectReason("");
      await fetchData();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setActionError(e?.response?.data?.message || e?.message || "Gagal mengubah status.");
    } finally {
      setActing(false);
    }
  };

  // ─── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-5 w-32 bg-slate-100 dark:bg-slate-700 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-40 bg-slate-100 dark:bg-slate-700 rounded-xl" />
            <div className="h-32 bg-slate-100 dark:bg-slate-700 rounded-xl" />
          </div>
          <div className="space-y-4">
            <div className="h-48 bg-slate-100 dark:bg-slate-700 rounded-xl" />
            <div className="h-64 bg-slate-100 dark:bg-slate-700 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="flex flex-col items-center gap-3 py-24">
        <AlertCircle className="w-12 h-12 text-red-300" />
        <p className="font-semibold text-slate-700">Peserta tidak ditemukan</p>
        <button onClick={() => router.back()} className="text-sm text-primary hover:underline">Kembali</button>
      </div>
    );
  }

  const initials = participant.full_name
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

  return (
    <div className="space-y-5 pb-12">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-medium pg-muted hover:pg-text transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Daftar
      </button>

      {/* SUCCESS / ERROR flash */}
      {actionSuccess && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          {actionSuccess}
          <button onClick={() => setActionSuccess(null)} className="ml-auto text-emerald-500 hover:text-emerald-700"><XCircle className="w-4 h-4" /></button>
        </div>
      )}
      {actionError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {actionError}
          <button onClick={() => setActionError(null)} className="ml-auto text-red-400 hover:text-red-600"><XCircle className="w-4 h-4" /></button>
        </div>
      )}

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── LEFT: Participant data ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Identity card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-xl font-black text-primary shrink-0">
                {initials}
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold pg-text">{participant.full_name}</h1>
                {participant.nickname && (
                  <p className="text-sm pg-muted">Dipanggil: {participant.nickname}</p>
                )}
                <p className="font-mono text-xs text-slate-400 mt-1">{participant.registration_number}</p>
                <div className="mt-3">
                  <StatusChip status={participant.status} />
                </div>
              </div>
            </div>

            {/* Personal info */}
            <SectionLabel label="Informasi Personal" icon={User} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <InfoRow icon={Mail} label="Email" value={participant.email} />
              <InfoRow icon={Phone} label="WhatsApp" value={participant.phone} />
            </div>
          </div>

          {/* Employment card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
            <SectionLabel label="Informasi Pekerjaan" icon={Briefcase} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <InfoRow icon={Building2} label="Perusahaan" value={participant.company_name} />
              <InfoRow icon={MapPin} label="Kawasan Industri" value={participant.industrial_area} />
              <InfoRow icon={Briefcase} label="Jabatan" value={participant.job_title} />
              <InfoRow icon={Layers} label="Departemen" value={participant.department || "—"} />
            </div>
          </div>

          {/* Registration timeline card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
            <SectionLabel label="Timeline Registrasi" icon={CalendarDays} />
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                <div>
                  <p className="text-xs font-semibold pg-text">Tanggal Pendaftaran</p>
                  <p className="text-sm pg-muted">
                    {new Date(participant.created_at).toLocaleString("id-ID", {
                      weekday: "long", day: "numeric", month: "long", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              {participant.updated_at !== participant.created_at && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold pg-text">Terakhir Diperbarui</p>
                    <p className="text-sm pg-muted">
                      {new Date(participant.updated_at).toLocaleString("id-ID", {
                        weekday: "long", day: "numeric", month: "long", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Actions & Audit ── */}
        <div className="space-y-5">

          {/* Action panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm sticky top-6">
            <h2 className="text-sm font-bold pg-text mb-4 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 pg-muted" />
              Tindakan Verifikasi
            </h2>

            <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-xs pg-muted mb-1.5">Status Saat Ini</p>
              <StatusChip status={participant.status} />
            </div>

            {/* Confirm overlay */}
            {confirmAction ? (
              <div className={`rounded-xl border p-4 mb-4 ${
                confirmAction === "Verified" ? "border-emerald-200 bg-emerald-50" :
                confirmAction === "Rejected" ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"
              }`}>
                <p className="text-sm font-semibold mb-1">
                  {confirmAction === "Verified"
                    ? "✅ Verifikasi peserta ini?"
                    : confirmAction === "Rejected"
                    ? "❌ Tolak peserta ini?"
                    : "↩️ Kembalikan ke Pending?"}
                </p>
                <p className="text-xs pg-muted mb-4">
                  Status akan berubah ke <strong>{confirmAction === "Pending" ? "Pending" : confirmAction}</strong>.
                  Tindakan ini tercatat dalam audit log.
                </p>
                {confirmAction === "Rejected" && (
                  <div className="mb-4">
                    <label className="block text-xs font-bold pg-muted uppercase tracking-wider mb-1.5">
                      Alasan Penolakan (Opsional)
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Masukkan alasan penolakan..."
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 pg-text focus:outline-none focus:border-red-400"
                      rows={3}
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => { setConfirmAction(null); setRejectReason(""); }}
                    disabled={acting}
                    className="flex-1 w-full"
                  >
                    Batal
                  </Button>
                  <Button
                    variant={confirmAction === "Rejected" ? "danger" : "primary"}
                    onClick={() => handleStatusUpdate(confirmAction)}
                    disabled={acting}
                    loading={acting}
                    className="flex-1 w-full"
                  >
                    Konfirmasi
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {participant.status !== "Verified" && (
                  <Button
                    id="btn-verify-participant"
                    variant="primary"
                    onClick={() => setConfirmAction("Verified")}
                    className="w-full"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Verifikasi Peserta
                  </Button>
                )}
                {participant.status !== "Rejected" && (
                  <Button
                    id="btn-reject-participant"
                    variant="danger"
                    onClick={() => setConfirmAction("Rejected")}
                    className="w-full"
                  >
                    <XCircle className="w-4 h-4" />
                    Tolak Peserta
                  </Button>
                )}
                {participant.status !== "Pending" && (
                  <Button
                    id="btn-return-pending"
                    variant="secondary"
                    onClick={() => setConfirmAction("Pending")}
                    className="w-full"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Kembalikan ke Pending
                  </Button>
                )}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-xs pg-muted">
              Setiap tindakan dicatat dalam audit log secara otomatis.
            </div>
          </div>

          {/* Audit history */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-bold pg-text mb-4 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 pg-muted" />
              Riwayat Aktivitas
            </h2>
            {audits.length === 0 ? (
              <p className="text-xs pg-muted text-center py-6">Belum ada riwayat aktivitas.</p>
            ) : (
              <ol className="relative border-l border-slate-200 dark:border-slate-700 space-y-5 ml-2">
                {audits.map((a) => {
                  const { label, dot } = auditActionLabel(a.action as string);
                  return (
                    <li key={a.id} className="pl-5 relative">
                      <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${dot}`} />
                      <p className="text-xs font-bold pg-text">{label}</p>
                      <p className="text-[11px] pg-muted">
                        {new Date(a.created_at).toLocaleString("id-ID", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                      {(a.previous_value?.status || a.new_value?.status) && (
                        <div className="mt-1.5 inline-flex items-center gap-2 text-[11px] bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
                          {a.previous_value?.status && (
                            <span className="pg-muted">{a.previous_value.status}</span>
                          )}
                          {a.previous_value?.status && a.new_value?.status && (
                            <span className="pg-muted">→</span>
                          )}
                          {a.new_value?.status && (
                            <span className="font-semibold pg-text">{a.new_value.status}</span>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helper Components ────────────────────────────────────────────────────────

function SectionLabel({
  label, icon: Icon,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 pg-muted" />
      <h3 className="text-xs font-bold uppercase tracking-wider pg-muted">{label}</h3>
    </div>
  );
}

function InfoRow({
  icon: Icon, label, value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
      <Icon className="w-4 h-4 pg-muted mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold pg-muted uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium pg-text break-words mt-0.5">{value}</p>
      </div>
    </div>
  );
}
