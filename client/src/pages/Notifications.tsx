import { MobileLayout } from '@/components/layout/MobileLayout';
import { Bell, Package, Tag, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Notifications() {
  const notifications = [
    {
      id: 1,
      title: 'تم شحن طلبك #12345',
      body: 'طلبك في الطريق إليك الآن مع مندوب التوصيل.',
      time: 'منذ ساعتين',
      icon: Package,
      color: 'bg-blue-100 text-blue-600',
      unread: true,
    },
    {
      id: 2,
      title: 'عروض جديدة بانتظارك!',
      body: 'خصومات تصل إلى 50% على منتجات الألبان والأجبان.',
      time: 'منذ 5 ساعات',
      icon: Tag,
      color: 'bg-red-100 text-red-600',
      unread: false,
    },
    {
      id: 3,
      title: 'تحديث سياسة الخصوصية',
      body: 'قمنا بتحديث شروط الاستخدام وسياسة الخصوصية.',
      time: 'أمس',
      icon: Info,
      color: 'bg-gray-100 text-gray-600',
      unread: false,
    },
    {
      id: 4,
      title: 'تم توصيل طلبك #11250',
      body: 'شكراً لتسوقك معنا! نرجو تقييم تجربتك.',
      time: 'منذ يومين',
      icon: Package,
      color: 'bg-green-100 text-green-600',
      unread: false,
    },
  ];

  return (
    <MobileLayout hideHeader>
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between">
          <h1 className="text-xl font-bold">الإشعارات</h1>
          <button className="text-xs text-primary font-medium">تحديد الكل كمقروء</button>
        </div>

        <div className="divide-y divide-gray-100">
          {notifications.map((notif) => (
            <div key={notif.id} className={cn("p-4 bg-white flex gap-4 hover:bg-gray-50 transition-colors cursor-pointer", notif.unread && "bg-blue-50/30")}>
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0", notif.color)}>
                <notif.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={cn("text-sm font-bold text-foreground", notif.unread && "text-primary")}>{notif.title}</h3>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{notif.time}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{notif.body}</p>
              </div>
              {notif.unread && (
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"></div>
              )}
            </div>
          ))}
        </div>

        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
             <Bell className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-muted-foreground text-sm">لا توجد إشعارات أخرى</p>
        </div>
      </div>
    </MobileLayout>
  );
}
