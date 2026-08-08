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
export const fallbackConfig: FullSystemConfig = {
  website_identity: {
    community_name: "MUSKOM",
    website_title: "MUSKOM — Portal Musyawarah",
    website_description: "Portal resmi pengelolaan musyawarah.",
    website_base_url: "https://muskom.komitkabe.com",
    logo_url: "/logo.png",
    favicon_url: "/favicon.ico",
  },
  publication: {
    website_status: "PUBLISHED",
    maintenance_mode: false,
    public_visibility: true,
    offline_message: "Sistem sedang dalam pemeliharaan.",
  },
  registration: {
    candidate_registration: true,
    participant_registration: true,
    opening_date: null,
    closing_date: null,
    registration_information: "Silakan mendaftar untuk mengikuti musyawarah.",
  },
  seo: {
    meta_title: "MUSKOM - Portal Resmi",
    meta_description: "Portal resmi pengelolaan musyawarah.",
    meta_keywords: "musyawarah, komunitas",
    opengraph_image: "/logo.png",
  },
  feature_flags: {
    show_hero: true,
    show_countdown: true,
    show_timeline: true,
    show_candidate: true,
    show_information: true,
    show_footer: true,
    enable_registration: true,
    enable_dark_theme: true,
  },
  event: {
    event_name: "Musyawarah KOMITKABE 2026",
    event_date: "29 Agustus 2026",
    event_time: "08:00 - Selesai WIB",
    event_location: "Gedung Serbaguna KOMITKABE",
  },
  contact: {
    email: "admin@muskom.local",
    whatsapp: "",
    secretariat: "",
    maps_embed: "",
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
