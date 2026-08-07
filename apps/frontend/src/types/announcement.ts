export interface Attachment {
  type: string;
  url: string;
  name: string;
}

export interface Announcement {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  thumbnail_url: string | null;
  category: string;
  priority: string;
  status: string;
  attachments: string | null;
  pinned: boolean;
  publish_date: string | null;
  expire_date: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface BroadcastJob {
  id: string;
  announcement_id: string;
  target_audience: string;
  channels: string;
  status: string;
  total_targets: number;
  successful_deliveries: number;
  failed_deliveries: number;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  summary?: string;
  content: string;
  thumbnail_url?: string;
  category: string;
  priority: string;
  attachments?: Attachment[];
  pinned?: boolean;
  publish_date?: string;
  expire_date?: string;
}

export interface UpdateAnnouncementRequest {
  title?: string;
  summary?: string;
  content?: string;
  thumbnail_url?: string;
  category?: string;
  priority?: string;
  status?: string;
  attachments?: Attachment[];
  pinned?: boolean;
  publish_date?: string | null;
  expire_date?: string | null;
}

export interface CreateBroadcastRequest {
  target_audience: string;
  channels: string[];
}
