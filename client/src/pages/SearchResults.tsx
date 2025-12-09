import { useState } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { ProductCard } from '@/components/ui/ProductCard';
import { useRoute, useLocation } from 'wouter';
import { Search, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { productsAPI, brandsAPI } from '@/lib/api';

export default function SearchResults() {
  const [match, params] = useRoute('/search/:query');
  const [, setLocation] = useLocation();
  const query = decodeURIComponent(params?.query || '').trim();
  const [searchInput, setSearchInput] = useState(query);

  const { data: products = [] } = useQuery<any[]>({
    queryKey: ['products'],
    queryFn: () => productsAPI.getAll() as Promise<any[]>,
  });

  const { data: brands = [] } = useQuery<any[]>({
    queryKey: ['brands'],
    queryFn: () => brandsAPI.getAll() as Promise<any[]>,
  });

  const filteredProducts = products.filter((p: any) => 
    p.name?.toLowerCase().includes(query.toLowerCase()) || 
    p.unit?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <MobileLayout hideHeader>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Custom Search Header */}
        <div className="bg-white p-4 sticky top-0 z-10 shadow-sm">
          <form 
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (searchInput.trim()) {
                setLocation(`/search/${encodeURIComponent(searchInput.trim())}`);
              }
            }}
          >
            <Button 
              type="button" 
              size="icon" 
              variant="ghost" 
              className="h-11 w-11 rounded-xl"
              onClick={() => setLocation('/')}
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                className="bg-gray-100 text-foreground pl-4 pr-10 h-11 rounded-xl border-0 shadow-none focus-visible:ring-primary" 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="ابحث عن منتج..." 
              />
            </div>
            <Button type="submit" size="icon" className="h-11 w-11 rounded-xl bg-primary">
              <Search className="w-5 h-5" />
            </Button>
          </form>
          
          <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <Button size="sm" variant="secondary" className="rounded-full text-xs h-8 bg-primary text-white hover:bg-primary/90">الكل</Button>
            {brands.slice(0, 4).map((brand: any) => (
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
