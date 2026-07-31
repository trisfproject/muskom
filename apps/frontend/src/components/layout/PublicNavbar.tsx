'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X, Lock } from 'lucide-react';

const navItems = [
  { label: 'Beranda', href: '#' },
  { label: 'Timeline', href: '#timeline' },
  { label: 'Kandidat', href: '#kandidat' },
  { label: 'Pengumuman', href: '#pengumuman' },
];

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Prevent scrolling when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-out ${
          scrolled
            ? 'bg-white/75 backdrop-blur-lg border-b border-slate-200/50 shadow-sm py-2'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {/* Left: Brand */}
            <div className="flex-1 flex justify-start">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                  <span className="text-white font-extrabold text-sm">M</span>
                </div>
                <span
                  className={`text-xl font-extrabold tracking-tight transition-colors duration-300 ${
                    scrolled ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  MUSKOM
                </span>
              </Link>
            </div>

            {/* Center: Desktop Nav */}
            <nav className="hidden md:flex flex-1 justify-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    scrolled
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right: Actions */}
            <div className="flex-1 flex justify-end items-center gap-3">
              <Link
                href="/admin/login"
                className={`hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                  scrolled
                    ? 'bg-slate-900 text-white shadow-md hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5'
                    : 'bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white/20 hover:border-white/30'
                }`}
              >
                <Lock className="w-4 h-4" />
                Portal Admin
              </Link>

              {/* Mobile toggle */}
              <button
                className={`md:hidden p-2 rounded-full transition-all duration-300 flex items-center justify-center w-10 h-10 ${
                  scrolled 
                    ? 'text-slate-700 hover:bg-slate-100 bg-transparent' 
                    : 'text-white bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20'
                }`}
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide Drawer */}
      <div 
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? 'visible' : 'invisible pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileOpen(false)}
        />
        
        {/* Drawer Panel */}
        <div 
          className={`absolute top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            mobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 h-20 border-b border-slate-100">
            <span className="font-extrabold text-xl tracking-tight text-slate-900">Menu Utama</span>
            <button 
              className="p-2 -mr-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center w-10 h-10"
              onClick={() => setMobileOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Drawer Links */}
          <div className="p-4 space-y-1 overflow-y-auto flex-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center px-4 py-4 rounded-2xl text-base font-semibold text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          {/* Drawer Footer / CTA */}
          <div className="p-6 border-t border-slate-100 bg-slate-50">
            <Link
              href="/admin/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-slate-900 text-white rounded-2xl font-bold shadow-md hover:bg-slate-800 transition-colors hover:shadow-lg hover:-translate-y-0.5"
            >
              <Lock className="w-4 h-4" />
              Masuk Portal Admin
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
