import api from "@/lib/api";

export interface WebsiteIdentityConfig {
  community_name: string;
  event_name: string;
  event_year: string;
  website_title: string;
  website_description: string;
  logo_url: string;
  favicon_url: string;
}

export interface PublicationConfig {
  website_status: string; // e.g., "PUBLISHED", "DRAFT"
  maintenance_mode: boolean;
  public_visibility: boolean;
}

export interface RegistrationConfig {
  candidate_registration: boolean;
  participant_registration: boolean;
  opening_date: string | null;
  closing_date: string | null;
}

export interface TimelineConfig {
  active_timeline_mode: boolean;
  countdown_source: string; // e.g., "TIMELINE_EVENT", "MANUAL"
}

export interface ContactConfig {
  email: string;
  whatsapp: string;
  secretariat: string;
  maps_embed: string;
}


export interface FullSystemConfig {
  website_identity: WebsiteIdentityConfig;
  publication: PublicationConfig;
  registration: RegistrationConfig;
  timeline: TimelineConfig;
  contact: ContactConfig;
}

interface ConfigResponse {
  data: FullSystemConfig;
  message: string;
}

export const configService = {
  getConfig: async (): Promise<FullSystemConfig> => {
    const res = await api.get<ConfigResponse>("/system/config");
    return res.data.data;
  },
  
  updateConfigGroup: async (groupName: string, settings: any): Promise<void> => {
    await api.put(`/system/config/${groupName}`, {
      group_name: groupName,
      settings: settings,
    });
  }
};
