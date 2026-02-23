import { useState } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { ProductCard } from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Search, Bell, MapPin, Sparkles, TrendingUp, Gift, ArrowLeft, Lock } from 'lucide-react';
import { AdsCarousel } from '@/components/ui/AdsCarousel';
import { Link, useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { productsAPI, categoriesAPI, brandsAPI, productsByCityAPI, citiesAPI } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';


export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const handleProtectedNavigation = (path: string) => {
    if (!user) {
      toast({
        title: "يرجى تسجيل الدخول",
        description: "سجل دخولك لتصفح الأقسام ومعرفة الأسعار",
        variant: "destructive",
      });
      setLocation('/login');
      return;
    }
    setLocation(path);
  };

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll() as Promise<any[]>,
  });

  const { data: brands = [] } = useQuery<any[]>({
    queryKey: ['brands'],
    queryFn: () => brandsAPI.getAll() as Promise<any[]>,
  });

  const { data: cities = [] } = useQuery<any[]>({
    queryKey: ['cities'],
    queryFn: () => citiesAPI.getAll() as Promise<any[]>,
  });

  const { data: products = [] } = useQuery<any[]>({
    queryKey: ['products', user?.cityId, 'limit12'],
    queryFn: () => {
      if (user?.cityId) {
        return productsByCityAPI.getByCity(user.cityId, 12) as Promise<any[]>;
      }
      return productsAPI.getAll(undefined, 12) as Promise<any[]>;
    },
  });

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

  const categoryIcons: Record<string, string> = {
    "مواد غذائية": "🍞",
    "مشروبات": "🥤",
    "حلويات": "🍫",
    "منظفات": "🧴",
    "العناية الشخصية": "🧼",
    "معلبات": "🥫",
  };

  const categoryColors = [
    "from-orange-400 to-amber-500",
    "from-blue-400 to-cyan-500",
    "from-pink-400 to-rose-500",
    "from-green-400 to-emerald-500",
    "from-purple-400 to-violet-500",
    "from-red-400 to-orange-500",
  ];

  return (
    <MobileLayout hideHeader>
      <div className="pb-8 min-h-screen">
        
        {/* Premium Header */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="gradient-primary text-white p-6 pb-28 rounded-b-[3rem] relative overflow-hidden shadow-2xl"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-20 -right-20 w-80 h-80 bg-white rounded-full blur-3xl"
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.05, 0.15, 0.05]
              }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              className="absolute bottom-0 -left-20 w-60 h-60 bg-cyan-300 rounded-full blur-3xl"
            />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          </div>

          <div className="relative z-10">
            {/* Top Bar */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-2 mb-2"
                >
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10">
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                  </div>
                  <span className="text-2xl font-black tracking-tight">مزود</span>
                </motion.div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-purple-200 text-sm"
                >
                  مرحباً بك 👋
                </motion.p>
                <motion.h1 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-bold" 
                  data-testid="text-facility-name"
                >
                  {user?.facilityName || 'ضيف كريم'}
                </motion.h1>
                <Link href="/profile">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-1.5 text-xs text-purple-100 mt-2 bg-white/15 backdrop-blur-md w-fit px-3 py-1.5 rounded-full hover:bg-white/25 transition-all cursor-pointer border border-white/10"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    {userCity?.name || 'اختر مدينتك'}
                  </motion.div>
                </Link>
              </div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="bg-white/15 hover:bg-white/25 text-white rounded-2xl w-12 h-12 relative backdrop-blur-md border border-white/10" 
                  onClick={() => setLocation('/notifications')}
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                </Button>
              </motion.div>
            </div>

            {/* Premium Search Bar */}
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative group"
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  setLocation(`/search/${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
            >
              <div className="absolute inset-0 bg-white/30 blur-2xl rounded-3xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-white/95 backdrop-blur-xl text-gray-800 rounded-2xl flex items-center p-1.5 shadow-2xl shadow-black/10 border border-white/50">
                <Search className="w-5 h-5 text-gray-400 mr-4 ml-2" />
                <Input 
                  data-testid="input-search"
                  className="border-none shadow-none focus-visible:ring-0 bg-transparent h-12 text-right placeholder:text-gray-400 font-medium" 
                  placeholder="ابحث عن منتج، علامة تجارية..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                  type="submit"
                  className="rounded-xl h-11 w-11 p-0 gradient-primary text-white border-0 shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow"
                  disabled={!searchQuery.trim()}
                >
                  <Search className="w-5 h-5" />
                </Button>
              </div>
            </motion.form>
          </div>
        </motion.div>

        {/* Ads Carousel - Floating */}
        <div className="px-4 -mt-20 relative z-20 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-3xl shadow-2xl overflow-hidden border-4 border-white/80 backdrop-blur-sm"
          >
            <AdsCarousel />
          </motion.div>
        </div>

        {/* Categories - Premium Cards */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between px-5 mb-4">
            <h3 className="font-black text-lg flex items-center gap-3">
              <div className="w-1.5 h-6 rounded-full gradient-secondary" />
              الأقسام الرئيسية
              {!user && <Lock className="w-4 h-4 text-gray-400" />}
            </h3>
            <Button 
              variant="ghost" 
              className="text-primary text-sm h-auto p-0 font-bold hover:bg-transparent group"
              onClick={() => handleProtectedNavigation('/categories')}
            >
              عرض الكل 
              <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            </Button>
          </div>
          <div className="flex overflow-x-auto px-4 gap-4 no-scrollbar pb-2">
            {categories.map((cat: any, index: number) => (
              <motion.div 
                key={cat.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer group" 
                data-testid={`category-${cat.id}`}
                onClick={() => handleProtectedNavigation(`/category/${cat.id}`)}
              >
                <div className={`w-[72px] h-[72px] rounded-[1.5rem] flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl bg-gradient-to-br ${categoryColors[index % categoryColors.length]} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-3xl relative z-10 drop-shadow-md">
                    {categoryIcons[cat.name] || cat.icon}
                  </span>
                  {!user && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-white drop-shadow-lg" />
                    </div>
                  )}
                </div>
                <span className="text-xs font-bold text-center leading-tight text-gray-700 group-hover:text-primary transition-colors">{cat.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Brands Section - Modern Style */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between px-5 mb-4">
            <h3 className="font-black text-lg flex items-center gap-3">
              <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-blue-500 to-cyan-500" />
              العلامات التجارية
            </h3>
          </div>
          <div className="flex overflow-x-auto px-4 gap-4 no-scrollbar pb-2">
            {brands.map((brand: any, index: number) => (
              <motion.div 
                key={brand.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer group" 
                data-testid={`brand-${brand.id}`}
              >
                <div className="w-[70px] h-[70px] rounded-2xl bg-white flex items-center justify-center shadow-premium group-hover:shadow-premium-hover transition-all duration-300 border border-gray-100/50 group-hover:border-primary/30 overflow-hidden">
                  <span className="text-3xl group-hover:scale-110 transition-transform">{brand.logo}</span>
                </div>
                <span className="text-[11px] text-gray-600 text-center font-bold max-w-[70px] truncate">{brand.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Featured Products - Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="px-4 mb-8"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-black text-lg flex items-center gap-3">
              <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-orange-500 to-red-500" />
              <TrendingUp className="w-5 h-5 text-orange-500" />
              الأكثر طلباً
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {products.slice(0, 8).map((product: any, index: number) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.05 }}
              >
                <ProductCard product={product} isFavorite={favoriteIds.includes(product.id)} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Premium CTA Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="px-4 mb-8"
        >
          <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl" />
            </div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-black text-white text-lg mb-2 flex items-center gap-2">
                  أعد طلب مشترياتك 
                  <span className="text-2xl">🔄</span>
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed mb-4 max-w-[200px]">
                  وفر وقتك وأعد طلب منتجاتك السابقة بضغطة زر واحدة
                </p>
                <Link href="/buy-again">
                  <Button className="bg-white text-gray-900 hover:bg-gray-100 font-bold rounded-xl px-6 h-11 shadow-xl hover:shadow-2xl transition-all">
                    طلباتي السابقة
                    <ArrowLeft className="w-4 h-4 mr-2" />
                  </Button>
                </Link>
              </div>
              <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                <span className="text-5xl">📝</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Special Offers Section */}
        {products.filter((p: any) => p.originalPrice).length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="px-4 mb-8"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-lg flex items-center gap-3">
                <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-red-500 to-pink-500" />
                <Gift className="w-5 h-5 text-red-500" />
                عروض خاصة
              </h3>
              <Link href="/offers">
                <Button variant="ghost" className="text-red-500 text-sm h-auto p-0 font-bold hover:bg-transparent group">
                  عرض الكل 
                  <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {products.filter((p: any) => p.originalPrice).slice(0, 4).map((product: any, index: number) => (
                <motion.div
                  key={`offer-${product.id}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + index * 0.05 }}
                >
                  <ProductCard product={product} isFavorite={favoriteIds.includes(product.id)} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </MobileLayout>
  );
}
