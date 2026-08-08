"use client";

import { useNotifications } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function NotificationCenterPage() {
  const { 
    notifications, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  const unreadCount = notifications.filter(n => !n.read_at).length;

  const getIconColor = (type: string) => {
    switch(type) {
      case 'success': return 'text-emerald-500 bg-emerald-500/10';
      case 'warning': return 'text-amber-500 bg-amber-500/10';
      case 'error': return 'text-rose-500 bg-rose-500/10';
      case 'system': return 'text-purple-500 bg-purple-500/10';
      default: return 'text-blue-500 bg-blue-500/10';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold pg-text">Notification Center</h1>
          <p className="text-sm pg-muted mt-1">
            Manage your alerts, tasks, and system notifications.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2.5 min-h-[44px] bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 w-full sm:w-auto cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Tandai Semua Dibaca
            </button>
          )}
        </div>
      </div>

      <div className="pg-surface border border-[var(--color-border)] rounded-xl shadow-sm">
        <div className="border-b border-[var(--color-border)] p-4 sm:p-6">
          <h2 className="text-lg font-semibold pg-text">Recent Notifications</h2>
        </div>
        <div className="p-0">
          {loading && notifications.length === 0 ? (
            <div className="p-12 text-center text-sm pg-muted">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-[var(--color-border)] rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold pg-text mb-1">No Notifications</h3>
              <p className="text-sm pg-muted max-w-sm">
                You're all caught up! New notifications will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {notifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={`group p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 transition-colors ${!notif.read_at ? 'bg-blue-500/5' : 'hover:bg-[var(--color-bg)]'}`}
                >
                  <div className={`mt-1 shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getIconColor(notif.type)}`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h4 className={`text-base ${!notif.read_at ? 'font-semibold pg-text' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-xs font-medium text-slate-500 shrink-0 mt-1 whitespace-nowrap">
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: id })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                      {notif.message}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4">
                      {!notif.read_at && (
                        <button 
                          onClick={() => markAsRead(notif.id)}
                          className="text-xs font-medium text-blue-500 hover:text-blue-600 flex items-center gap-1.5 min-h-[36px] cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> Mark read
                        </button>
                      )}
                      
                      {notif.action_url && (
                        <Link 
                          href={notif.action_url}
                          className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-blue-500 flex items-center gap-1.5 min-h-[36px]"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> View Details
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 flex sm:flex-col justify-end sm:justify-center mt-2 sm:mt-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => deleteNotification(notif.id)}
                      className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
