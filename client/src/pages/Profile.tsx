import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User, Package, MapPin, CreditCard, Settings, LogOut, Phone, Store, Gift, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Profile() {
  const [, setLocation] = useLocation();

  const menuItems = [
    { icon: Package, label: 'طلباتي', desc: 'تتبع طلباتك الحالية والسابقة', href: '/orders' },
    { icon: MapPin, label: 'عناويني', desc: 'إدارة مواقع التوصيل', href: '/addresses' },
    { icon: CreditCard, label: 'المحفظة والمدفوعات', desc: 'طرق الدفع والرصيد', href: '/wallet' },
    { icon: Gift, label: 'دعوة صديق', desc: 'اكسب رصيد مجاني بدعوة أصدقائك', href: '/referral' },
    { icon: Store, label: 'تفاصيل المنشأة', desc: 'معلومات السجل التجاري والضريبة', href: '/facility' },
    { icon: Phone, label: 'المساعدة والدعم', desc: 'تواصل مع خدمة العملاء', href: '/support' },
    { icon: Settings, label: 'الإعدادات', desc: 'اللغة والإشعارات', href: '/settings' },
  ];

  return (
    <MobileLayout hideHeader>
      <div className="bg-primary pb-24 pt-10 px-4 rounded-b-[2.5rem] shadow-xl mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="relative z-10 flex items-center gap-4 text-white mb-6">
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

        {/* Business Dashboard Stats */}
        <div className="grid grid-cols-3 gap-2 relative z-10">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/10">
            <div className="text-xs text-purple-100 mb-1">مشتريات الشهر</div>
            <div className="font-bold text-lg text-white">4,500</div>
            <div className="text-[10px] text-green-300 flex items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3" /> 12%
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/10">
            <div className="text-xs text-purple-100 mb-1">عدد الطلبات</div>
            <div className="font-bold text-lg text-white">8</div>
            <div className="text-[10px] text-white/60">اخر 30 يوم</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/10">
            <div className="text-xs text-purple-100 mb-1">التوفير</div>
            <div className="font-bold text-lg text-white">350</div>
            <div className="text-[10px] text-green-300">ر.س</div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-14 relative z-20 space-y-3 pb-8">
        {menuItems.map((item, index) => (
          <Card 
            key={index} 
            className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors border-none shadow-sm cursor-pointer"
            onClick={() => item.href && setLocation(item.href)}
          >
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
