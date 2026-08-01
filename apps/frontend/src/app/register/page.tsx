"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, ArrowRight, CheckCircle2, Download } from "lucide-react";
import { landingService } from "@/services/landing";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const registerSchema = z.object({
  full_name: z.string().min(3, "Nama lengkap harus diisi (min. 3 karakter)"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().min(10, "Nomor telepon harus diisi (min. 10 angka)"),
  company: z.string().min(1, "Perusahaan/Instansi harus diisi"),
  job_title: z.string().min(1, "Jabatan harus diisi"),
  participant_category: z.string().min(1, "Status keanggotaan harus dipilih"),
  region: z.string().min(1, "Wilayah/Cabang harus diisi"),
  community: z.string().min(1, "Nama komunitas/organisasi harus diisi"),
  special_notes: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ regNumber: string; qr: string } | null>(null);

  const { register, handleSubmit, trigger, getValues, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched"
  });

  const onNextStep1 = async () => {
    const valid = await trigger(["full_name", "email", "phone", "company", "job_title", "participant_category"]);
    if (valid) setStep(2);
  };

  const onNextStep2 = async () => {
    const valid = await trigger(["region", "community"]);
    if (valid) setStep(3);
  };

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await landingService.registerParticipant(data);
      if (res && res.registration_number) {
        setSuccessData({ 
          regNumber: res.registration_number as string, 
          qr: (res.qr_token as string) || "" 
        });
        setStep(4);
      } else {
        throw new Error("Gagal mendapatkan nomor registrasi");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }, message?: string };
      setError(error?.response?.data?.message || error.message || "Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  const v = getValues();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-[720px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Batal
          </Link>
          <span className="font-bold text-slate-900 text-sm tracking-tight">Pendaftaran Peserta</span>
          <div className="w-16" />
        </div>
      </header>

      <div className="max-w-[720px] mx-auto px-6 pt-10">
        {step < 4 && (
          <div className="mb-10">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
              <span className={step === 1 ? "text-blue-600" : ""}>Personal</span>
              <span className="flex-1 border-t border-slate-200 mx-4" />
              <span className={step === 2 ? "text-blue-600" : ""}>Keanggotaan</span>
              <span className="flex-1 border-t border-slate-200 mx-4" />
              <span className={step === 3 ? "text-blue-600" : ""}>Review</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <h1 className="text-3xl font-black tracking-tight mb-2">Informasi Personal</h1>
                <p className="text-slate-500 mb-8">Mohon lengkapi data diri Anda dengan benar.</p>

                <div className="space-y-5">
                  <InputGroup label="Nama Lengkap" error={errors.full_name?.message}>
                    <input {...register("full_name")} type="text" className="input-lg" placeholder="Sesuai KTP" />
                  </InputGroup>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InputGroup label="Email" error={errors.email?.message}>
                      <input {...register("email")} type="email" className="input-lg" placeholder="email@contoh.com" />
                    </InputGroup>
                    <InputGroup label="Nomor Telepon / WhatsApp" error={errors.phone?.message}>
                      <input {...register("phone")} type="tel" className="input-lg" placeholder="0812..." />
                    </InputGroup>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InputGroup label="Instansi / Perusahaan" error={errors.company?.message}>
                      <input {...register("company")} type="text" className="input-lg" placeholder="Nama Perusahaan" />
                    </InputGroup>
                    <InputGroup label="Jabatan" error={errors.job_title?.message}>
                      <input {...register("job_title")} type="text" className="input-lg" placeholder="CTO, Manager, dll" />
                    </InputGroup>
                  </div>
                  <InputGroup label="Status Keanggotaan KOMITKABE" error={errors.participant_category?.message}>
                    <select {...register("participant_category")} className="input-lg bg-white">
                      <option value="">Pilih Status</option>
                      <option value="MEMBER">Anggota Aktif</option>
                      <option value="NON_MEMBER">Non-Anggota / Umum</option>
                      <option value="VIP">Tamu Undangan (VIP)</option>
                    </select>
                  </InputGroup>
                </div>

                <div className="mt-10 fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 sm:relative sm:p-0 sm:border-0 sm:bg-transparent">
                  <button type="button" onClick={onNextStep1} className="w-full sm:w-auto bg-blue-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors">
                    Lanjutkan <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <h1 className="text-3xl font-black tracking-tight mb-2">Informasi Keanggotaan</h1>
                <p className="text-slate-500 mb-8">Lengkapi data asal wilayah dan komunitas Anda.</p>

                <div className="space-y-5">
                  <InputGroup label="Wilayah / Cabang" error={errors.region?.message}>
                    <input {...register("region")} type="text" className="input-lg" placeholder="Contoh: Jakarta Pusat" />
                  </InputGroup>
                  <InputGroup label="Nama Komunitas" error={errors.community?.message}>
                    <input {...register("community")} type="text" className="input-lg" placeholder="Contoh: IT Security Club" />
                  </InputGroup>
                  <InputGroup label="Catatan Tambahan (Opsional)" error={errors.special_notes?.message}>
                    <textarea {...register("special_notes")} rows={3} className="input-lg resize-none" placeholder="Kebutuhan diet, aksesibilitas, dll" />
                  </InputGroup>
                </div>

                <div className="mt-10 fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 sm:relative sm:p-0 sm:border-0 sm:bg-transparent flex flex-col sm:flex-row gap-3">
                  <button type="button" onClick={() => setStep(1)} className="w-full sm:w-auto bg-slate-100 text-slate-700 font-bold py-4 px-8 rounded-xl hover:bg-slate-200 transition-colors">
                    Kembali
                  </button>
                  <button type="button" onClick={onNextStep2} className="w-full sm:w-auto bg-blue-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors">
                    Review Data <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <h1 className="text-3xl font-black tracking-tight mb-2">Konfirmasi Data</h1>
                <p className="text-slate-500 mb-8">Pastikan seluruh data yang Anda masukkan sudah benar sebelum mendaftar.</p>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
                  <ReviewRow label="Nama Lengkap" value={v.full_name} onClick={() => setStep(1)} />
                  <ReviewRow label="Email" value={v.email} onClick={() => setStep(1)} />
                  <ReviewRow label="Nomor Telepon" value={v.phone} onClick={() => setStep(1)} />
                  <ReviewRow label="Instansi & Jabatan" value={`${v.company} - ${v.job_title}`} onClick={() => setStep(1)} />
                  <ReviewRow label="Status Keanggotaan" value={v.participant_category} onClick={() => setStep(1)} />
                  <div className="border-t border-slate-100 pt-6 space-y-6">
                    <ReviewRow label="Wilayah" value={v.region} onClick={() => setStep(2)} />
                    <ReviewRow label="Komunitas" value={v.community} onClick={() => setStep(2)} />
                    <ReviewRow label="Catatan Tambahan" value={v.special_notes || "-"} onClick={() => setStep(2)} />
                  </div>
                </div>

                {error && (
                  <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                    {error}
                  </div>
                )}

                <div className="mt-10 fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 sm:relative sm:p-0 sm:border-0 sm:bg-transparent flex flex-col sm:flex-row gap-3">
                  <button type="button" onClick={() => setStep(2)} disabled={loading} className="w-full sm:w-auto bg-slate-100 text-slate-700 font-bold py-4 px-8 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50">
                    Kembali
                  </button>
                  <button type="submit" disabled={loading} className="w-full sm:w-auto bg-blue-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                    {loading ? "Memproses..." : "Selesaikan Pendaftaran"}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && successData && (
              <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center shadow-sm">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h1 className="text-3xl font-black tracking-tight mb-3">Pendaftaran Berhasil!</h1>
                  <p className="text-slate-500 mb-10 max-w-sm mx-auto">Kami telah mengirimkan email konfirmasi. Harap simpan QR Code berikut untuk akses masuk acara.</p>
                  
                  <div className="inline-block p-6 bg-slate-50 border border-slate-100 rounded-2xl mb-8">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(successData.qr)}`} 
                      alt="QR Code Registrasi" 
                      className="w-48 h-48 mx-auto mix-blend-multiply" 
                    />
                    <div className="mt-4 font-mono font-bold text-lg tracking-widest text-slate-800">
                      {successData.regNumber}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button type="button" onClick={() => window.print()} className="w-full sm:w-auto bg-slate-900 text-white font-bold py-3.5 px-6 rounded-xl hover:bg-slate-800 flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" /> Unduh Tiket
                    </button>
                    <Link href="/" className="w-full sm:w-auto bg-slate-100 text-slate-700 font-bold py-3.5 px-6 rounded-xl hover:bg-slate-200 flex items-center justify-center gap-2">
                      Kembali ke Beranda
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      {/* Global Form Styles */}
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
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
          background-color: #ffffff;
        }
        .input-lg::placeholder {
          color: #94a3b8;
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

function ReviewRow({ label, value, onClick }: { label: string, value: string, onClick: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 group">
      <div>
        <p className="text-sm text-slate-500 mb-0.5">{label}</p>
        <p className="font-semibold text-slate-900">{value}</p>
      </div>
      <button type="button" onClick={onClick} className="text-sm font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity self-start sm:self-auto">
        Ubah
      </button>
    </div>
  );
}
