"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sliders,
  Calendar,
  Megaphone,
  UserCheck,
  LogOut,
  ExternalLink,
  Mail,
  Users,
  Info,
  ShieldCheck,
  Activity,
  X,
} from "lucide-react";
import Cookies from "js-cookie";

import { useSystemConfig } from "@/contexts/ConfigContext";

interface AdminSidebarProps {
  isOpen?: boolean; // For mobile/tablet offcanvas drawer
  onClose?: () => void;
  isCollapsed?: boolean; // Controlled from parent (desktop only)
  onToggleCollapse?: () => void;
}

export function AdminSidebar({
  isOpen = false,
  onClose,
  isCollapsed = false,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { config } = useSystemConfig();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle ESC key and resize cleanup when mobile/tablet drawer is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 1024 && onClose) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, onClose]);

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

  const navGroups = [
    {
      title: "Monitoring",
      items: [
        { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { label: "Ops Dashboard", href: "/admin/operations", icon: Activity },
      ],
    },
    {
      title: "Data Induk",
      items: [
        { label: "Peserta", href: "/admin/participants", icon: Users },
        { label: "Kandidat", href: "/admin/candidates", icon: UserCheck },
      ],
    },
    {
      title: "Operasional",
      items: [
        { label: "QR Check-in", href: "/admin/checkin", icon: Activity },
        { label: "Verifikasi Berkas", href: "/admin/verifications", icon: ShieldCheck },
        { label: "Presensi Kehadiran", href: "/admin/attendance", icon: UserCheck },
        { label: "Bilik Suara", href: "/admin/billick", icon: Activity, target: "_blank" },
        { label: "Monitor E-Voting", href: "/admin/voting", icon: Activity },
      ],
    },
    {
      title: "Pengaturan Website",
      items: [
        { label: "Identitas Web", href: "/admin/website/identity", icon: Sliders },
        { label: "Timeline Acara", href: "/admin/website/timeline", icon: Calendar },
        { label: "Pengumuman", href: "/admin/website/announcements", icon: Megaphone },
        { label: "Panduan", href: "/admin/website/guides", icon: Info },
      ],
    },
    {
      title: "Sistem",
      items: [
        { label: "Manajemen Pengguna", href: "/admin/users", icon: Users },
        { label: "Audit Log", href: "/admin/audit", icon: Activity },
        { label: "Konfigurasi SMTP", href: "/admin/system/smtp", icon: Mail },
        { label: "Template Email", href: "/admin/system/templates", icon: Mail },
        { label: "Log Email", href: "/admin/system/email-logs", icon: Activity },
      ],
    },
  ];

  if (!mounted) return null; // Avoid hydration mismatch on initial render

  return (
    <>
      {/* Mobile & Tablet Backdrop Overlay (< lg) */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in" 
          onClick={onClose} 
          aria-hidden="true"
        />
      )}
      
      <aside 
        className={`pg-bg border-r pg-border pg-muted flex flex-col h-screen fixed inset-y-0 left-0 z-50 lg:sticky lg:top-0 shrink-0 select-none transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        } w-[280px] md:w-[300px] ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b pg-border flex items-center justify-between min-h-[72px]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 shrink-0 rounded-xl bg-primary flex items-center justify-center text-white font-black text-sm shadow-md shadow-primary/20">
              {initial}
            </div>
            <div className={`${isCollapsed ? "lg:hidden" : "lg:block"} block truncate transition-opacity duration-300`}>
              <h1 className="font-bold pg-text text-sm tracking-tight truncate">{communityName}</h1>
              <p className="text-[10px] text-primary font-semibold uppercase tracking-wider">Admin Portal</p>
            </div>
          </div>
          
          {/* Mobile & Tablet close button inside drawer (< lg) */}
          <button
            onClick={onClose}
            aria-label="Close navigation menu"
            className="lg:hidden p-2 rounded-lg hover:pg-surface-elevated text-slate-500 hover:pg-text transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.title} className="px-3">
              {/* Group Title: Always visible on mobile/tablet drawer; conditional on desktop */}
              <p className={`${isCollapsed ? "lg:hidden" : "lg:block"} block px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 truncate`}>
                {group.title}
              </p>
              
              {/* Compact Separator on Collapsed Desktop only */}
              {isCollapsed && (
                <div className="hidden lg:flex w-full justify-center mb-2">
                  <div className="w-4 h-0.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
                </div>
              )}
              
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      target={(item as any).target || "_self"}
                      onClick={() => {
                        if (onClose && (item as any).target !== "_blank") onClose();
                      }}
                      title={item.label}
                      className={`flex items-center ${
                        isCollapsed ? "lg:justify-center lg:px-0" : "lg:justify-between lg:px-3"
                      } px-3 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "bg-primary text-white shadow-sm shadow-primary/25 font-semibold"
                          : "text-slate-600 dark:text-slate-300 hover:pg-text hover:bg-slate-100 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                        <span className={`${isCollapsed ? "lg:hidden" : "lg:inline"} inline truncate`}>
                          {item.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="p-3 border-t pg-border flex flex-col gap-2 bg-slate-50/50 dark:bg-slate-900/30">
          <div className={`flex items-center ${isCollapsed ? "lg:flex-col lg:gap-2" : "lg:flex-row lg:justify-between"} justify-between gap-2`}>
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:pg-text transition-colors min-h-[44px] text-xs font-medium"
              title="Lihat Website Publik"
            >
              <ExternalLink className="w-4 h-4 shrink-0 text-slate-500" />
              <span className={`${isCollapsed ? "lg:hidden" : "lg:inline"} inline`}>
                Website Publik
              </span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors min-h-[44px] text-xs font-medium cursor-pointer"
              title="Keluar"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className={`${isCollapsed ? "lg:hidden" : "lg:inline"} inline`}>
                Keluar
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
