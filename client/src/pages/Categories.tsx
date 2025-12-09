import { MobileLayout } from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { ChevronLeft, MapPin } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { categoriesAPI, citiesAPI } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

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
  const { user } = useAuth();

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll() as Promise<Category[]>,
  });

  const { data: cities = [] } = useQuery<any[]>({
    queryKey: ['cities'],
    queryFn: () => citiesAPI.getAll() as Promise<any[]>,
  });

  const userCity = cities.find((c: any) => c.id === user?.cityId);

  return (
    <MobileLayout>
      <div className="p-4 space-y-4">
        {userCity && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-primary/5 px-3 py-2 rounded-xl mb-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span>المحافظة: <span className="font-bold text-foreground">{userCity.governorate || userCity.name}</span></span>
          </div>
        )}
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
