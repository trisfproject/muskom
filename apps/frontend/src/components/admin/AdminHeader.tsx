"use client";

import { useEffect, useState } from "react";
import { Search, Bell, User as UserIcon, LogOut, Settings } from "lucide-react";
import Cookies from "js-cookie";
import { dashboardService } from "@/services/dashboard";
import { DashboardSummary } from "@/types/dashboard";
import Link from "next/link";

export function AdminHeader() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [user, setUser] = useState<{ full_name: string; role_name: string } | null>(null);

  useEffect(() => {
    // Fetch dashboard summary
    dashboardService.getSummary().then(data => {
      setSummary(data);
    }).catch(() => {});

    // Get user from cookie
    try {
      const userDataStr = Cookies.get("user_data");
      if (userDataStr) {
        setUser(JSON.parse(userDataStr));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    Cookies.remove("user_data");
    window.location.href = "/admin/login";
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-border)] flex items-center justify-between px-6 py-4 h-16">
      {/* Search Bar Placeholder */}
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search anywhere (Cmd+K)"
            className="w-full bg-slate-900 border border-[var(--color-border)] rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-medium rounded border border-slate-700 bg-slate-800 text-slate-400">⌘</kbd>
            <kbd className="hidden sm:inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-medium rounded border border-slate-700 bg-slate-800 text-slate-400">K</kbd>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 ml-auto">
        
        {/* Active Musyawarah Indicator */}
        {summary?.event && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-[var(--color-border)]">
            <div className={`w-2 h-2 rounded-full ${summary.event.status === 'PUBLISHED' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="text-xs font-medium text-slate-300">
              {summary.event.name || 'Untitled Event'}
            </span>
          </div>
        )}

        <div className="h-6 w-px bg-slate-800 hidden md:block"></div>

        {/* Quick Actions / Notifications */}
        <div className="relative group">
          <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
            <Bell className="w-5 h-5" />
            {(summary?.pending_participants || 0) + (summary?.pending_candidates || 0) > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border border-slate-950"></span>
            )}
          </button>

          {/* Notifications Dropdown (Hover) */}
          <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-[var(--color-border)] rounded-xl shadow-xl shadow-black/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all origin-top-right z-50">
            <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Notifikasi Operasional</span>
              <span className="text-[10px] font-medium bg-[var(--color-primary)]/10 text-primary px-2 py-0.5 rounded-full">
                {(summary?.pending_participants || 0) + (summary?.pending_candidates || 0)} Baru
              </span>
            </div>
            <div className="p-2 max-h-64 overflow-y-auto">
              {(summary?.pending_participants || 0) > 0 && (
                <Link href="/admin/registrations" className="flex items-start gap-3 p-3 hover:bg-slate-800 rounded-lg transition-colors group/item">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200 group-hover/item:text-white transition-colors">
                      {summary?.pending_participants} Peserta perlu verifikasi
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">Harap segera tinjau data pendaftaran peserta baru.</div>
                  </div>
                </Link>
              )}
              
              {(summary?.pending_candidates || 0) > 0 && (
                <Link href="/admin/candidates" className="flex items-start gap-3 p-3 hover:bg-slate-800 rounded-lg transition-colors group/item">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200 group-hover/item:text-white transition-colors">
                      {summary?.pending_candidates} Kandidat perlu verifikasi
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">Harap segera tinjau kelengkapan berkas kandidat.</div>
                  </div>
                </Link>
              )}

              {((summary?.pending_participants || 0) + (summary?.pending_candidates || 0)) === 0 && (
                <div className="p-4 text-center text-sm text-slate-500">
                  Tidak ada notifikasi tugas operasional saat ini.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="relative group">
          <button className="flex items-center gap-2 pl-2">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-white leading-tight">
                {user?.full_name || 'Administrator'}
              </div>
              <div className="text-[10px] font-medium text-slate-500">
                {user?.role_name || 'System Admin'}
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white border-2 border-[var(--color-border)] shadow-sm">
              <UserIcon className="w-5 h-5" />
            </div>
          </button>

          {/* Dropdown (Hover) */}
          <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-[var(--color-border)] rounded-xl shadow-xl shadow-black/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all origin-top-right z-50">
            <div className="p-2 space-y-1">
              <Link href="/admin/users/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
                <span>Account Settings</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
