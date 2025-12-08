import { MobileLayout } from '@/components/layout/MobileLayout';
import { PRODUCTS } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, CreditCard } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function Cart() {
  // Mock cart items (subset of products)
  const cartItems = [
    { ...PRODUCTS[0], quantity: 10 },
    { ...PRODUCTS[2], quantity: 4 },
  ];

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  return (
    <MobileLayout hideHeader>
      <div className="flex flex-col h-[calc(100vh-80px)]">
        <div className="p-4 bg-white shadow-sm z-10">
          <h1 className="text-xl font-bold">سلة المشتريات</h1>
          <p className="text-xs text-muted-foreground mt-1">لديك {cartItems.length} منتجات في السلة</p>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-xl p-2 flex items-center justify-center shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm line-clamp-1">{item.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{item.price} ر.س / {item.unit}</p>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-200">
                    <button className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-primary hover:text-primary/80">
                      <Plus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-500 hover:text-destructive">
                      <Minus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="font-bold text-primary">{(item.price * item.quantity).toFixed(2)} ر.س</span>
                </div>
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3 mt-6">
            <h3 className="font-bold text-sm mb-2">ملخص الطلب</h3>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">المجموع الفرعي</span>
              <span>{subtotal.toFixed(2)} ر.س</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ضريبة القيمة المضافة (15%)</span>
              <span>{vat.toFixed(2)} ر.س</span>
            </div>
            <div className="flex justify-between text-sm text-green-600">
              <span className="text-muted-foreground">التوصيل</span>
              <span className="font-bold">مجاني</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>الإجمالي</span>
              <span className="text-primary">{total.toFixed(2)} ر.س</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-gray-100 z-20">
          <Button className="w-full h-12 text-lg font-bold rounded-xl shadow-lg shadow-primary/20">
            <CreditCard className="w-5 h-5 ml-2" />
            إتمام الشراء
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
