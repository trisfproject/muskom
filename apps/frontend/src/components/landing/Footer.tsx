'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <span className="text-emerald-400 font-extrabold text-xs">M</span>
            </div>
            <span className="text-white font-bold tracking-wide">MUSKOM</span>
          </div>

          <div className="text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} Musyawarah Komunitas. Platform Resmi.
          </div>

          <div className="flex items-center gap-6 text-sm font-medium">
            <Link href="/admin/login" className="hover:text-white transition-colors">
              Portal Admin
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
}
