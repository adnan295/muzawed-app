import { MobileLayout } from '@/components/layout/MobileLayout';
import { ProductCard } from '@/components/ui/ProductCard';
import { PRODUCTS, BRANDS } from '@/lib/data';
import { useRoute } from 'wouter';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SearchResults() {
  const [match, params] = useRoute('/search/:query');
  const query = decodeURIComponent(params?.query || '');

  const filteredProducts = PRODUCTS.filter(p => 
    p.name.includes(query) || p.category.includes(query)
  );

  return (
    <MobileLayout hideHeader>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Custom Search Header */}
        <div className="bg-white p-4 sticky top-0 z-10 shadow-sm">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                className="bg-gray-100 text-foreground pl-4 pr-10 h-11 rounded-xl border-0 shadow-none focus-visible:ring-secondary" 
                defaultValue={query}
                placeholder="ابحث عن منتج..." 
              />
            </div>
            <Button size="icon" variant="outline" className="h-11 w-11 rounded-xl border-gray-200">
              <SlidersHorizontal className="w-5 h-5 text-gray-600" />
            </Button>
          </div>
          
          <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <Button size="sm" variant="secondary" className="rounded-full text-xs h-8 bg-primary text-white hover:bg-primary/90">الكل</Button>
            {BRANDS.slice(0, 4).map(brand => (
               <Button key={brand.id} size="sm" variant="outline" className="rounded-full text-xs h-8 border-gray-200">{brand.name}</Button>
            ))}
          </div>
        </div>

        <div className="p-4">
          <p className="text-sm text-muted-foreground mb-4">
            نتائج البحث عن "<span className="font-bold text-foreground">{query}</span>" ({filteredProducts.length} منتج)
          </p>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
              <Search className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="font-bold text-lg">لم يتم العثور على نتائج</h3>
              <p className="text-sm text-muted-foreground mt-1">جرب البحث بكلمات مختلفة أو عامة أكثر</p>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
