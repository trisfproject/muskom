"use client";

import { useCurrentEvent } from "@/providers/event/EventProvider";
import { Calendar, Settings } from "lucide-react";
import { StateBadge } from "../workflow/StateBadge";

export function CurrentEventCard() {
  const { currentEvent, isLoading } = useCurrentEvent();

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-slate-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">No Active Event</h3>
          <p className="text-sm text-slate-500">Please switch to an event context to manage operations.</p>
        </div>
        <Calendar className="w-8 h-8 text-slate-300" />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-1">Current Active Context</p>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{currentEvent.name}</h3>
        <div className="flex flex-wrap gap-2">
          <StateBadge state={currentEvent.status} />
          {currentEvent.settings.voting_enabled && (
             <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">
               Voting Enabled
             </span>
          )}
        </div>
      </div>
      
      <button className="inline-flex items-center justify-center p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );
}
