import { useState } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { ProductCard } from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/button';
import { Search, Bell, MapPin, TrendingUp, ArrowLeft, Lock, ShoppingCart, Heart, Package, Wallet, ChevronLeft, Tag, Star } from 'lucide-react';
import { AdsCarousel } from '@/components/ui/AdsCarousel';
import { FlashSaleBanner } from '@/components/ui/FlashSaleBanner';
import { Link, useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/use-toast';

const categoryColors = [
  { bg: 'bg-orange-50', icon: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-100' },
  { bg: 'bg-blue-50', icon: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-100' },
  { bg: 'bg-pink-50', icon: 'bg-pink-100', text: 'text-pink-600', border: 'border-pink-100' },
  { bg: 'bg-green-50', icon: 'bg-green-100', text: 'text-green-600', border: 'border-green-100' },
  { bg: 'bg-purple-50', icon: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-100' },
  { bg: 'bg-red-50', icon: 'bg-red-100', text: 'text-red-600', border: 'border-red-100' },
  { bg: 'bg-amber-50', icon: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-100' },
  { bg: 'bg-teal-50', icon: 'bg-teal-100', text: 'text-teal-600', border: 'border-teal-100' },
];

const categoryIcons: Record<string, string> = {
  "مواد غذائية": "🍞",
  "مشروبات": "🥤",
  "حلويات": "🍫",
  "منظفات": "🧴",
  "العناية الشخصية": "🧼",
  "معلبات": "🥫",
  "مجمدات": "❄️",
  "ألبان وأجبان": "🧀",
  "خضروات وفواكه": "🥦",
  "توابل وبهارات": "🌶️",
};

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  const handleProtectedNavigation = (path: string) => {
    if (!user) {
      toast({ title: "يرجى تسجيل الدخول", description: "سجل دخولك لتصفح الأقسام ومعرفة الأسعار", variant: "destructive" });
      setLocation('/login');
      return;
    }
    setLocation(path);
  };

  const { data: homeData } = useQuery<any>({
    queryKey: ['home-data', user?.cityId ?? null],
    queryFn: async () => {
      const url = user?.cityId ? `/api/home-data?cityId=${user.cityId}` : '/api/home-data';
      const res = await fetch(url);
      if (!res.ok) throw new Error('فشل تحميل البيانات');
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  const categories: any[] = homeData?.categories ?? [];
  const brands: any[] = homeData?.brands ?? [];
  const cities: any[] = homeData?.cities ?? [];
  const products: any[] = homeData?.products ?? [];

  const { data: favoriteIds = [] } = useQuery<number[]>({
    queryKey: ['favoriteIds', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(`/api/favorites/${user.id}/ids`);
      return res.json();
    },
    enabled: !!user?.id,
  });

  const userCity = cities.find((c: any) => c.id === user?.cityId);

  const quickActions = [
    { icon: ShoppingCart, label: 'طلباتي', path: '/orders', color: 'text-violet-600', bg: 'bg-violet-50' },
    { icon: Wallet, label: 'المحفظة', path: '/wallet', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: Heart, label: 'المفضلة', path: '/favorites', color: 'text-rose-500', bg: 'bg-rose-50' },
    { icon: Tag, label: 'العروض', path: '/offers', color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <MobileLayout hideHeader>
      <div className="pb-8 min-h-screen bg-gray-50">

        {/* ── Header ── */}
        <div
          className="px-5 pt-12 pb-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #5b21b6 0%, #7c3aed 50%, #6d28d9 100%)' }}
        >
          {/* Subtle decorative ring — no blur */}
          <div
            className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          />
          <div
            className="absolute bottom-0 -left-8 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          />

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-5">
              <div>
                <p className="text-purple-200 text-sm mb-0.5">
                  {user ? `مرحباً،` : 'أهلاً بك في'}
                </p>
                <h1 className="text-xl font-black text-white leading-tight" data-testid="text-facility-name">
                  {user?.facilityName || 'مزود'}
                </h1>
                {user && (
                  <Link href="/profile">
                    <div className="flex items-center gap-1 mt-1.5 text-xs text-purple-200 cursor-pointer hover:text-white transition-colors">
                      <MapPin className="w-3 h-3" />
                      <span>{userCity?.name || 'اختر مدينتك'}</span>
                      <ChevronLeft className="w-3 h-3" />
                    </div>
                  </Link>
                )}
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="bg-white/15 hover:bg-white/25 text-white rounded-2xl w-11 h-11 relative border border-white/10"
                onClick={() => setLocation('/notifications')}
                data-testid="button-notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-400 rounded-full border-2 border-purple-700" />
              </Button>
            </div>

            {/* Search */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) setLocation(`/search/${encodeURIComponent(searchQuery.trim())}`);
              }}
            >
              <div className="flex items-center bg-white rounded-2xl shadow-lg overflow-hidden h-12">
                <Search className="w-4 h-4 text-gray-400 mx-3 shrink-0" />
                <Input
                  data-testid="input-search"
                  className="border-none shadow-none focus-visible:ring-0 bg-transparent h-full text-right placeholder:text-gray-400 text-sm"
                  placeholder="ابحث عن منتج أو علامة تجارية..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button type="submit" size="sm" className="rounded-xl m-1 h-9 px-4 bg-primary text-white text-xs font-bold border-0">
                    بحث
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="px-4 py-4 bg-white border-b border-gray-100 shadow-sm">
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                className="flex flex-col items-center gap-1.5 py-2 px-1 rounded-2xl hover:bg-gray-50 transition-colors active:scale-95"
                onClick={() => handleProtectedNavigation(action.path)}
                data-testid={`quick-action-${action.path.replace('/', '')}`}
              >
                <div className={`w-11 h-11 rounded-xl ${action.bg} flex items-center justify-center`}>
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                </div>
                <span className="text-[11px] font-bold text-gray-600">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Ads Carousel ── */}
        <div className="px-4 pt-4 pb-2">
          <div className="rounded-2xl overflow-hidden shadow-md">
            <AdsCarousel />
          </div>
        </div>

        {/* ── Flash Sale ── */}
        <div className="px-4">
          <FlashSaleBanner />
        </div>

        {/* ── Categories ── */}
        <section className="pt-5 pb-2">
          <div className="flex items-center justify-between px-5 mb-3">
            <h2 className="font-black text-base text-gray-800 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-primary block" />
              الأقسام
              {!user && <Lock className="w-3.5 h-3.5 text-gray-400" />}
            </h2>
            <button
              className="text-primary text-xs font-bold flex items-center gap-0.5 hover:underline"
              onClick={() => handleProtectedNavigation('/categories')}
            >
              الكل <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex overflow-x-auto px-4 gap-3 no-scrollbar pb-1">
            {categories.length === 0
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="min-w-[72px] h-[88px] rounded-2xl bg-gray-100 animate-pulse" />
                ))
              : categories.map((cat: any, i: number) => {
                  const c = categoryColors[i % categoryColors.length];
                  return (
                    <button
                      key={cat.id}
                      className={`flex flex-col items-center gap-1.5 min-w-[72px] py-2.5 px-2 rounded-2xl border ${c.bg} ${c.border} active:scale-95 transition-transform cursor-pointer`}
                      onClick={() => handleProtectedNavigation(`/category/${cat.id}`)}
                      data-testid={`category-${cat.id}`}
                    >
                      <div className={`w-11 h-11 rounded-xl ${c.icon} flex items-center justify-center`}>
                        <span className="text-2xl leading-none">{categoryIcons[cat.name] || cat.icon || '📦'}</span>
                      </div>
                      <span className={`text-[10px] font-bold text-center leading-tight ${c.text}`}>{cat.name}</span>
                    </button>
                  );
                })}
          </div>
        </section>

        {/* ── Brands ── */}
        {brands.length > 0 && (
          <section className="pt-5 pb-2">
            <div className="flex items-center justify-between px-5 mb-3">
              <h2 className="font-black text-base text-gray-800 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-blue-500 block" />
                العلامات التجارية
              </h2>
            </div>
            <div className="flex overflow-x-auto px-4 gap-3 no-scrollbar pb-1">
              {brands.map((brand: any) => (
                <div
                  key={brand.id}
                  className="flex-shrink-0 flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
                  data-testid={`brand-${brand.id}`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden">
                    {brand.logo && brand.logo.startsWith('http') ? (
                      <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain p-1" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <span className="text-2xl">{brand.logo || '🏷️'}</span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold max-w-[56px] truncate text-center">{brand.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Most Popular Products ── */}
        <section className="pt-5 px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black text-base text-gray-800 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-orange-500 block" />
              <TrendingUp className="w-4 h-4 text-orange-500" />
              الأكثر طلباً
            </h2>
          </div>
          {products.length === 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-56 rounded-3xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {products.slice(0, 8).map((product: any) => (
                <ProductCard key={product.id} product={product} isFavorite={favoriteIds.includes(product.id)} />
              ))}
            </div>
          )}
        </section>

        {/* ── Promo Banner ── */}
        <div className="px-4 pt-5">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-l from-violet-600 to-indigo-700 p-5 shadow-lg">
            <div className="absolute right-0 top-0 w-28 h-28 rounded-full bg-white/10 -translate-y-6 translate-x-6" />
            <div className="relative z-10 flex items-center gap-4">
              <div>
                <p className="text-white/80 text-xs mb-1">أعد طلب مشترياتك</p>
                <h3 className="text-white font-black text-lg leading-tight mb-3">وفّر وقتك<br />بضغطة واحدة</h3>
                <Link href="/buy-again">
                  <Button size="sm" className="bg-white text-violet-700 hover:bg-violet-50 font-bold rounded-xl h-9 px-4 text-xs border-0 shadow-md">
                    طلباتي السابقة
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  </Button>
                </Link>
              </div>
              <div className="mr-auto text-5xl select-none">📦</div>
            </div>
          </div>
        </div>

        {/* ── Special Offers (if any) ── */}
        {products.filter((p: any) => p.originalPrice).length > 0 && (
          <section className="pt-5 px-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-black text-base text-gray-800 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-rose-500 block" />
                <Star className="w-4 h-4 text-rose-500" />
                عروض خاصة
              </h2>
              <Link href="/offers">
                <span className="text-rose-500 text-xs font-bold flex items-center gap-0.5 hover:underline">
                  الكل <ArrowLeft className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {products.filter((p: any) => p.originalPrice).slice(0, 4).map((product: any) => (
                <ProductCard key={`offer-${product.id}`} product={product} isFavorite={favoriteIds.includes(product.id)} />
              ))}
            </div>
          </section>
        )}

        {/* ── Footer spacer ── */}
        <div className="h-6" />
      </div>
    </MobileLayout>
  );
}
