'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, CheckCheck, ListTodo, Lock, FileCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string | null;
  related_type: string | null;
  related_id: number | null;
  read_at: string | null;
  created_at: string;
}

export function NotificationDropdown() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications({ limit: 30 });
      setNotifications(res?.data || []);
      const countRes = await api.getNotificationUnreadCount();
      setUnreadCount(countRes?.data?.count ?? 0);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open]);

  const handleMarkRead = async (n: Notification) => {
    if (n.read_at) return;
    try {
      await api.markNotificationRead(n.id);
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(x => ({ ...x, read_at: x.read_at || new Date().toISOString() })));
      setUnreadCount(0);
    } catch {}
  };

  const handleClick = (n: Notification) => {
    handleMarkRead(n);
    setOpen(false);
    if (n.related_type === 'task' && n.related_id) {
      router.push(`/dashboard/projects`);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'task_assigned':
        return <ListTodo className="h-4 w-4 text-blue-500" />;
      case 'task_completed':
        return <FileCheck className="h-4 w-4 text-green-500" />;
      case 'password_changed':
      case 'password_reset':
        return <Lock className="h-4 w-4 text-amber-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-[400px] overflow-hidden flex flex-col" align="end" forceMount>
        <div className="p-2 border-b flex items-center justify-between">
          <span className="font-semibold text-sm">Bildirimler</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={handleMarkAllRead}>
              <CheckCheck className="h-3.5 w-3 mr-1" />
              Tümünü okundu işaretle
            </Button>
          )}
        </div>
        <div className="overflow-y-auto max-h-[320px]">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Bildirim yok
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                className={`w-full text-left px-3 py-2.5 flex gap-3 hover:bg-muted/80 transition-colors border-b last:border-0 ${!n.read_at ? 'bg-muted/50' : ''}`}
                onClick={() => handleClick(n)}
              >
                <div className="flex-shrink-0 mt-0.5">{getIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight">{n.title}</p>
                  {n.message && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: tr })}
                  </p>
                </div>
                {!n.read_at && (
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
                )}
              </button>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
