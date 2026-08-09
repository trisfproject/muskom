"use client";

import React, { useState, useEffect } from "react";
import { Search, Vote, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { PageHeader } from "@/components/admin/PageHeader";
import Image from "next/image";

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

export default function AdminBillickPage() {
  const [scanToken, setScanToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [eligibility, setEligibility] = useState<EligibilityData | null>(null);
  const [ballot, setBallot] = useState<Ballot | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch ballot (this endpoint fails if session is not RUNNING)
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

  const handleCheckEligibility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanToken.trim()) return;

    try {
      setLoading(true);
      setEligibility(null);
      setSelectedCandidate(null);
      
      const res = await api.get(`/admin/votes/eligibility?registration_number=${encodeURIComponent(scanToken.trim())}`);
      
      if (res.data?.success) {
        setEligibility(res.data.data);
      }
    } catch (err: any) {
      toast.error("Gagal memeriksa eligibilitas", {
        description: err.response?.data?.message || "Terjadi kesalahan sistem."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCastVote = async () => {
    if (!eligibility?.is_eligible || !selectedCandidate) return;

    try {
      setSubmitting(true);
      const res = await api.post("/admin/votes/cast", {
        participant_id: eligibility.participant_id,
        candidate_id: selectedCandidate,
      });

      if (res.data?.success) {
        toast.success("Suara Berhasil Diberikan!", {
          description: `Peserta: ${eligibility.full_name}`
        });
        
        // Reset state for next voter
        setScanToken("");
        setEligibility(null);
        setSelectedCandidate(null);
      }
    } catch (err: any) {
      toast.error("Gagal Memberikan Suara", {
        description: err.response?.data?.message || "Terjadi kesalahan sistem."
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bilik Suara (Voting Room)"
        description="Fasilitas operator untuk membantu peserta melakukan pemungutan suara digital"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-500" /> Cek Eligibilitas Pemilih
            </h2>
            
            <form onSubmit={handleCheckEligibility} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Nomor Pendaftaran
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={scanToken}
                    onChange={(e) => setScanToken(e.target.value.toUpperCase())}
                    placeholder="Contoh: MUSKOM-2026-0001"
                    className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white uppercase font-mono tracking-widest text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !scanToken.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-medium transition-all"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Periksa Pemilih
              </button>
            </form>

            {eligibility && (
              <div className={`p-4 rounded-xl border ${eligibility.is_eligible ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30' : 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800/30'} space-y-3`}>
                <div className="flex items-start gap-3">
                  {eligibility.is_eligible ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className={`font-semibold text-sm ${eligibility.is_eligible ? 'text-emerald-900 dark:text-emerald-400' : 'text-rose-900 dark:text-rose-400'}`}>
                      {eligibility.is_eligible ? 'Memenuhi Syarat' : 'Tidak Memenuhi Syarat'}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {eligibility.reason}
                    </p>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-black/5 dark:border-white/5 space-y-2">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Nama Peserta</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{eligibility.full_name}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Voting Panel */}
        <div className="lg:col-span-2">
          {eligibility?.is_eligible ? (
            <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Vote className="w-5 h-5 text-indigo-500" /> Surat Suara Elektronik
                </h2>
                <p className="text-xs font-semibold px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full">
                  Pemilih: {eligibility.full_name}
                </p>
              </div>

              {!ballot || !ballot.candidates ? (
                <div className="p-12 text-center text-slate-400">
                  <p className="font-medium text-sm">Surat suara belum tersedia atau sesi belum dibuka.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {ballot.candidates.map((cand) => (
                      <button
                        key={cand.id}
                        onClick={() => setSelectedCandidate(cand.id)}
                        className={`relative p-4 rounded-xl border-2 text-left transition-all overflow-hidden ${
                          selectedCandidate === cand.id 
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' 
                            : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                        }`}
                      >
                        {selectedCandidate === cand.id && (
                          <div className="absolute top-0 right-0 bg-indigo-600 text-white p-1 rounded-bl-lg">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                        <div className="flex gap-4">
                          {cand.photo_url ? (
                            <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden relative">
                              <Image 
                                src={cand.photo_url.startsWith('http') ? cand.photo_url : `/uploads/${cand.photo_url}`} 
                                alt={cand.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center text-slate-400 font-black text-xl">
                              {cand.number}
                            </div>
                          )}
                          <div>
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1 block">KANDIDAT #{cand.number}</span>
                            <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2">{cand.name}</h3>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                      onClick={handleCastVote}
                      disabled={!selectedCandidate || submitting}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-sm flex items-center gap-2"
                    >
                      {submitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Vote className="w-5 h-5" />
                      )}
                      Berikan Suara
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 text-center text-slate-500">
              <Vote className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <p className="font-medium">Periksa nomor pendaftaran untuk melihat surat suara.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
