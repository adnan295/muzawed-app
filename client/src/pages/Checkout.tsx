import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Truck, Calendar, CheckCircle2, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePlaceOrder = () => {
    setIsSuccess(true);
    // Simulate delay before redirecting
    setTimeout(() => {
      setIsSuccess(false);
      setLocation('/orders');
      toast({
        title: "تم استلام طلبك بنجاح",
        description: "رقم الطلب #12345",
        className: "bg-green-600 text-white border-none",
      });
    }, 2000);
  };

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
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-sm">سوبر ماركت السعادة</p>
                  <p className="text-xs text-muted-foreground mt-1">الرياض، حي الملقا، شارع أنس بن مالك</p>
                </div>
                <Button variant="link" className="text-primary text-xs h-auto p-0">تغيير</Button>
              </div>
            </div>
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
                    <div className="w-8 h-5 bg-gray-200 rounded"></div>
                    <div className="w-8 h-5 bg-gray-200 rounded"></div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse rounded-xl border p-3 hover:bg-accent cursor-pointer transition-colors">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod" className="flex-1 cursor-pointer mr-2">الدفع عند الاستلام (نقدي)</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse rounded-xl border p-3 hover:bg-accent cursor-pointer transition-colors">
                <RadioGroupItem value="transfer" id="transfer" />
                <Label htmlFor="transfer" className="flex-1 cursor-pointer mr-2">تحويل بنكي</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <h3 className="font-bold text-sm mb-2">ملخص الدفع</h3>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">المجموع</span>
              <span>625.00 ر.س</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">الضريبة (15%)</span>
              <span>93.75 ر.س</span>
            </div>
            <div className="flex justify-between text-sm text-green-600">
              <span className="text-muted-foreground">التوصيل</span>
              <span className="font-bold">مجاني</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>الإجمالي</span>
              <span className="text-primary">718.75 ر.س</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-20 max-w-md mx-auto">
          <Button 
            className="w-full h-12 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
            onClick={handlePlaceOrder}
          >
            تأكيد الطلب (718.75 ر.س)
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
                شكراً لثقتكم. رقم طلبك هو #12345. يمكنك تتبع حالة الطلب من صفحة طلباتي.
              </DialogDescription>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </MobileLayout>
  );
}
