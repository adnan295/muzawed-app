import { MobileLayout } from '@/components/layout/MobileLayout';
import { ProductCard } from '@/components/ui/ProductCard';
import { Heart, ShoppingBag, Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import type { Product } from '@shared/schema';

interface FavoriteWithProduct {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
  product: Product;
}

export default function Favorites() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: favorites = [], isLoading } = useQuery<FavoriteWithProduct[]>({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(`/api/favorites/${user.id}`);
      if (!res.ok) throw new Error('فشل في تحميل المفضلة');
      return res.json();
    },
    enabled: !!user?.id,
  });

  const favoriteProducts = favorites
    .filter(f => f.product)
    .map(f => f.product);

  if (!user) {
    return (
      <MobileLayout hideHeader hideNav>
        <div className="min-h-screen bg-gray-50 pb-24">
          <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
            <h1 className="text-xl font-bold">المفضلة</h1>
          </div>
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="font-bold text-lg">يرجى تسجيل الدخول</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-6">
              قم بتسجيل الدخول لعرض المنتجات المفضلة لديك.
            </p>
            <Button onClick={() => setLocation('/login')} className="w-full max-w-xs font-bold">
              تسجيل الدخول
            </Button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout hideHeader hideNav>
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => window.history.back()} className="p-1">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold" data-testid="text-favorites-title">المفضلة</h1>
          </div>
          <span className="text-xs text-muted-foreground" data-testid="text-favorites-count">{favoriteProducts.length} منتجات</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : favoriteProducts.length > 0 ? (
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
            <Button onClick={() => setLocation('/')} className="w-full max-w-xs font-bold" data-testid="button-browse-products">
              <ShoppingBag className="w-4 h-4 ml-2" />
              تصفح المنتجات
            </Button>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
