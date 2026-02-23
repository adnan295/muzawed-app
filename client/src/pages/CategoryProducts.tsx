import { MobileLayout } from '@/components/layout/MobileLayout';
import { ProductCard } from '@/components/ui/ProductCard';
import { useRoute } from 'wouter';
import { Search, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterSheet } from '@/components/ui/FilterSheet';
import { useQuery } from '@tanstack/react-query';
import { productsAPI, categoriesAPI } from '@/lib/api';

interface Product {
  id: number;
  name: string;
  categoryId: number;
  price: string;
  originalPrice?: string | null;
  image: string;
  minOrder: number;
  unit: string;
  stock: number;
}

interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export default function CategoryProducts() {
  const [, params] = useRoute('/category/:id');
  const categoryId = params?.id ? parseInt(params.id) : undefined;

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products', categoryId],
    queryFn: () => productsAPI.getAll(categoryId) as Promise<Product[]>,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll() as Promise<Category[]>,
  });

  const category = categories.find(c => c.id === categoryId);

  return (
    <MobileLayout hideHeader hideNav>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="bg-white p-4 sticky top-0 z-10 shadow-sm flex items-center gap-3">
          <Button size="icon" variant="ghost" className="h-10 w-10 -mr-2" onClick={() => history.back()}>
            <ChevronRight className="w-6 h-6" />
          </Button>
          <div className="flex-1">
             <h1 className="text-lg font-bold">{category?.name || 'المنتجات'}</h1>
             <p className="text-xs text-muted-foreground">{products.length} منتج</p>
          </div>
          <Button size="icon" variant="outline" className="h-10 w-10 rounded-xl border-gray-200">
            <Search className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
        
        {/* Subcategories / Filters */}
        <div className="bg-white px-4 pb-4 mb-2 border-b border-gray-100 flex items-center justify-between gap-3">
           <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <Button size="sm" className="rounded-full text-xs h-8 bg-primary text-white hover:bg-primary/90 min-w-fit px-4">الكل</Button>
            <Button size="sm" variant="outline" className="rounded-full text-xs h-8 border-gray-200 min-w-fit px-4">الأكثر مبيعاً</Button>
            <Button size="sm" variant="outline" className="rounded-full text-xs h-8 border-gray-200 min-w-fit px-4">عروض خاصة</Button>
          </div>
          <FilterSheet />
        </div>

        <div className="p-4 pt-2">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">لا توجد منتجات في هذا القسم</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
