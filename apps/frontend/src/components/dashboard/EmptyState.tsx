import { CalendarX } from 'lucide-react';
import Link from 'next/link';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-6">
        <CalendarX className="h-10 w-10 text-slate-400" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-3">Belum Ada Event Aktif</h2>
      <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
        Belum ada event Musyawarah yang dikonfigurasi. Buat dan konfigurasikan event terlebih dahulu untuk mulai mengelola peserta dan kandidat.
      </p>
      <Link
        href="/admin/events"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/20"
      >
        Konfigurasi Event Sekarang
      </Link>
    </div>
  );
}
