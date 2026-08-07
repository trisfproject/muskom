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
  ChevronRight,
  ExternalLink,
  Mail,
  Users,
  Info,
  ShieldCheck,
  Activity,
  ChevronLeft,
  ChevronRightSquare,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import Cookies from "js-cookie";

import { useSystemConfig } from "@/contexts/ConfigContext";

interface AdminSidebarProps {
  isOpen?: boolean; // For mobile offcanvas
  onClose?: () => void;
}

export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { config } = useSystemConfig();
  
  // Collapsible state (Desktop)
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("adminSidebarCollapsed");
    if (saved === "true") setIsCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("adminSidebarCollapsed", String(newState));
  };

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
        { label: "Operational Dashboard", href: "/admin/operations", icon: Activity },
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
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" 
          onClick={onClose} 
        />
      )}
      
      <aside 
        className={`pg-bg border-r pg-border pg-muted flex flex-col h-screen fixed inset-y-0 left-0 z-50 lg:sticky lg:top-0 shrink-0 select-none transform transition-all duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-20" : "lg:w-64 w-64"}`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b pg-border flex items-center justify-between min-h-[72px]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 shrink-0 rounded-lg bg-primary flex items-center justify-center text-white font-black text-sm shadow-md">
              {initial}
            </div>
            {!isCollapsed && (
              <div className="truncate transition-opacity duration-300">
                <h1 className="font-bold pg-text text-sm tracking-tight truncate">{communityName}</h1>
                <p className="text-[10px] text-primary font-semibold uppercase tracking-wider">Admin</p>
              </div>
            )}
          </div>
          
          {/* Mobile close button inside header */}
          {isOpen && (
            <button onClick={onClose} className="lg:hidden p-1.5 rounded-md hover:pg-surface-elevated text-slate-500">
              <PanelLeftClose className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-hide space-y-6">
          {navGroups.map((group) => (
            <div key={group.title} className="px-3">
              {!isCollapsed && (
                <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 truncate">
                  {group.title}
                </p>
              )}
              {isCollapsed && (
                <div className="w-full flex justify-center mb-2">
                  <div className="w-4 h-0.5 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                </div>
              )}
              
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={isCollapsed ? item.label : undefined}
                      className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-3'} py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "pg-primary text-white shadow-sm shadow-primary/20"
                          : "text-slate-600 dark:text-slate-300 hover:pg-text hover:pg-surface-elevated"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-slate-500 group-hover:pg-text"}`} />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="p-3 border-t pg-border flex flex-col gap-2">
          {/* Collapse Toggle */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex w-full items-center justify-center p-2 rounded-lg hover:pg-surface-elevated text-slate-500 hover:pg-text transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
          
          <div className={`flex items-center ${isCollapsed ? 'flex-col gap-2' : 'justify-between'}`}>
            <Link
              href="/"
              target="_blank"
              className="p-2 rounded-lg hover:pg-surface-elevated text-slate-500 hover:pg-text transition-colors"
              title="Lihat Website Publik"
            >
              <ExternalLink className="w-5 h-5" />
            </Link>
            
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              title="Keluar"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
