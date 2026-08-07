import api from '@/lib/api';
import { 
  Announcement, 
  BroadcastJob, 
  CreateAnnouncementRequest, 
  UpdateAnnouncementRequest, 
  CreateBroadcastRequest 
} from '@/types/announcement';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: any;
}

export const announcementService = {
  // Admin Endpoints
  listAdminAnnouncements: async (): Promise<Announcement[]> => {
    const res = await api.get<ApiResponse<Announcement[]>>('/admin/announcements');
    return res.data.data;
  },

  getAdminAnnouncement: async (id: string): Promise<Announcement> => {
    const res = await api.get<ApiResponse<Announcement>>(`/admin/announcements/${id}`);
    return res.data.data;
  },

  createAnnouncement: async (data: CreateAnnouncementRequest): Promise<Announcement> => {
    const res = await api.post<ApiResponse<Announcement>>('/admin/announcements', data);
    return res.data.data;
  },

  updateAnnouncement: async (id: string, data: UpdateAnnouncementRequest): Promise<Announcement> => {
    const res = await api.put<ApiResponse<Announcement>>(`/admin/announcements/${id}`, data);
    return res.data.data;
  },

  deleteAnnouncement: async (id: string): Promise<void> => {
    await api.delete(`/admin/announcements/${id}`);
  },

  // Broadcasts
  listBroadcastJobs: async (): Promise<BroadcastJob[]> => {
    const res = await api.get<ApiResponse<BroadcastJob[]>>('/admin/announcements/broadcasts');
    return res.data.data;
  },

  createBroadcast: async (announcementId: string, data: CreateBroadcastRequest): Promise<BroadcastJob> => {
    const res = await api.post<ApiResponse<BroadcastJob>>(`/admin/announcements/${announcementId}/broadcast`, data);
    return res.data.data;
  },

  // Public Endpoints
  listPublicAnnouncements: async (): Promise<Announcement[]> => {
    const res = await api.get<ApiResponse<Announcement[]>>('/public/announcements');
    return res.data.data;
  },

  getPublicAnnouncement: async (slug: string): Promise<Announcement> => {
    const res = await api.get<ApiResponse<Announcement>>(`/public/announcements/${slug}`);
    return res.data.data;
  },
};
