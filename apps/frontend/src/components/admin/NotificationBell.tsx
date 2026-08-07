import React, { useRef, useState, useEffect } from 'react';
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function NotificationBell() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = async (notif: any) => {
    if (!notif.read_at) {
      await markAsRead(notif.id);
    }
    if (notif.action_url) {
      setIsOpen(false);
      router.push(notif.action_url);
    }
  };

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
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 min-h-[44px] min-w-[44px] flex items-center justify-center pg-muted hover:pg-text hover:pg-surface-elevated rounded-full transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center bg-blue-500 text-white text-[10px] font-bold rounded-full border border-slate-950 shadow-sm animate-in zoom-in">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 pg-surface border border-[var(--color-border)] rounded-xl shadow-xl shadow-black/50 z-50 animate-in fade-in slide-in-from-top-2 origin-top-right">
          <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                className="text-xs text-blue-500 hover:text-blue-400 font-medium flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-sm pg-muted">
                <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                No notifications yet.
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 flex gap-3 transition-colors ${notif.action_url ? 'cursor-pointer hover:bg-[var(--color-bg)]' : ''} ${!notif.read_at ? 'bg-blue-500/5' : ''}`}
                  >
                    <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getIconColor(notif.type)}`}>
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <p className={`text-sm truncate ${!notif.read_at ? 'font-semibold' : 'font-medium'}`}>
                          {notif.title}
                        </p>
                        <span className="text-[10px] whitespace-nowrap pg-muted mt-0.5">
                          {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: id })}
                        </span>
                      </div>
                      <p className="text-xs pg-muted line-clamp-2 mb-2 leading-relaxed">
                        {notif.message}
                      </p>
                      
                      <div className="flex items-center gap-3">
                        {notif.action_url && (
                          <span className="text-[10px] text-blue-500 font-medium flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            View details
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                        className="p-1 text-slate-500 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-bg)]/50 rounded-b-xl text-center">
              <Link href="/admin/notifications" onClick={() => setIsOpen(false)} className="text-xs font-medium text-blue-500 hover:text-blue-400">
                View All Notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
