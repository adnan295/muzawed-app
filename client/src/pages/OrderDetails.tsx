import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PRODUCTS } from '@/lib/data';
import { useLocation, useRoute, Link } from 'wouter';
import { ChevronRight, Package, Truck, CheckCircle2, Clock, MapPin, Phone, FileText, Repeat } from 'lucide-react';

export default function OrderDetails() {
  const [, params] = useRoute('/order/:id');
  const [, setLocation] = useLocation();
  const orderId = params?.id || '12345';

  const steps = [
    { label: 'تم استلام الطلب', date: '08:30 ص', status: 'completed', icon: Package },
    { label: 'تجهيز الطلب', date: '09:15 ص', status: 'completed', icon: CheckCircle2 },
    { label: 'خرج للتوصيل', date: '10:00 ص', status: 'active', icon: Truck },
    { label: 'تم التوصيل', date: '---', status: 'pending', icon: MapPin },
  ];

  return (
    <MobileLayout hideHeader>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-3">
          <Button size="icon" variant="ghost" className="h-10 w-10 -mr-2" onClick={() => history.back()}>
            <ChevronRight className="w-6 h-6" />
          </Button>
          <div className="flex-1">
             <h1 className="text-lg font-bold">تفاصيل الطلب</h1>
             <p className="text-xs text-muted-foreground">#{orderId}</p>
          </div>
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
            جاري التوصيل
          </div>
        </div>

        <div className="p-4 space-y-4">
          
          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 bg-white border-gray-200" onClick={() => setLocation(`/invoice/${orderId}`)}>
              <FileText className="w-4 h-4 ml-2" />
              الفاتورة
            </Button>
            <Button className="flex-1 shadow-sm bg-primary text-white">
              <Repeat className="w-4 h-4 ml-2" />
              إعادة الطلب
            </Button>
          </div>

          {/* Timeline */}
          <Card className="p-5 border-none shadow-sm">
            <h3 className="font-bold text-sm mb-6">حالة الطلب</h3>
            <div className="relative space-y-8 before:absolute before:right-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
               {steps.map((step, index) => (
                 <div key={index} className="relative flex items-center gap-4 z-10">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${
                     step.status === 'completed' ? 'bg-green-500 text-white' :
                     step.status === 'active' ? 'bg-primary text-white ring-4 ring-primary/10' :
                     'bg-gray-100 text-gray-400'
                   }`}>
                     <step.icon className="w-5 h-5" />
                   </div>
                   <div className="flex-1 flex justify-between items-center">
                     <span className={`text-sm font-bold ${step.status === 'pending' ? 'text-gray-400' : 'text-foreground'}`}>
                       {step.label}
                     </span>
                     <span className="text-xs text-muted-foreground">{step.date}</span>
                   </div>
                 </div>
               ))}
            </div>
          </Card>

          {/* Items */}
          <Card className="p-4 border-none shadow-sm overflow-hidden">
             <h3 className="font-bold text-sm mb-3">المنتجات (3)</h3>
             <div className="space-y-3">
               {[PRODUCTS[0], PRODUCTS[3], PRODUCTS[1]].map((item, idx) => (
                 <div key={idx} className="flex gap-3 items-center">
                   <div className="w-12 h-12 bg-gray-50 rounded-lg p-1 shrink-0">
                     <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                   </div>
                   <div className="flex-1">
                     <p className="text-sm font-bold line-clamp-1">{item.name}</p>
                     <p className="text-xs text-muted-foreground">الكمية: {item.minOrder}</p>
                   </div>
                   <span className="font-bold text-sm">{(item.price * item.minOrder).toFixed(2)} ل.س</span>
                 </div>
               ))}
             </div>
             <Separator className="my-3" />
             <div className="flex justify-between items-center font-bold">
               <span>الإجمالي</span>
               <span className="text-primary">450.00 ل.س</span>
             </div>
          </Card>

          {/* Driver Info */}
          <Card className="p-4 border-none shadow-sm bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">
                👨🏻‍✈️
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm">محمد أحمد</h3>
                <p className="text-xs text-muted-foreground">مندوب التوصيل</p>
              </div>
              <Button size="icon" className="rounded-full h-10 w-10 shadow-md">
                <Phone className="w-5 h-5" />
              </Button>
            </div>
          </Card>

        </div>
      </div>
    </MobileLayout>
  );
}
