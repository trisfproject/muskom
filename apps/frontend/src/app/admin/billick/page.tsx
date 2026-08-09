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

        <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 p-16 max-w-2xl w-full text-center space-y-8 relative z-10">
          <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 animate-bounce-short">
            <CheckCircle2 className="w-16 h-16 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Suara Berhasil Dicatat</h1>
          <p className="text-xl text-slate-600 font-medium">
            Terima kasih. Suara Anda telah berhasil dicatat secara aman.
          </p>
          <div className="pt-8">
            <button 
              onClick={resetKiosk}
              className="px-10 py-5 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold transition-all text-lg w-full shadow-lg shadow-primary/20"
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
      {/* Subtle background abstract shapes */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-slate-50 to-white pointer-events-none z-0" />
      <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-40 -left-40 w-[600px] h-[600px] bg-purple-50/50 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Header - Modern Application Style */}
      <header className="px-8 py-6 flex flex-col md:flex-row items-center justify-between sticky top-0 z-30 shrink-0 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-primary tracking-tighter">MUSKOM</h1>
            <div className="w-px h-6 bg-slate-300 hidden md:block"></div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight hidden md:block">BILIK SUARA DIGITAL</h2>
          </div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mt-1">MUSKOM KOMITKABE 2026</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-4 text-sm font-bold text-slate-600">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Aman</span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-emerald-600" /> Rahasia</span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5"><Scale className="w-4 h-4 text-emerald-600" /> Adil</span>
          </div>
          
          <div className="h-8 w-px bg-slate-200 hidden md:block" />
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${ballot ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span className={`text-sm font-bold uppercase tracking-widest ${ballot ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {ballot ? 'SESI TERBUKA' : 'SESI DITUTUP'}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-400 font-mono">
                {format(currentTime, "HH:mm:ss", { locale: idLocale })}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-10 flex flex-col relative z-20">
        {!eligibility ? (
          /* -------------------------------------------------------------------
           * Step 1: Identification
           * ------------------------------------------------------------------- */
          <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full py-12">
            
            {/* Identification Area */}
            <div className="w-full max-w-lg bg-white rounded-[2rem] p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <div className="text-center space-y-3 mb-10">
                <h2 className="text-3xl font-black text-primary tracking-tighter">MUSKOM</h2>
                <h3 className="text-2xl font-bold text-slate-900">Identifikasi Pemilih</h3>
                <p className="text-slate-500 font-medium">Masukkan Nomor Registrasi Peserta untuk membuka bilik suara.</p>
              </div>

              {!scannerActive ? (
                <form onSubmit={handleManualCheck} className="space-y-6">
                  <div className="space-y-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={scanToken}
                      onChange={(e) => setScanToken(e.target.value.toUpperCase())}
                      placeholder="Contoh: MUSKOM-2026-0001"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-center text-lg uppercase font-mono tracking-widest text-slate-900 font-bold transition-all placeholder:text-slate-400 placeholder:font-sans placeholder:tracking-normal"
                      autoComplete="off"
                      autoFocus
                    />
                  </div>
                  
                  <div className="space-y-3 pt-2">
                    <button
                      type="submit"
                      disabled={loading || !scanToken.trim()}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl font-bold text-lg transition-all shadow-md shadow-primary/20"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>Buka Surat Suara <ArrowRight className="w-5 h-5" /></>
                      )}
                    </button>
                    
                    <div className="flex items-center gap-4 py-3">
                      <div className="h-px bg-slate-100 flex-1" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ATAU</span>
                      <div className="h-px bg-slate-100 flex-1" />
                    </div>
                    
                    <button
                      type="button"
                      onClick={startScanner}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl font-bold text-lg transition-all"
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
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl font-bold transition-all"
                  >
                    Tutup Scanner
                  </button>
                </div>
              )}
            </div>

            {/* Light Information Section */}
            <div className="w-full mt-16 pt-10 border-t border-slate-100/60 flex flex-col md:flex-row justify-center items-start gap-8 md:gap-12 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4 max-w-[280px]">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 shrink-0 border border-slate-100">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg mb-1">Aman & Rahasia</h4>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">Suara Anda dijaga kerahasiaannya dengan aman.</p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4 max-w-[280px]">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 shrink-0 border border-slate-100">
                  <UserCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg mb-1">Satu Orang Satu Suara</h4>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">Setiap peserta hanya dapat memberikan satu suara.</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center md:items-start gap-4 max-w-[280px]">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 shrink-0 border border-slate-100">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg mb-1">Langsung & Transparan</h4>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">Perolehan suara dapat dipantau secara transparan.</p>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* -------------------------------------------------------------------
           * Step 2: Voting & Verification Result
           * ------------------------------------------------------------------- */
          <div className="space-y-12 pb-40">
            {/* Lighter, minimal Eligibility Banner */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                  eligibility.is_eligible ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  {eligibility.is_eligible ? <UserCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{eligibility.full_name}</h2>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="font-mono text-sm text-slate-500 font-semibold">
                      {eligibility.registration_number}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className={`text-sm font-bold uppercase tracking-widest ${eligibility.is_eligible ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {eligibility.is_eligible ? 'Teridentifikasi Valid' : 'Tidak Memenuhi Syarat'}
                    </span>
                  </div>
                  {!eligibility.is_eligible && (
                    <p className="text-rose-600 mt-2 font-medium text-sm">
                      Alasan: {eligibility.reason}
                    </p>
                  )}
                </div>
              </div>
              <button 
                onClick={resetKiosk}
                className="px-5 py-2 hover:bg-slate-50 rounded-lg font-bold text-sm text-slate-500 transition-all shrink-0"
              >
                Ganti Peserta
              </button>
            </div>

            {/* Voting Area */}
            {eligibility.is_eligible && (
              <>
                {!ballot || !ballot.candidates ? (
                  <div className="p-16 text-center space-y-4">
                    <Info className="w-12 h-12 mx-auto text-slate-300" />
                    <h3 className="text-2xl font-bold text-slate-700">Sesi Belum Dibuka</h3>
                    <p className="text-slate-500 max-w-md mx-auto text-lg">Panitia belum membuka sesi pemilihan. Silakan tunggu aba-aba panitia, lalu refresh halaman ini.</p>
                  </div>
                ) : (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150">
                    <div className="text-center md:text-left">
                      <h3 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Pilih Ketua Umum</h3>
                      <p className="text-slate-500 font-medium text-lg">Pilih satu calon Ketua Umum KOMITKABE 2026.</p>
                    </div>
                    
                    {/* Generous Spacing for Candidate Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                      {ballot.candidates.map((cand) => (
                        <button
                          key={cand.id}
                          onClick={() => setSelectedCandidate(cand)}
                          className={`relative text-left bg-white rounded-[2rem] transition-all duration-200 overflow-hidden group ${
                            selectedCandidate?.id === cand.id 
                              ? 'border-2 border-primary bg-primary/5 ring-4 ring-primary/10 scale-[1.01]' 
                              : 'border border-slate-100 hover:border-slate-300 hover:shadow-lg'
                          }`}
                        >
                          {/* Selected Overlay Indicator */}
                          {selectedCandidate?.id === cand.id && (
                            <div className="absolute top-4 right-4 bg-primary text-white rounded-full p-1.5 z-10 shadow-sm animate-in zoom-in">
                              <CheckCircle2 className="w-6 h-6" />
                            </div>
                          )}
                          
                          <div className="aspect-square w-full bg-slate-50 relative overflow-hidden">
                            {cand.photo_url ? (
                              <Image 
                                src={cand.photo_url.startsWith('http') ? cand.photo_url : `/uploads/${cand.photo_url}`} 
                                alt={cand.name}
                                fill
                                className={`object-cover object-top transition-transform duration-500 ${selectedCandidate?.id === cand.id ? 'scale-105' : 'group-hover:scale-105'}`}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <UserCircle2 className="w-32 h-32" />
                              </div>
                            )}
                            {/* Number Badge Minimal */}
                            <div className="absolute bottom-6 left-6 w-14 h-14 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center font-black text-2xl text-slate-900 shadow-sm">
                              {cand.number}
                            </div>
                          </div>
                          
                          <div className="p-8">
                            <h4 className="text-2xl font-black text-slate-900 leading-snug mb-3">{cand.name}</h4>
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
       * Sticky Bottom Vote Action (Cleaner & Modern)
       * ----------------------------------------------------------------------- */}
      {eligibility?.is_eligible && selectedCandidate && !voteSuccess && (
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 py-4 px-6 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] animate-in slide-in-from-bottom-24 duration-300">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-xl font-black text-primary">
                {selectedCandidate.number}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Kandidat Pilihan Anda</p>
                <p className="text-xl font-black text-slate-900">{selectedCandidate.name}</p>
              </div>
            </div>
            <button
              onClick={() => setShowConfirmModal(true)}
              className="w-full sm:w-auto px-10 py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold text-lg transition-all shadow-md flex items-center justify-center gap-2"
            >
              Kirim Suara <ArrowRight className="w-5 h-5" />
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
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-200">

            <button 
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-4 right-4 w-10 h-10 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-lg font-bold text-slate-500 mb-2 mt-4">Anda akan memberikan suara kepada:</h3>
            <p className="text-3xl font-black text-slate-900 leading-tight mb-6">{selectedCandidate.name}</p>
            
            <div className="bg-slate-50 rounded-xl p-4 mb-8">
              <p className="text-sm text-slate-600 font-medium">
                Suara yang telah dikirim <strong className="text-slate-900">tidak dapat diubah</strong>.
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={handleCastVote}
                disabled={submitting}
                className="w-full px-6 py-4 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl font-bold text-lg transition-all shadow-sm flex items-center justify-center"
              >
                {submitting ? (
                  <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  "Konfirmasi & Kirim"
                )}
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
                className="w-full px-6 py-4 hover:bg-slate-50 text-slate-600 rounded-xl font-bold transition-all"
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
