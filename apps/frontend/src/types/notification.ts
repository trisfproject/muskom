export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface InAppNotification {
  id: string;
  user_id?: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  action_url?: string;
  read_at?: string;
  created_at: string;
}

export interface NotificationListResponse {
  items: InAppNotification[];
  total: number;
}
