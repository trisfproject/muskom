"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { configService, FullSystemConfig } from "@/services/config";

interface ConfigContextType {
  config: FullSystemConfig | null;
  loading: boolean;
  error: Error | null;
  refreshConfig: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

// Initial fallback config to prevent hydration mismatch and provide immediate render
const fallbackConfig: FullSystemConfig = {
  website_identity: {
    community_name: "MUSKOM",
    event_name: "Musyawarah Komunitas",
    event_year: "2026",
    website_title: "MUSKOM — Portal Musyawarah",
    website_description: "Portal resmi pengelolaan musyawarah.",
    logo_url: "/logo.png",
    favicon_url: "/favicon.ico",
  },
  publication: {
    website_status: "PUBLISHED",
    maintenance_mode: false,
    public_visibility: true,
  },
  registration: {
    candidate_registration: true,
    participant_registration: true,
    opening_date: null,
    closing_date: null,
  },
  timeline: {
    active_timeline_mode: true,
    countdown_source: "TIMELINE_EVENT",
  },
  contact: {
    email: "admin@muskom.local",
    whatsapp: "",
    secretariat: "",
    maps_embed: "",
  },
  social_media: {
    instagram: "",
    telegram: "",
    website: "",
  }
};

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<FullSystemConfig>(fallbackConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await configService.getConfig();
      if (data) {
        setConfig(data);
      }
    } catch (err: any) {
      console.error("Failed to load system config:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{ config, loading, error, refreshConfig: fetchConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useSystemConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useSystemConfig must be used within a ConfigProvider");
  }
  return context;
};
