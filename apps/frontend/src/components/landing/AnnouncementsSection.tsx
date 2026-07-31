'use client';

import { CalendarDays, Bell } from 'lucide-react';

export function AnnouncementsSection() {
  const announcements = [
    {
      id: 1,
      date: '2026-08-15',
      title: 'Pembukaan Pendaftaran Peserta',
      summary: 'Pendaftaran peserta Musyawarah Komunitas resmi dibuka. Silakan daftar melalui portal ini sebelum tanggal penutupan.',
    },
    {
      id: 2,
      date: '2026-08-10',
      title: 'Persyaratan Kandidat Ketua',
      summary: 'Dokumen persyaratan untuk mencalonkan diri sebagai ketua telah diterbitkan. Silakan unduh di halaman pendaftaran kandidat.',
    },
  ];

  return (
    <section className="py-24 bg-slate-50" id="pengumuman">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            Pengumuman Resmi
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Informasi dan pembaruan terbaru seputar pelaksanaan musyawarah.
          </p>
        </div>

        <div className="space-y-6">
          {announcements.map((announcement) => (
            <div 
              key={announcement.id} 
              className="group bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start"
            >
              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                <Bell size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                  <CalendarDays size={16} />
                  <span>{new Date(announcement.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                  {announcement.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {announcement.summary}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
