import { MobileLayout } from '@/components/layout/MobileLayout';
import { CATEGORIES } from '@/lib/data';
import { Card } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Categories() {
  const [, setLocation] = useLocation();

  return (
    <MobileLayout>
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold mb-6">جميع الأقسام</h1>
        
        <div className="grid grid-cols-1 gap-3">
          {CATEGORIES.map((cat) => (
            <Card 
              key={cat.id} 
              className="flex items-center p-4 hover:bg-accent/50 transition-colors cursor-pointer group shadow-sm border-none bg-white"
              onClick={() => setLocation(`/category/${cat.id}`)}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${cat.color} bg-opacity-20`}>
                 <span className="text-xl">📦</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base">{cat.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">120+ منتج</p>
              </div>
              <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Card>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
