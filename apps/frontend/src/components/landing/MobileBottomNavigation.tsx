"use client"

import Link from "next/link"
import { useAnchorNav } from "@/hooks/useAnchorNav"
import { navItems } from "@/config/navigation"

export function MobileBottomNavigation() {
  const { activeSection, handleNavClick } = useAnchorNav(navItems, 80)

  return (
    <div 
      className="fixed z-50 md:hidden w-full px-4"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
    >
      <nav className="flex items-center justify-between px-2 py-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/30 shadow-lg shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-full">
        {navItems.map((item) => {
          const isActive = activeSection === item.href || (activeSection === "/" && item.href === "/")

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="relative flex flex-col items-center justify-center w-full min-w-0 pt-1 pb-1 px-1 transition-all duration-300"
            >
              {isActive && (
                <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 rounded-full animate-in fade-in zoom-in duration-300" />
              )}
              
              <div 
                className={`flex flex-col items-center justify-center transition-transform duration-300 ${
                  isActive ? "-translate-y-0.5" : ""
                }`}
              >
                <item.icon 
                  className={`w-5 h-5 mb-1 transition-colors duration-300 ${
                    isActive 
                      ? "text-blue-600 dark:text-blue-400 drop-shadow-[0_0_8px_rgba(37,99,235,0.4)]" 
                      : "text-slate-500 dark:text-slate-400"
                  }`} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span 
                  className={`text-[10px] leading-tight transition-all duration-300 ${
                    isActive 
                      ? "font-bold text-blue-700 dark:text-blue-300" 
                      : "font-medium text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
