import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, Package, MapPin, CreditCard, Settings, LogOut, Store, Gift, 
  ChevronLeft, CheckCircle, Wallet, Crown, Star, 
  Heart, Bell, HelpCircle, FileText, Award, Sparkles,
  Zap, Clock, ArrowUpRight
} from 'lucide-react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersAPI, walletAPI, creditsAPI } from '@/lib/api';
import { motion } from 'framer-motion';
import type { Favorite, Notification } from '@shared/schema';

interface MenuItem {
  icon: any;
  label: string;
  desc: string;
  href: string;
  badge?: number | null;
  highlight?: boolean;
}

interface Order {
  id: number;
  total: string;
  status: string;
  createdAt: string;
}

interface WalletData {
  id: number;
  balance: string;
}


export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['orders', user?.id],
    queryFn: () => ordersAPI.getAll(user!.id) as Promise<Order[]>,
    enabled: !!user?.id,
  });

  const { data: wallet } = useQuery<WalletData>({
    queryKey: ['wallet', user?.id],
    queryFn: () => walletAPI.get(user!.id) as Promise<WalletData>,
    enabled: !!user?.id,
  });

  const { data: creditInfo } = useQuery<{
    id: number;
    userId: number;
    creditLimit: string;
    currentBalance: string;
    loyaltyLevel: string;
    creditPeriodDays: number;
    isEligible: boolean;
  }>({
    queryKey: ['credit', user?.id],
    queryFn: () => creditsAPI.get(user!.id) as any,
    enabled: !!user?.id,
  });

  const { data: favorites = [] } = useQuery<Favorite[]>({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(`/api/favorites/${user.id}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user?.id,
  });

  const { data: unreadNotifications } = useQuery<{ count: number }>({
    queryKey: ['unreadNotifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return { count: 0 };
      const res = await fetch(`/api/notifications/unread/count?userId=${user.id}`);
      if (!res.ok) return { count: 0 };
      return res.json();
    },
    enabled: !!user?.id,
  });

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  const totalSpent = orders.reduce((acc: number, order: any) => acc + parseFloat(order.total || '0'), 0);
  
  const getLoyaltyLevel = (spent: number) => {
    if (spent >= 10000000) return { name: 'ماسي', color: 'from-cyan-400 to-blue-500', icon: Crown, progress: 100 };
    if (spent >= 5000000) return { name: 'ذهبي', color: 'from-yellow-400 to-orange-500', icon: Award, progress: (spent / 10000000) * 100 };
    if (spent >= 1000000) return { name: 'فضي', color: 'from-gray-300 to-gray-500', icon: Star, progress: (spent / 5000000) * 100 };
    return { name: 'برونزي', color: 'from-orange-300 to-orange-600', icon: Zap, progress: (spent / 1000000) * 100 };
  };

  const loyaltyLevel = getLoyaltyLevel(totalSpent);
  const LoyaltyIcon = loyaltyLevel.icon;

  const recentOrders = orders.slice(0, 3);

  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  const favoritesCount = favorites.length;
  const notificationsCount = unreadNotifications?.count || 0;

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'الطلبات والمشتريات',
      items: [
        { icon: Package, label: 'طلباتي', desc: 'تتبع طلباتك الحالية والسابقة', href: '/orders', badge: pendingOrdersCount || null },
        { icon: Clock, label: 'اشترِ مجدداً', desc: 'أعد طلب منتجاتك السابقة بسهولة', href: '/buy-again' },
        { icon: Heart, label: 'المفضلة', desc: 'منتجاتك المحفوظة', href: '/favorites', badge: favoritesCount || null },
      ]
    },
    {
      title: 'الدفع والمحفظة',
      items: [
        { icon: Wallet, label: 'المحفظة', desc: 'رصيدك الحالي والعمليات', href: '/wallet' },
        { icon: CreditCard, label: 'طرق الدفع', desc: 'إدارة بطاقاتك المحفوظة', href: '/cards' },
      ]
    },
    {
      title: 'الحساب والإعدادات',
      items: [
        { icon: MapPin, label: 'عناويني', desc: 'إدارة مواقع التوصيل', href: '/addresses' },
        { icon: Store, label: 'تفاصيل المنشأة', desc: 'معلومات السجل التجاري', href: '/facility' },
        { icon: Bell, label: 'الإشعارات', desc: 'إدارة التنبيهات', href: '/notifications', badge: notificationsCount || null },
        { icon: Settings, label: 'الإعدادات', desc: 'اللغة والخصوصية', href: '/settings' },
      ]
    },
    {
      title: 'المساعدة',
      items: [
        { icon: Gift, label: 'دعوة صديق', desc: 'اكسب رصيد مجاني', href: '/referral', highlight: true },
        { icon: HelpCircle, label: 'المساعدة والدعم', desc: 'تواصل مع خدمة العملاء', href: '/support' },
        { icon: FileText, label: 'الشروط والأحكام', desc: 'سياسة الاستخدام', href: '/terms' },
      ]
    },
  ];

  if (!isAuthenticated) {
    return (
      <MobileLayout hideHeader>
        <div className="flex flex-col items-center justify-center h-[80vh] p-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-6"
          >
            <User className="w-12 h-12 text-primary" />
          </motion.div>
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold mb-2"
          >
            مرحباً بك في ساري
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-500 text-center mb-8"
          >
            سجل دخولك للوصول لحسابك وطلباتك
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/login">
              <Button size="lg" className="rounded-2xl px-12 h-14 text-lg shadow-lg shadow-primary/30">
                <Sparkles className="w-5 h-5 ml-2" />
                تسجيل الدخول
              </Button>
            </Link>
          </motion.div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout hideHeader>
      <div className="bg-gradient-to-br from-primary via-primary to-secondary pb-32 pt-12 px-4 rounded-b-[3rem] shadow-2xl mb-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/30 rounded-full translate-y-1/2 translate-x-1/4 blur-2xl"></div>
        
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative z-10"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center border-2 border-white/30 text-3xl font-bold text-white shadow-lg">
                  {user?.facilityName?.charAt(0) || 'س'}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-gradient-to-r ${loyaltyLevel.color} flex items-center justify-center shadow-lg`}>
                  <LoyaltyIcon className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-white">
                <h1 className="text-xl font-bold mb-1" data-testid="text-user-name">{user?.facilityName}</h1>
                <p className="text-white/70 text-sm">{user?.phone}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={`bg-gradient-to-r ${loyaltyLevel.color} border-0 text-white text-xs px-3`}>
                    <LoyaltyIcon className="w-3 h-3 ml-1" />
                    عميل {loyaltyLevel.name}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => setLocation('/settings')}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/80 text-sm">مستوى العضوية</span>
              <span className="text-white text-sm font-bold">{loyaltyLevel.name}</span>
            </div>
            <Progress value={loyaltyLevel.progress} className="h-2 bg-white/20" />
            <p className="text-white/60 text-xs mt-2">
              {totalSpent < 1000000 ? `${(1000000 - totalSpent).toLocaleString('ar-SY')} ل.س للمستوى الفضي` :
               totalSpent < 5000000 ? `${(5000000 - totalSpent).toLocaleString('ar-SY')} ل.س للمستوى الذهبي` :
               totalSpent < 10000000 ? `${(10000000 - totalSpent).toLocaleString('ar-SY')} ل.س للمستوى الماسي` :
               'أنت في أعلى مستوى!'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white/15 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/10 cursor-pointer"
              onClick={() => setLocation('/orders')}
            >
              <Package className="w-6 h-6 text-white/80 mx-auto mb-2" />
              <div className="font-bold text-xl text-white">{orders.length}</div>
              <div className="text-xs text-white/60">طلب</div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white/15 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/10 cursor-pointer"
              onClick={() => setLocation('/wallet')}
            >
              <Wallet className="w-6 h-6 text-white/80 mx-auto mb-2" />
              <div className="font-bold text-xl text-white">{parseFloat(wallet?.balance || '0').toLocaleString('ar-SY')}</div>
              <div className="text-xs text-white/60">ل.س</div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white/15 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/10 cursor-pointer"
              onClick={() => setLocation('/favorites')}
            >
              <Heart className="w-6 h-6 text-white/80 mx-auto mb-2" />
              <div className="font-bold text-xl text-white">{favoritesCount}</div>
              <div className="text-xs text-white/60">مفضلة</div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="px-4 -mt-20 relative z-20 space-y-4 pb-8">
        {/* Credit/Deferred Payment Card */}
        {creditInfo && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <Card className={`p-4 border-none shadow-md ${creditInfo.isEligible ? 'bg-gradient-to-l from-green-500/10 via-white to-white' : 'bg-gradient-to-l from-gray-500/10 via-white to-white'}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${creditInfo.isEligible ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-green-500/30' : 'bg-gradient-to-br from-gray-400 to-gray-500 shadow-gray-400/30'}`}>
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground">الدفع الآجل</h3>
                    <Badge variant={creditInfo.isEligible ? "default" : "secondary"} className="text-xs">
                      {creditInfo.isEligible ? 'مفعّل' : 'غير مفعّل'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    مدة السداد: {creditInfo.creditPeriodDays} يوم
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">الحد الائتماني</div>
                  <div className="font-bold text-green-600">
                    {parseFloat(creditInfo.creditLimit).toLocaleString('ar-SY')} ل.س
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">الرصيد المستخدم</div>
                  <div className={`font-bold ${parseFloat(creditInfo.currentBalance) > 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                    {parseFloat(creditInfo.currentBalance).toLocaleString('ar-SY')} ل.س
                  </div>
                </div>
              </div>
              
              {parseFloat(creditInfo.currentBalance) > 0 && (
                <div className="mt-3 p-3 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-2 text-sm text-orange-700">
                    <Clock className="w-4 h-4" />
                    <span>لديك رصيد مستحق بقيمة {parseFloat(creditInfo.currentBalance).toLocaleString('ar-SY')} ل.س</span>
                  </div>
                </div>
              )}
              
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>الرصيد المتاح</span>
                  <span className="font-bold text-green-600">
                    {(parseFloat(creditInfo.creditLimit) - parseFloat(creditInfo.currentBalance)).toLocaleString('ar-SY')} ل.س
                  </span>
                </div>
                <Progress 
                  value={(parseFloat(creditInfo.currentBalance) / parseFloat(creditInfo.creditLimit)) * 100} 
                  className="h-2" 
                />
              </div>
            </Card>
          </motion.div>
        )}

        {recentOrders.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-4 border-none shadow-md">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold">آخر الطلبات</h3>
                <Button variant="ghost" size="sm" className="text-primary" onClick={() => setLocation('/orders')}>
                  عرض الكل
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                </Button>
              </div>
              <div className="space-y-2">
                {recentOrders.map((order, idx) => (
                  <div 
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setLocation(`/orders/${order.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">طلب #{order.id}</p>
                        <p className="text-xs text-gray-500">{parseFloat(order.total).toLocaleString('ar-SY')} ل.س</p>
                      </div>
                    </div>
                    <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'} className="text-xs">
                      {order.status === 'pending' ? 'قيد الانتظار' :
                       order.status === 'processing' ? 'قيد التحضير' :
                       order.status === 'shipped' ? 'في الطريق' :
                       order.status === 'delivered' ? 'تم التوصيل' : order.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {menuSections.map((section, sectionIdx) => (
          <motion.div
            key={sectionIdx}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 * (sectionIdx + 3) }}
          >
            <h3 className="text-sm font-bold text-gray-500 mb-2 px-1">{section.title}</h3>
            <Card className="border-none shadow-md overflow-hidden">
              {section.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  className={`p-4 flex items-center gap-4 cursor-pointer transition-colors ${
                    item.highlight 
                      ? 'bg-gradient-to-l from-primary/10 via-white to-white hover:from-primary/20' 
                      : 'hover:bg-gray-50'
                  } ${itemIdx !== section.items.length - 1 ? 'border-b border-gray-100' : ''}`}
                  onClick={() => item.href && setLocation(item.href)}
                  data-testid={`menu-${item.href?.replace('/', '')}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    item.highlight 
                      ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/30' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm">{item.label}</h4>
                      {item.badge && (
                        <Badge variant="destructive" className="text-xs px-1.5 py-0 h-5">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-gray-400" />
                </div>
              ))}
            </Card>
          </motion.div>
        ))}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="pt-4"
        >
          <Button 
            variant="outline" 
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/20 h-14 rounded-2xl"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5 ml-2" />
            تسجيل الخروج
          </Button>
        </motion.div>
        
        <p className="text-center text-xs text-muted-foreground pt-4 pb-8">
          ساري - منصة الجملة للأعمال
          <br />
          <span className="text-gray-400">الإصدار 1.0.0</span>
        </p>
      </div>
    </MobileLayout>
  );
}
