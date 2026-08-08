"use client";

import React, { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuickActionItem {
  label: string;
  icon?: React.ElementType;
  onClick: () => void;
  variant?: "default" | "danger" | "success";
}

interface QuickActionMenuProps {
  items: QuickActionItem[];
}

export function QuickActionMenu({ items }: QuickActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg pg-muted hover:pg-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl shadow-black/10 dark:shadow-black/50 z-50 py-1.5 overflow-hidden">
          {items.map((item, idx) => {
            const Icon = item.icon;
            
            let colorClass = "pg-text hover:bg-slate-50 dark:hover:bg-slate-800";
            if (item.variant === "danger") {
              colorClass = "text-[var(--color-danger)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10";
            } else if (item.variant === "success") {
              colorClass = "text-[var(--color-success)] hover:text-[var(--color-success)] hover:bg-[var(--color-success)]/10";
            }

            return (
              <button
                key={idx}
                onClick={() => {
                  setIsOpen(false);
                  item.onClick();
                }}
                className={cn(
                  "w-full text-left px-4 py-2.5 min-h-[40px] text-sm flex items-center gap-2.5 transition-colors cursor-pointer",
                  colorClass
                )}
              >
                {Icon && <Icon className="w-4 h-4 shrink-0" />}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
