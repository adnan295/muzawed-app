import { MobileLayout } from '@/components/layout/MobileLayout';
import { ProductCard } from '@/components/ui/ProductCard';
import { CATEGORIES, PRODUCTS } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import truckImg from '@assets/stock_images/grocery_delivery_tru_61152cdf.jpg';

export default function Home() {
  return (
    <MobileLayout>
      <div className="pb-8 space-y-6">
        
        {/* Hero Banner */}
        <div className="px-4 mt-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-primary to-purple-800 text-white shadow-xl aspect-[2/1]">
            <div className="absolute inset-0 bg-black/10"></div>
            <img 
              src={truckImg} 
              alt="Delivery Truck" 
              className="absolute right-0 top-0 h-full w-2/3 object-cover opacity-20 mix-blend-overlay"
            />
            <div className="relative z-10 p-6 flex flex-col justify-center h-full items-start">
              <span className="bg-secondary text-white text-xs font-bold px-2 py-1 rounded-md mb-2">عرض خاص</span>
              <h2 className="text-2xl font-bold mb-1">مقاضيك واصلة<br/>لباب محلك</h2>
              <p className="text-purple-100 text-xs mb-4">توصيل مجاني للطلبات فوق 500 ريال</p>
              <Button size="sm" className="bg-white text-primary hover:bg-white/90 font-bold rounded-lg text-xs h-8">
                اطلب الآن
              </Button>
            </div>
          </div>
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
            <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-white rounded-lg">سجل طلباتي</Button>
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
