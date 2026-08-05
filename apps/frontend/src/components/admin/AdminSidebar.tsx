"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe,
  LayoutDashboard,
  Sliders,
  Sparkles,
  Calendar,
  Megaphone,
  UserCheck,
  PanelBottom,
  LogOut,
  ChevronRight,
  ExternalLink,
  List,
  MonitorPlay,
  Users,
  Info,
  Archive,
  MapPin,
  UserPlus,
  ShieldCheck,
  Activity,
  BarChart3,
  X
} from "lucide-react";
import Cookies from "js-cookie";

import { useSystemConfig } from "@/contexts/ConfigContext";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { config } = useSystemConfig();

  // If login page, don't render sidebar
  if (pathname.includes("/admin/login")) {
    return null;
  }

  const handleLogout = () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    Cookies.remove("user_data");
    window.location.href = "/admin/login";
  };

  const communityName = config?.website_identity?.community_name || "MUSKOM";
  const initial = communityName.charAt(0).toUpperCase();

  const navItems = [
    {
      title: "Dashboard",
      items: [
        { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, exact: true },
      ],
    },
    {
      title: "Musyawarah",
      items: [
        { label: "General", href: "/admin/website/general", icon: Sliders, exact: false },
        { label: "Lokasi", href: "/admin/musyawarah/location", icon: MapPin, exact: false },
        { label: "Timeline", href: "/admin/website/timeline", icon: Calendar, exact: false },
        { label: "Publikasi", href: "/admin/musyawarah/publication", icon: Megaphone, exact: false },
        { label: "Arsip", href: "/admin/musyawarah/archive", icon: Archive, exact: false },
      ],
    },
    {
      title: "Website",
      items: [
        { label: "Hero", href: "/admin/website/hero", icon: MonitorPlay },
        { label: "Kandidat", href: "/admin/website/candidate", icon: Users },
        { label: "Pengumuman", href: "/admin/website/announcements", icon: Megaphone },
        { label: "Halaman Panduan", href: "/admin/website/information", icon: Info },
        { label: "Footer", href: "/admin/website/footer", icon: PanelBottom },
      ],
    },
    {
      title: "Registrasi",
      items: [
        { label: "Bakal Calon", href: "/admin/candidates", icon: UserPlus, exact: false },
        { label: "Dashboard Peserta", href: "/admin/participants", icon: BarChart3, exact: false },
        { label: "Peserta", href: "/admin/registrations", icon: Users, exact: false },
        { label: "Verifikasi", href: "#coming-soon-verification", icon: ShieldCheck, comingSoon: true },
      ],
    },
    {
      title: "System",
      items: [
        { label: "Pengguna", href: "/admin/users", icon: Users, exact: false },
        { label: "Audit Log", href: "/admin/audit", icon: Activity, exact: false },
      ],
    },
  ] as { title: string; items: { label: string; href: string; icon: React.ComponentType<{ className?: string }>; exact?: boolean; comingSoon?: boolean }[] }[];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" 
          onClick={onClose} 
        />
      )}
      <aside 
        className={`w-64 pg-bg border-r pg-border pg-muted flex flex-col h-screen fixed inset-y-0 left-0 z-50 lg:sticky lg:top-0 shrink-0 select-none transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b pg-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-black text-sm shadow-md shadow-[var(--color-primary)]/30">
              {initial}
            </div>
            <div>
              <h1 className="font-bold pg-text text-sm tracking-tight">{communityName}</h1>
              <p className="text-[10px] text-primary font-semibold uppercase tracking-wider">Admin Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href="/"
              target="_blank"
              className="p-1.5 rounded-md hover:pg-surface-elevated pg-muted hover:pg-text transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Lihat Website Publik"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-md hover:pg-surface-elevated pg-muted hover:pg-text transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {navItems.map((group) => (
          <div key={group.title}>
            <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact 
                  ? pathname === item.href 
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.comingSoon ? "#" : item.href}
                    onClick={(e) => item.comingSoon && e.preventDefault()}
                    className={`flex items-center justify-between px-3 py-2 min-h-[44px] rounded-lg text-xs font-medium transition-all ${
                      item.comingSoon
                        ? "opacity-50 cursor-not-allowed text-slate-500"
                        : isActive
                        ? "pg-primary text-white font-semibold shadow-sm shadow-primary/20"
                        : "text-slate-600 dark:text-slate-300 hover:pg-text hover:pg-surface-elevated"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive && !item.comingSoon ? "text-white" : "text-slate-500 dark:text-slate-400 group-hover:pg-text"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.comingSoon ? (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                        Segera
                      </span>
                    ) : isActive ? (
                      <ChevronRight className="w-3.5 h-3.5 opacity-80" />
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User / Logout Footer */}
      <div className="p-4 border-t pg-border flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-7 h-7 rounded-full pg-surface-elevated border pg-border flex items-center justify-center pg-muted text-xs font-bold shrink-0">
            A
          </div>
          <div className="truncate">
            <p className="text-xs font-medium pg-text truncate">Administrator</p>
            <p className="text-[10px] pg-faint">Panitia Muskom</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
          title="Keluar"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
    </>
  );
}
