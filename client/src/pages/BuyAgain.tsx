import { MobileLayout } from '@/components/layout/MobileLayout';
import { ProductCard } from '@/components/ui/ProductCard';
import { PRODUCTS } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Repeat } from 'lucide-react';

export default function BuyAgain() {
  // Mock data: items the user buys frequently
  // In a real app, this comes from order history analysis
  const frequentProducts = [PRODUCTS[1], PRODUCTS[0], PRODUCTS[5], PRODUCTS[3]];

  return (
    <MobileLayout hideHeader hideNav>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="bg-secondary/10 p-2 rounded-lg text-secondary">
               <Repeat className="w-5 h-5" />
             </div>
             <div>
               <h1 className="text-lg font-bold">إعادة الشراء</h1>
               <p className="text-xs text-muted-foreground">منتجات تطلبها باستمرار</p>
             </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-3">
            <span className="text-xl">💡</span>
            <p className="text-xs text-blue-800 leading-relaxed pt-1">
              هذه القائمة محدثة تلقائياً بناءً على طلباتك السابقة لتسهيل عملية إعادة الطلب.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {frequentProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
            {/* Duplicate for demo */}
            {frequentProducts.map(product => (
              <ProductCard key={`dup-${product.id}`} product={product} />
            ))}
          </div>
        </div>
        
        <div className="fixed bottom-20 left-4 right-4 z-20">
           <Button className="w-full h-12 rounded-xl shadow-lg shadow-primary/20 font-bold">
             إضافة الكل للسلة (450.00 ل.س)
           </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
