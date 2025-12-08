import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User, Package, MapPin, CreditCard, Settings, LogOut, Phone, Store } from 'lucide-react';

export default function Profile() {
  const menuItems = [
    { icon: Package, label: 'طلباتي', desc: 'تتبع طلباتك الحالية والسابقة' },
    { icon: MapPin, label: 'عناويني', desc: 'إدارة مواقع التوصيل' },
    { icon: CreditCard, label: 'المحفظة والمدفوعات', desc: 'طرق الدفع والرصيد' },
    { icon: Store, label: 'تفاصيل المنشأة', desc: 'معلومات السجل التجاري والضريبة' },
    { icon: Phone, label: 'المساعدة والدعم', desc: 'تواصل مع خدمة العملاء' },
    { icon: Settings, label: 'الإعدادات', desc: 'اللغة والإشعارات' },
  ];

  return (
    <MobileLayout hideHeader>
      <div className="bg-primary pb-20 pt-10 px-4 rounded-b-[2.5rem] shadow-xl mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="relative z-10 flex items-center gap-4 text-white">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/30 text-2xl font-bold">
            س
          </div>
          <div>
            <h1 className="text-xl font-bold">سوبر ماركت السعادة</h1>
            <p className="text-purple-100 opacity-90 text-sm">050XXXXXXX</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-secondary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">عميل مميز</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-10 relative z-20 space-y-3 pb-8">
        {menuItems.map((item, index) => (
          <Card key={index} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors border-none shadow-sm cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-primary/5 text-primary flex items-center justify-center">
              <item.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm text-foreground">{item.label}</h3>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </Card>
        ))}

        <Button variant="outline" className="w-full text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/20 h-12 rounded-xl mt-6">
          <LogOut className="w-4 h-4 ml-2" />
          تسجيل الخروج
        </Button>
        
        <p className="text-center text-xs text-muted-foreground mt-4">رقم الإصدار 1.0.0</p>
      </div>
    </MobileLayout>
  );
}
