"use client";

import { useCurrentEvent } from "@/providers/event/EventProvider";
import { ChevronDown, CalendarDays } from "lucide-react";

export function EventSwitcher() {
  const { currentEvent } = useCurrentEvent();

  // In a real implementation, clicking this would open a dropdown populated 
  // with a GET /api/v1/events endpoint.
  
  return (
    <div className="relative inline-block text-left">
      <button 
        type="button" 
        className="inline-flex w-full items-center justify-between gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
      >
        <CalendarDays className="h-4 w-4 text-slate-500" />
        <span className="truncate max-w-[150px]">
          {currentEvent ? currentEvent.name : "System Default"}
        </span>
        <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
      </button>

      {/* Dropdown menu mock */}
      {/* 
      <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        <div className="py-1">
          <button onClick={() => setEventId(null)} className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
             Clear Context (Default)
          </button>
        </div>
      </div> 
      */}
    </div>
  );
}
