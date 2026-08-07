import api from "@/lib/api";

export interface WebsiteIdentityConfig {
  community_name: string;
  website_title: string;
  website_description: string;
  logo_url: string;
  favicon_url: string;
}

export interface PublicationConfig {
  website_status: string; // e.g., "PUBLISHED", "DRAFT"
  maintenance_mode: boolean;
  public_visibility: boolean;
  offline_message: string;
}

export interface RegistrationConfig {
  candidate_registration: boolean;
  participant_registration: boolean;
  participant_limit?: number;
  capacity_mode?: string;
  opening_date: string | null;
  closing_date: string | null;
  registration_information: string;
}

export interface SEOConfig {
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  opengraph_image: string;
}

export interface FeatureFlagsConfig {
  show_hero: boolean;
  show_countdown: boolean;
  show_timeline: boolean;
  show_candidate: boolean;
  show_information: boolean;
  show_footer: boolean;
  enable_registration: boolean;
  enable_dark_theme: boolean;
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
  contact: ContactConfig;
  seo: SEOConfig;
  feature_flags: FeatureFlagsConfig;
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
    await api.put(`/admin/system/config/${groupName}`, {
      group_name: groupName,
      settings: settings,
    });
  }
};
