'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navGroups } from './nav-links';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, ChevronRight } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <aside className="hidden md:flex w-64 flex-col h-screen sticky top-0 bg-slate-900 text-slate-300 flex-shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-extrabold text-sm">M</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-extrabold text-base tracking-tight leading-none">MUSKOM</div>
          <div className="text-slate-500 text-xs mt-0.5">Admin Panel</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-widest">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.links.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <link.icon
                      className={`w-4 h-4 flex-shrink-0 ${
                        isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                    <span className="flex-1">{link.name}</span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User + logout */}
      <div className="border-t border-slate-800 p-3 space-y-1">
        {user && (
          <div className="px-3 py-2.5 rounded-xl bg-slate-800/50 mb-2">
            <div className="text-xs text-slate-500 font-medium">Masuk sebagai</div>
            <div className="text-white text-sm font-semibold truncate mt-0.5">{user.full_name || user.username}</div>
            <div className="text-emerald-500 text-xs capitalize">{user.role}</div>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
