import { useLocation } from 'wouter';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Plus, Minus, CreditCard, ShoppingBag, TrendingDown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartAPI } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'wouter';
import { useEffect, useState } from 'react';

interface CartItemWithProduct {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: string;
    image: string;
    unit: string;
    minOrder: number;
  };
}

interface PriceTier {
  id: number;
  productId: number;
  minQuantity: number;
  maxQuantity: number | null;
  price: string;
  discountPercent: string | null;
}

// Get tiered price based on quantity
function getTieredPrice(basePrice: string, quantity: number, tiers: PriceTier[]): { price: number; hasTier: boolean; discountPercent: string | null } {
  const base = parseFloat(basePrice || '0');
  if (!tiers || tiers.length === 0) {
    return { price: base, hasTier: false, discountPercent: null };
  }
  
  // Sort tiers by minQuantity descending to find the best match
  const sortedTiers = [...tiers].sort((a, b) => b.minQuantity - a.minQuantity);
  
  for (const tier of sortedTiers) {
    const min = tier.minQuantity;
    const max = tier.maxQuantity;
    if (quantity >= min && (max === null || quantity <= max)) {
      return { 
        price: parseFloat(tier.price), 
        hasTier: true, 
        discountPercent: tier.discountPercent 
      };
    }
  }
  
  return { price: base, hasTier: false, discountPercent: null };
}

export default function Cart() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [priceTiers, setPriceTiers] = useState<Record<number, PriceTier[]>>({});

  const { data: cartItems = [], isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ['cart', user?.id],
    queryFn: () => cartAPI.get(user!.id) as Promise<CartItemWithProduct[]>,
    enabled: !!user?.id,
  });

  // Fetch price tiers for all products in cart
  useEffect(() => {
    const fetchTiers = async () => {
      if (!cartItems.length) return;
      
      const tiersMap: Record<number, PriceTier[]> = {};
      await Promise.all(
        cartItems.map(async (item) => {
          try {
            const res = await fetch(`/api/products/${item.productId}/price-tiers`);
            if (res.ok) {
              tiersMap[item.productId] = await res.json();
            }
          } catch (e) {
            tiersMap[item.productId] = [];
          }
        })
      );
      setPriceTiers(tiersMap);
    };
    fetchTiers();
  }, [cartItems]);

  const updateMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) => 
      cartAPI.update(id, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => cartAPI.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const handleQuantityChange = (item: CartItemWithProduct, delta: number) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity < item.product.minOrder) {
      removeMutation.mutate(item.id);
    } else {
      updateMutation.mutate({ id: item.id, quantity: newQuantity });
    }
  };

  // Calculate item price with tiered pricing
  const getItemPrice = (item: CartItemWithProduct) => {
    const tiers = priceTiers[item.productId] || [];
    return getTieredPrice(item.product?.price || '0', item.quantity, tiers);
  };

  const subtotal = cartItems.reduce((acc, item) => {
    const { price } = getItemPrice(item);
    return acc + (price * item.quantity);
  }, 0);
  const total = subtotal; // No tax

  if (!isAuthenticated) {
    return (
      <MobileLayout hideHeader>
        <div className="flex flex-col items-center justify-center h-[80vh] p-4">
          <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-bold mb-2">سجل دخولك أولاً</h2>
          <p className="text-gray-500 text-center mb-6">يجب تسجيل الدخول لعرض سلة المشتريات</p>
          <Link href="/login">
            <Button className="rounded-xl px-8">تسجيل الدخول</Button>
          </Link>
        </div>
      </MobileLayout>
    );
  }

  if (isLoading) {
    return (
      <MobileLayout hideHeader>
        <div className="p-4 space-y-4">
          <div className="h-8 bg-gray-100 rounded animate-pulse w-40" />
          {[1, 2].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </MobileLayout>
    );
  }

  if (cartItems.length === 0) {
    return (
      <MobileLayout hideHeader>
        <div className="flex flex-col items-center justify-center h-[80vh] p-4">
          <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-bold mb-2">السلة فارغة</h2>
          <p className="text-gray-500 text-center mb-6">أضف منتجات للسلة لبدء التسوق</p>
          <Link href="/">
            <Button className="rounded-xl px-8">تصفح المنتجات</Button>
          </Link>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout hideHeader>
      <div className="flex flex-col h-[calc(100vh-80px)]">
        <div className="p-4 bg-white shadow-sm z-10">
          <h1 className="text-xl font-bold">سلة المشتريات</h1>
          <p className="text-xs text-muted-foreground mt-1">لديك {cartItems.length} منتجات في السلة</p>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm" data-testid={`cart-item-${item.id}`}>
              <div className="w-20 h-20 bg-gray-50 rounded-xl p-2 flex items-center justify-center shrink-0">
                <img src={item.product?.image} alt={item.product?.name} className="w-full h-full object-contain mix-blend-multiply" />
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm line-clamp-1">{item.product?.name}</h3>
                  {(() => {
                    const { price, hasTier, discountPercent } = getItemPrice(item);
                    const originalPrice = parseFloat(item.product?.price || '0');
                    return (
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {hasTier ? (
                            <>
                              <span className="text-green-600 font-bold">{price.toFixed(2)}</span>
                              <span className="line-through text-gray-400 mr-1">{originalPrice.toFixed(2)}</span>
                            </>
                          ) : (
                            <span>{item.product?.price}</span>
                          )}
                          {' '}ل.س / {item.product?.unit}
                        </p>
                        {hasTier && discountPercent && (
                          <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded-full flex items-center">
                            <TrendingDown className="w-3 h-3 ml-0.5" />
                            {discountPercent}%
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-200">
                    <button 
                      className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-primary hover:text-primary/80"
                      onClick={() => handleQuantityChange(item, 1)}
                      data-testid={`button-increase-${item.id}`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button 
                      className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-500 hover:text-destructive"
                      onClick={() => handleQuantityChange(item, -1)}
                      data-testid={`button-decrease-${item.id}`}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="font-bold text-primary">
                    {(() => {
                      const { price } = getItemPrice(item);
                      return (price * item.quantity).toFixed(2);
                    })()} ل.س
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3 mt-6">
            <h3 className="font-bold text-sm mb-2">ملخص الطلب</h3>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">المجموع الفرعي</span>
              <span>{subtotal.toFixed(2)} ل.س</span>
            </div>
            <div className="flex justify-between text-sm text-green-600">
              <span className="text-muted-foreground">التوصيل</span>
              <span className="font-bold">مجاني</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>الإجمالي</span>
              <span className="text-primary">{total.toFixed(2)} ل.س</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-gray-100 z-20">
          <Button 
            className="w-full h-12 text-lg font-bold rounded-xl shadow-lg shadow-primary/20"
            onClick={() => setLocation('/checkout')}
            data-testid="button-checkout"
          >
            <CreditCard className="w-5 h-5 ml-2" />
            إتمام الشراء
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
