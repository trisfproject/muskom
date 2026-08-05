"use client";

import React from "react";
import { FileText, Download, ShieldCheck, BookOpen, FileSpreadsheet } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

export default function PublicDocumentsPage() {
  const documents = [
    {
      id: "doc-1",
      title: "Tata Tertib Musyawarah Komunitas (Tatib MUSKOM 2026)",
      category: "Regulasi",
      format: "PDF",
      size: "1.2 MB",
      url: "#",
    },
    {
      id: "doc-2",
      title: "Anggaran Dasar & Anggaran Rumah Tangga (AD/ART)",
      category: "Regulasi",
      format: "PDF",
      size: "2.4 MB",
      url: "#",
    },
    {
      id: "doc-3",
      title: "Panduan Teknis Pelaksanaan E-Voting & Presensi Digital",
      category: "Panduan",
      format: "PDF",
      size: "850 KB",
      url: "#",
    },
    {
      id: "doc-4",
      title: "Laporan Pertanggungjawaban Pengurus (LPJ 2024-2026)",
      category: "Laporan",
      format: "PDF",
      size: "4.8 MB",
      url: "#",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-bold">
            <FileText className="w-3.5 h-3.5" /> Pusat Dokumen & Unduhan Resmi
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Berkas & Dokumen Musyawarah
          </h1>
          <p className="text-sm text-slate-400">
            Unduh regulasi, tata tertib, panduan e-voting, dan laporan persidangan.
          </p>
        </div>

        {/* Document Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {doc.category}
                  </span>
                  <span className="text-xs font-mono text-slate-500 font-bold">{doc.format} • {doc.size}</span>
                </div>
                <h2 className="text-base font-bold text-white leading-snug">{doc.title}</h2>
              </div>

              <a
                href={doc.url}
                onClick={(e) => { e.preventDefault(); alert("Dokumen dapat diunduh saat sesi rapat pleno dibuka."); }}
                className="w-full py-2.5 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" /> Unduh Dokumen
              </a>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
