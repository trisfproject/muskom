"use client";

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
} from "lucide-react";
import Cookies from "js-cookie";

import { useSystemConfig } from "@/contexts/ConfigContext";

export function AdminSidebar() {
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
      title: "Overview",
      items: [
        { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      title: "Musyawarah",
      items: [
        { label: "General", href: "/admin/musyawarah/general", icon: Sliders },
        { label: "Location", href: "/admin/musyawarah/location", icon: Sparkles },
        { label: "Timeline", href: "/admin/musyawarah/timeline", icon: Calendar },
        { label: "Publication", href: "/admin/musyawarah/publication", icon: Megaphone },
        { label: "Archive", href: "/admin/musyawarah/archive", icon: UserCheck },
      ],
    },
    {
      title: "Website CMS",
      items: [
        { label: "General", href: "/admin/website/general", icon: Sliders },
        { label: "Hero", href: "/admin/website/hero", icon: Sparkles },
        { label: "Timeline", href: "/admin/website/timeline", icon: Calendar },
        { label: "Pengumuman", href: "/admin/website/announcements", icon: Megaphone },
        { label: "Bursa Calon", href: "/admin/website/candidate", icon: UserCheck },
        { label: "Pusat Informasi", href: "/admin/website/information", icon: Sparkles },
        { label: "Footer", href: "/admin/website/footer", icon: PanelBottom },
      ],
    },
    {
      title: "Registrations",
      items: [
        { label: "Data Peserta", href: "/admin/registrations", icon: UserCheck },
      ],
    },
    {
      title: "System & Security",
      items: [
        { label: "Pengguna & Hak Akses", href: "/admin/users", icon: UserCheck },
        { label: "Audit Log", href: "/admin/audit", icon: LayoutDashboard },
      ],
    },
  ];

  return (
    <aside className="w-64 pg-bg border-r pg-border pg-muted flex flex-col h-screen sticky top-0 shrink-0 select-none">
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
        <Link
          href="/"
          target="_blank"
          className="p-1.5 rounded-md hover:pg-surface-elevated pg-muted hover:pg-text transition-colors"
          title="Lihat Website Publik"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
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
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "pg-primary text-white font-semibold shadow-sm shadow-primary/20"
                        : "text-slate-600 dark:text-slate-300 hover:pg-text hover:pg-surface-elevated"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500 dark:text-slate-400 group-hover:pg-text"}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
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
          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
          title="Keluar"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
