"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, CheckCircle2, Download, Save, AlertCircle, RefreshCw, Trash2, Lock } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { candidateSchema, CandidateFormData } from "./schema";
import { candidateRegistrationService } from "@/services/candidate-registration";
import { landingService } from "@/services/landing";

const LOCAL_DRAFT_KEY = "muskom_candidate_local_draft";
const ID_DRAFT_KEY = "muskom_candidate_id";

type SaveStatus = "Idle" | "Saving..." | "Saved" | "Failed";

export default function CandidateRegisterPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [musyawarahId, setMusyawarahId] = useState<string | null>(null);
  
  // Backend Sync State
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("Idle");
  const [isLocked, setIsLocked] = useState(false);
  
  const [successData, setSuccessData] = useState<{ regNumber: string; name: string } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const { register, handleSubmit, trigger, getValues, watch, reset, formState: { errors } } = useForm<CandidateFormData>({
    resolver: zodResolver(candidateSchema),
    mode: "onTouched"
  });

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedData = useRef<string>("");

  // 1. Initial Load & Hydration
  useEffect(() => {
    const initialize = async () => {
      try {
        // Fetch Event ID
        const res = await landingService.getPublicHome();
        if (res?.event?.id) setMusyawarahId(res.event.id);

        // Check if there is an active backend draft
        const savedId = localStorage.getItem(ID_DRAFT_KEY);
        if (savedId) {
          try {
            const draft = await candidateRegistrationService.getDraft(savedId);
            if (draft.status === "Submitted") {
              setIsLocked(true);
              setSuccessData({ regNumber: draft.registration_number, name: draft.full_name });
              setStep(5);
            } else {
              setCandidateId(draft.id);
              reset(draft as unknown as CandidateFormData);
              // Start at step 2 if we have a valid draft
              setStep(2);
            }
          } catch (e) {
            console.error("Failed to fetch draft from backend", e);
            localStorage.removeItem(ID_DRAFT_KEY);
          }
        } else {
          // If no backend draft, try local draft for Step 1
          const localDraft = localStorage.getItem(LOCAL_DRAFT_KEY);
          if (localDraft) reset(JSON.parse(localDraft));
        }
      } finally {
        setIsLoaded(true);
      }
    };
    initialize();
  }, [reset]);

  // 2. Prevent accidental exit if saving or failed
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === "Saving..." || saveStatus === "Failed") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveStatus]);

  // 3. Auto-Save Logic (Local for Step 1, Backend for Step 2+)
  useEffect(() => {
    const subscription = watch((value) => {
      if (!isLoaded || isLocked || step === 5) return;

      const currentString = JSON.stringify(value);
      if (currentString === lastSavedData.current) return;

      // If we don't have a candidateId, save locally (Step 1)
      if (!candidateId) {
        localStorage.setItem(LOCAL_DRAFT_KEY, currentString);
        return;
      }

      // If we do have a candidateId, debounce a PATCH to the backend
      setSaveStatus("Saving...");
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          // Clean empty optional fields for PATCH
          const payload = { ...value } as any;
          Object.keys(payload).forEach((key) => {
            if (payload[key] === "") payload[key] = undefined;
          });

          await candidateRegistrationService.patchDraft(candidateId, payload);
          setSaveStatus("Saved");
          lastSavedData.current = currentString;
        } catch (e) {
          console.error("Draft Auto-Save Failed", e);
          setSaveStatus("Failed");
        }
      }, 1500); // 1.5s debounce
    });
    return () => subscription.unsubscribe();
  }, [watch, isLoaded, isLocked, candidateId, step]);

  const handleDeleteDraft = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus draft ini? Semua data yang belum disubmit akan hilang.")) return;
    try {
      setLoading(true);
      if (candidateId) {
        await candidateRegistrationService.deleteDraft(candidateId);
      }
      localStorage.removeItem(ID_DRAFT_KEY);
      localStorage.removeItem(LOCAL_DRAFT_KEY);
      window.location.reload();
    } catch (e) {
      alert("Gagal menghapus draft. Silakan coba lagi.");
      setLoading(false);
    }
  };

  const onNextStep1 = async () => {
    const valid = await trigger(["full_name", "nickname", "email", "phone", "gender", "birth_place", "birth_date"]);
    if (valid) {
      // If valid, transition from Local Draft to Backend Draft
      if (!candidateId) {
        if (!musyawarahId) return setError("Sistem gagal memuat ID Acara. Coba refresh halaman.");
        
        setSaveStatus("Saving...");
        try {
          const data = getValues();
          const cand = await candidateRegistrationService.registerCandidate({
            musyawarah_id: musyawarahId,
            full_name: data.full_name,
            nickname: data.nickname || undefined,
            email: data.email,
            phone: data.phone,
            gender: data.gender,
            birth_place: data.birth_place || undefined,
            birth_date: data.birth_date || undefined,
          });
          setCandidateId(cand.id);
          localStorage.setItem(ID_DRAFT_KEY, cand.id);
          localStorage.removeItem(LOCAL_DRAFT_KEY);
          setSaveStatus("Saved");
          lastSavedData.current = JSON.stringify(getValues());
        } catch (e: any) {
          console.error(e);
          setSaveStatus("Failed");
          setError(e?.response?.data?.message || "Gagal membuat draft pendaftaran di server.");
          return;
        }
      }
      setStep(2);
    }
  };

  const onNextStep2 = async () => {
    const valid = await trigger(["occupation", "organization", "address"]);
    if (valid) setStep(3);
  };

  const onNextStep3 = async () => {
    const valid = await trigger(["biography", "motivation", "vision", "mission"]);
    if (valid) {
      // Ensure any pending save completes before previewing
      if (saveStatus === "Saving...") {
        // Just wait for auto-save to finish or fail
        setTimeout(onNextStep3, 500);
        return;
      }
      setStep(4);
    }
  };

  const onSubmit = async () => {
    if (!candidateId) return;

    setLoading(true);
    setError(null);
    try {
      const submitted = await candidateRegistrationService.submitCandidate(candidateId);

      // Lock local storage
      localStorage.removeItem(ID_DRAFT_KEY);
      localStorage.removeItem(LOCAL_DRAFT_KEY);
      
      setIsLocked(true);
      setSuccessData({ 
        regNumber: submitted.registration_number, 
        name: submitted.full_name
      });
      setStep(5);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Terjadi kesalahan sistem saat submit.");
    } finally {
      setLoading(false);
    }
  };

  const v = getValues();

  if (!isLoaded) return null; // Prevent hydration mismatch

  if (isLocked && step < 5) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
         <div className="bg-white border border-slate-200 rounded-3xl p-10 max-w-lg shadow-sm">
            <Lock className="w-16 h-16 text-slate-400 mx-auto mb-6" />
            <h1 className="text-2xl font-black mb-3">Pendaftaran Dikunci</h1>
            <p className="text-slate-500 mb-6">Pendaftaran Anda telah di-submit dan sedang menunggu verifikasi panitia. Form ini tidak dapat diubah lagi.</p>
            <Link href="/" className="bg-slate-900 text-white font-bold py-3.5 px-6 rounded-xl hover:bg-slate-800">
              Kembali ke Beranda
            </Link>
         </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-[800px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Batal
          </Link>
          <span className="font-bold text-slate-900 text-sm tracking-tight hidden sm:block">Pendaftaran Bakal Calon</span>
          
          <div className="flex items-center gap-4">
            {candidateId && step < 5 && (
              <button onClick={handleDeleteDraft} disabled={loading} className="text-red-500 hover:text-red-600 text-sm font-semibold flex items-center gap-1.5 transition-colors">
                <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Hapus Draft</span>
              </button>
            )}
            {step < 5 && (
              <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border ${
                saveStatus === "Saved" ? "text-emerald-700 bg-emerald-50 border-emerald-200" :
                saveStatus === "Saving..." ? "text-amber-700 bg-amber-50 border-amber-200" :
                saveStatus === "Failed" ? "text-red-700 bg-red-50 border-red-200" :
                "text-slate-600 bg-slate-100 border-slate-200"
              }`}>
                {saveStatus === "Saved" && <Save className="w-3.5 h-3.5" />}
                {saveStatus === "Saving..." && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {saveStatus === "Failed" && <AlertCircle className="w-3.5 h-3.5" />}
                {saveStatus === "Idle" && <Save className="w-3.5 h-3.5" />}
                {saveStatus === "Idle" ? (candidateId ? "Draft Lokal" : "Belum Disimpan") : saveStatus}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-[800px] mx-auto px-6 pt-10">
        {step < 5 && (
          <div className="mb-10 overflow-x-auto pb-4 hide-scrollbar">
            <div className="flex items-center text-xs font-semibold uppercase tracking-widest text-slate-400 min-w-max">
              <span className={step >= 1 ? "text-primary" : ""}>1. Personal</span>
              <span className="w-8 border-t border-slate-200 mx-3" />
              <span className={step >= 2 ? "text-primary" : ""}>2. Profesi</span>
              <span className="w-8 border-t border-slate-200 mx-3" />
              <span className={step >= 3 ? "text-primary" : ""}>3. Profil</span>
              <span className="w-8 border-t border-slate-200 mx-3" />
              <span className={step >= 4 ? "text-primary" : ""}>4. Preview</span>
            </div>
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: PERSONAL INFORMATION */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <h1 className="text-3xl font-black tracking-tight mb-2">Informasi Personal</h1>
                <p className="text-slate-500 mb-8">Lengkapi identitas Anda. Data akan dibuatkan Draft otomatis setelah tahap ini selesai.</p>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                    {error}
                  </div>
                )}

                <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <InputGroup label="Nama Lengkap" error={errors.full_name?.message}>
                    <input {...register("full_name")} type="text" className="input-lg" placeholder="Sesuai KTP" />
                  </InputGroup>
                  <InputGroup label="Nama Panggilan (Opsional)" error={errors.nickname?.message}>
                    <input {...register("nickname")} type="text" className="input-lg" placeholder="Nama Panggilan" />
                  </InputGroup>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <InputGroup label="Email" error={errors.email?.message}>
                      <input {...register("email")} type="email" className="input-lg" placeholder="email@contoh.com" />
                    </InputGroup>
                    <InputGroup label="Nomor Telepon / WhatsApp" error={errors.phone?.message}>
                      <input {...register("phone")} type="tel" className="input-lg" placeholder="0812..." />
                    </InputGroup>
                  </div>
                  <InputGroup label="Jenis Kelamin" error={errors.gender?.message}>
                    <select {...register("gender")} className="input-lg bg-white">
                      <option value="">Pilih Jenis Kelamin</option>
                      <option value="MALE">Laki-Laki</option>
                      <option value="FEMALE">Perempuan</option>
                    </select>
                  </InputGroup>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <InputGroup label="Tempat Lahir" error={errors.birth_place?.message}>
                      <input {...register("birth_place")} type="text" className="input-lg" placeholder="Kota Kelahiran" />
                    </InputGroup>
                    <InputGroup label="Tanggal Lahir" error={errors.birth_date?.message}>
                      <input {...register("birth_date")} type="date" className="input-lg" />
                    </InputGroup>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button type="button" onClick={onNextStep1} disabled={saveStatus === "Saving..."} className="w-full sm:w-auto bg-primary text-white font-bold py-4 px-10 rounded-xl hover:bg-primary-active flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                    {saveStatus === "Saving..." ? "Membuat Draft..." : "Lanjutkan"} <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: PROFESSIONAL INFORMATION */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <h1 className="text-3xl font-black tracking-tight mb-2">Informasi Profesional</h1>
                <p className="text-slate-500 mb-8">Draft otomatis tersimpan saat Anda mengetik. Anda bisa keluar dan melanjutkannya nanti.</p>

                <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <InputGroup label="Pekerjaan / Jabatan" error={errors.occupation?.message}>
                      <input {...register("occupation")} type="text" className="input-lg" placeholder="Contoh: Direktur Utama" />
                    </InputGroup>
                    <InputGroup label="Instansi / Organisasi" error={errors.organization?.message}>
                      <input {...register("organization")} type="text" className="input-lg" placeholder="Contoh: PT Teknologi Indonesia" />
                    </InputGroup>
                  </div>
                  <InputGroup label="Alamat Lengkap" error={errors.address?.message}>
                    <textarea {...register("address")} rows={4} className="input-lg resize-none" placeholder="Masukkan alamat lengkap sesuai domisili" />
                  </InputGroup>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
                  <button type="button" onClick={() => setStep(1)} className="w-full sm:w-auto bg-slate-100 text-slate-700 font-bold py-4 px-10 rounded-xl hover:bg-slate-200 transition-colors">
                    Kembali
                  </button>
                  <button type="button" onClick={onNextStep2} className="w-full sm:w-auto bg-primary text-white font-bold py-4 px-10 rounded-xl hover:bg-primary-active flex items-center justify-center gap-2 transition-colors">
                    Lanjutkan <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: CANDIDATE PROFILE */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <h1 className="text-3xl font-black tracking-tight mb-2">Profil & Visi Misi</h1>
                <p className="text-slate-500 mb-8">Jabarkan profil, visi, dan misi Anda untuk posisi ini.</p>

                <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <InputGroup label="Biografi Singkat" error={errors.biography?.message}>
                    <textarea {...register("biography")} rows={4} className="input-lg resize-none" placeholder="Ceritakan latar belakang dan pengalaman Anda (Min. 50 karakter)" />
                  </InputGroup>
                  <InputGroup label="Motivasi Pencalonan" error={errors.motivation?.message}>
                    <textarea {...register("motivation")} rows={4} className="input-lg resize-none" placeholder="Mengapa Anda mencalonkan diri? (Min. 50 karakter)" />
                  </InputGroup>
                  <InputGroup label="Visi" error={errors.vision?.message}>
                    <textarea {...register("vision")} rows={3} className="input-lg resize-none" placeholder="Visi yang ingin Anda capai" />
                  </InputGroup>
                  <InputGroup label="Misi" error={errors.mission?.message}>
                    <textarea {...register("mission")} rows={5} className="input-lg resize-none" placeholder="Langkah-langkah untuk mencapai visi (1 misi per baris disarankan)" />
                  </InputGroup>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
                  <button type="button" onClick={() => setStep(2)} className="w-full sm:w-auto bg-slate-100 text-slate-700 font-bold py-4 px-10 rounded-xl hover:bg-slate-200 transition-colors">
                    Kembali
                  </button>
                  <button type="button" onClick={onNextStep3} className="w-full sm:w-auto bg-primary text-white font-bold py-4 px-10 rounded-xl hover:bg-primary-active flex items-center justify-center gap-2 transition-colors">
                    Preview Data <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: PREVIEW */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <h1 className="text-3xl font-black tracking-tight mb-2">Preview Data</h1>
                <p className="text-slate-500 mb-8">Pastikan seluruh data pendaftaran Bakal Calon Anda sudah benar. Setelah disubmit, data tidak dapat diubah lagi.</p>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-8 shadow-sm">
                  {/* Personal */}
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                      <h3 className="font-bold text-lg text-slate-800">1. Personal</h3>
                      <button type="button" onClick={() => setStep(1)} className="text-sm font-bold text-primary hover:underline">Ubah</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                      <ReviewItem label="Nama Lengkap" value={v.full_name} />
                      <ReviewItem label="Nama Panggilan" value={v.nickname || "-"} />
                      <ReviewItem label="Email" value={v.email} />
                      <ReviewItem label="No. Telepon" value={v.phone} />
                      <ReviewItem label="Jenis Kelamin" value={v.gender === "MALE" ? "Laki-Laki" : "Perempuan"} />
                      <ReviewItem label="Tempat, Tgl Lahir" value={`${v.birth_place}, ${v.birth_date}`} />
                    </div>
                  </div>

                  {/* Profesional */}
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                      <h3 className="font-bold text-lg text-slate-800">2. Profesional</h3>
                      <button type="button" onClick={() => setStep(2)} className="text-sm font-bold text-primary hover:underline">Ubah</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                      <ReviewItem label="Pekerjaan" value={v.occupation || "-"} />
                      <ReviewItem label="Organisasi" value={v.organization || "-"} />
                      <div className="sm:col-span-2">
                        <ReviewItem label="Alamat" value={v.address || "-"} />
                      </div>
                    </div>
                  </div>

                  {/* Profil */}
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                      <h3 className="font-bold text-lg text-slate-800">3. Profil & Visi Misi</h3>
                      <button type="button" onClick={() => setStep(3)} className="text-sm font-bold text-primary hover:underline">Ubah</button>
                    </div>
                    <div className="space-y-4">
                      <ReviewItem label="Biografi" value={v.biography || "-"} />
                      <ReviewItem label="Motivasi" value={v.motivation || "-"} />
                      <ReviewItem label="Visi" value={v.vision || "-"} />
                      <ReviewItem label="Misi" value={v.mission || "-"} />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-6 flex items-start gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm">Gagal Mengirim Pendaftaran</h4>
                      <p className="text-sm mt-1">{error}</p>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
                  <button type="button" onClick={() => setStep(3)} disabled={loading} className="w-full sm:w-auto bg-slate-100 text-slate-700 font-bold py-4 px-10 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50">
                    Kembali
                  </button>
                  <button type="button" onClick={onSubmit} disabled={loading || saveStatus === "Saving..."} className="w-full sm:w-auto bg-emerald-600 text-white font-bold py-4 px-10 rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-lg shadow-emerald-600/20">
                    {loading ? "Memproses..." : "Kirim Pendaftaran"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: SUCCESS */}
            {step === 5 && successData && (
              <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="bg-white border border-slate-200 rounded-[2rem] p-8 sm:p-14 text-center shadow-xl shadow-slate-200/50">
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">Pendaftaran Disubmit!</h1>
                  <p className="text-slate-500 mb-10 max-w-md mx-auto leading-relaxed">
                    Terima kasih <strong>{successData.name}</strong>, pendaftaran Anda sebagai Bakal Calon telah berhasil disubmit dan saat ini sedang menunggu proses verifikasi oleh panitia.
                  </p>
                  
                  <div className="inline-block p-8 bg-slate-50 border border-slate-100 rounded-3xl mb-10 min-w-[280px]">
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-2">Nomor Registrasi Anda</p>
                    <div className="font-mono font-black text-2xl tracking-widest text-slate-900 bg-white border border-slate-200 py-3 px-6 rounded-xl inline-block shadow-sm">
                      {successData.regNumber}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button type="button" onClick={() => window.print()} className="w-full sm:w-auto bg-slate-900 text-white font-bold py-4 px-8 rounded-xl hover:bg-slate-800 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20">
                      <Download className="w-4 h-4" /> Cetak Tanda Terima
                    </button>
                    <Link href="/" className="w-full sm:w-auto bg-slate-100 text-slate-700 font-bold py-4 px-8 rounded-xl hover:bg-slate-200 flex items-center justify-center gap-2">
                      Kembali ke Beranda
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      {/* Global Form Styles for Wizard */}
      <style dangerouslySetInnerHTML={{__html: `
        .input-lg {
          width: 100%;
          padding: 1rem 1.25rem;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          background-color: #f8fafc;
          font-size: 1rem;
          color: #0f172a;
          transition: all 0.2s;
          outline: none;
        }
        .input-lg:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
          background-color: #ffffff;
        }
        .input-lg::placeholder {
          color: #94a3b8;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </main>
  );
}

function InputGroup({ label, error, children }: { label: string, error?: string, children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-slate-700">{label}</label>
      {children}
      {error && <span className="text-sm text-red-500 font-medium">{error}</span>}
    </div>
  );
}

function ReviewItem({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-500 mb-1">{label}</p>
      <p className="font-medium text-slate-900 whitespace-pre-wrap">{value}</p>
    </div>
  );
}
