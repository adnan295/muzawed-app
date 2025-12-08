import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PRODUCTS, Product } from '@/lib/data';
import { ChevronRight, Heart, Share2, Minus, Plus, ShoppingCart, Truck, ShieldCheck, Clock } from 'lucide-react';
import { useLocation, useRoute } from 'wouter';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ProductDetails() {
  const [, params] = useRoute('/product/:id');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const productId = params?.id;
  const product = PRODUCTS.find(p => p.id === productId) || PRODUCTS[0];
  
  const [quantity, setQuantity] = useState(product.minOrder);

  // Mock tiered pricing for wholesale feel
  const tieredPricing = [
    { range: `${product.minOrder}-${product.minOrder + 4}`, price: product.price },
    { range: `${product.minOrder + 5}-${product.minOrder + 9}`, price: Math.floor(product.price * 0.95) },
    { range: `${product.minOrder + 10}+`, price: Math.floor(product.price * 0.90) },
  ];

  const handleIncrement = () => setQuantity(q => q + 1);
  const handleDecrement = () => {
    if (quantity > product.minOrder) setQuantity(q => q - 1);
  };

  const addToCart = () => {
    toast({
      title: "تمت الإضافة للسلة",
      description: `تم إضافة ${quantity} ${product.unit} من ${product.name}`,
      className: "bg-secondary text-white border-none",
    });
  };

  return (
    <MobileLayout hideHeader>
      <div className="bg-gray-50 min-h-screen pb-24 relative">
        {/* Header Actions */}
        <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-20 pointer-events-none max-w-md mx-auto">
          <Button 
            size="icon" 
            variant="secondary" 
            className="rounded-full bg-white/80 backdrop-blur-md shadow-sm hover:bg-white pointer-events-auto h-10 w-10"
            onClick={() => setLocation('/')}
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </Button>
          <div className="flex gap-2 pointer-events-auto">
            <Button size="icon" variant="secondary" className="rounded-full bg-white/80 backdrop-blur-md shadow-sm hover:bg-white h-10 w-10">
              <Share2 className="w-5 h-5 text-foreground" />
            </Button>
            <Button 
              size="icon" 
              variant="secondary" 
              className="rounded-full bg-white/80 backdrop-blur-md shadow-sm hover:bg-white h-10 w-10"
              onClick={() => setLocation('/favorites')}
            >
              <Heart className="w-5 h-5 text-foreground" />
            </Button>
          </div>
        </div>

        {/* Product Image */}
        <div className="bg-white rounded-b-[2.5rem] shadow-sm overflow-hidden relative">
          <div className="aspect-square relative p-8 flex items-center justify-center">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-contain mix-blend-multiply hover:scale-105 transition-transform duration-500"
            />
          </div>
          {product.originalPrice && (
            <div className="absolute bottom-6 right-6">
              <Badge className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm shadow-md">
                خصم {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </Badge>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="px-5 mt-6 space-y-6">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-xl font-bold text-foreground leading-snug max-w-[80%]">{product.name}</h1>
              <div className="flex flex-col items-end">
                <span className="text-2xl font-bold text-primary">{product.price} <span className="text-sm font-normal text-muted-foreground">ر.س</span></span>
                {product.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through decoration-red-400">{product.originalPrice} ر.س</span>
                )}
              </div>
            </div>
            <p className="text-muted-foreground text-sm">الوحدة: {product.unit} | أقل كمية: {product.minOrder}</p>
          </div>

          {/* Tiered Pricing Table (Wholesale Feature) */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-secondary" />
              أسعار الجملة (كلما طلبت أكثر، وفرت أكثر)
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {tieredPricing.map((tier, i) => (
                <div key={i} className={cn(
                  "flex-1 min-w-[100px] border rounded-xl p-2.5 flex flex-col items-center justify-center text-center transition-colors",
                  quantity >= parseInt(tier.range) ? "bg-primary/5 border-primary" : "bg-gray-50 border-transparent"
                )}>
                  <span className="text-xs text-muted-foreground mb-1">الكمية {tier.range}</span>
                  <span className="font-bold text-foreground">{tier.price} ر.س</span>
                </div>
              ))}
            </div>
          </div>

          {/* Specifications */}
          <div className="space-y-3">
             <h3 className="font-bold text-lg">المواصفات</h3>
             <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white p-3 rounded-xl border border-gray-100">
                  <span className="text-muted-foreground block text-xs mb-1">العلامة التجارية</span>
                  <span className="font-semibold">ساري</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-100">
                   <span className="text-muted-foreground block text-xs mb-1">الصلاحية</span>
                   <span className="font-semibold">6 أشهر</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-100">
                   <span className="text-muted-foreground block text-xs mb-1">بلد المنشأ</span>
                   <span className="font-semibold">السعودية</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-100">
                   <span className="text-muted-foreground block text-xs mb-1">التخزين</span>
                   <span className="font-semibold">مكان جاف</span>
                </div>
             </div>
          </div>

          {/* Delivery Info */}
          <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800">
             <div className="bg-white p-2 rounded-full">
               <Truck className="w-5 h-5 text-blue-600" />
             </div>
             <div>
               <p className="font-bold text-sm">توصيل مجاني</p>
               <p className="text-xs opacity-80">للطلبات التي تتجاوز 500 ريال</p>
             </div>
          </div>

          <Separator className="my-4" />
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border/50 p-4 pb-8 z-50 max-w-md mx-auto shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] rounded-t-3xl">
        <div className="flex gap-4">
          <div className="flex items-center justify-between bg-gray-100 rounded-xl px-2 w-32 shrink-0 h-14">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-10 w-10 rounded-lg hover:bg-white text-destructive"
              onClick={handleDecrement}
            >
              <Minus className="w-5 h-5" />
            </Button>
            <span className="font-bold text-lg w-8 text-center tabular-nums">{quantity}</span>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-10 w-10 rounded-lg hover:bg-white text-primary"
              onClick={handleIncrement}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
          
          <Button className="flex-1 h-14 rounded-xl text-lg font-bold shadow-lg shadow-primary/20" onClick={addToCart}>
            <ShoppingCart className="w-5 h-5 ml-2" />
            {(product.price * quantity).toFixed(2)} ر.س
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
