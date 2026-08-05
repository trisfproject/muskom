"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token verifikasi tidak ditemukan.");
      return;
    }

    const verifyToken = async () => {
      try {
        await api.get(`/public/participants/verify-email?token=${token}`);
        setStatus("success");
      } catch (error: any) {
        setStatus("error");
        setMessage(error.response?.data?.message || "Link verifikasi tidak valid atau sudah kadaluarsa.");
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full pg-surface border pg-border rounded-2xl shadow-xl overflow-hidden p-8 text-center space-y-6">
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
            <h2 className="text-xl font-bold pg-text">Memverifikasi Email...</h2>
            <p className="text-sm pg-muted">Mohon tunggu sebentar, kami sedang memverifikasi email Anda.</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-600">Verifikasi Berhasil!</h2>
            <p className="text-sm pg-muted">
              Terima kasih, alamat email Anda telah berhasil diverifikasi. Pendaftaran Anda kini sedang menunggu persetujuan (Pending Verifikasi) oleh panitia.
            </p>
            <div className="pt-4 w-full">
              <Link
                href="/"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
              >
                Kembali ke Beranda <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-rose-600">
              <XCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-rose-600">Verifikasi Gagal</h2>
            <p className="text-sm pg-muted">{message}</p>
            <div className="pt-4 w-full">
              <Link
                href="/"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 pg-text font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
