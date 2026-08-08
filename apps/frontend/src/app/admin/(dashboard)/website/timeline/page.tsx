"use client";

import { useEffect, useState } from "react";
import { websiteService, TimelinePhase } from "@/services/website";
import {
  Calendar,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

export default function AdminWebsiteTimelinePage() {
  const [phases, setPhases] = useState<TimelinePhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<TimelinePhase | null>(null);
  const [formState, setFormState] = useState<Partial<TimelinePhase>>({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    display_order: 1,
    registration_type: "NONE",
    current_indicator: false,
    is_published: true,
  });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const data = await websiteService.getTimeline();
      setPhases(data || []);
    } catch (err: unknown) {
      console.error("Failed to load timeline:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingPhase(null);
    setFormState({
      title: "",
      description: "",
      start_date: new Date().toISOString().split("T")[0] + "T09:00",
      end_date: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0] + "T18:00",
      display_order: phases.length + 1,
      registration_type: "NONE",
      current_indicator: false,
      is_published: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (phase: TimelinePhase) => {
    setEditingPhase(phase);
    setFormState({
      title: phase.title,
      description: phase.description,
      start_date: phase.start_date ? phase.start_date.substring(0, 16) : "",
      end_date: phase.end_date ? phase.end_date.substring(0, 16) : "",
      display_order: phase.display_order,
      registration_type: phase.registration_type,
      current_indicator: phase.current_indicator,
      is_published: phase.is_published,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload: Partial<TimelinePhase> = {
        ...formState,
        start_date: formState.start_date ? new Date(formState.start_date).toISOString() : new Date().toISOString(),
        end_date: formState.end_date ? new Date(formState.end_date).toISOString() : new Date().toISOString(),
        display_order: Number(formState.display_order) || 1,
      };

      if (editingPhase && editingPhase.id) {
        await websiteService.updateTimelinePhase(editingPhase.id, payload);
        setMessage({ type: "success", text: "Tahapan timeline berhasil diperbarui." });
      } else {
        await websiteService.createTimelinePhase(payload);
        setMessage({ type: "success", text: "Tahapan timeline berhasil ditambahkan." });
      }
      setModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      setMessage({ type: "error", text: "Gagal menyimpan tahapan timeline." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus tahapan timeline ini?")) return;
    try {
      await websiteService.deleteTimelinePhase(id);
      setMessage({ type: "success", text: "Tahapan timeline berhasil dihapus." });
      await loadData();
    } catch (err: unknown) {
      setMessage({ type: "error", text: "Gagal menghapus tahapan timeline." });
    }
  };

  const moveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= phases.length) return;

    const newPhases = [...phases];
    const temp = newPhases[index];
    newPhases[index] = newPhases[targetIndex];
    newPhases[targetIndex] = temp;

    // Update display_order values
    const items = newPhases.map((p, i) => ({
      id: p.id!,
      display_order: i + 1,
    }));

    setPhases(newPhases.map((p, i) => ({ ...p, display_order: i + 1 })));

    try {
      await websiteService.reorderTimeline(items);
      setMessage({ type: "success", text: "Urutan tahapan timeline berhasil diperbarui." });
    } catch (err: unknown) {
      setMessage({ type: "error", text: "Gagal mengubah urutan timeline." });
      await loadData();
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold pg-text tracking-tight">Musyawarah — Timeline & Agenda</h1>
          <p className="text-sm pg-muted mt-1">
            Kelola tahapan agenda musyawarah, tanggal pelaksanaan, dan kontrol fase aktif otomatis.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm transition-all duration-200 shadow-xl shadow-[var(--color-primary)]/40 hover:-translate-y-[2px] shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambah Tahapan
        </button>
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

      {/* Phases List */}
      <div className="space-y-3">
        {phases.length === 0 ? (
          <div className="p-12 text-center pg-surface border pg-border rounded-2xl">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="pg-muted text-sm font-medium">Belum ada tahapan timeline</p>
            <p className="text-slate-600 text-xs mt-1">Klik tombol &quot;Tambah Tahapan&quot; di atas untuk membuat jadwal.</p>
          </div>
        ) : (
          phases.map((phase, idx) => (
            <div
              key={phase.id || idx}
              className="pg-surface border pg-border shadow-xs rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md hover:border-primary/20 transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                {/* Order Index */}
                <div className="w-9 h-9 rounded-xl pg-surface-elevated border-2 pg-border flex items-center justify-center text-xs font-medium pg-text shrink-0">
                  {String(idx + 1).padStart(2, "0")}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h3 className="font-bold pg-text text-lg">{phase.title}</h3>
                    {phase.status === "active" && (
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase">
                        Fase Aktif
                      </span>
                    )}
                    {phase.registration_type !== "NONE" && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold uppercase">
                        Reg: {phase.registration_type}
                      </span>
                    )}
                    {!phase.is_published && (
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-bold uppercase">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed pg-muted line-clamp-2">{phase.description || "Tidak ada deskripsi."}</p>
                  <p className="flex items-center gap-1.5 text-xs pg-muted font-medium mt-2.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {phase.start_date ? new Date(phase.start_date).toLocaleDateString("id-ID") : ""} —{" "}
                    {phase.end_date ? new Date(phase.end_date).toLocaleDateString("id-ID") : ""}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <button
                  onClick={() => moveOrder(idx, "up")}
                  disabled={idx === 0}
                  className="p-2 rounded-lg pg-surface-elevated border pg-border hover:border-primary hover:shadow-sm disabled:opacity-30 text-primary transition-all duration-200"
                  title="Pindah ke Atas"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => moveOrder(idx, "down")}
                  disabled={idx === phases.length - 1}
                  className="p-2 rounded-lg pg-surface-elevated border pg-border hover:border-primary hover:shadow-sm disabled:opacity-30 text-slate-500 dark:text-slate-400 transition-all duration-200"
                  title="Pindah ke Bawah"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => openEditModal(phase)}
                  className="p-2 rounded-lg pg-surface-elevated border pg-border hover:border-primary hover:shadow-sm text-primary transition-all duration-200"
                  title="Edit Tahapan"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(phase.id!)}
                  className="p-2 rounded-lg pg-surface-elevated border pg-border hover:border-rose-500/50 hover:bg-rose-500/10 hover:shadow-sm text-slate-500 dark:text-slate-400 hover:text-rose-500 transition-all duration-200"
                  title="Hapus Tahapan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="pg-surface border pg-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 border-b pg-border flex items-center justify-between">
              <h2 className="text-base font-bold pg-text">
                {editingPhase ? "Edit Tahapan Timeline" : "Tambah Tahapan Timeline"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 pg-muted hover:pg-text rounded-lg hover:pg-surface-elevated transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Nama Tahapan</label>
                <input
                  type="text"
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Deskripsi Ringkas</label>
                <textarea
                  rows={2}
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Waktu Mulai</label>
                  <input
                    type="datetime-local"
                    value={formState.start_date}
                    onChange={(e) => setFormState({ ...formState, start_date: e.target.value })}
                    className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3 py-2 text-xs pg-text focus:outline-none focus:border-[var(--color-primary)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Waktu Selesai</label>
                  <input
                    type="datetime-local"
                    value={formState.end_date}
                    onChange={(e) => setFormState({ ...formState, end_date: e.target.value })}
                    className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3 py-2 text-xs pg-text focus:outline-none focus:border-[var(--color-primary)]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Jenis Registrasi Yang Dibuka</label>
                <select
                  value={formState.registration_type}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      registration_type: e.target.value as "NONE" | "PARTICIPANT" | "CANDIDATE" | "BOTH",
                    })
                  }
                  className="w-full bg-[var(--color-bg)] border pg-border rounded-xl px-3.5 py-2.5 text-sm pg-text focus:outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="NONE">Tidak Ada (NONE)</option>
                  <option value="CANDIDATE">Penjaringan Calon (CANDIDATE)</option>
                  <option value="PARTICIPANT">Pendaftaran Peserta (PARTICIPANT)</option>
                  <option value="BOTH">Keduanya (BOTH)</option>
                </select>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-3 p-3 bg-[var(--color-bg)]/60 border pg-border rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.current_indicator}
                    onChange={(e) => setFormState({ ...formState, current_indicator: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold pg-text block">Tandai Sebagai Fase Aktif</span>
                    <span className="text-[11px] pg-muted">Override manual indikator fase aktif di landing</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-[var(--color-bg)]/60 border pg-border rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.is_published}
                    onChange={(e) => setFormState({ ...formState, is_published: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold pg-text block">Publikasikan Tahapan Ini</span>
                    <span className="text-[11px] pg-muted">Tampilkan di halaman publik</span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t pg-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl pg-surface-elevated hover:pg-surface-elevated/80 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 pg-text text-xs font-semibold transition-colors"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
