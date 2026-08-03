"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, Search, X, AlertCircle, RefreshCw, Plus } from "lucide-react";
import { landingService } from "@/services/landing";
import { participantRegistrationService } from "@/services/participant-registration";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SearchableSelect } from "@/components/ui/searchable-select";

import { publicMasterDataService, IndustrialArea, Company, JobTitle, Department } from "@/services/master-data";

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
    industrial_area: z.string().min(1, "Kawasan industri harus dipilih"),
    job_title: z.string().min(1, "Jabatan harus diisi"),
    department: z.string().optional(),
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface SuccessInfo {
  regNumber: string;
  qr: string;
  fullName: string;
  musyawarahName: string;
  submittedAt: string;
}

const STEPS = [
  { id: 1, label: "Personal" },
  { id: 2, label: "Pekerjaan" },
  { id: 3, label: "Review" },
];

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<SuccessInfo | null>(null);
  const [musyawarahId, setMusyawarahId] = useState<string>("");
  const [musyawarahName, setMusyawarahName] = useState<string>("MUSKOM");
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Master Data States
  const [masterAreas, setMasterAreas] = useState<IndustrialArea[]>([]);
  const [masterCompanies, setMasterCompanies] = useState<Company[]>([]);
  const [masterJobTitles, setMasterJobTitles] = useState<JobTitle[]>([]);
  const [masterDepartments, setMasterDepartments] = useState<Department[]>([]);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
  });

  useEffect(() => {
    landingService.getPublicHome().then((data) => {
      if (data?.event?.id) setMusyawarahId(data.event.id);
      if (data?.event?.name) setMusyawarahName(data.event.name);
    });

    // Fetch Master Data
    Promise.all([
      publicMasterDataService.getIndustrialAreas(),
      publicMasterDataService.getCompanies(),
      publicMasterDataService.getJobTitles(),
      publicMasterDataService.getDepartments()
    ]).then(([areas, comps, jobs, depts]) => {
      setMasterAreas(areas);
      setMasterCompanies(comps);
      setMasterJobTitles(jobs);
      setMasterDepartments(depts);
    });

    const saved = localStorage.getItem("participant_registration_draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        reset(parsed);
      } catch {
        // ignore parse errors
      }
    }
    setIsLoaded(true);
  }, [reset]);

  useEffect(() => {
    if (!isLoaded) return;
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
  }, [watch, isLoaded]);

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
      setError("Data acara belum dimuat. Mohon muat ulang halaman.");
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
      const msg = e?.response?.data?.message || e?.message || "Terjadi kesalahan sistem";
      // User-friendly duplicate email message
      if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("duplicate")) {
        setError("Email ini sudah terdaftar pada acara ini. Gunakan email lain atau hubungi panitia.");
      } else {
        setError(msg);
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
    setStep(1);
  };

  const v = getValues();

  if (!isLoaded) return null;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-32">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-[680px] mx-auto px-5 h-14 flex items-center justify-between">
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

      <div className="max-w-[680px] mx-auto px-5 pt-8">
        {/* PROGRESS STEPPER */}
        {step < 4 && (
          <div className="mb-8">
            <div className="flex items-center">
              {STEPS.map((s, idx) => (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        step > s.id
                          ? "bg-emerald-500 text-white"
                          : step === s.id
                          ? "bg-primary text-white ring-4 ring-primary/20"
                          : "bg-slate-200 text-slate-400"
                      }`}
                    >
                      {step > s.id ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        s.id
                      )}
                    </div>
                    <span
                      className={`mt-1.5 text-xs font-semibold transition-colors ${
                        step === s.id
                          ? "text-primary"
                          : step > s.id
                          ? "text-emerald-600"
                          : "text-slate-400"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mb-5 mx-2 transition-colors duration-300 ${
                        step > s.id ? "bg-emerald-400" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

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
                <h1 className="text-2xl font-black tracking-tight mb-1">
                  Informasi Personal
                </h1>
                <p className="text-slate-500 text-sm mb-7">
                  Mohon isi data diri Anda dengan benar.
                </p>

                <div className="space-y-5">
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
                <h1 className="text-2xl font-black tracking-tight mb-1">
                  Informasi Pekerjaan
                </h1>
                <p className="text-slate-500 text-sm mb-7">
                  Lengkapi data pekerjaan Anda saat ini.
                </p>

                <div className="space-y-5">
                  <InputGroup label="Kawasan Industri" required error={errors.industrial_area?.message}>
                    <Controller
                      name="industrial_area"
                      control={control}
                      render={({ field }) => (
                        <SearchableSelect
                          id="industrial_area"
                          value={field.value || ""}
                          onChange={field.onChange}
                          options={masterAreas.map(a => a.name)}
                          placeholder="Pilih kawasan industri..."
                          hasError={!!errors.industrial_area}
                        />
                      )}
                    />
                  </InputGroup>

                  <InputGroup label="Nama Perusahaan" required error={errors.company_name?.message}>
                    <Controller
                      name="company_name"
                      control={control}
                      render={({ field }) => (
                        <SearchableSelect
                          id="company_name"
                          value={field.value || ""}
                          onChange={field.onChange}
                          options={masterCompanies
                            .filter(c => {
                              // Filter by selected industrial area if any
                              const selectedArea = watch("industrial_area");
                              if (!selectedArea) return true;
                              return c.industrial_area === selectedArea;
                            })
                            .map(c => c.name)}
                          placeholder="Pilih perusahaan..."
                          hasError={!!errors.company_name}
                        />
                      )}
                    />
                  </InputGroup>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InputGroup label="Jabatan" required error={errors.job_title?.message}>
                      <Controller
                        name="job_title"
                        control={control}
                        render={({ field }) => (
                          <SearchableSelect
                            id="job_title"
                            value={field.value || ""}
                            onChange={field.onChange}
                            options={masterJobTitles.map(j => j.name)}
                            placeholder="Pilih jabatan..."
                            hasError={!!errors.job_title}
                          />
                        )}
                      />
                    </InputGroup>
                    <InputGroup label="Departemen" error={errors.department?.message}>
                      <Controller
                        name="department"
                        control={control}
                        render={({ field }) => (
                          <SearchableSelect
                            id="department"
                            value={field.value || ""}
                            onChange={field.onChange}
                            options={masterDepartments.map(d => d.name)}
                            placeholder="Pilih departemen... (Opsional)"
                            hasError={!!errors.department}
                          />
                        )}
                      />
                    </InputGroup>
                  </div>
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
                <h1 className="text-2xl font-black tracking-tight mb-1">
                  Review Data
                </h1>
                <p className="text-slate-500 text-sm mb-7">
                  Pastikan seluruh data sudah benar sebelum mendaftar.
                </p>

                <div className="space-y-4">
                  {/* Personal Section */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-100">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Informasi Personal
                      </h3>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Ubah
                      </button>
                    </div>
                    <div className="p-5 space-y-4">
                      <ReviewRow label="Nama Lengkap" value={v.full_name} />
                      <ReviewRow label="Nama Panggilan" value={v.nickname || "—"} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ReviewRow label="Email" value={v.email} />
                        <ReviewRow label="WhatsApp" value={v.phone} />
                      </div>
                    </div>
                  </div>

                  {/* Employment Section */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-100">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Informasi Pekerjaan
                      </h3>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Ubah
                      </button>
                    </div>
                    <div className="p-5 space-y-4">
                      <ReviewRow label="Perusahaan" value={v.company_name} />
                      <ReviewRow
                        label="Kawasan Industri"
                        value={v.industrial_area}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ReviewRow label="Jabatan" value={v.job_title} />
                        <ReviewRow label="Departemen" value={v.department || "—"} />
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
                    <p className="text-sm text-primary font-semibold">
                      📋 Ringkasan Pendaftaran
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      Pendaftaran sebagai <strong>Peserta</strong> pada acara{" "}
                      <strong>{musyawarahName || "MUSKOM"}</strong>. Status awal akan
                      menjadi <span className="font-bold text-amber-600">Pending Verifikasi</span>.
                    </p>
                  </div>
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
                <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center shadow-sm">
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
                    Pendaftaran Berhasil!
                  </h1>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto">
                    Terima kasih. Data Anda telah diterima dan menunggu verifikasi panitia.
                  </p>

                  {/* Registration detail card */}
                  <div className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-3">
                    <DetailRow label="Nama Peserta" value={successInfo.fullName} />
                    <DetailRow label="Nomor Registrasi" value={successInfo.regNumber} mono />
                    <DetailRow label="Acara" value={successInfo.musyawarahName} />
                    <DetailRow label="Waktu Daftar" value={successInfo.submittedAt} />
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-slate-500 font-medium">Status</span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                        Pending Verifikasi
                      </span>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row items-stretch gap-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-bold py-3.5 px-5 rounded-xl hover:bg-slate-200 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Daftarkan Peserta Lain
                    </button>
                    <Link
                      href="/"
                      className="flex-1 flex items-center justify-center bg-primary text-white font-bold py-3.5 px-5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
                    >
                      Kembali ke Beranda
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      {/* ─── FIXED BOTTOM ACTION BAR ─── */}
      <AnimatePresence>
        {step < 4 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-slate-200 p-4"
          >
            <div className="max-w-[680px] mx-auto flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4)}
                  disabled={loading}
                  className="flex-shrink-0 bg-slate-100 text-slate-700 font-bold py-3.5 px-5 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50 text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}

              {step === 1 && (
                <button
                  type="button"
                  onClick={onNextStep1}
                  className="flex-1 bg-primary text-white font-bold py-3.5 px-6 rounded-xl hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors text-sm"
                >
                  Lanjutkan <ArrowRight className="w-4 h-4" />
                </button>
              )}
              {step === 2 && (
                <button
                  type="button"
                  onClick={onNextStep2}
                  className="flex-1 bg-primary text-white font-bold py-3.5 px-6 rounded-xl hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors text-sm"
                >
                  Review Data <ArrowRight className="w-4 h-4" />
                </button>
              )}
              {step === 3 && (
                <button
                  type="submit"
                  form=""
                  onClick={handleSubmit(onSubmit)}
                  disabled={loading}
                  className="flex-1 bg-emerald-600 text-white font-bold py-3.5 px-6 rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-60 text-sm shadow-lg shadow-emerald-600/20"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Selesaikan Pendaftaran
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400 font-medium mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-slate-900 break-words">{value}</p>
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
