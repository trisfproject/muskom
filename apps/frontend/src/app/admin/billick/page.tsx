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
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 px-8 py-10 max-w-[400px] w-full text-center relative z-10">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100 mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          
          <h1 className="text-2xl font-black text-slate-900 mb-2">Suara Berhasil Dicatat</h1>
          
          <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
            Terima kasih. Suara Anda telah dicatat secara aman.
          </p>

          <button 
            onClick={resetKiosk}
            className="w-full px-6 py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2"
          >
            Kembali ke Halaman Utama ({countdown}s)
          </button>
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
      <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-indigo-50/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-40 -left-40 w-[600px] h-[600px] bg-purple-50/20 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Header - Modern Application Style */}
      <header className="px-8 py-5 flex flex-col md:flex-row items-center justify-between sticky top-0 z-30 shrink-0 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-primary tracking-tighter">MUSKOM</h1>
            <div className="w-px h-5 bg-slate-300 hidden md:block"></div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight hidden md:block">BILIK SUARA DIGITAL</h2>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">MUSKOM KOMITKABE 2026</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Aman</span>
            <span className="text-slate-200">•</span>
            <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-emerald-600" /> Rahasia</span>
            <span className="text-slate-200">•</span>
            <span className="flex items-center gap-1.5"><Scale className="w-3.5 h-3.5 text-emerald-600" /> Adil</span>
          </div>
          
          <div className="h-6 w-px bg-slate-200 hidden md:block" />
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${ballot ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span className={`text-[11px] font-bold uppercase tracking-widest ${ballot ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {ballot ? 'SESI TERBUKA' : 'SESI DITUTUP'}
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-400 font-mono mt-0.5">
                {format(currentTime, "HH:mm:ss", { locale: idLocale })}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full flex flex-col relative z-20">
        {!eligibility ? (
          /* -------------------------------------------------------------------
           * Step 1: Identification (Strict Structural Sections)
           * ------------------------------------------------------------------- */
          <div className="flex-1 flex flex-col">
            
            {/* Identification Card Section with Breathing Space */}
            <section className="flex-1 flex flex-col items-center justify-center py-20 px-4">
              <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                <div className="text-center space-y-1 mb-8">
                  <h2 className="text-2xl font-black text-primary tracking-tighter mb-1">MUSKOM</h2>
                  <h3 className="text-lg font-bold text-slate-900">Identifikasi Pemilih</h3>
                  <p className="text-xs text-slate-500 font-medium">Masukkan Nomor Registrasi Peserta untuk membuka bilik suara.</p>
                </div>

                {!scannerActive ? (
                  <form onSubmit={handleManualCheck} className="space-y-6">
                    <div>
                      <input
                        ref={inputRef}
                        type="text"
                        value={scanToken}
                        onChange={(e) => setScanToken(e.target.value.toUpperCase())}
                        placeholder="Contoh: MUSKOM-2026-0001"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-center text-sm uppercase font-mono tracking-widest text-slate-900 font-bold transition-all placeholder:text-slate-400 placeholder:font-sans placeholder:tracking-normal"
                        autoComplete="off"
                        autoFocus
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <button
                        type="submit"
                        disabled={loading || !scanToken.trim()}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-lg font-bold transition-all"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>Buka Surat Suara <ArrowRight className="w-4 h-4" /></>
                        )}
                      </button>
                      
                      <div className="flex items-center gap-4 py-1">
                        <div className="h-px bg-slate-100 flex-1" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ATAU</span>
                        <div className="h-px bg-slate-100 flex-1" />
                      </div>
                      
                      <button
                        type="button"
                        onClick={startScanner}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg font-bold transition-all text-sm"
                      >
                        <QrCode className="w-4 h-4" /> Scan QR Code
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6 animate-in fade-in">
                    <div className="bg-slate-50 rounded-xl p-1.5 border border-slate-200 relative overflow-hidden">
                      {cameraError && (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center">
                          <AlertCircle className="w-6 h-6 text-rose-500 mb-2" />
                          <p className="font-bold text-slate-900 mb-1 text-sm">Kamera Bermasalah</p>
                          <p className="text-xs text-slate-500">{cameraError}</p>
                        </div>
                      )}
                      <div id={scannerContainerId} className="rounded-lg overflow-hidden [&_video]:object-cover [&_video]:w-full [&_video]:h-[260px]" />
                    </div>
                    
                    <button
                      type="button"
                      onClick={stopScanner}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg font-bold transition-all text-sm"
                    >
                      Tutup Scanner
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Feature Section Separated Below */}
            <section className="w-full max-w-5xl mx-auto py-16 px-6 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0 border border-slate-200">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">Aman & Rahasia</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[200px] mx-auto md:mx-0">Suara Anda dijaga kerahasiaannya dengan sistem enkripsi canggih dan tertutup.</p>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0 border border-slate-200">
                    <UserCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">Satu Orang Satu Suara</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[200px] mx-auto md:mx-0">Sistem memastikan setiap peserta terdaftar hanya dapat memberikan satu suara sah.</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0 border border-slate-200">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">Langsung & Transparan</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[200px] mx-auto md:mx-0">Hasil pemilihan akan dihitung dan ditampilkan secara transparan di akhir sesi.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          /* -------------------------------------------------------------------
           * Step 2: Voting & Verification Result (Structured Layout)
           * ------------------------------------------------------------------- */
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
            
            {/* 1. Voter Identity Banner */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-b border-slate-200">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  eligibility.is_eligible ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  {eligibility.is_eligible ? <UserCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{eligibility.full_name}</h2>
                    <span className="font-mono text-xs text-slate-500 font-medium">
                      ({eligibility.registration_number})
                    </span>
                  </div>
                  <div className="mt-0.5">
                    <span className={`text-[11px] font-bold uppercase tracking-widest ${eligibility.is_eligible ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {eligibility.is_eligible ? 'Teridentifikasi Valid' : 'Tidak Memenuhi Syarat'}
                    </span>
                  </div>
                  {!eligibility.is_eligible && (
                    <p className="text-rose-600 mt-1.5 font-medium text-xs">
                      Alasan: {eligibility.reason}
                    </p>
                  )}
                </div>
              </div>
              <button 
                onClick={resetKiosk}
                className="px-4 py-2 hover:bg-slate-50 rounded-lg font-bold text-xs text-slate-500 uppercase tracking-widest transition-all border border-transparent hover:border-slate-200 shrink-0"
              >
                Ganti Peserta
              </button>
            </div>

            {/* Gap Identity -> Heading (Min 24-32px) */}
            <div className="mt-8 md:mt-10 mb-3 text-center md:text-left">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Pilih Ketua Umum</h3>
              
              {/* Gap Heading -> Subtitle (8-12px) */}
              <p className="mt-2 text-slate-500 font-medium text-sm">Pilih satu calon Ketua Umum KOMITKABE 2026.</p>
            </div>

            {/* Gap Subtitle -> Grid (Min 32-40px) */}
            {eligibility.is_eligible && (
              <div className="mt-10 mb-12 animate-in fade-in">
                {!ballot || !ballot.candidates ? (
                  <div className="p-16 text-center space-y-4 border border-slate-200 rounded-2xl bg-slate-50">
                    <Info className="w-10 h-10 mx-auto text-slate-400" />
                    <h3 className="text-lg font-bold text-slate-700">Sesi Belum Dibuka</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto">Panitia belum membuka sesi pemilihan. Silakan tunggu aba-aba panitia, lalu refresh halaman ini.</p>
                  </div>
                ) : (
                  /* Candidate Grid with clear separation */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                    {ballot.candidates.map((cand) => (
                      <button
                        key={cand.id}
                        onClick={() => setSelectedCandidate(cand)}
                        className={`relative text-left bg-white rounded-2xl transition-all duration-200 overflow-hidden outline-none flex flex-col ${
                          selectedCandidate?.id === cand.id 
                            ? 'border-2 border-primary shadow-sm' 
                            : 'border border-slate-200 hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        {/* Selected Indicator */}
                        {selectedCandidate?.id === cand.id && (
                          <div className="absolute top-4 right-4 bg-primary text-white rounded-full p-1.5 z-10">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                        
                        <div className="aspect-[4/3] w-full bg-slate-50 relative overflow-hidden border-b border-slate-100">
                          {cand.photo_url ? (
                            <Image 
                              src={cand.photo_url.startsWith('http') ? cand.photo_url : `/uploads/${cand.photo_url}`} 
                              alt={cand.name}
                              fill
                              className="object-cover object-top"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <UserCircle2 className="w-16 h-16" />
                            </div>
                          )}
                          <div className="absolute bottom-4 left-4 w-10 h-10 bg-white/95 backdrop-blur-md rounded-xl flex items-center justify-center font-black text-lg text-slate-900 border border-slate-100">
                            {cand.number}
                          </div>
                        </div>
                        
                        <div className="p-6 flex-1 flex flex-col">
                          <h4 className="text-lg font-black text-slate-900 leading-snug mb-2">{cand.name}</h4>
                          <p className="text-xs text-slate-500 line-clamp-4 leading-relaxed font-medium">{cand.vision || "Belum ada visi & misi."}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Gap Grid -> Selected Candidate Summary (Min 24-32px) */}
            {/* Gap Selected Candidate Summary -> Submit Vote (Min 24-32px) */}
            {/* Moved away from sticky fixed layout to normal document flow, as requested */}
            {eligibility?.is_eligible && selectedCandidate && !voteSuccess && (
              <div className="mt-4 mb-16 mx-auto w-full max-w-2xl bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center animate-in fade-in zoom-in-95">
                
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Kandidat Pilihan Anda</p>
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-xl font-black text-primary border border-slate-200 shadow-sm">
                    {selectedCandidate.number}
                  </div>
                  <p className="text-2xl font-black text-slate-900">{selectedCandidate.name}</p>
                </div>
                
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="w-full sm:w-auto px-12 py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  Kirim Suara <ArrowRight className="w-4 h-4" />
                </button>

              </div>
            )}
          </div>
        )}
      </main>

      {/* ----------------------------------------------------------------------
       * Confirmation Modal
       * ----------------------------------------------------------------------- */}
      {showConfirmModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-[320px] w-full px-6 py-8 text-center animate-in zoom-in-95 duration-200">
            
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Vote className="w-6 h-6 text-primary" />
            </div>

            <h3 className="text-sm font-bold text-slate-500 mb-3">Anda akan memberikan suara kepada:</h3>
            
            <p className="text-xl font-black text-slate-900 leading-tight mb-5">{selectedCandidate.name}</p>
            
            <div className="bg-amber-50 border border-amber-200/60 p-3 rounded-lg mb-6 text-left">
              <p className="text-[11px] text-amber-800 font-bold leading-relaxed">
                Suara yang telah dikirim <br/><strong className="text-amber-900 text-xs">tidak dapat diubah</strong>.
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={handleCastVote}
                disabled={submitting}
                className="w-full px-4 py-3 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-lg font-bold text-sm transition-all flex items-center justify-center"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  "Konfirmasi & Kirim"
                )}
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
                className="w-full px-4 py-3 hover:bg-slate-50 text-slate-600 rounded-lg font-bold text-sm transition-all"
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
