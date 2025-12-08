import { useState } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { User, Package, MapPin, CreditCard, Settings, LogOut, Phone, Store, Gift, TrendingUp, Shield, ChevronLeft, CheckCircle } from 'lucide-react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersAPI, walletAPI, citiesAPI } from '@/lib/api';

interface Order {
  id: number;
  total: string;
}

interface Wallet {
  id: number;
  balance: string;
}

interface City {
  id: number;
  name: string;
  region: string;
  isActive: boolean;
}

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, logout, updateUser, isAuthenticated } = useAuth();
  const [isCityDialogOpen, setIsCityDialogOpen] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState<string>(user?.cityId?.toString() || '');
  const queryClient = useQueryClient();

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['orders', user?.id],
    queryFn: () => ordersAPI.getAll(user!.id) as Promise<Order[]>,
    enabled: !!user?.id,
  });

  const { data: wallet } = useQuery<Wallet>({
    queryKey: ['wallet', user?.id],
    queryFn: () => walletAPI.get(user!.id) as Promise<Wallet>,
    enabled: !!user?.id,
  });

  const { data: cities = [] } = useQuery<City[]>({
    queryKey: ['cities'],
    queryFn: () => citiesAPI.getAll() as Promise<City[]>,
  });

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  const handleCityChange = async () => {
    if (selectedCityId && user) {
      try {
        const response = await fetch(`/api/users/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cityId: parseInt(selectedCityId) }),
        });
        if (!response.ok) {
          throw new Error('Failed to update city');
        }
        updateUser({ cityId: parseInt(selectedCityId) });
        await queryClient.refetchQueries({ queryKey: ['products'], exact: false });
        setIsCityDialogOpen(false);
      } catch (error) {
        console.error('Error updating city:', error);
        alert('حدث خطأ أثناء تحديث المدينة. حاول مرة أخرى.');
      }
    }
  };

  const userCity = cities.find(c => c.id === user?.cityId);

  const menuItems = [
    { icon: Package, label: 'طلباتي', desc: 'تتبع طلباتك الحالية والسابقة', href: '/orders' },
    { icon: MapPin, label: 'عناويني', desc: 'إدارة مواقع التوصيل', href: '/addresses' },
    { icon: CreditCard, label: 'المحفظة والمدفوعات', desc: 'طرق الدفع والرصيد', href: '/wallet' },
    { icon: Gift, label: 'دعوة صديق', desc: 'اكسب رصيد مجاني بدعوة أصدقائك', href: '/referral' },
    { icon: Store, label: 'تفاصيل المنشأة', desc: 'معلومات السجل التجاري والضريبة', href: '/facility' },
    { icon: Phone, label: 'المساعدة والدعم', desc: 'تواصل مع خدمة العملاء', href: '/support' },
    { icon: Settings, label: 'الإعدادات', desc: 'اللغة والإشعارات', href: '/settings' },
  ];

  if (!isAuthenticated) {
    return (
      <MobileLayout hideHeader>
        <div className="flex flex-col items-center justify-center h-[80vh] p-4">
          <User className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-bold mb-2">مرحباً بك</h2>
          <p className="text-gray-500 text-center mb-6">سجل دخولك للوصول لحسابك</p>
          <Link href="/login">
            <Button className="rounded-xl px-8">تسجيل الدخول</Button>
          </Link>
        </div>
      </MobileLayout>
    );
  }

  const totalSpent = orders.reduce((acc: number, order: any) => acc + parseFloat(order.total || '0'), 0);

  return (
    <MobileLayout hideHeader>
      <div className="bg-primary pb-24 pt-10 px-4 rounded-b-[2.5rem] shadow-xl mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="relative z-10 flex items-center gap-4 text-white mb-6">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/30 text-2xl font-bold">
            {user?.facilityName?.charAt(0) || 'س'}
          </div>
          <div>
            <h1 className="text-xl font-bold" data-testid="text-user-name">{user?.facilityName}</h1>
            <p className="text-purple-100 opacity-90 text-sm">{user?.phone}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-secondary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">عميل مميز</span>
            </div>
          </div>
        </div>

        {/* Business Dashboard Stats */}
        <div className="grid grid-cols-3 gap-2 relative z-10">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/10">
            <div className="text-xs text-purple-100 mb-1">إجمالي المشتريات</div>
            <div className="font-bold text-lg text-white">{totalSpent.toFixed(0)}</div>
            <div className="text-[10px] text-green-300 flex items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3" /> ل.س
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/10">
            <div className="text-xs text-purple-100 mb-1">عدد الطلبات</div>
            <div className="font-bold text-lg text-white">{orders.length}</div>
            <div className="text-[10px] text-white/60">طلب</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/10">
            <div className="text-xs text-purple-100 mb-1">رصيد المحفظة</div>
            <div className="font-bold text-lg text-white">{wallet?.balance || '0'}</div>
            <div className="text-[10px] text-green-300">ل.س</div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-14 relative z-20 space-y-3 pb-8">
        {/* City Selection */}
        <Card 
          className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors border-none shadow-sm cursor-pointer bg-gradient-to-l from-blue-500/10 to-transparent"
          onClick={() => setIsCityDialogOpen(true)}
          data-testid="button-select-city"
        >
          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm text-foreground">مدينة التوصيل</h3>
            <p className="text-xs text-muted-foreground">
              {userCity ? userCity.name : 'اختر مدينتك لعرض المنتجات المتوفرة'}
            </p>
          </div>
          {userCity && (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
          <ChevronLeft className="w-5 h-5 text-gray-400" />
        </Card>

        {/* City Selection Dialog */}
        <Dialog open={isCityDialogOpen} onOpenChange={setIsCityDialogOpen}>
          <DialogContent className="max-w-sm max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center">اختر مدينة التوصيل</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-500 text-center mb-4">
              سيتم عرض المنتجات المتوفرة في مستودع المدينة المختارة
            </p>
            <RadioGroup value={selectedCityId} onValueChange={setSelectedCityId} className="space-y-2">
              {cities.filter(c => c.isActive).map((city) => (
                <div key={city.id} className="flex items-center space-x-2 p-3 rounded-xl border border-gray-200 hover:border-primary transition-colors cursor-pointer" onClick={() => setSelectedCityId(city.id.toString())}>
                  <RadioGroupItem value={city.id.toString()} id={`city-${city.id}`} className="mr-3" />
                  <Label htmlFor={`city-${city.id}`} className="flex-1 cursor-pointer">
                    <span className="font-bold">{city.name}</span>
                    <span className="text-xs text-gray-500 block">{city.region}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <Button className="w-full mt-4 rounded-xl" onClick={handleCityChange} disabled={!selectedCityId}>
              تأكيد المدينة
            </Button>
          </DialogContent>
        </Dialog>

        {/* Admin Link */}
        <Card 
          className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors border-none shadow-sm cursor-pointer bg-gradient-to-l from-primary/5 to-transparent"
          onClick={() => setLocation('/admin')}
          data-testid="link-admin"
        >
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm text-foreground">لوحة التحكم</h3>
            <p className="text-xs text-muted-foreground">إدارة المنتجات والطلبات</p>
          </div>
        </Card>

        {menuItems.map((item, index) => (
          <Card 
            key={index} 
            className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors border-none shadow-sm cursor-pointer"
            onClick={() => item.href && setLocation(item.href)}
            data-testid={`menu-item-${index}`}
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

        <Button 
          variant="outline" 
          className="w-full text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/20 h-12 rounded-xl mt-6"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 ml-2" />
          تسجيل الخروج
        </Button>
        
        <p className="text-center text-xs text-muted-foreground mt-4">رقم الإصدار 1.0.0</p>
      </div>
    </MobileLayout>
  );
}
