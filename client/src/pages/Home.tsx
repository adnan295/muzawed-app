import { MobileLayout } from '@/components/layout/MobileLayout';
import { ProductCard } from '@/components/ui/ProductCard';
import { CATEGORIES, PRODUCTS, BRANDS } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { AdsCarousel } from '@/components/ui/AdsCarousel';
import { Link } from 'wouter';

export default function Home() {
  return (
    <MobileLayout>
      <div className="pb-8 space-y-6">
        
        {/* Hero Banner Carousel */}
        <div className="px-4 mt-4">
          <AdsCarousel />
        </div>

        {/* Categories Horizontal Scroll */}
        <div>
          <div className="flex items-center justify-between px-4 mb-3">
            <h3 className="font-bold text-lg">الأقسام الرئيسية</h3>
            <Button variant="link" className="text-primary text-xs h-auto p-0 font-bold">
              عرض الكل <ChevronLeft className="w-3 h-3 mr-1" />
            </Button>
          </div>
          <div className="flex overflow-x-auto px-4 gap-3 no-scrollbar pb-2">
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="flex flex-col items-center gap-2 min-w-[70px]">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm ${cat.color} bg-opacity-50`}>
                   {/* In a real app, map icon strings to components. For now using text fallback or generic */}
                   <span className="text-2xl">📦</span>
                </div>
                <span className="text-xs font-medium text-center leading-tight">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Brands Section */}
        <div>
           <div className="flex items-center justify-between px-4 mb-3">
            <h3 className="font-bold text-lg">أهم العلامات التجارية</h3>
          </div>
          <div className="flex overflow-x-auto px-4 gap-3 no-scrollbar pb-2">
            {BRANDS.map((brand) => (
               <div key={brand.id} className="flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer w-16">
                 <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md border-2 border-white ${brand.logo} text-center`}>
                   <span className="font-bold text-[10px] px-1">{brand.name}</span>
                 </div>
               </div>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        <div className="px-4">
           <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg">الأكثر طلباً</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Second Banner */}
        <div className="px-4">
          <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-secondary-foreground mb-1">أعد طلب مشترياتك</h4>
              <p className="text-xs text-muted-foreground">وفر وقتك وأعد طلب منتجاتك السابقة بضغطة زر</p>
            </div>
            <Link href="/buy-again">
              <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-white rounded-lg">سجل طلباتي</Button>
            </Link>
          </div>
        </div>

         {/* More Products */}
        <div className="px-4">
           <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg">عروض خاصة</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {PRODUCTS.slice(0, 4).reverse().map((product) => (
              <ProductCard key={`offer-${product.id}`} product={product} />
            ))}
          </div>
        </div>

      </div>
    </MobileLayout>
  );
}
