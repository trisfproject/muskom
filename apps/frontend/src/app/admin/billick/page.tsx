"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Vote,
  AlertCircle,
  CheckCircle2,
  UserCircle2,
  Info,
  X,
  ShieldCheck,
  Lock,
  Scale,
  QrCode,
  ArrowRight,
  ChevronRight,
  Fingerprint,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import Image from "next/image";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

interface EligibilityData {
  participant_id: string;
  registration_number: string;
  full_name: string;
  is_eligible: boolean;
  reason: string;
}

interface Candidate {
  id: string;
  number: number;
  name: string;
  photo_url: string;
  vision: string;
  mission: string;
}

interface Ballot {
  candidates: Candidate[];
}

// ─── Minimal avatar placeholder using initials ────────────────────────────────
function CandidateAvatar({ name, number }: { name: string; number: number }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 select-none">
      <div className="w-20 h-20 rounded-full bg-white/60 border border-slate-200 flex items-center justify-center mb-3 shadow-inner">
        <span className="text-2xl font-black text-slate-500 tracking-tighter">{initials}</span>
      </div>
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Kandidat {number}</span>
    </div>
  );
}

export default function BilikSuaraPage() {
  const [scanToken, setScanToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [eligibility, setEligibility] = useState<EligibilityData | null>(null);
  const [ballot, setBallot] = useState<Ballot | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [scannerActive, setScannerActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const html5QrRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-reader-container-billick";
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchBallot = async () => {
      try {
        const res = await api.get("/admin/votes/ballot");
        if (res.data?.data) setBallot(res.data.data);
      } catch (_) {}
    };
    fetchBallot();
  }, []);

  useEffect(() => {
    if (!eligibility && !voteSuccess && !scannerActive) {
      inputRef.current?.focus();
    }
  }, [eligibility, voteSuccess, scannerActive]);

  useEffect(() => {
    if (voteSuccess && countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    } else if (voteSuccess && countdown === 0) {
      resetKiosk();
    }
  }, [voteSuccess, countdown]);

  const stopScanner = async () => {
    if (html5QrRef.current) {
      try {
        if (html5QrRef.current.isScanning) await html5QrRef.current.stop();
        await html5QrRef.current.clear();
      } catch (_) {}
      html5QrRef.current = null;
    }
    setScannerActive(false);
  };

  const startScanner = useCallback(async () => {
    setCameraError(null);
    setScannerActive(true);
    if (html5QrRef.current) {
      try {
        if (html5QrRef.current.isScanning) await html5QrRef.current.stop();
        await html5QrRef.current.clear();
      } catch (_) {}
      html5QrRef.current = null;
    }
    setTimeout(async () => {
      let qr: Html5Qrcode;
      try {
        qr = new Html5Qrcode(scannerContainerId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
        html5QrRef.current = qr;
      } catch (_) {
        setCameraError("Gagal menginisialisasi kamera.");
        return;
      }
      try {
        await qr.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: (w: number, h: number) => {
              const s = Math.max(160, Math.min(Math.floor(Math.min(w, h) * 0.7), 280));
              return { width: s, height: s };
            },
          },
          (text) => {
            const parts = text.split("/checkin/");
            const reg = parts.length > 1 ? parts[1].trim() : text.trim();
            stopScanner();
            setScanToken(reg);
            checkEligibility(reg);
          },
          () => {}
        );
      } catch (err: any) {
        setCameraError(err?.message || "Kamera tidak tersedia.");
      }
    }, 100);
  }, []);

  const checkEligibility = async (token: string) => {
    if (!token.trim()) return;
    try {
      setLoading(true);
      setEligibility(null);
      setSelectedCandidate(null);
      setVoteSuccess(false);
      const res = await api.get(
        `/admin/votes/eligibility?registration_number=${encodeURIComponent(token.trim())}`
      );
      if (res.data?.success) setEligibility(res.data.data);
    } catch (err: any) {
      setEligibility({
        participant_id: "",
        registration_number: token.trim(),
        full_name: "TIDAK DITEMUKAN",
        is_eligible: false,
        reason:
          err.response?.data?.message ||
          "Nomor tidak valid atau terjadi kesalahan sistem.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheck = (e: React.FormEvent) => {
    e.preventDefault();
    checkEligibility(scanToken);
  };

  const handleCastVote = async () => {
    if (!eligibility?.is_eligible || !selectedCandidate) return;
    try {
      setSubmitting(true);
      const res = await api.post("/admin/votes/cast", {
        participant_id: eligibility.participant_id,
        candidate_id: selectedCandidate.id,
      });
      if (res.data?.success) {
        setShowConfirmModal(false);
        setVoteSuccess(true);
        setCountdown(5);
      }
    } catch (err: any) {
      toast.error("Gagal Memberikan Suara", {
        description: err.response?.data?.message || "Terjadi kesalahan sistem.",
      });
      setShowConfirmModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const resetKiosk = () => {
    setScanToken("");
    setEligibility(null);
    setSelectedCandidate(null);
    setShowConfirmModal(false);
    setVoteSuccess(false);
    stopScanner();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ─── Success ─────────────────────────────────────────────────────────────────
  if (voteSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Thin top bar for branding continuity */}
        <div className="h-1 bg-primary w-full" />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm text-center">
            {/* Icon */}
            <div className="relative inline-flex mb-8">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
            </div>

            {/* Text */}
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">
              Suara Berhasil Dicatat
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed mb-10">
              Terima kasih. Suara Anda telah berhasil dicatat secara aman dan
              rahasia.
            </p>

            {/* CTA */}
            <button
              onClick={resetKiosk}
              className="w-full h-11 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold text-sm transition-colors"
            >
              Kembali ke Halaman Utama ({countdown}s)
            </button>

            {/* Tagline */}
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mt-8">
              MUSKOM KOMITKABE 2026
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Layout ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans select-none overflow-x-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between gap-4">

          {/* Branding */}
          <div className="flex items-center gap-3">
            <span className="text-base font-black text-primary tracking-tighter leading-none">
              MUSKOM
            </span>
            <span className="hidden sm:block text-slate-300">|</span>
            <span className="hidden sm:block text-sm font-semibold text-slate-700">
              Bilik Suara Digital
            </span>
            <span className="sm:hidden text-xs font-semibold text-slate-500">
              Bilik Suara
            </span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            {/* Security row — hidden on small screens */}
            <div className="hidden md:flex items-center gap-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <span className="flex items-center gap-1 text-emerald-600">
                <ShieldCheck className="w-3.5 h-3.5" />
                Aman
              </span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1 text-emerald-600">
                <Lock className="w-3.5 h-3.5" />
                Rahasia
              </span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1 text-emerald-600">
                <Scale className="w-3.5 h-3.5" />
                Adil
              </span>
            </div>

            <div className="hidden md:block h-4 w-px bg-slate-200" />

            {/* Session status */}
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  ballot
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    ballot ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                  }`}
                />
                {ballot ? "Sesi Terbuka" : "Sesi Ditutup"}
              </span>
              <span className="hidden sm:block text-[10px] text-slate-400 font-mono" suppressHydrationWarning>
                {format(currentTime, "HH:mm:ss", { locale: idLocale })}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full flex flex-col">
        {!eligibility ? (
          // ─────────────────────────────────────────────────────────────────
          // STEP 1 — IDENTIFICATION
          // Two-zone hero layout on desktop; stacked on mobile
          // ─────────────────────────────────────────────────────────────────
          <div className="flex-1 flex flex-col">
            {/* Hero Zone */}
            <section className="flex-1 flex items-stretch">
              <div className="max-w-screen-xl mx-auto w-full px-5 sm:px-8 py-12 md:py-0 flex flex-col md:flex-row items-center gap-10 md:gap-16">

                {/* LEFT — Context & branding */}
                <div className="w-full md:w-1/2 flex flex-col justify-center md:py-16">
                  {/* Event badge */}
                  <div className="inline-flex items-center self-start gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
                    <Vote className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[11px] font-bold text-primary uppercase tracking-widest">
                      Pemilihan Ketua Umum
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-4">
                    Bilik Suara
                    <br />
                    <span className="text-primary">Digital</span>
                  </h1>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-md mb-8">
                    Masukkan nomor registrasi peserta Anda untuk memulai proses
                    pemilihan. Suara Anda bersifat rahasia dan langsung dicatat
                    secara aman.
                  </p>

                  {/* Trust signals */}
                  <div className="space-y-3">
                    {[
                      { icon: ShieldCheck, label: "Aman & Rahasia", desc: "Identitas dan pilihan Anda tidak dapat dilacak." },
                      { icon: UserCircle2, label: "Satu Orang Satu Suara", desc: "Sistem mencegah suara ganda secara otomatis." },
                      { icon: Scale, label: "Langsung & Transparan", desc: "Hasil dihitung secara real-time dan terbuka." },
                    ].map(({ icon: Icon, label, desc }) => (
                      <div key={label} className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{label}</p>
                          <p className="text-xs text-slate-500">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-8">
                    MUSKOM KOMITKABE 2026
                  </p>
                </div>

                {/* RIGHT — Input form */}
                <div className="w-full md:w-5/12 lg:w-2/5 flex flex-col justify-center md:py-16">
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    {/* Card header strip */}
                    <div className="px-6 pt-6 pb-5 border-b border-slate-100">
                      <div className="flex items-center gap-2.5 mb-1">
                        <Fingerprint className="w-5 h-5 text-primary" />
                        <h2 className="text-base font-bold text-slate-900">Identifikasi Pemilih</h2>
                      </div>
                      <p className="text-xs text-slate-500">
                        Masukkan nomor registrasi peserta untuk membuka surat suara.
                      </p>
                    </div>

                    {/* Form body */}
                    <div className="px-6 py-6">
                      {!scannerActive ? (
                        <form onSubmit={handleManualCheck} className="space-y-4">
                          {/* Input group */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                              Nomor Registrasi
                            </label>
                            <input
                              ref={inputRef}
                              type="text"
                              value={scanToken}
                              onChange={(e) =>
                                setScanToken(e.target.value.toUpperCase())
                              }
                              placeholder="Cth: MUSKOM-2026-0001"
                              className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-mono text-slate-900 font-semibold uppercase tracking-widest transition-all placeholder:text-slate-400 placeholder:font-sans placeholder:normal-case placeholder:tracking-normal"
                              autoComplete="off"
                              autoFocus
                            />
                          </div>

                          {/* Primary action */}
                          <button
                            type="submit"
                            disabled={loading || !scanToken.trim()}
                            className="w-full h-11 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors shadow-sm"
                          >
                            {loading ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>
                                Buka Surat Suara
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>

                          {/* Divider */}
                          <div className="relative py-1">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center">
                              <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                atau
                              </span>
                            </div>
                          </div>

                          {/* Secondary action */}
                          <button
                            type="button"
                            onClick={startScanner}
                            className="w-full h-11 flex items-center justify-center gap-2 border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 rounded-xl font-semibold text-sm transition-colors"
                          >
                            <QrCode className="w-4 h-4 text-slate-500" />
                            Scan QR Code
                          </button>
                        </form>
                      ) : (
                        <div className="space-y-4">
                          <div className="relative bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                            {cameraError && (
                              <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center p-4 text-center">
                                <AlertCircle className="w-6 h-6 text-rose-500 mb-2" />
                                <p className="text-sm font-semibold text-slate-800 mb-1">
                                  Kamera Bermasalah
                                </p>
                                <p className="text-xs text-slate-500">
                                  {cameraError}
                                </p>
                              </div>
                            )}
                            <div
                              id={scannerContainerId}
                              className="[&_video]:object-cover [&_video]:w-full [&_video]:h-[220px]"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={stopScanner}
                            className="w-full h-10 flex items-center justify-center gap-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold text-sm transition-colors"
                          >
                            Tutup Scanner
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          // ─────────────────────────────────────────────────────────────────
          // STEP 2 — CANDIDATE SELECTION
          // ─────────────────────────────────────────────────────────────────
          <div className="max-w-screen-xl mx-auto w-full px-5 sm:px-8 py-8 flex flex-col gap-6">

            {/* Voter identity bar */}
            <div
              className={`flex items-center justify-between gap-4 px-4 py-3 rounded-xl border text-sm ${
                eligibility.is_eligible
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-rose-50 border-rose-200"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    eligibility.is_eligible
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-rose-100 text-rose-600"
                  }`}
                >
                  {eligibility.is_eligible ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-bold text-slate-900">
                      {eligibility.full_name}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 shrink-0">
                      {eligibility.registration_number}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest ${
                        eligibility.is_eligible
                          ? "text-emerald-700"
                          : "text-rose-700"
                      }`}
                    >
                      ·{" "}
                      {eligibility.is_eligible
                        ? "Teridentifikasi Valid"
                        : "Tidak Memenuhi Syarat"}
                    </span>
                  </div>
                  {!eligibility.is_eligible && (
                    <p className="text-xs text-rose-600 mt-0.5">
                      Alasan: {eligibility.reason}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={resetKiosk}
                className="shrink-0 flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors whitespace-nowrap"
              >
                Ganti <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Ballot area */}
            {eligibility.is_eligible && (
              <>
                {/* Section heading */}
                <div className="pt-2">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Pilih Ketua Umum
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Pilih satu calon Ketua Umum KOMITKABE 2026.
                  </p>
                </div>

                {/* Voting closed state */}
                {!ballot?.candidates ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-5">
                      <Info className="w-7 h-7 text-slate-400" />
                    </div>
                    <h3 className="text-base font-bold text-slate-700 mb-2">
                      Sesi Belum Dibuka
                    </h3>
                    <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                      Panitia belum membuka sesi pemilihan. Silakan tunggu
                      aba-aba panitia, lalu refresh halaman.
                    </p>
                  </div>
                ) : (
                  // Candidate grid
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-7">
                    {ballot.candidates.map((cand) => {
                      const isSelected = selectedCandidate?.id === cand.id;
                      return (
                        <button
                          key={cand.id}
                          onClick={() => setSelectedCandidate(cand)}
                          className={[
                            "group relative text-left rounded-2xl overflow-hidden outline-none",
                            "transition-all duration-150 flex flex-col",
                            "bg-white",
                            isSelected
                              ? "border-2 border-primary shadow-md ring-2 ring-primary/10"
                              : "border border-slate-200 hover:border-slate-300 hover:shadow-sm shadow-xs",
                          ].join(" ")}
                        >
                          {/* Selected indicator */}
                          {isSelected && (
                            <div className="absolute top-3.5 right-3.5 z-10">
                              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-sm">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          )}

                          {/* Photo area — fixed proportional height */}
                          <div className="relative w-full bg-slate-100 overflow-hidden" style={{ aspectRatio: "16/9" }}>
                            {cand.photo_url ? (
                              <Image
                                src={
                                  cand.photo_url.startsWith("http")
                                    ? cand.photo_url
                                    : `/uploads/${cand.photo_url}`
                                }
                                alt={cand.name}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 600px"
                                className="object-cover object-top"
                              />
                            ) : (
                              <CandidateAvatar name={cand.name} number={cand.number} />
                            )}

                            {/* Bottom gradient with number label */}
                            <div
                              className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity ${
                                isSelected ? "opacity-100" : "opacity-60 group-hover:opacity-80"
                              }`}
                            />
                            <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-end justify-between">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-[11px] font-bold text-white uppercase tracking-widest">
                                No. {cand.number}
                              </span>
                              {isSelected && (
                                <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">
                                  Dipilih
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Card content */}
                          <div
                            className={`px-5 py-4 flex-1 flex flex-col gap-1 transition-colors ${
                              isSelected ? "bg-primary/5" : "bg-white"
                            }`}
                          >
                            <h3
                              className={`text-base font-bold leading-snug ${
                                isSelected ? "text-primary" : "text-slate-900"
                              }`}
                            >
                              {cand.name}
                            </h3>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {cand.vision || "Visi & misi belum tersedia."}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Action bar — shown when a candidate is selected */}
                {selectedCandidate && !voteSuccess && (
                  <div className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm">
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Number badge */}
                      <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black text-base shrink-0">
                        {selectedCandidate.number}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Kandidat Pilihan Anda
                        </p>
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {selectedCandidate.name}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowConfirmModal(true)}
                      className="shrink-0 w-full sm:w-auto h-11 flex items-center justify-center gap-2 px-8 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold text-sm transition-colors shadow-sm"
                    >
                      Kirim Suara <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* ── Confirmation Modal ────────────────────────────────────────────────── */}
      {showConfirmModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowConfirmModal(false)}
          />

          {/* Modal panel */}
          <div className="relative bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
            {/* Drag indicator on mobile */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-200" />
            </div>

            {/* Close */}
            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="px-6 pt-5 pb-6">
              {/* Icon */}
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
                <Vote className="w-6 h-6 text-primary" />
              </div>

              {/* Label */}
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Anda akan memberikan suara kepada:
              </p>

              {/* Candidate name — focal point */}
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight mb-5">
                {selectedCandidate.name}
              </h2>

              {/* Warning */}
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  Suara yang telah dikirim{" "}
                  <strong className="font-semibold">tidak dapat diubah</strong>.
                  Pastikan pilihan Anda sudah benar sebelum konfirmasi.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleCastVote}
                  disabled={submitting}
                  className="w-full h-11 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-colors"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Konfirmasi & Kirim"
                  )}
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={submitting}
                  className="w-full h-11 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold text-sm transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
