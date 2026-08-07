"use client";

import { useEffect, useState } from "react";
import { Search, Bell, User as UserIcon, LogOut, Settings, Menu } from "lucide-react";
import Cookies from "js-cookie";
import { dashboardService } from "@/services/dashboard";
import { DashboardData } from "@/types/dashboard";
import Link from "next/link";
import { useSystemConfig } from "@/contexts/ConfigContext";

interface AdminHeaderProps {
  onOpenSidebar?: () => void;
}

export function AdminHeader({ onOpenSidebar }: AdminHeaderProps) {
  const { config } = useSystemConfig();
  const [data, setData] = useState<DashboardData | null>(null);
  const [user, setUser] = useState<{ full_name: string; role_name: string } | null>(null);

  useEffect(() => {
    // Fetch dashboard summary
    dashboardService.getSummary().then(res => {
      setData(res);
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

  const pendingNotifs = data?.summary?.pending_notifications || 0;

  return (
    <header className="sticky top-0 z-30 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-border)] flex items-center justify-between px-4 sm:px-6 py-4 h-16 shrink-0">
      
      {/* Mobile Hamburger */}
      {onOpenSidebar && (
        <button
          onClick={onOpenSidebar}
          className="mr-3 lg:hidden p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Search Bar Placeholder */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search anywhere (Cmd+K)"
            className="w-full pg-surface border border-[var(--color-border)] rounded-lg pl-10 pr-4 py-2 text-sm pg-text placeholder:pg-muted focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-medium rounded border pg-border pg-surface-elevated pg-muted">⌘</kbd>
            <kbd className="hidden sm:inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-medium rounded border pg-border pg-surface-elevated pg-muted">K</kbd>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 ml-auto">
        
        {/* Active Musyawarah Indicator */}
        {(config || data) && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full pg-surface border border-[var(--color-border)]">
            <div className={`w-2 h-2 rounded-full ${config?.publication?.website_status === 'PUBLISHED' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="text-xs font-medium pg-muted">
              {config?.website_identity?.community_name || "MUSKOM"}
            </span>
          </div>
        )}

        <div className="h-6 w-px bg-[var(--color-border)] hidden md:block"></div>

        {/* Quick Actions / Notifications */}
        <div className="relative group">
          <button className="relative p-2 min-h-[44px] min-w-[44px] flex items-center justify-center pg-muted hover:pg-text hover:pg-surface-elevated rounded-full transition-colors">
            <Bell className="w-5 h-5" />
            {pendingNotifs > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border border-slate-950"></span>
            )}
          </button>

          {/* Notifications Dropdown (Hover) */}
          <div className="absolute right-0 mt-2 w-72 pg-surface border border-[var(--color-border)] rounded-xl shadow-xl shadow-black/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all origin-top-right z-50">
            <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
              <span className="text-sm font-semibold pg-text">Notifikasi Operasional</span>
              <span className="text-[10px] font-medium bg-[var(--color-primary)]/10 text-primary px-2 py-0.5 rounded-full">
                {pendingNotifs} Baru
              </span>
            </div>
            <div className="p-2 max-h-64 overflow-y-auto">
              {pendingNotifs > 0 && (
                <Link href="/admin/verifications" className="flex items-start gap-3 p-3 hover:pg-surface-elevated rounded-lg transition-colors group/item">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium pg-muted group-hover/item:pg-text transition-colors">
                      {pendingNotifs} Menunggu Verifikasi
                    </div>
                    <div className="text-xs pg-faint mt-0.5">Harap segera tinjau data pendaftaran baru.</div>
                  </div>
                </Link>
              )}

              {pendingNotifs === 0 && (
                <div className="p-4 text-center text-sm pg-muted">
                  Tidak ada notifikasi tugas operasional saat ini.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="relative group">
          <button className="flex items-center gap-2 pl-2 min-h-[44px]">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold pg-text leading-tight">
                {user?.full_name || 'Administrator'}
              </div>
              <div className="text-[10px] font-medium pg-muted">
                {user?.role_name || 'System Admin'}
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white border-2 border-[var(--color-border)] shadow-sm">
              <UserIcon className="w-5 h-5" />
            </div>
          </button>

          {/* Dropdown (Hover) */}
          <div className="absolute right-0 mt-2 w-48 pg-surface border border-[var(--color-border)] rounded-xl shadow-xl shadow-black/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all origin-top-right z-50">
            <div className="p-2 space-y-1">
              <Link href="/admin/users/profile" className="flex items-center gap-2 px-3 py-2 min-h-[44px] text-sm pg-muted hover:pg-text hover:pg-surface-elevated rounded-lg transition-colors">
                <UserIcon className="w-4 h-4" />
                <span>Profil Saya</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 min-h-[44px] text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
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
