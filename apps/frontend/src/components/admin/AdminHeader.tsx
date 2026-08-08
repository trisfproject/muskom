"use client";

import { useEffect, useState } from "react";
import { Search, User as UserIcon, LogOut, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Cookies from "js-cookie";
import { dashboardService } from "@/services/dashboard";
import { DashboardData } from "@/types/dashboard";
import Link from "next/link";
import { useSystemConfig } from "@/contexts/ConfigContext";
import { NotificationBell } from "./NotificationBell";

interface AdminHeaderProps {
  /** Opens the mobile off-canvas drawer */
  onOpenMobileSidebar?: () => void;
  /** Current desktop sidebar collapsed state */
  isCollapsed?: boolean;
  /** Toggle desktop sidebar collapse */
  onToggleCollapse?: () => void;
  // Legacy prop kept for backward-compat (unused)
  onOpenSidebar?: () => void;
}

export function AdminHeader({
  onOpenMobileSidebar,
  isCollapsed = false,
  onToggleCollapse,
  onOpenSidebar,
}: AdminHeaderProps) {
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

  // Support legacy onOpenSidebar prop
  const handleMobileOpen = onOpenMobileSidebar ?? onOpenSidebar;

  return (
    <header className="sticky top-0 z-30 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-border)] flex items-center justify-between px-4 sm:px-6 py-4 h-16 shrink-0">

      {/* Left section: Desktop sidebar toggle + Mobile hamburger + Mobile Title */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Desktop sidebar collapse/expand — visible on lg+ */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            className="hidden lg:flex items-center justify-center w-9 h-9 rounded-lg hover:pg-surface-elevated text-slate-500 hover:pg-text transition-colors min-h-[44px] min-w-[44px]"
          >
            {isCollapsed
              ? <PanelLeftOpen className="w-5 h-5" />
              : <PanelLeftClose className="w-5 h-5" />
            }
          </button>
        )}

        {/* Mobile / Tablet hamburger — visible on < lg */}
        {handleMobileOpen && (
          <button
            onClick={handleMobileOpen}
            aria-label="Open navigation menu"
            className="lg:hidden flex items-center justify-center w-9 h-9 min-h-[44px] min-w-[44px] rounded-lg hover:pg-surface-elevated text-slate-500 hover:pg-text transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Mobile / Tablet Brand Name (< lg) */}
        <div className="lg:hidden flex items-center gap-2">
          <span className="font-bold text-sm pg-text truncate max-w-[140px] xs:max-w-[180px] sm:max-w-[240px]">
            {config?.website_identity?.community_name || "MUSKOM"}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md hidden sm:block mx-3">
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

        {/* Notifications */}
        <NotificationBell />

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
