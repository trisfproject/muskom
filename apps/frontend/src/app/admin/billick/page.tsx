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
      const res = await api.get(`/admin/votes/eligibility?registration_number=${encodeURIComponent(token.trim())}`);
      if (res.data?.success) setEligibility(res.data.data);
    } catch (err: any) {
      setEligibility({
        participant_id: "",
        registration_number: token.trim(),
        full_name: "TIDAK DITEMUKAN",
        is_eligible: false,
        reason: err.response?.data?.message || "Nomor tidak valid atau terjadi kesalahan sistem.",
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

  // ─── Success Screen ──────────────────────────────────────────────────────────
  if (voteSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-[360px] bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center">
          <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
          <h1 className="text-lg font-bold text-slate-900 mb-2">Suara Berhasil Dicatat</h1>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            Terima kasih. Suara Anda telah berhasil dicatat secara aman.
          </p>
          <button
            onClick={resetKiosk}
            className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold text-sm transition-colors"
          >
            Kembali ke Halaman Utama ({countdown}s)
          </button>
        </div>
      </div>
    );
  }

  // ─── Main Layout ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans select-none overflow-x-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between gap-4">
          {/* Branding */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="text-lg font-black text-primary tracking-tighter leading-none">MUSKOM</span>
              <span className="hidden md:block text-slate-300 text-sm leading-none">|</span>
              <span className="hidden md:block text-sm font-semibold text-slate-700 leading-none">Bilik Suara Digital</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">
              MUSKOM KOMITKABE 2026
            </span>
          </div>

          {/* Right: security + session */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden sm:flex items-center gap-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />Aman</span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-emerald-500" />Rahasia</span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1"><Scale className="w-3.5 h-3.5 text-emerald-500" />Adil</span>
            </div>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${ballot ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                <span className={`text-[10px] font-bold uppercase tracking-widest ${ballot ? "text-emerald-700" : "text-rose-700"}`}>
                  {ballot ? "Sesi Terbuka" : "Sesi Ditutup"}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                {format(currentTime, "HH:mm:ss", { locale: idLocale })}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full flex flex-col">
        {!eligibility ? (
          // ─── Step 1: Identification ────────────────────────────────────────
          <>
            {/* Identification section — vertically centered within the remaining viewport */}
            <section className="flex-1 flex items-center justify-center px-4 py-16">
              <div className="w-full max-w-[400px]">
                {/* Card */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
                  {/* Card header */}
                  <div className="text-center mb-8">
                    <p className="text-xl font-black text-primary tracking-tighter mb-1">MUSKOM</p>
                    <h2 className="text-base font-bold text-slate-900 mb-1.5">Identifikasi Pemilih</h2>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Masukkan Nomor Registrasi Peserta untuk membuka bilik suara.
                    </p>
                  </div>

                  {/* Form */}
                  {!scannerActive ? (
                    <form onSubmit={handleManualCheck} className="space-y-3">
                      <input
                        ref={inputRef}
                        type="text"
                        value={scanToken}
                        onChange={(e) => setScanToken(e.target.value.toUpperCase())}
                        placeholder="Nomor Registrasi"
                        className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-center text-sm uppercase font-mono tracking-widest text-slate-900 font-semibold transition-all placeholder:text-slate-400 placeholder:normal-case placeholder:font-sans placeholder:tracking-normal"
                        autoComplete="off"
                        autoFocus
                      />

                      <button
                        type="submit"
                        disabled={loading || !scanToken.trim()}
                        className="w-full h-10 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-lg font-semibold text-sm transition-colors"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>Buka Surat Suara <ArrowRight className="w-4 h-4" /></>
                        )}
                      </button>

                      <div className="flex items-center gap-3 py-1">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">atau</span>
                        <div className="flex-1 h-px bg-slate-200" />
                      </div>

                      <button
                        type="button"
                        onClick={startScanner}
                        className="w-full h-10 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg font-semibold text-sm transition-colors"
                      >
                        <QrCode className="w-4 h-4" />
                        Scan QR Code
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                        {cameraError && (
                          <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center p-4 text-center">
                            <AlertCircle className="w-6 h-6 text-rose-500 mb-2" />
                            <p className="text-sm font-semibold text-slate-800 mb-1">Kamera Bermasalah</p>
                            <p className="text-xs text-slate-500">{cameraError}</p>
                          </div>
                        )}
                        <div
                          id={scannerContainerId}
                          className="rounded-xl overflow-hidden [&_video]:object-cover [&_video]:w-full [&_video]:h-[220px]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={stopScanner}
                        className="w-full h-10 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg font-semibold text-sm transition-colors"
                      >
                        Tutup Scanner
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Information section — structurally separated from the card above */}
            <section className="border-t border-slate-200 bg-white">
              <div className="max-w-4xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      icon: <ShieldCheck className="w-4 h-4" />,
                      title: "Aman & Rahasia",
                      desc: "Suara Anda dijaga kerahasiaannya dan tidak dapat dilacak oleh siapapun.",
                    },
                    {
                      icon: <UserCircle2 className="w-4 h-4" />,
                      title: "Satu Orang Satu Suara",
                      desc: "Setiap peserta terdaftar hanya dapat memberikan satu suara yang sah.",
                    },
                    {
                      icon: <Scale className="w-4 h-4" />,
                      title: "Langsung & Transparan",
                      desc: "Perolehan suara dihitung dan ditampilkan secara transparan di akhir sesi.",
                    },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0 mt-0.5">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800 mb-0.5">{item.title}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        ) : (
          // ─── Step 2: Candidate Selection ──────────────────────────────────
          <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-8">

            {/* ── Voter identity bar ────────────────────────────────────────── */}
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm ${
                  eligibility.is_eligible ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-rose-50 text-rose-600 border border-rose-200"
                }`}>
                  {eligibility.is_eligible ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900 truncate">{eligibility.full_name}</span>
                    <span className="font-mono text-[11px] text-slate-500 shrink-0">{eligibility.registration_number}</span>
                  </div>
                  <p className={`text-[11px] font-bold uppercase tracking-widest mt-0.5 ${eligibility.is_eligible ? "text-emerald-600" : "text-rose-600"}`}>
                    {eligibility.is_eligible ? "Teridentifikasi Valid" : "Tidak Memenuhi Syarat"}
                  </p>
                  {!eligibility.is_eligible && (
                    <p className="text-xs text-rose-600 mt-0.5">Alasan: {eligibility.reason}</p>
                  )}
                </div>
              </div>
              <button
                onClick={resetKiosk}
                className="shrink-0 text-[11px] font-semibold text-slate-500 hover:text-slate-700 uppercase tracking-widest transition-colors flex items-center gap-1"
              >
                Ganti <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* ── Ballot area ────────────────────────────────────────────────── */}
            {eligibility.is_eligible && (
              <>
                {/* Section heading */}
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Pilih Ketua Umum</h2>
                  <p className="text-sm text-slate-500 mt-1">Pilih satu calon Ketua Umum KOMITKABE 2026.</p>
                </div>

                {!ballot?.candidates ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
                    <Info className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-slate-700 mb-1">Sesi Belum Dibuka</h3>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                      Panitia belum membuka sesi pemilihan. Silakan tunggu aba-aba panitia, lalu refresh halaman.
                    </p>
                  </div>
                ) : (
                  /* ── Candidate grid ──────────────────────────────────────── */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {ballot.candidates.map((cand) => {
                      const isSelected = selectedCandidate?.id === cand.id;
                      return (
                        <button
                          key={cand.id}
                          onClick={() => setSelectedCandidate(cand)}
                          className={[
                            "relative text-left bg-white rounded-xl transition-all duration-150 overflow-hidden outline-none",
                            "flex flex-col shadow-sm",
                            isSelected
                              ? "border border-primary ring-2 ring-primary/20"
                              : "border border-slate-200 hover:border-slate-300",
                          ].join(" ")}
                        >
                          {/* Selected badge */}
                          {isSelected && (
                            <div className="absolute top-3 right-3 z-10 bg-primary text-white rounded-full p-1 shadow-sm">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          )}

                          {/* Photo */}
                          <div className="relative h-44 w-full bg-slate-100 border-b border-slate-200 overflow-hidden shrink-0">
                            {cand.photo_url ? (
                              <Image
                                src={
                                  cand.photo_url.startsWith("http")
                                    ? cand.photo_url
                                    : `/uploads/${cand.photo_url}`
                                }
                                alt={cand.name}
                                fill
                                className="object-cover object-top"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <UserCircle2 className="w-14 h-14" />
                              </div>
                            )}
                            {/* Candidate number — integrated bottom-left */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent px-3 py-2">
                              <span className="text-xs font-bold text-white/80 uppercase tracking-widest">
                                Kandidat
                              </span>
                              <span className="ml-1.5 text-white font-black text-sm">#{cand.number}</span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-5 flex-1 flex flex-col gap-1.5">
                            <h3 className="text-base font-bold text-slate-900 leading-snug">{cand.name}</h3>
                            <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                              {cand.vision || "Belum ada visi & misi yang tersedia."}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* ── Selected candidate action bar ───────────────────────── */}
                {selectedCandidate && !voteSuccess && (
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-sm shrink-0">
                        #{selectedCandidate.number}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                          Kandidat Pilihan Anda
                        </p>
                        <p className="text-sm font-bold text-slate-900 truncate">{selectedCandidate.name}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowConfirmModal(true)}
                      className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold text-sm transition-colors"
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

      {/* ── Confirmation Modal ───────────────────────────────────────────────── */}
      {showConfirmModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setShowConfirmModal(false)}
          />
          <div className="relative bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-[340px] p-6 text-center">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Vote className="w-5 h-5 text-primary" />
            </div>

            <p className="text-xs text-slate-500 font-semibold mb-2">Anda akan memberikan suara kepada:</p>
            <p className="text-xl font-bold text-slate-900 mb-5 leading-snug">{selectedCandidate.name}</p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5 text-left">
              <p className="text-xs text-amber-800 leading-relaxed">
                Suara yang telah dikirim <strong>tidak dapat diubah</strong>.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleCastVote}
                disabled={submitting}
                className="w-full h-10 flex items-center justify-center bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-lg font-semibold text-sm transition-colors"
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
                className="w-full h-10 text-slate-600 hover:bg-slate-50 rounded-lg font-semibold text-sm transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
