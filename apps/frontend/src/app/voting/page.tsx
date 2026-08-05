"use client";

import React, { useState, useEffect } from "react";
import { Vote, CheckCircle2, Shield, Lock, Award, ArrowRight, AlertTriangle } from "lucide-react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { toast } from "sonner";
import Cookies from "js-cookie";

interface Candidate {
  id: string;
  number: number;
  name: string;
  photo_url?: string;
  vision: string;
  mission: string;
}

export default function PublicVotingPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [receiptCode, setReceiptCode] = useState("");
  const [participantIdInput, setParticipantIdInput] = useState("");

  const fetchBallot = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/vote/ballot");
      const data = await res.json();
      if (data.success && data.data?.candidates) {
        setCandidates(data.data.candidates);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBallot();
  }, []);

  const handleCastVote = async () => {
    if (!selectedCandidate || !participantIdInput.trim()) {
      toast.error("Masukkan ID Peserta Anda untuk mengonfirmasi suara.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/v1/vote/cast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: selectedCandidate.id,
          participant_id: participantIdInput.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setHasVoted(true);
        setReceiptCode(`VOTE-${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
        toast.success("Suara Anda Berhasil Disimpan!");
      } else {
        toast.error(data.message || "Gagal menyalurkan suara. Pastikan Anda sudah check-in dan belum memilih.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem saat pemungutan suara.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-5xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold">
            <Lock className="w-3.5 h-3.5" /> Bilik Suara Digital (Rahasia & Enkripsi)
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            E-Voting Ketua Ummat
          </h1>
          <p className="text-sm text-slate-400">
            Pilihlah kandidat terbaik dengan memberikan 1 (satu) hak suara sah Anda.
          </p>
        </div>

        {hasVoted ? (
          <div className="p-8 max-w-xl mx-auto rounded-3xl bg-slate-900 border border-emerald-500/30 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Suara Sah Terverifikasi!</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Terima kasih telah berpartisipasi aktif dalam e-voting Musyawarah. Hak suara Anda telah dicatat secara anonim.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 font-mono text-center">
              <p className="text-xs text-slate-400 mb-1">Kode Resi Digital:</p>
              <p className="text-lg font-bold text-emerald-400 tracking-wider">{receiptCode}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Candidate Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                <div className="col-span-2 text-center p-12 text-slate-400">Memuat kertas suara...</div>
              ) : candidates.length === 0 ? (
                <div className="col-span-2 text-center p-12 text-slate-400">
                  Sesi voting belum dibuka atau tidak ada kandidat terverifikasi.
                </div>
              ) : (
                candidates.map((cand) => {
                  const isSelected = selectedCandidate?.id === cand.id;
                  return (
                    <div
                      key={cand.id}
                      onClick={() => setSelectedCandidate(cand)}
                      className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                        isSelected
                          ? "bg-gradient-to-br from-indigo-950 to-slate-900 border-indigo-500 ring-2 ring-indigo-500 shadow-xl scale-[1.01]"
                          : "bg-slate-900 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 font-black text-lg flex items-center justify-center border border-indigo-500/30">
                            #{cand.number}
                          </span>
                          <span
                            className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                              isSelected ? "bg-indigo-500 border-indigo-500 text-white" : "border-slate-600"
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="w-4 h-4" />}
                          </span>
                        </div>

                        <div>
                          <h2 className="text-xl font-bold text-white">{cand.name}</h2>
                        </div>

                        {cand.vision && (
                          <div className="space-y-1">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Visi:</p>
                            <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">{cand.vision}</p>
                          </div>
                        )}

                        {cand.mission && (
                          <div className="space-y-1">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Misi Utama:</p>
                            <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">{cand.mission}</p>
                          </div>
                        )}
                      </div>

                      <button
                        className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-md"
                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        }`}
                      >
                        {isSelected ? "Kandidat Dipilih" : "Pilih Kandidat Ini"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Voting Modal Action */}
            {selectedCandidate && (
              <div className="p-6 rounded-2xl bg-slate-900 border border-indigo-500/30 max-w-xl mx-auto space-y-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-indigo-400 shrink-0" />
                  <div>
                    <h3 className="font-bold text-white text-sm">Konfirmasi Suara untuk #{selectedCandidate.number} {selectedCandidate.name}</h3>
                    <p className="text-xs text-slate-400">Masukkan Participant ID Anda (misal dari QR Code) untuk mengirim suara.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={participantIdInput}
                    onChange={(e) => setParticipantIdInput(e.target.value)}
                    placeholder="Masukkan Participant ID Anda..."
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  <button
                    onClick={handleCastVote}
                    disabled={submitting || !participantIdInput.trim()}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:opacity-50 font-bold text-sm text-white rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {submitting ? "Kirim Suara..." : "Kirim Suara Sah Sekarang"} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
