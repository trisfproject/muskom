import api from '@/lib/api';
import { InAppNotification, NotificationListResponse } from '@/types/notification';

export const notificationService = {
  getNotifications: async (limit: number = 50, offset: number = 0) => {
    // const response = await api.get<{ data: NotificationListResponse }>('/notifications/in-app', {
    //   params: { limit, offset }
    // });
    // return response.data.data;
    return { notifications: [], total: 0 } as any;
  },

  getUnreadCount: async () => {
    // const response = await api.get<{ data: { count: number } }>('/notifications/in-app/unread-count');
    // return response.data.data.count;
    return 0;
  },

  markAsRead: async (id: string) => {
    // await api.patch(`/notifications/in-app/${id}/read`);
  },

  markAllAsRead: async () => {
    // await api.patch('/notifications/in-app/read-all');
  },

  deleteNotification: async (id: string) => {
    // await api.delete(`/notifications/in-app/${id}`);
  }
};
