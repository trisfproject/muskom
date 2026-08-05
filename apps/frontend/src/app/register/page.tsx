"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { landingService } from "@/services/landing";
import { participantRegistrationService } from "@/services/participant-registration";
import api from "@/lib/api";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const registerSchema = z
  .object({
    full_name: z.string().min(3, "Nama lengkap harus diisi (min. 3 karakter)"),
    nickname: z.string().optional(),
    email: z.string().email("Format email tidak valid"),
    phone: z
      .string()
      .min(9, "Nomor WhatsApp harus diisi (min. 9 angka)")
      .regex(/^[0-9+\-\s()]+$/, "Format nomor tidak valid"),
    company_name: z.string().min(1, "Nama perusahaan harus diisi"),
    industrial_area: z.string().min(1, "Kawasan industri harus diisi"),
    job_title: z.string().min(1, "Jabatan harus diisi"),
    department: z.string().optional(),
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface SuccessInfo {
  regNumber: string;
  qr: string;
  fullName: string;
  email: string;
  musyawarahName: string;
  submittedAt: string;
}

const STEPS = [
  { id: 1, label: "Personal" },
  { id: 2, label: "Profesi" },
  { id: 3, label: "Review" },
];

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<SuccessInfo | null>(null);
  const [musyawarahId, setMusyawarahId] = useState<string>("");
  const [musyawarahName, setMusyawarahName] = useState<string>("MUSKOM");
  const [eventStatus, setEventStatus] = useState<"loading" | "open" | "closed" | "not_started" | "no_event">("loading");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [resendCooldown, setResendCooldown] = useState(0);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const data = await landingService.getPublicHome();
        if (!mounted) return;

        if (!data?.event?.id) {
          setEventStatus("no_event");
          return;
        }

        setMusyawarahId(data.event.id);
        if (data.event.name) setMusyawarahName(data.event.name);

        if (data.general?.registration_enabled === false) {
          setEventStatus("not_started");
          return;
        }

        const limit = data.settings?.participant_limit || 0;
        const count = data.settings?.participant_count || 0;
        if (limit > 0 && count >= limit) {
          setEventStatus("closed");
          return;
        }

        setEventStatus("open");

        const saved = localStorage.getItem("participant_registration_draft");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            reset(parsed);
          } catch {
            // ignore parse errors
          }
        }
      } catch (err) {
        if (mounted) setEventStatus("no_event");
      }
    };
    init();
    return () => { mounted = false; };
  }, [reset]);

  useEffect(() => {
    if (eventStatus !== "open") return;
    const subscription = watch((value) => {
      setSaveStatus("saving");
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        localStorage.setItem("participant_registration_draft", JSON.stringify(value));
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      }, 600);
    });
    return () => {
      subscription.unsubscribe();
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [watch, eventStatus]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const onNextStep1 = async () => {
    const valid = await trigger(["full_name", "email", "phone"]);
    if (valid) setStep(2);
  };

  const onNextStep2 = async () => {
    const valid = await trigger([
      "company_name",
      "industrial_area",
      "job_title",
    ]);
    if (valid) setStep(3);
  };

  const onSubmit = async (data: RegisterFormData) => {
    if (!musyawarahId) {
      setError("Data acara tidak ditemukan atau belum dimuat. Mohon muat ulang halaman.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await participantRegistrationService.register({
        full_name: data.full_name,
        nickname: data.nickname,
        email: data.email,
        phone: data.phone,
        company_name: data.company_name,
        industrial_area: data.industrial_area,
        job_title: data.job_title,
        department: data.department,
        musyawarah_id: musyawarahId,
      });

      if (res?.registration_number) {
        localStorage.removeItem("participant_registration_draft");
        setSuccessInfo({
          regNumber: res.registration_number,
          qr: res.qr_token || "",
          fullName: data.full_name,
          email: data.email,
          musyawarahName,
          submittedAt: new Date().toLocaleString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
        setStep(4);
      } else {
        throw new Error("Gagal mendapatkan nomor registrasi");
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      const rawMsg = e?.response?.data?.message || e?.message || "Internal server error.";
      const msg = rawMsg.toLowerCase();
      
      if (msg.includes("already registered") || msg.includes("duplicate")) {
        setError("Email ini sudah terdaftar. Silakan gunakan email lain.");
      } else if (msg.includes("closed") || msg.includes("ditutup")) {
        setError("Pendaftaran sudah ditutup.");
      } else if (msg.includes("quota") || msg.includes("limit") || msg.includes("penuh")) {
        setError("Kuota peserta telah terpenuhi.");
      } else {
        setError(rawMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    reset();
    setError(null);
    setSuccessInfo(null);
    setSaveStatus("idle");
    setResendCooldown(0);
    setStep(1);
  };

  const handleResendVerification = async () => {
    if (!successInfo?.email) return;
    try {
      await api.post("/public/participants/resend-verification", { email: successInfo.email });
      setResendCooldown(60); // 1 minute cooldown
    } catch (err: any) {
      // Error toast or something. For now just set a smaller cooldown if it fails
      setResendCooldown(10);
    }
  };

  const v = getValues();

  if (eventStatus === "loading") {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900 pb-32">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
          <div className="max-w-[800px] mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-16 h-4 bg-slate-200 animate-pulse rounded" />
            </div>
            <div className="w-32 h-4 bg-slate-200 animate-pulse rounded hidden sm:block" />
            <div className="w-20 h-4 bg-slate-200 animate-pulse rounded" />
          </div>
        </header>
        <div className="max-w-[800px] mx-auto px-6 pt-10">
          <div className="mb-10 w-full h-8 bg-slate-200 animate-pulse rounded-lg" />
          <div className="w-48 h-8 bg-slate-200 animate-pulse rounded mb-2" />
          <div className="w-64 h-4 bg-slate-200 animate-pulse rounded mb-8" />
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="w-full h-12 bg-slate-100 animate-pulse rounded-xl" />
            <div className="w-full h-12 bg-slate-100 animate-pulse rounded-xl" />
            <div className="w-full h-12 bg-slate-100 animate-pulse rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-32">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-[800px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Batal
          </Link>
          <span className="font-bold text-slate-900 text-sm tracking-tight">
            Pendaftaran Peserta
          </span>
          {/* Draft status indicator */}
          <div className="w-24 flex justify-end">
            <AnimatePresence mode="wait">
              {saveStatus === "saving" && (
                <motion.span
                  key="saving"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-slate-400 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3 animate-spin" /> Menyimpan...
                </motion.span>
              )}
              {saveStatus === "saved" && (
                <motion.span
                  key="saved"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-emerald-600 flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" /> Tersimpan
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <div className="max-w-[800px] mx-auto px-6 pt-10">
        {/* PROGRESS STEPPER */}
        {step < 4 && eventStatus === "open" && (
          <div className="mb-10 overflow-x-auto pb-4 hide-scrollbar">
            <div className="flex items-center text-xs font-semibold uppercase tracking-widest text-slate-400 min-w-max">
              <span className={step >= 1 ? "text-primary" : ""}>1. Personal</span>
              <span className="w-8 border-t border-slate-200 mx-3" />
              <span className={step >= 2 ? "text-primary" : ""}>2. Profesi</span>
              <span className="w-8 border-t border-slate-200 mx-3" />
              <span className={step >= 3 ? "text-primary" : ""}>3. Review</span>
            </div>
          </div>
        )}

        {eventStatus === "no_event" && (
          <StatusMessage 
            icon={<AlertCircle className="w-9 h-9 text-amber-500" />}
            iconBg="bg-amber-50"
            title="Tidak Ada Acara Aktif"
            message="Saat ini belum ada Musyawarah yang sedang berlangsung. Silakan kembali lagi nanti."
          />
        )}
        {eventStatus === "not_started" && (
          <StatusMessage 
            icon={<AlertCircle className="w-9 h-9 text-blue-500" />}
            iconBg="bg-blue-50"
            title="Pendaftaran Belum Dibuka"
            message="Pendaftaran peserta untuk acara ini belum dibuka oleh panitia."
          />
        )}
        {eventStatus === "closed" && (
          <StatusMessage 
            icon={<AlertCircle className="w-9 h-9 text-red-500" />}
            iconBg="bg-red-50"
            title="Pendaftaran Ditutup"
            message="Pendaftaran telah ditutup atau kuota peserta telah terpenuhi. Terima kasih atas antusiasmenya."
          />
        )}
        
        {eventStatus === "open" && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {/* ─── STEP 1: PERSONAL ─── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-3xl font-black tracking-tight mb-2">
                  Informasi Personal
                </h1>
                <p className="text-slate-500 mb-8">
                  Mohon isi data diri Anda dengan benar.
                </p>

                <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InputGroup label="Nama Lengkap" required error={errors.full_name?.message}>
                      <input
                        {...register("full_name")}
                        type="text"
                        id="full_name"
                        className="input-lg"
                        placeholder="Sesuai KTP"
                        autoComplete="name"
                      />
                    </InputGroup>
                    <InputGroup label="Nama Panggilan" error={errors.nickname?.message}>
                      <input
                        {...register("nickname")}
                        type="text"
                        id="nickname"
                        className="input-lg"
                        placeholder="Opsional"
                        autoComplete="nickname"
                      />
                    </InputGroup>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InputGroup label="Email" required error={errors.email?.message}>
                      <input
                        {...register("email")}
                        type="email"
                        id="email"
                        className="input-lg"
                        placeholder="email@contoh.com"
                        autoComplete="email"
                      />
                    </InputGroup>
                    <InputGroup label="Nomor WhatsApp" required error={errors.phone?.message}>
                      <input
                        {...register("phone")}
                        type="tel"
                        id="phone"
                        className="input-lg"
                        placeholder="0812-xxxx-xxxx"
                        autoComplete="tel"
                      />
                    </InputGroup>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button type="button" onClick={onNextStep1} disabled={saveStatus === "saving"} className="w-full sm:w-auto bg-primary text-white font-bold py-4 px-10 rounded-xl hover:bg-primary-active flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                    {saveStatus === "saving" ? "Membuat Draft..." : "Lanjutkan"} <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── STEP 2: EMPLOYMENT ─── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-3xl font-black tracking-tight mb-2">
                  Informasi Profesional
                </h1>
                <p className="text-slate-500 mb-8">
                  Lengkapi data pekerjaan Anda saat ini.
                </p>

                <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <InputGroup label="Nama Perusahaan" required error={errors.company_name?.message}>
                    <input
                      {...register("company_name")}
                      type="text"
                      id="company_name"
                      className="input-lg"
                      placeholder="Masukkan nama perusahaan"
                    />
                  </InputGroup>

                  <InputGroup label="Kawasan Industri" required error={errors.industrial_area?.message}>
                    <input
                      {...register("industrial_area")}
                      type="text"
                      id="industrial_area"
                      className="input-lg"
                      placeholder="Masukkan kawasan industri"
                    />
                  </InputGroup>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InputGroup label="Jabatan" required error={errors.job_title?.message}>
                      <input
                        {...register("job_title")}
                        type="text"
                        id="job_title"
                        className="input-lg"
                        placeholder="Masukkan jabatan"
                      />
                    </InputGroup>
                    <InputGroup label="Departemen" error={errors.department?.message}>
                      <input
                        {...register("department")}
                        type="text"
                        id="department"
                        className="input-lg"
                        placeholder="Masukkan departemen (Opsional)"
                      />
                    </InputGroup>
                  </div>
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

            {/* ─── STEP 3: REVIEW ─── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-3xl font-black tracking-tight mb-2">
                  Review Data
                </h1>
                <p className="text-slate-500 mb-8">
                  Pastikan seluruh data sudah benar sebelum mendaftar.
                </p>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-8 shadow-sm">
                  {/* Personal Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                      <h3 className="font-bold text-lg text-slate-800">1. Personal</h3>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-sm font-bold text-primary hover:underline"
                      >
                        Ubah
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                      <ReviewItem label="Nama Lengkap" value={v.full_name} />
                      <ReviewItem label="Nama Panggilan" value={v.nickname || "-"} />
                      <ReviewItem label="Email" value={v.email} />
                      <ReviewItem label="WhatsApp" value={v.phone} />
                    </div>
                  </div>

                  {/* Employment Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                      <h3 className="font-bold text-lg text-slate-800">2. Profesional</h3>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-sm font-bold text-primary hover:underline"
                      >
                        Ubah
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                      <ReviewItem label="Nama Perusahaan" value={v.company_name} />
                      <ReviewItem label="Kawasan Industri" value={v.industrial_area} />
                      <ReviewItem label="Jabatan" value={v.job_title} />
                      <ReviewItem label="Departemen" value={v.department || "-"} />
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-8 bg-primary/5 border border-primary/20 rounded-2xl p-5">
                  <p className="text-sm text-primary font-semibold">
                    📋 Ringkasan Pendaftaran
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    Pendaftaran sebagai <strong>Peserta</strong> pada acara{" "}
                    <strong>{musyawarahName || "MUSKOM"}</strong>. Status awal akan
                    menjadi <span className="font-bold text-amber-600">Pending Verifikasi</span>.
                  </p>
                </div>

                {error && (
                  <div className="mt-5 flex items-start gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Pendaftaran Gagal</p>
                      <p className="text-sm mt-0.5">{error}</p>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
                  <button type="button" onClick={() => setStep(2)} disabled={loading} className="w-full sm:w-auto bg-slate-100 text-slate-700 font-bold py-4 px-10 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50">
                    Kembali
                  </button>
                  <button type="button" onClick={handleSubmit(onSubmit)} disabled={loading || saveStatus === "saving"} className="w-full sm:w-auto bg-emerald-600 text-white font-bold py-4 px-10 rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-lg shadow-emerald-600/20">
                    {loading ? "Memproses..." : "Kirim Pendaftaran"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── STEP 4: SUCCESS ─── */}
            {step === 4 && successInfo && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white border border-slate-200 rounded-[2rem] p-8 sm:p-14 text-center shadow-xl shadow-slate-200/50">
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
                    Pendaftaran Berhasil!
                  </h1>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto">
                    Data Anda telah diterima. Kami telah mengirimkan tautan verifikasi ke email <strong className="text-slate-700">{successInfo.email}</strong>.
                    <br/><br/>
                    Silakan periksa kotak masuk (atau folder spam) Anda dan klik tautan tersebut untuk mengaktifkan akun Anda.
                  </p>

                  {/* Registration detail card */}
                  <div className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-3">
                    <DetailRow label="Nama Peserta" value={successInfo.fullName} />
                    <DetailRow label="Nomor Registrasi" value={successInfo.regNumber} mono />
                    <DetailRow label="Acara" value={successInfo.musyawarahName} />
                    <DetailRow label="Waktu Daftar" value={successInfo.submittedAt} />
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-slate-500 font-medium">Status</span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-200 text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 inline-block" />
                        Unverified
                      </span>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendCooldown > 0}
                      className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 font-bold py-4 px-10 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      {resendCooldown > 0 ? `Kirim Ulang (${resendCooldown}s)` : "Kirim Ulang Email"}
                    </button>
                    <Link
                      href="/"
                      className="w-full sm:w-auto bg-primary text-white font-bold py-4 px-10 rounded-xl hover:bg-primary-active flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary/20"
                    >
                      Kembali ke Beranda
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
        )}
      </div>

      {/* (Action bar removed to match candidate UI) */}

      <style dangerouslySetInnerHTML={{
        __html: `
          .input-lg {
            width: 100%;
            padding: 0.875rem 1rem;
            border-radius: 0.75rem;
            border: 1.5px solid #e2e8f0;
            background-color: #f8fafc;
            font-size: 0.9375rem;
            color: #0f172a;
            transition: all 0.15s;
            outline: none;
          }
          .input-lg:focus {
            border-color: var(--color-primary, #2563eb);
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
            background-color: #ffffff;
          }
          .input-lg:hover:not(:focus) {
            border-color: #cbd5e1;
          }
          .input-lg::placeholder {
            color: #94a3b8;
          }
          .input-lg-error {
            border-color: #ef4444 !important;
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
          }
        `
      }} />
    </main>
  );
}
// ─── Helper Components ────────────────────────────────────────────────────────
function StatusMessage({ icon, iconBg, title, message }: { icon: React.ReactNode; iconBg: string; title: string; message: string; }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-14 text-center shadow-sm"
    >
      <div className={`w-16 h-16 ${iconBg} rounded-2xl flex items-center justify-center mx-auto mb-5`}>
        {icon}
      </div>
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
        {title}
      </h1>
      <p className="text-slate-500 max-w-sm mx-auto mb-8">
        {message}
      </p>
      <Link
        href="/"
        className="inline-flex bg-slate-100 text-slate-700 font-bold py-3.5 px-8 rounded-xl hover:bg-slate-200 transition-colors"
      >
        Kembali ke Beranda
      </Link>
    </motion.div>
  );
}

function InputGroup({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <span className="text-xs text-red-500 font-medium flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </span>
      )}
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-500 mb-1">{label}</p>
      <p className="font-medium text-slate-900 whitespace-pre-wrap">{value}</p>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-slate-500 font-medium flex-shrink-0">{label}</span>
      <span
        className={`text-sm font-semibold text-slate-900 text-right ${
          mono ? "font-mono tracking-wider" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
