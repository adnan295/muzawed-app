import { useState, useCallback, useRef, useEffect } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { ProductCard } from '@/components/ui/ProductCard';
import { useRoute } from 'wouter';
import { Search, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterSheet, type FilterValues } from '@/components/ui/FilterSheet';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { categoriesAPI, brandsAPI } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

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

const PAGE_SIZE = 20;

const DEFAULT_FILTERS: FilterValues = {
  sort: 'featured',
  brandId: null,
  minPrice: 0,
  maxPrice: 999999,
};

function buildFilterParams(filters: FilterValues): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.sort && filters.sort !== 'featured') params.append('sort', filters.sort);
  if (filters.brandId) params.append('brandId', filters.brandId.toString());
  if (filters.minPrice > 0) params.append('minPrice', filters.minPrice.toString());
  if (filters.maxPrice < 999999) params.append('maxPrice', filters.maxPrice.toString());
  return params;
}

export default function CategoryProducts() {
  const [, params] = useRoute('/category/:id');
  const categoryId = params?.id ? parseInt(params.id) : undefined;
  const { user } = useAuth();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);

  const { data: favoriteIds = [] } = useQuery<number[]>({
    queryKey: ['favoriteIds', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(`/api/favorites/${user.id}/ids`);
      return res.json();
    },
    enabled: !!user?.id,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery<Product[]>({
    queryKey: ['products', 'infinite', categoryId, filters],
    queryFn: async ({ pageParam }) => {
      const qp = new URLSearchParams();
      if (categoryId) qp.append('categoryId', categoryId.toString());
      qp.append('limit', PAGE_SIZE.toString());
      qp.append('offset', (pageParam as number).toString());
      const filterParams = buildFilterParams(filters);
      filterParams.forEach((v, k) => qp.append(k, v));
      const res = await fetch(`/api/products?${qp.toString()}`);
      return res.json();
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length * PAGE_SIZE;
    },
  });

  const products = data?.pages.flat() ?? [];

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll() as Promise<Category[]>,
  });

  const { data: brands = [] } = useQuery<any[]>({
    queryKey: ['brands'],
    queryFn: () => brandsAPI.getAll() as Promise<any[]>,
  });

  const { data: countData } = useQuery<{ count: number }>({
    queryKey: ['productsCount', categoryId, filters],
    queryFn: async () => {
      const qp = new URLSearchParams();
      if (categoryId) qp.append('categoryId', categoryId.toString());
      const filterParams = buildFilterParams(filters);
      filterParams.forEach((v, k) => qp.append(k, v));
      const res = await fetch(`/api/products/count?${qp.toString()}`);
      return res.json();
    },
  });

  const totalCount = countData?.count ?? 0;
  const category = categories.find(c => c.id === categoryId);

  const lastProductRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage) {
            fetchNextPage();
          }
        },
        { rootMargin: '200px' }
      );
      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  const handleApplyFilters = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  const isFiltered = filters.sort !== 'featured' || filters.brandId !== null || filters.maxPrice < 999999;

  return (
    <MobileLayout hideHeader hideNav>
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white p-4 sticky top-0 z-10 shadow-sm flex items-center gap-3">
          <Button size="icon" variant="ghost" className="h-10 w-10 -mr-2" onClick={() => history.back()}>
            <ChevronRight className="w-6 h-6" />
          </Button>
          <div className="flex-1">
             <h1 className="text-lg font-bold">{category?.name || 'المنتجات'}</h1>
             <p className="text-xs text-muted-foreground">{totalCount} منتج</p>
          </div>
          <Button size="icon" variant="outline" className="h-10 w-10 rounded-xl border-gray-200">
            <Search className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
        
        <div className="bg-white px-4 pb-4 mb-2 border-b border-gray-100 flex items-center justify-between gap-3">
           <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <Button
              size="sm"
              className={`rounded-full text-xs h-8 min-w-fit px-4 ${!isFiltered ? 'bg-primary text-white hover:bg-primary/90' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
              onClick={() => setFilters(DEFAULT_FILTERS)}
            >
              الكل
            </Button>
            <Button
              size="sm"
              className={`rounded-full text-xs h-8 min-w-fit px-4 ${filters.sort === 'price-low' ? 'bg-primary text-white hover:bg-primary/90' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
              onClick={() => setFilters({ ...filters, sort: filters.sort === 'price-low' ? 'featured' : 'price-low' })}
            >
              الأقل سعراً
            </Button>
            <Button
              size="sm"
              className={`rounded-full text-xs h-8 min-w-fit px-4 ${filters.sort === 'price-high' ? 'bg-primary text-white hover:bg-primary/90' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
              onClick={() => setFilters({ ...filters, sort: filters.sort === 'price-high' ? 'featured' : 'price-high' })}
            >
              الأعلى سعراً
            </Button>
            <Button
              size="sm"
              className={`rounded-full text-xs h-8 min-w-fit px-4 ${filters.sort === 'newest' ? 'bg-primary text-white hover:bg-primary/90' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
              onClick={() => setFilters({ ...filters, sort: filters.sort === 'newest' ? 'featured' : 'newest' })}
            >
              الأحدث
            </Button>
          </div>
          <FilterSheet filters={filters} onApply={handleApplyFilters} brands={brands} />
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
              <p className="text-gray-500">لا توجد منتجات {isFiltered ? 'تطابق التصفية' : 'في هذا القسم'}</p>
              {isFiltered && (
                <Button variant="link" className="text-primary mt-2" onClick={() => setFilters(DEFAULT_FILTERS)}>
                  إزالة التصفية
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    ref={index === products.length - 1 ? lastProductRef : undefined}
                  >
                    <ProductCard product={product} isFavorite={favoriteIds.includes(product.id)} />
                  </div>
                ))}
              </div>
              {isFetchingNextPage && (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
