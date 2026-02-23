import { MobileLayout } from '@/components/layout/MobileLayout';
import { ProductCard } from '@/components/ui/ProductCard';
import { PRODUCTS } from '@/lib/data';
import { Percent, Timer } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';

export default function Offers() {
  const { user } = useAuth();

  const { data: favoriteIds = [] } = useQuery<number[]>({
    queryKey: ['favoriteIds', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(`/api/favorites/${user.id}/ids`);
      return res.json();
    },
    enabled: !!user?.id,
  });

  const offerProducts = PRODUCTS.filter(p => p.originalPrice);

  return (
    <MobileLayout hideHeader>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="bg-red-600 p-6 pb-12 rounded-b-[2rem] text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="relative z-10 text-center">
             <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-md rounded-full mb-3">
                <Percent className="w-6 h-6 text-white" />
             </div>
             <h1 className="text-2xl font-bold mb-1">عروض التوفير</h1>
             <p className="text-red-100 text-sm">خصومات حصرية لفترة محدودة</p>
          </div>
        </div>

        <div className="px-4 -mt-8 relative z-20 space-y-6">
          {/* Flash Sale Banner */}
          <div className="bg-white p-4 rounded-2xl shadow-md border border-red-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg text-red-600">
                <Timer className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-red-600">عروض الـ 24 ساعة</h3>
                <p className="text-xs text-muted-foreground">تنتهي خلال 05:30:00</p>
              </div>
            </div>
          </div>

          {/* Offers Grid */}
          <div>
            <h3 className="font-bold text-lg mb-3">منتجات مخفضة</h3>
            <div className="grid grid-cols-2 gap-3">
              {offerProducts.map(product => (
                <ProductCard key={product.id} product={product} isFavorite={favoriteIds.includes(product.id)} />
              ))}
              {/* Duplicate for demo density */}
              {offerProducts.map(product => (
                <ProductCard key={`dup-${product.id}`} product={product} isFavorite={favoriteIds.includes(product.id)} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
