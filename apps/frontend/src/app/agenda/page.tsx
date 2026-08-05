"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, CheckCircle2, ChevronRight } from "lucide-react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

interface TimelineItem {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
}

export default function PublicAgendaPage() {
  const [timelines, setTimelines] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAgenda() {
      try {
        const res = await fetch("/api/v1/public/home");
        const data = await res.json();
        if (data.success && data.data?.timeline) {
          setTimelines(data.data.timeline);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAgenda();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold">
            <Calendar className="w-3.5 h-3.5" /> Agenda & Jadwal Resmi Musyawarah
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Rangkaian Acara Musyawarah
          </h1>
          <p className="text-sm text-slate-400">
            Jadwal kegiatan pleno, persidangan, dan agenda pemilihan ketua umum.
          </p>
        </div>

        {/* Agenda List */}
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Memuat agenda musyawarah...</div>
          ) : timelines.length === 0 ? (
            <div className="p-12 text-center text-slate-400 rounded-2xl bg-slate-900 border border-slate-800">
              Belum ada agenda publik yang dirilis.
            </div>
          ) : (
            timelines.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/30">
                      {idx + 1}
                    </span>
                    <h2 className="text-lg font-bold text-white">{item.title}</h2>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-blue-400 font-mono font-semibold bg-blue-500/10 px-3 py-1 rounded-full w-fit">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(item.start_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
                {item.description && (
                  <p className="text-sm text-slate-300 pl-11 leading-relaxed">{item.description}</p>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      <Footer data={null} />
    </div>
  );
}
