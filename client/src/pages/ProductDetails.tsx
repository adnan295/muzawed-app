import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronRight, Heart, Share2, Minus, Plus, ShoppingCart, Truck, ShieldCheck, Clock } from 'lucide-react';
import { useLocation, useRoute } from 'wouter';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsAPI, cartAPI } from '@/lib/api';
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

export default function ProductDetails() {
  const [, params] = useRoute('/product/:id');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const productId = params?.id ? parseInt(params.id) : undefined;

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['product', productId],
    queryFn: () => productsAPI.getById(productId!) as Promise<Product>,
    enabled: !!productId,
  });

  const [quantity, setQuantity] = useState(product?.minOrder || 1);

  const addToCartMutation = useMutation({
    mutationFn: (data: { userId: number; productId: number; quantity: number }) => 
      cartAPI.add(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  if (isLoading || !product) {
    return (
      <MobileLayout hideHeader hideNav>
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="h-80 bg-gray-100 rounded-3xl animate-pulse mb-4" />
          <div className="h-8 bg-gray-100 rounded animate-pulse w-3/4 mb-2" />
          <div className="h-6 bg-gray-100 rounded animate-pulse w-1/2" />
        </div>
      </MobileLayout>
    );
  }

  const price = parseFloat(product.price);
  const originalPrice = product.originalPrice ? parseFloat(product.originalPrice) : null;
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const tieredPricing = [
    { range: `${product.minOrder}-${product.minOrder + 4}`, price: price },
    { range: `${product.minOrder + 5}-${product.minOrder + 9}`, price: Math.floor(price * 0.95) },
    { range: `${product.minOrder + 10}+`, price: Math.floor(price * 0.90) },
  ];

  const handleIncrement = () => setQuantity(q => q + 1);
  const handleDecrement = () => {
    if (quantity > product.minOrder) setQuantity(q => q - 1);
  };

  const addToCart = () => {
    if (user) {
      addToCartMutation.mutate({
        userId: user.id,
        productId: product.id,
        quantity: quantity,
      });
    }
    toast({
      title: "تمت الإضافة للسلة",
      description: `تم إضافة ${quantity} ${product.unit} من ${product.name}`,
      className: "bg-secondary text-white border-none",
    });
  };

  return (
    <MobileLayout hideHeader hideNav>
      <div className="bg-gray-50 min-h-screen pb-24 relative">
        {/* Header Actions */}
        <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-20 pointer-events-none max-w-md mx-auto">
          <Button 
            size="icon" 
            variant="secondary" 
            className="rounded-full bg-white/80 backdrop-blur-md shadow-sm hover:bg-white pointer-events-auto h-10 w-10"
            onClick={() => setLocation('/')}
            data-testid="button-back"
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
          {discount > 0 && (
            <div className="absolute bottom-6 right-6">
              <Badge className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm shadow-md">
                خصم {discount}%
              </Badge>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="px-5 mt-6 space-y-6">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-xl font-bold text-foreground leading-snug max-w-[80%]" data-testid="text-product-name">{product.name}</h1>
              <div className="flex flex-col items-end">
                <span className="text-2xl font-bold text-primary" data-testid="text-product-price">{price} <span className="text-sm font-normal text-muted-foreground">ل.س</span></span>
                {originalPrice && (
                  <span className="text-sm text-muted-foreground line-through decoration-red-400">{originalPrice} ل.س</span>
                )}
              </div>
            </div>
            <p className="text-muted-foreground text-sm">الوحدة: {product.unit} | أقل كمية: {product.minOrder}</p>
          </div>

          {/* Tiered Pricing Table */}
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
                  <span className="font-bold text-foreground">{tier.price} ل.س</span>
                </div>
              ))}
            </div>
          </div>

          {/* Specifications */}
          <div className="space-y-3">
             <h3 className="font-bold text-lg">المواصفات</h3>
             <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Truck className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">التوصيل</p>
                    <p className="font-bold text-xs">مجاني</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">وقت التوصيل</p>
                    <p className="font-bold text-xs">24-48 ساعة</p>
                  </div>
                </div>
             </div>
          </div>

          {/* Stock Status */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">المخزون المتاح</span>
              <span className={cn(
                "font-bold text-sm px-3 py-1 rounded-full",
                product.stock > 50 ? "bg-green-100 text-green-600" :
                product.stock > 20 ? "bg-yellow-100 text-yellow-600" :
                "bg-red-100 text-red-600"
              )}>
                {product.stock} {product.unit}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-30 max-w-md mx-auto">
          <div className="flex items-center gap-3">
            {/* Quantity Selector */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-10 w-10 bg-white rounded-lg shadow-sm hover:bg-gray-50"
                onClick={handleIncrement}
                data-testid="button-increment"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <span className="w-10 text-center font-bold" data-testid="text-quantity">{quantity}</span>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-10 w-10 bg-white rounded-lg shadow-sm hover:bg-gray-50"
                onClick={handleDecrement}
                data-testid="button-decrement"
              >
                <Minus className="w-4 h-4" />
              </Button>
            </div>

            {/* Add to Cart Button */}
            <Button 
              className="flex-1 h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20"
              onClick={addToCart}
              data-testid="button-add-to-cart"
            >
              <ShoppingCart className="w-5 h-5 ml-2" />
              أضف للسلة - {(price * quantity).toFixed(2)} ل.س
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
