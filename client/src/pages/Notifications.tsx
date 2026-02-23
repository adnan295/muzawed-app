import { MobileLayout } from '@/components/layout/MobileLayout';
import { Bell, Package, Tag, Info, Loader2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import type { Notification } from '@shared/schema';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

function getNotificationIcon(type: string) {
  switch (type) {
    case 'order':
      return { icon: Package, color: 'bg-blue-100 text-blue-600' };
    case 'promotion':
      return { icon: Tag, color: 'bg-red-100 text-red-600' };
    case 'system':
    default:
      return { icon: Info, color: 'bg-gray-100 text-gray-600' };
  }
}

function formatTime(dateString: string) {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ar });
  } catch {
    return '';
  }
}

export default function Notifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(`/api/notifications?userId=${user.id}`);
      if (!res.ok) throw new Error('فشل في تحميل الإشعارات');
      return res.json();
    },
    enabled: !!user?.id,
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      await fetch(`/api/notifications/read-all?userId=${user.id}`, { method: 'PUT' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      await fetch(`/api/notifications/${notificationId}/read`, { method: 'PUT' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <MobileLayout hideHeader hideNav>
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => window.history.back()} className="p-1">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold" data-testid="text-notifications-title">الإشعارات</h1>
            {unreadCount > 0 && (
              <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={() => markAllReadMutation.mutate()}
              className="text-xs text-primary font-medium"
              data-testid="button-mark-all-read"
            >
              تحديد الكل كمقروء
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {notifications.map((notif) => {
              const { icon: Icon, color } = getNotificationIcon(notif.type || 'system');
              return (
                <div 
                  key={notif.id} 
                  className={cn(
                    "p-4 bg-white flex gap-4 hover:bg-gray-50 transition-colors cursor-pointer", 
                    !notif.isRead && "bg-blue-50/30"
                  )}
                  onClick={() => !notif.isRead && markReadMutation.mutate(notif.id)}
                  data-testid={`notification-item-${notif.id}`}
                >
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0", color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={cn("text-sm font-bold text-foreground", !notif.isRead && "text-primary")}>
                        {notif.title}
                      </h3>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatTime(notif.createdAt?.toString() || '')}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{notif.message}</p>
                  </div>
                  {!notif.isRead && (
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"></div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-muted-foreground text-sm">لا توجد إشعارات</p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
