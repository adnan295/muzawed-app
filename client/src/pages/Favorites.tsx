import { MobileLayout } from '@/components/layout/MobileLayout';
import { ProductCard } from '@/components/ui/ProductCard';
import { PRODUCTS } from '@/lib/data';
import { Heart, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export default function Favorites() {
  const [, setLocation] = useLocation();
  // Mock favorites (subset of products)
  const favoriteProducts = [PRODUCTS[0], PRODUCTS[3], PRODUCTS[4]];

  return (
    <MobileLayout hideHeader>
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between">
          <h1 className="text-xl font-bold">المفضلة</h1>
          <span className="text-xs text-muted-foreground">{favoriteProducts.length} منتجات</span>
        </div>

        {favoriteProducts.length > 0 ? (
          <div className="p-4 grid grid-cols-2 gap-3">
            {favoriteProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="font-bold text-lg">قائمة المفضلة فارغة</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-6">
              احتفظ بالمنتجات التي تطلبها باستمرار هنا لسهولة الوصول إليها لاحقاً.
            </p>
            <Button onClick={() => setLocation('/')} className="w-full max-w-xs font-bold">
              تصفح المنتجات
            </Button>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
