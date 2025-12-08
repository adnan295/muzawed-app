import { MobileLayout } from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { categoriesAPI } from '@/lib/api';

interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

const categoryIcons: Record<string, string> = {
  "مواد غذائية": "🍞",
  "مشروبات": "🥤",
  "حلويات": "🍫",
  "منظفات": "🧴",
  "العناية الشخصية": "🧼",
  "معلبات": "🥫",
};

export default function Categories() {
  const [, setLocation] = useLocation();

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll() as Promise<Category[]>,
  });

  return (
    <MobileLayout>
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold mb-6">جميع الأقسام</h1>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {categories.map((cat) => (
              <Card 
                key={cat.id} 
                className="flex items-center p-4 hover:bg-accent/50 transition-colors cursor-pointer group shadow-sm border-none bg-white"
                onClick={() => setLocation(`/category/${cat.id}`)}
                data-testid={`category-card-${cat.id}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 bg-gradient-to-br ${cat.color} bg-opacity-20`}>
                   <span className="text-xl">{categoryIcons[cat.name] || cat.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-base">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">منتجات متنوعة</p>
                </div>
                <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Card>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
