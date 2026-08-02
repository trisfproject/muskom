"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface DetailLayoutTab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface DetailLayoutProps {
  title: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  tabs: DetailLayoutTab[];
  defaultTab?: string;
}

export function DetailLayout({
  title,
  subtitle,
  headerActions,
  tabs,
  defaultTab
}: DetailLayoutProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeContent = tabs.find(t => t.id === activeTab)?.content;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {headerActions && (
          <div className="flex items-center gap-3">
            {headerActions}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800">
        <nav className="flex gap-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeContent}
      </div>
    </div>
  );
}
