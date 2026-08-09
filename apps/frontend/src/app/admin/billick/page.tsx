"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Vote, AlertCircle, CheckCircle2, UserCircle2, Info, X, ShieldCheck, Lock, Scale, QrCode, ArrowRight } from "lucide-react";
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

  // Scanner state
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const html5QrRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-reader-container-billick";

  const inputRef = useRef<HTMLInputElement>(null);

  // Time ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch ballot
  useEffect(() => {
    const fetchBallot = async () => {
      try {
        const res = await api.get("/admin/votes/ballot");
        if (res.data?.data) {
          setBallot(res.data.data);
        }
      } catch (err: any) {
        if (err.response?.status === 400 || err.response?.status === 403 || err.response?.data?.message?.includes("closed")) {
          // Session not opened
        }
      }
    };
    fetchBallot();
  }, []);

  // Auto focus input on load and reset
  useEffect(() => {
    if (!eligibility && !voteSuccess && !scannerActive) {
      inputRef.current?.focus();
    }
  }, [eligibility, voteSuccess, scannerActive]);

  // Handle countdown and reset
  useEffect(() => {
    if (voteSuccess && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (voteSuccess && countdown === 0) {
      resetKiosk();
    }
  }, [voteSuccess, countdown]);

  const stopScanner = async () => {
    if (html5QrRef.current) {
      try {
        if (html5QrRef.current.isScanning) {
          await html5QrRef.current.stop();
        }
        await html5QrRef.current.clear();
      } catch (err) {
        console.warn("[QR] Error stopping scanner", err);
      }
      html5QrRef.current = null;
    }
    setScannerActive(false);
  };

  const startScanner = useCallback(async () => {
    setCameraError(null);
    setScannerActive(true);

    if (html5QrRef.current) {
      try {
        if (html5QrRef.current.isScanning) {
          await html5QrRef.current.stop();
        }
        await html5QrRef.current.clear();
      } catch (_) {}
      html5QrRef.current = null;
    }

    // Give the DOM a moment to render the container
    setTimeout(async () => {
      let qrInstance: Html5Qrcode;
      try {
        qrInstance = new Html5Qrcode(scannerContainerId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
        html5QrRef.current = qrInstance;
      } catch (err) {
        console.error("[QR] Failed to instantiate Html5Qrcode:", err);
        setCameraError("Gagal menginisialisasi scanner kamera.");
        return;
      }

      const config = {
        fps: 15,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const edge = Math.floor(minEdge * 0.75);
          const boxSize = Math.max(200, Math.min(edge, 300));
          return { width: boxSize, height: boxSize };
        },
        disableFlip: false,
      };

      try {
        await qrInstance.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            console.log("[QR] Decoded:", decodedText);
            const parts = decodedText.split("/checkin/");
            const regNum = parts.length > 1 ? parts[1].trim() : decodedText.trim();
            stopScanner();
            setScanToken(regNum);
            checkEligibility(regNum);
          },
          () => {} // ignore frame errors
        );
      } catch (err: any) {
        console.error("[QR] Error starting scanner:", err);
        setCameraError(err?.message || "Kamera tidak diizinkan atau tidak tersedia.");
      }
    }, 100);
  }, []);

  const checkEligibility = async (tokenStr: string) => {
    if (!tokenStr.trim()) return;

    try {
      setLoading(true);
      setEligibility(null);
      setSelectedCandidate(null);
      setVoteSuccess(false);
      
      const res = await api.get(`/admin/votes/eligibility?registration_number=${encodeURIComponent(tokenStr.trim())}`);
      
      if (res.data?.success) {
        setEligibility(res.data.data);
      }
    } catch (err: any) {
      setEligibility({
        participant_id: "",
        registration_number: tokenStr.trim(),
        full_name: "TIDAK DITEMUKAN",
        is_eligible: false,
        reason: err.response?.data?.message || "Terjadi kesalahan sistem atau nomor tidak valid.",
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
        setCountdown(5); // Show success screen for 5 seconds
      }
    } catch (err: any) {
      toast.error("Gagal Memberikan Suara", {
        description: err.response?.data?.message || "Terjadi kesalahan sistem."
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

  // ---------------------------------------------------------------------------
  // Success Screen
  // ---------------------------------------------------------------------------
  if (voteSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 select-none animate-in fade-in duration-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-white" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 p-16 max-w-2xl w-full text-center space-y-8 relative z-10">
          <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-100 animate-bounce-short">
            <CheckCircle2 className="w-16 h-16 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Suara Berhasil Dicatat</h1>
          <p className="text-xl text-slate-600 font-medium">
            Terima kasih. Suara Anda telah berhasil dicatat secara aman.
          </p>
          <div className="pt-8">
            <button 
              onClick={resetKiosk}
              className="px-10 py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all text-lg w-full shadow-xl shadow-slate-900/20"
            >
              Kembali ke Halaman Utama ({countdown}s)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Main Terminal Layout
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* Decorative Light Background */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#F3F0FA] to-white pointer-events-none z-0" />
      <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-[#E9D8FD]/30 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-40 -left-40 w-[600px] h-[600px] bg-[#D6BCFA]/20 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Header */}
      <header className="px-8 py-5 flex flex-col sm:flex-row items-center justify-between sticky top-0 z-30 shrink-0 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm border border-slate-100 font-black text-xl">
            M
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">BILIK SUARA DIGITAL</h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">MUSKOM KOMITKABE 2026</p>
          </div>
        </div>
        <div className="text-right hidden sm:flex items-center gap-8">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-3 text-sm font-bold text-slate-700 uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Aman</span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-emerald-600" /> Rahasia</span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5"><Scale className="w-4 h-4 text-emerald-600" /> Adil</span>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Satu orang, satu suara, satu masa depan.</p>
          </div>
          <div className="h-10 w-px bg-slate-200" />
          <div className="flex flex-col items-end gap-1">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border ${ballot ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
              <div className={`w-2.5 h-2.5 rounded-full ${ballot ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-xs font-bold uppercase tracking-widest">
                {ballot ? 'SESI TERBUKA' : 'SESI DITUTUP'}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-400 font-mono">
              {format(currentTime, "HH:mm:ss", { locale: idLocale })}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col relative z-20">
        {!eligibility ? (
          /* -------------------------------------------------------------------
           * Step 1: Identification
           * ------------------------------------------------------------------- */
          <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full py-12">
            <div className="bg-white p-8 sm:p-12 rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 w-full space-y-10 relative overflow-hidden">
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">
                  <span className="text-3xl font-black text-white">M</span>
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Identifikasi Pemilih</h2>
                <p className="text-slate-500 text-base font-medium px-4">Masukkan Nomor Registrasi Peserta untuk membuka bilik suara.</p>
              </div>

              {!scannerActive ? (
                <form onSubmit={handleManualCheck} className="space-y-6">
                  <div className="space-y-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={scanToken}
                      onChange={(e) => setScanToken(e.target.value.toUpperCase())}
                      placeholder="MUSKOM-2026-0001"
                      className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-center text-xl uppercase font-mono tracking-widest text-slate-900 font-bold transition-all placeholder:text-slate-400 placeholder:font-sans placeholder:tracking-normal"
                      autoComplete="off"
                      autoFocus
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={loading || !scanToken.trim()}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-primary/25"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>Buka Surat Suara <ArrowRight className="w-5 h-5" /></>
                      )}
                    </button>
                    
                    <div className="flex items-center gap-4 py-2">
                      <div className="h-px bg-slate-200 flex-1" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ATAU</span>
                      <div className="h-px bg-slate-200 flex-1" />
                    </div>
                    
                    <button
                      type="button"
                      onClick={startScanner}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-700 rounded-2xl font-bold text-lg transition-all"
                    >
                      <QrCode className="w-5 h-5" /> Scan QR Code
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-slate-50 rounded-2xl p-2 border border-slate-200 relative overflow-hidden">
                    {cameraError && (
                      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center">
                        <AlertCircle className="w-10 h-10 text-rose-500 mb-3" />
                        <p className="font-bold text-slate-900 mb-1">Kamera Bermasalah</p>
                        <p className="text-sm text-slate-500">{cameraError}</p>
                      </div>
                    )}
                    <div id={scannerContainerId} className="rounded-xl overflow-hidden [&_video]:object-cover [&_video]:w-full [&_video]:h-[300px]" />
                  </div>
                  
                  <button
                    type="button"
                    onClick={stopScanner}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-lg transition-all"
                  >
                    Tutup Scanner
                  </button>
                </div>
              )}
            </div>

            {/* Trust / Information Area */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl mt-12">
              <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Aman & Rahasia</h4>
                  <p className="text-sm text-slate-500 mt-1 font-medium">Suara Anda dijaga kerahasiaannya.</p>
                </div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <UserCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Satu Orang Satu Suara</h4>
                  <p className="text-sm text-slate-500 mt-1 font-medium">Setiap peserta hanya memberikan satu suara.</p>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Langsung & Transparan</h4>
                  <p className="text-sm text-slate-500 mt-1 font-medium">Perolehan dipantau secara transparan.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* -------------------------------------------------------------------
           * Step 2: Voting & Verification Result
           * ------------------------------------------------------------------- */
          <div className="space-y-8 pb-32">
            {/* Eligibility Banner */}
            <div className={`p-6 sm:p-8 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-6 bg-white shadow-sm ${
              eligibility.is_eligible ? 'border-emerald-200' : 'border-rose-200'
            }`}>
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border-2 ${
                  eligibility.is_eligible ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'
                }`}>
                  {eligibility.is_eligible ? <UserCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{eligibility.full_name}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="font-mono text-sm px-2.5 py-1 bg-slate-100 rounded-md text-slate-700 font-bold border border-slate-200">
                      {eligibility.registration_number}
                    </span>
                    <span className={`text-sm font-bold uppercase tracking-wider ${eligibility.is_eligible ? 'text-emerald-600' : 'text-rose-600'}`}>
                      • {eligibility.is_eligible ? 'Teridentifikasi Valid' : 'Tidak Memenuhi Syarat'}
                    </span>
                  </div>
                  {!eligibility.is_eligible && (
                    <p className="text-rose-700 mt-3 font-medium bg-rose-50 border border-rose-100 px-4 py-2 rounded-xl inline-block text-sm">
                      Alasan: {eligibility.reason}
                    </p>
                  )}
                </div>
              </div>
              <button 
                onClick={resetKiosk}
                className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-600 transition-all shrink-0"
              >
                Ganti Peserta
              </button>
            </div>

            {/* Voting Area */}
            {eligibility.is_eligible && (
              <>
                {!ballot || !ballot.candidates ? (
                  <div className="p-16 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
                    <Info className="w-16 h-16 mx-auto text-slate-300" />
                    <h3 className="text-2xl font-black text-slate-900">Sesi Belum Dibuka</h3>
                    <p className="text-slate-500 max-w-md mx-auto text-lg">Panitia belum membuka sesi pemilihan. Silakan tunggu aba-aba panitia, lalu refresh halaman ini.</p>
                  </div>
                ) : (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150">
                    <div className="text-center space-y-2 mb-10">
                      <h3 className="text-4xl font-black text-slate-900 tracking-tight">Pilih Ketua Umum</h3>
                      <p className="text-slate-500 font-medium text-lg">Pilih satu calon Ketua Umum KOMITKABE 2026.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {ballot.candidates.map((cand) => (
                        <button
                          key={cand.id}
                          onClick={() => setSelectedCandidate(cand)}
                          className={`relative text-left bg-white rounded-[2rem] transition-all duration-300 overflow-hidden group shadow-lg border-2 ${
                            selectedCandidate?.id === cand.id 
                              ? 'border-primary ring-4 ring-primary/20 scale-[1.02]' 
                              : 'border-transparent hover:border-slate-300 hover:shadow-xl'
                          }`}
                        >
                          {/* Selected Overlay Indicator */}
                          {selectedCandidate?.id === cand.id && (
                            <div className="absolute top-4 right-4 bg-primary text-white rounded-full p-2 z-10 shadow-lg animate-in zoom-in">
                              <CheckCircle2 className="w-8 h-8" />
                            </div>
                          )}
                          
                          <div className="aspect-[4/3] w-full bg-slate-50 relative overflow-hidden border-b border-slate-100">
                            {cand.photo_url ? (
                              <Image 
                                src={cand.photo_url.startsWith('http') ? cand.photo_url : `/uploads/${cand.photo_url}`} 
                                alt={cand.name}
                                fill
                                className={`object-cover object-top transition-transform duration-700 ${selectedCandidate?.id === cand.id ? 'scale-105' : 'group-hover:scale-105'}`}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <UserCircle2 className="w-32 h-32" />
                              </div>
                            )}
                            {/* Number Badge */}
                            <div className="absolute bottom-4 left-4 w-16 h-16 bg-white rounded-2xl flex items-center justify-center font-black text-3xl text-slate-900 shadow-xl border border-slate-100">
                              {cand.number}
                            </div>
                          </div>
                          
                          <div className="p-8">
                            <h4 className="text-3xl font-black text-slate-900 leading-tight mb-3">{cand.name}</h4>
                            <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed font-medium">{cand.vision || "Belum ada visi & misi."}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* ----------------------------------------------------------------------
       * Sticky Bottom Bar for Action
       * ----------------------------------------------------------------------- */}
      {eligibility?.is_eligible && selectedCandidate && !voteSuccess && (
        <div className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 p-5 sm:p-6 z-40 animate-in slide-in-from-bottom-24 duration-300 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Kandidat Pilihan Anda</p>
              <p className="text-3xl font-black text-slate-900 flex items-center gap-3">
                <span className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl text-primary border border-primary/20">
                  {selectedCandidate.number}
                </span>
                {selectedCandidate.name}
              </p>
            </div>
            <button
              onClick={() => setShowConfirmModal(true)}
              className="w-full sm:w-auto px-12 py-5 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black text-xl transition-all shadow-xl shadow-primary/25 flex items-center justify-center gap-3"
            >
              <Vote className="w-6 h-6" /> Kirim Suara
            </button>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
       * Confirmation Modal
       * ----------------------------------------------------------------------- */}
      {showConfirmModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)} />
          <div className="relative bg-white border border-slate-100 rounded-[2rem] shadow-2xl max-w-md w-full p-10 text-center animate-in zoom-in-95 duration-200 overflow-hidden">

            <button 
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-6 right-6 w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Vote className="w-12 h-12 text-primary" />
            </div>
            
            <h3 className="text-2xl font-bold text-slate-600 mb-1">Anda akan memberikan suara kepada:</h3>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 my-6">
              <p className="text-4xl font-black text-slate-900">{selectedCandidate.name}</p>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-8">
              <p className="text-sm text-amber-800 font-bold">
                Suara yang telah dikirim tidak dapat diubah.
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={handleCastVote}
                disabled={submitting}
                className="w-full px-6 py-5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-2xl font-black text-lg transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Konfirmasi & Kirim Suara</>
                )}
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
                className="w-full px-6 py-5 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-700 rounded-2xl font-bold transition-all"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
