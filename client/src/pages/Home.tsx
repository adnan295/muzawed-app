import { useState } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { ProductCard } from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Search, Bell, MapPin } from 'lucide-react';
import { AdsCarousel } from '@/components/ui/AdsCarousel';
import { Link, useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { productsAPI, categoriesAPI, brandsAPI, productsByCityAPI, citiesAPI } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated } = useAuth();

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
    queryKey: ['products', user?.cityId],
    queryFn: () => {
      if (user?.cityId) {
        return productsByCityAPI.getByCity(user.cityId) as Promise<any[]>;
      }
      return productsAPI.getAll() as Promise<any[]>;
    },
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

  return (
    <MobileLayout hideHeader>
      <div className="pb-24 bg-gray-50 min-h-screen">
        
        {/* Creative Header */}
        <div className="bg-primary text-white p-6 pb-24 rounded-b-[2.5rem] relative overflow-hidden shadow-xl">
           {/* Abstract Shapes */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
           <div className="absolute bottom-0 left-0 w-40 h-40 bg-secondary/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

           <div className="relative z-10">
             <div className="flex justify-between items-center mb-6">
               <div>
                 <p className="text-purple-200 text-xs mb-1">مرحباً بك 👋</p>
                 <h1 className="text-xl font-bold" data-testid="text-facility-name">
                   {user?.facilityName || 'ضيف'}
                 </h1>
                 <Link href="/profile" className="flex items-center gap-1 text-[10px] text-purple-100 mt-1 bg-white/10 w-fit px-2 py-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer">
                    <MapPin className="w-3 h-3" />
                    {userCity?.name || 'اختر مدينتك'}
                 </Link>
               </div>
               <div className="flex gap-3">
                 <Button size="icon" variant="ghost" className="bg-white/10 hover:bg-white/20 text-white rounded-xl relative" onClick={() => setLocation('/notifications')}>
                   <Bell className="w-5 h-5" />
                   <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-primary"></span>
                 </Button>
               </div>
             </div>

             {/* Search Bar */}
             <form 
               className="relative group"
               onSubmit={(e) => {
                 e.preventDefault();
                 if (searchQuery.trim()) {
                   setLocation(`/search/${encodeURIComponent(searchQuery.trim())}`);
                 }
               }}
             >
               <div className="absolute inset-0 bg-secondary blur-lg opacity-20 group-hover:opacity-30 transition-opacity rounded-xl"></div>
               <div className="relative bg-white text-gray-800 rounded-2xl flex items-center p-1 shadow-lg shadow-black/5">
                 <Search className="w-5 h-5 text-gray-400 mr-3 ml-2" />
                 <Input 
                   data-testid="input-search"
                   className="border-none shadow-none focus-visible:ring-0 bg-transparent h-12 text-right placeholder:text-gray-400" 
                   placeholder="ابحث عن منتج، علامة تجارية..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
                 <Button 
                   type="submit"
                   className="rounded-xl h-10 w-10 p-0 bg-primary text-white hover:bg-primary/90 shadow-md"
                   disabled={!searchQuery.trim()}
                 >
                   <Search className="w-5 h-5" />
                 </Button>
               </div>
             </form>
           </div>
        </div>

        {/* Ads Carousel Overlapping Header */}
        <div className="px-4 -mt-16 relative z-10 mb-6">
          <div className="rounded-2xl shadow-lg overflow-hidden border-4 border-white">
             <AdsCarousel />
          </div>
        </div>

        {/* Categories Horizontal Scroll */}
        <div>
          <div className="flex items-center justify-between px-4 mb-3">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="w-1 h-5 bg-secondary rounded-full"></span>
              الأقسام الرئيسية
            </h3>
            <Link href="/categories">
              <Button variant="ghost" className="text-primary text-xs h-auto p-0 font-bold hover:bg-transparent hover:text-primary/80">
                عرض الكل <ChevronLeft className="w-3 h-3 mr-1" />
              </Button>
            </Link>
          </div>
          <div className="flex overflow-x-auto px-4 gap-4 no-scrollbar pb-4 pt-1">
            {categories.map((cat: any) => (
              <Link key={cat.id} href={`/category/${cat.id}`}>
                <div className="flex flex-col items-center gap-2 min-w-[72px] cursor-pointer group" data-testid={`category-${cat.id}`}>
                  <div className={`w-18 h-18 aspect-square rounded-[1.2rem] flex items-center justify-center shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md bg-gradient-to-br ${cat.color} bg-opacity-10 border border-white`}>
                     <div className="text-2xl drop-shadow-sm">
                       {categoryIcons[cat.name] || cat.icon}
                     </div>
                  </div>
                  <span className="text-xs font-bold text-center leading-tight text-gray-700 group-hover:text-primary transition-colors">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Brands Section */}
        <div className="mt-2">
           <div className="flex items-center justify-between px-4 mb-3">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="w-1 h-5 bg-secondary rounded-full"></span>
              أهم العلامات التجارية
            </h3>
          </div>
          <div className="flex overflow-x-auto px-4 gap-3 no-scrollbar pb-4">
            {brands.map((brand: any) => (
               <div key={brand.id} className="flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer w-20 group" data-testid={`brand-${brand.id}`}>
                 <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm border-2 border-white group-hover:border-primary transition-colors text-center overflow-hidden relative">
                   <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                   <span className="text-2xl relative z-10">{brand.logo}</span>
                 </div>
                 <span className="text-[10px] text-gray-600 text-center font-bold">{brand.name}</span>
               </div>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        <div className="px-4 mt-2">
           <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="w-1 h-5 bg-secondary rounded-full"></span>
              الأكثر طلباً
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {products.slice(0, 8).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Second Banner */}
        <div className="px-4 mt-8">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-6 flex items-center justify-between relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <h4 className="font-bold text-white text-lg mb-2">أعد طلب مشترياتك 🔄</h4>
              <p className="text-xs text-gray-300 max-w-[150px] leading-relaxed mb-4">وفر وقتك وأعد طلب منتجاتك السابقة بضغطة زر</p>
              <Link href="/buy-again">
                <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100 border-0 font-bold rounded-xl px-6">
                  سجل طلباتي
                </Button>
              </Link>
            </div>
            <div className="relative z-10 bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
               <span className="text-4xl">📝</span>
            </div>
          </div>
        </div>

         {/* Offers Section */}
        <div className="px-4 mt-8">
           <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="w-1 h-5 bg-red-500 rounded-full"></span>
              عروض خاصة 🔥
            </h3>
            <Link href="/offers">
              <Button variant="ghost" className="text-red-500 text-xs h-auto p-0 font-bold hover:bg-transparent hover:text-red-600">
                عرض الكل <ChevronLeft className="w-3 h-3 mr-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {products.filter((p: any) => p.originalPrice).slice(0, 4).map((product: any) => (
              <ProductCard key={`offer-${product.id}`} product={product} />
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
