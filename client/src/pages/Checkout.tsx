import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Calendar, CheckCircle2, MapPin, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartAPI, addressesAPI, ordersAPI } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

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
  };
}

interface Address {
  id: number;
  title: string;
  details: string;
  isDefault: boolean;
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  const { data: cartItems = [] } = useQuery<CartItemWithProduct[]>({
    queryKey: ['cart', user?.id],
    queryFn: () => cartAPI.get(user!.id) as Promise<CartItemWithProduct[]>,
    enabled: !!user?.id,
  });

  const { data: addresses = [] } = useQuery<Address[]>({
    queryKey: ['addresses', user?.id],
    queryFn: () => addressesAPI.getAll(user!.id) as Promise<Address[]>,
    enabled: !!user?.id,
  });

  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];

  const subtotal = cartItems.reduce((acc, item) => 
    acc + (parseFloat(item.product?.price || '0') * item.quantity), 0);
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!user || !defaultAddress) throw new Error('Missing data');
      
      const orderData = {
        userId: user.id,
        addressId: defaultAddress.id,
        status: 'pending',
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        paymentMethod: paymentMethod === 'card' ? 'card' : paymentMethod === 'cod' ? 'cash' : 'wallet',
      };

      const orderItems = cartItems.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        total: (parseFloat(item.product.price) * item.quantity).toFixed(2),
      }));

      return ordersAPI.create(orderData, orderItems);
    },
    onSuccess: (data: any) => {
      setOrderId(data.id);
      setIsSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      setTimeout(() => {
        setIsSuccess(false);
        setLocation('/orders');
        toast({
          title: "تم استلام طلبك بنجاح",
          description: `رقم الطلب #${data.id}`,
          className: "bg-green-600 text-white border-none",
        });
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إنشاء الطلب",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <MobileLayout hideHeader>
        <div className="flex flex-col items-center justify-center h-[80vh] p-4">
          <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-bold mb-2">سجل دخولك أولاً</h2>
          <p className="text-gray-500 text-center mb-6">يجب تسجيل الدخول لإتمام الطلب</p>
          <Link href="/login">
            <Button className="rounded-xl px-8">تسجيل الدخول</Button>
          </Link>
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
          <p className="text-gray-500 text-center mb-6">أضف منتجات للسلة أولاً</p>
          <Link href="/">
            <Button className="rounded-xl px-8">تسوق الآن</Button>
          </Link>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout hideHeader>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
          <h1 className="text-xl font-bold">إتمام الطلب</h1>
        </div>

        <div className="p-4 space-y-6">
          
          {/* Delivery Location */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              عنوان التوصيل
            </h3>
            {defaultAddress ? (
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-sm" data-testid="text-address-title">{defaultAddress.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{defaultAddress.details}</p>
                  </div>
                  <Link href="/addresses">
                    <Button variant="link" className="text-primary text-xs h-auto p-0">تغيير</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-200">
                <p className="text-sm text-yellow-800">لم تضف عنوان توصيل بعد</p>
                <Link href="/addresses">
                  <Button size="sm" className="mt-2 rounded-lg">إضافة عنوان</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Delivery Time */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              وقت التوصيل
            </h3>
            <RadioGroup defaultValue="tomorrow" className="grid grid-cols-2 gap-3">
              <div>
                <RadioGroupItem value="tomorrow" id="tomorrow" className="peer sr-only" />
                <Label
                  htmlFor="tomorrow"
                  className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary"
                >
                  <span className="mb-1 text-sm font-bold">غداً</span>
                  <span className="text-xs text-muted-foreground">9 ص - 12 م</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="after-tomorrow" id="after-tomorrow" className="peer sr-only" />
                <Label
                  htmlFor="after-tomorrow"
                  className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary"
                >
                  <span className="mb-1 text-sm font-bold">بعد غد</span>
                  <span className="text-xs text-muted-foreground">9 ص - 12 م</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              طريقة الدفع
            </h3>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
              <div className="flex items-center space-x-2 space-x-reverse rounded-xl border p-3 hover:bg-accent cursor-pointer transition-colors">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex-1 cursor-pointer flex items-center justify-between mr-2">
                  <span>بطاقة مدى / ائتمانية</span>
                  <div className="flex gap-1">
                    <div className="w-8 h-5 bg-blue-100 rounded text-[8px] flex items-center justify-center font-bold text-blue-600">مدى</div>
                    <div className="w-8 h-5 bg-orange-100 rounded text-[8px] flex items-center justify-center font-bold text-orange-600">Visa</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse rounded-xl border p-3 hover:bg-accent cursor-pointer transition-colors">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod" className="flex-1 cursor-pointer mr-2">الدفع عند الاستلام (نقدي)</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse rounded-xl border p-3 hover:bg-accent cursor-pointer transition-colors">
                <RadioGroupItem value="wallet" id="wallet" />
                <Label htmlFor="wallet" className="flex-1 cursor-pointer mr-2">المحفظة</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Order Items Summary */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-sm mb-3">المنتجات ({cartItems.length})</h3>
            <div className="space-y-2">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{item.product?.name} × {item.quantity}</span>
                  <span className="font-bold">{(parseFloat(item.product?.price || '0') * item.quantity).toFixed(2)} ل.س</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <h3 className="font-bold text-sm mb-2">ملخص الدفع</h3>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">المجموع</span>
              <span>{subtotal.toFixed(2)} ل.س</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">الضريبة (15%)</span>
              <span>{tax.toFixed(2)} ل.س</span>
            </div>
            <div className="flex justify-between text-sm text-green-600">
              <span className="text-muted-foreground">التوصيل</span>
              <span className="font-bold">مجاني</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>الإجمالي</span>
              <span className="text-primary" data-testid="text-total">{total.toFixed(2)} ل.س</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-20 max-w-md mx-auto">
          <Button 
            className="w-full h-12 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
            onClick={() => createOrderMutation.mutate()}
            disabled={!defaultAddress || createOrderMutation.isPending}
            data-testid="button-confirm-order"
          >
            {createOrderMutation.isPending ? 'جاري الإرسال...' : `تأكيد الطلب (${total.toFixed(2)} ل.س)`}
          </Button>
        </div>

        {/* Success Modal */}
        <Dialog open={isSuccess} onOpenChange={setIsSuccess}>
          <DialogContent className="sm:max-w-md mx-auto rounded-2xl w-[90%]">
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <DialogTitle className="text-xl font-bold text-foreground">تم الطلب بنجاح!</DialogTitle>
              <DialogDescription className="text-center text-muted-foreground">
                شكراً لثقتكم. رقم طلبك هو #{orderId}. يمكنك تتبع حالة الطلب من صفحة طلباتي.
              </DialogDescription>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </MobileLayout>
  );
}
