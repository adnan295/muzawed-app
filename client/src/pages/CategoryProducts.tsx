import { MobileLayout } from '@/components/layout/MobileLayout';
import { ProductCard } from '@/components/ui/ProductCard';
import { PRODUCTS, CATEGORIES } from '@/lib/data';
import { useRoute } from 'wouter';
import { Search, SlidersHorizontal, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CategoryProducts() {
  const [, params] = useRoute('/category/:id');
  const categoryId = params?.id;
  const category = CATEGORIES.find(c => c.id === categoryId);

  // In a real app, you'd fetch products by category ID
  // For mock, we'll just filter if category matches, or show all if we don't have enough mock data
  const categoryProducts = PRODUCTS.filter(p => p.category === categoryId);
  
  // Fallback to showing some products if empty (mock data limitation)
  const displayProducts = categoryProducts.length > 0 ? categoryProducts : PRODUCTS;

  return (
    <MobileLayout hideHeader>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="bg-white p-4 sticky top-0 z-10 shadow-sm flex items-center gap-3">
          <Button size="icon" variant="ghost" className="h-10 w-10 -mr-2" onClick={() => history.back()}>
            <ChevronRight className="w-6 h-6" />
          </Button>
          <div className="flex-1">
             <h1 className="text-lg font-bold">{category?.name || 'المنتجات'}</h1>
             <p className="text-xs text-muted-foreground">{displayProducts.length} منتج</p>
          </div>
          <Button size="icon" variant="outline" className="h-10 w-10 rounded-xl border-gray-200">
            <Search className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
        
        {/* Subcategories / Filters */}
        <div className="bg-white px-4 pb-4 mb-2 border-b border-gray-100">
           <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <Button size="sm" className="rounded-full text-xs h-8 bg-primary text-white hover:bg-primary/90 min-w-fit px-4">الكل</Button>
            <Button size="sm" variant="outline" className="rounded-full text-xs h-8 border-gray-200 min-w-fit px-4">الأكثر مبيعاً</Button>
            <Button size="sm" variant="outline" className="rounded-full text-xs h-8 border-gray-200 min-w-fit px-4">عروض خاصة</Button>
            <Button size="sm" variant="outline" className="rounded-full text-xs h-8 border-gray-200 min-w-fit px-4">أصناف جديدة</Button>
          </div>
        </div>

        <div className="p-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            {displayProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
             {/* Duplicate for demo density if low count */}
             {displayProducts.length < 4 && displayProducts.map(product => (
              <ProductCard key={`dup-${product.id}`} product={product} />
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
