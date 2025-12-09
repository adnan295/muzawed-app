import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Calendar, CheckCircle2, MapPin, ShoppingBag, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartAPI, addressesAPI, ordersAPI, deliverySettingsAPI, warehousesAPI, creditsAPI } from '@/lib/api';
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
  const [paymentMethod, setPaymentMethod] = useState('cod');
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

  const { data: warehouses = [] } = useQuery<any[]>({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const data = await warehousesAPI.getAll();
      return data as any[];
    }
  });

  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];

  const subtotal = cartItems.reduce((acc, item) => 
    acc + (parseFloat(item.product?.price || '0') * item.quantity), 0);
  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const userWarehouse = warehouses.find((w: any) => w.cityId === user?.cityId);
  
  const { data: deliveryInfo } = useQuery<{ fee: number; isFree: boolean; reason?: string }>({
    queryKey: ['delivery-fee', userWarehouse?.id, subtotal, totalQuantity],
    queryFn: async () => {
      if (!userWarehouse) return { fee: 0, isFree: true, reason: 'no_warehouse' };
      const data = await deliverySettingsAPI.resolve(userWarehouse.id, subtotal, totalQuantity);
      return data as { fee: number; isFree: boolean; reason?: string };
    },
    enabled: !!userWarehouse?.id && subtotal > 0,
    initialData: { fee: 0, isFree: true }
  });

  // Fetch customer credit info
  const { data: creditInfo } = useQuery<{
    id: number;
    userId: number;
    creditLimit: string;
    currentBalance: string;
    loyaltyLevel: string;
    creditPeriodDays: number;
    isEligible: boolean;
  }>({
    queryKey: ['credit', user?.id],
    queryFn: () => creditsAPI.get(user!.id) as any,
    enabled: !!user?.id,
  });

  const getLoyaltyLabel = (level: string) => {
    switch (level) {
      case 'diamond': return 'ماسي';
      case 'gold': return 'ذهبي';
      case 'silver': return 'فضي';
      default: return 'برونزي';
    }
  };

  const deliveryFee = deliveryInfo?.fee || 0;
  const isDeliveryFree = deliveryInfo?.isFree || deliveryFee === 0;
  const tax = subtotal * 0.15;
  const total = subtotal + tax + deliveryFee;

  const creditAvailable = creditInfo ? parseFloat(creditInfo.creditLimit) - parseFloat(creditInfo.currentBalance) : 0;
  const canUseCredit = creditInfo?.isEligible && creditAvailable >= total;

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!user || !defaultAddress) throw new Error('Missing data');
      
      const orderData = {
        userId: user.id,
        addressId: defaultAddress.id,
        status: 'pending',
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        total: total.toFixed(2),
        paymentMethod: paymentMethod === 'credit' ? 'credit' : 'cash',
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
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod" className="flex-1 cursor-pointer mr-2">الدفع عند الاستلام (نقدي)</Label>
              </div>
              
              {/* Credit/Deferred Payment Option */}
              <div className={`rounded-xl border-2 p-3 transition-colors ${
                canUseCredit 
                  ? 'border-green-200 bg-green-50/50 hover:bg-green-50 cursor-pointer' 
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="credit" id="credit" disabled={!canUseCredit} />
                  <Label htmlFor="credit" className={`flex-1 mr-2 ${canUseCredit ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-600" />
                        <span className="font-bold">الدفع الآجل</span>
                        {creditInfo && (
                          <Badge variant="secondary" className="text-xs">
                            عميل {getLoyaltyLabel(creditInfo.loyaltyLevel)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {creditInfo && (
                      <div className="mt-2 text-xs text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>مدة السداد:</span>
                          <span className="font-bold text-green-700">{creditInfo.creditPeriodDays} يوم</span>
                        </div>
                        <div className="flex justify-between">
                          <span>الرصيد المتاح:</span>
                          <span className={`font-bold ${creditAvailable >= total ? 'text-green-700' : 'text-red-600'}`}>
                            {creditAvailable.toLocaleString('ar-SY')} ل.س
                          </span>
                        </div>
                        {parseFloat(creditInfo.currentBalance) > 0 && (
                          <div className="flex justify-between text-orange-600">
                            <span>رصيد مستحق:</span>
                            <span className="font-bold">{parseFloat(creditInfo.currentBalance).toLocaleString('ar-SY')} ل.س</span>
                          </div>
                        )}
                      </div>
                    )}
                    {!canUseCredit && creditInfo && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="w-3 h-3" />
                        {!creditInfo.isEligible 
                          ? 'غير مؤهل للدفع الآجل' 
                          : 'الرصيد المتاح غير كافي'}
                      </div>
                    )}
                  </Label>
                </div>
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
            <div className={`flex justify-between text-sm ${isDeliveryFree ? 'text-green-600' : ''}`}>
              <span className="text-muted-foreground">التوصيل</span>
              <span className="font-bold" data-testid="text-delivery-fee">
                {isDeliveryFree ? 'مجاني' : `${deliveryFee.toFixed(2)} ل.س`}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>الإجمالي</span>
              <span className="text-primary" data-testid="text-total">{total.toFixed(2)} ل.س</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <Button 
            className="w-full h-12 text-base font-bold rounded-xl bg-primary hover:bg-primary/90"
            onClick={() => createOrderMutation.mutate()}
            disabled={!defaultAddress || createOrderMutation.isPending}
            data-testid="button-confirm-order"
          >
            {createOrderMutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                جاري إرسال الطلب...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                تأكيد الطلب ({total.toFixed(2)} ل.س)
              </span>
            )}
          </Button>
          {!defaultAddress && (
            <p className="text-xs text-destructive text-center mt-2">يرجى إضافة عنوان توصيل أولاً</p>
          )}
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
