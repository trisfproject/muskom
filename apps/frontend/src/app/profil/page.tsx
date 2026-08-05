"use client";

import React, { useState } from "react";
import { QrCode, Search, CheckCircle2, User, Building, MapPin, Calendar, Download, AlertCircle } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

interface ParticipantProfile {
  id: string;
  registration_number: string;
  full_name: string;
  company_name: string;
  industrial_area: string;
  job_title: string;
  status: string;
  created_at: string;
}

export default function UserProfileTicketPage() {
  const [emailOrReg, setEmailOrReg] = useState("");
  const [profile, setProfile] = useState<ParticipantProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearchProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrReg.trim()) return;

    try {
      setLoading(true);
      setSearched(true);
      const res = await fetch(`/api/v1/public/participants?email=${encodeURIComponent(emailOrReg.trim())}`);
      const data = await res.json();
      if (data.success && data.data) {
        setProfile(data.data);
      } else {
        setProfile(null);
      }
    } catch (err) {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-3xl space-y-8">
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Tiket Presensi & Profil Peserta
          </h1>
          <p className="text-sm text-slate-400">
            Cari pendaftaran Anda untuk mengunduh QR Ticket resmi Musyawarah
          </p>
        </div>

        {/* Search Box */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <form onSubmit={handleSearchProfile} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={emailOrReg}
                onChange={(e) => setEmailOrReg(e.target.value)}
                placeholder="Masukkan Email Terdaftar atau Nomor Registrasi (PAR-...)"
                className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !emailOrReg.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 font-bold text-sm rounded-xl transition-all shadow-md shrink-0"
            >
              {loading ? "Mencari..." : "Cari Tiket"}
            </button>
          </form>
        </div>

        {/* Ticket Result Display */}
        {searched && (
          loading ? (
            <div className="p-12 text-center text-slate-400">Loading data tiket...</div>
          ) : profile ? (
            <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/80 border border-slate-800 shadow-2xl relative overflow-hidden space-y-6">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <QrCode className="w-64 h-64 text-blue-400" />
              </div>

              {/* Status Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 gap-2">
                <div>
                  <span className="text-xs font-mono text-blue-400 font-bold uppercase tracking-wider">
                    {profile.registration_number}
                  </span>
                  <h2 className="text-xl font-extrabold text-white mt-0.5">{profile.full_name}</h2>
                </div>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> {profile.status.toUpperCase()}
                </span>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3 text-slate-300">
                  <Building className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <p className="text-[11px] text-slate-500">Perusahaan / Instansi</p>
                    <p className="font-semibold">{profile.company_name || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <p className="text-[11px] text-slate-500">Kawasan Industri</p>
                    <p className="font-semibold">{profile.industrial_area || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <User className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <p className="text-[11px] text-slate-500">Jabatan</p>
                    <p className="font-semibold">{profile.job_title || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <p className="text-[11px] text-slate-500">Tanggal Terdaftar</p>
                    <p className="font-semibold">{new Date(profile.created_at).toLocaleDateString("id-ID")}</p>
                  </div>
                </div>
              </div>

              {/* Digital QR Ticket */}
              <div className="p-6 rounded-2xl bg-white text-slate-900 flex flex-col items-center justify-center space-y-3">
                <div className="w-40 h-40 bg-slate-100 border-2 border-slate-900 rounded-xl flex items-center justify-center p-2">
                  {/* Visual QR Simulator */}
                  <div className="w-full h-full border-4 border-dashed border-slate-800 rounded flex flex-col items-center justify-center text-center">
                    <QrCode className="w-16 h-16 text-slate-800" />
                    <span className="text-[9px] font-mono font-bold mt-1 tracking-tighter">QR VALID</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 text-center font-mono font-bold">
                  {profile.id}
                </p>
                <p className="text-[11px] text-slate-400 text-center">
                  Tunjukkan QR Code ini kepada panitia presensi di lokasi musyawarah.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
              <p className="font-semibold text-white">Data Peserta Tidak Ditemukan</p>
              <p className="text-xs text-slate-400">Pastikan email atau nomor registrasi yang Anda masukkan benar.</p>
            </div>
          )
        )}
      </main>

      <Footer />
    </div>
  );
}
