"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

export interface EventSettings {
  registration_enabled: boolean;
  candidate_enabled: boolean;
  attendance_enabled: boolean;
  voting_enabled: boolean;
  notification_enabled: boolean;
  realtime_enabled: boolean;
}

export interface EventContextType {
  id: string;
  slug: string;
  name: string;
  status: string;
  settings: EventSettings;
}

interface EventProviderContextType {
  currentEvent: EventContextType | null;
  isLoading: boolean;
  setEventId: (id: string | null) => void;
}

const EventContext = createContext<EventProviderContextType>({
  currentEvent: null,
  isLoading: true,
  setEventId: () => {},
});

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [currentEvent, setCurrentEvent] = useState<EventContextType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);

  // Load initial preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("muskom_active_event_id");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setActiveEventId(saved);
  }, []);

  useEffect(() => {
    let isMounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);

    // Write to local storage immediately so interceptor picks it up
    if (activeEventId) {
      localStorage.setItem("muskom_active_event_id", activeEventId);
    } else {
      localStorage.removeItem("muskom_active_event_id");
    }

    // We can fetch the event details using a dedicated endpoint in the future.
    // For now, if we have an ID, we could fetch it. Since this is an architectural setup,
    // we assume the backend will return the event info via a GET /api/v1/events/active endpoint.
    // We will stub the API call here to prevent app crash if endpoint isn't ready.
    api.get("/events/active")
      .then((res) => {
        if (isMounted && res.data?.data) {
          setCurrentEvent(res.data.data as EventContextType);
        }
      })
      .catch((err) => {
        console.warn("Failed to load active event", err);
        if (isMounted) setCurrentEvent(null);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeEventId]);

  return (
    <EventContext.Provider value={{ currentEvent, isLoading, setEventId: setActiveEventId }}>
      {children}
    </EventContext.Provider>
  );
}

export const useCurrentEvent = () => useContext(EventContext);
