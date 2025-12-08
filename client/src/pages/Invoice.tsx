import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PRODUCTS } from '@/lib/data';
import { Download, Share2, Printer, ArrowRight } from 'lucide-react';
import { useLocation, useRoute } from 'wouter';

export default function Invoice() {
  const [, params] = useRoute('/invoice/:id');
  const orderId = params?.id || '12345';
  const date = new Date().toLocaleDateString('ar-SA');

  // Mock invoice items
  const items = [PRODUCTS[0], PRODUCTS[3], PRODUCTS[1]];
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.minOrder), 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans" dir="rtl">
      {/* Actions Header */}
      <div className="flex items-center justify-between mb-6 no-print">
        <Button variant="ghost" onClick={() => history.back()} className="gap-2">
          <ArrowRight className="w-4 h-4" />
          رجوع
        </Button>
        <div className="flex gap-2">
          <Button size="icon" variant="outline" className="bg-white rounded-full">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="outline" className="bg-white rounded-full" onClick={() => window.print()}>
            <Printer className="w-4 h-4" />
          </Button>
          <Button size="icon" className="rounded-full bg-primary text-white">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Invoice Paper */}
      <Card className="max-w-md mx-auto bg-white p-6 rounded-none sm:rounded-xl shadow-sm print:shadow-none print:w-full print:max-w-none">
        {/* Header */}
        <div className="text-center border-b-2 border-gray-100 pb-6 mb-6">
          <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
            س
          </div>
          <h1 className="text-xl font-bold mb-1">فاتورة ضريبية مبسطة</h1>
          <p className="text-sm text-muted-foreground">شركة ساري لتقنية المعلومات</p>
          <p className="text-xs text-muted-foreground mt-1">الرقم الضريبي: 300123456789003</p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p className="text-muted-foreground text-xs mb-1">رقم الفاتورة</p>
            <p className="font-bold font-mono">INV-{orderId}</p>
          </div>
          <div className="text-left">
            <p className="text-muted-foreground text-xs mb-1">التاريخ</p>
            <p className="font-bold">{date}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">العميل</p>
            <p className="font-bold">سوبر ماركت السعادة</p>
          </div>
          <div className="text-left">
            <p className="text-muted-foreground text-xs mb-1">الرقم الضريبي للعميل</p>
            <p className="font-bold font-mono">310123456700003</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <div className="flex text-xs font-bold text-muted-foreground border-b border-gray-100 pb-2 mb-2">
            <span className="flex-[2]">المنتج</span>
            <span className="flex-1 text-center">الكمية</span>
            <span className="flex-1 text-left">السعر</span>
          </div>
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex text-sm items-start">
                <span className="flex-[2] font-medium line-clamp-2 pl-2">{item.name}</span>
                <span className="flex-1 text-center text-muted-foreground">x{item.minOrder}</span>
                <span className="flex-1 text-left font-bold">{(item.price * item.minOrder).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Totals */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">المجموع الخاضع للضريبة</span>
            <span>{subtotal.toFixed(2)} ر.س</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">ضريبة القيمة المضافة (15%)</span>
            <span>{vat.toFixed(2)} ر.س</span>
          </div>
          <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t border-dashed border-gray-200">
            <span>الإجمالي المستحق</span>
            <span>{total.toFixed(2)} ر.س</span>
          </div>
        </div>

        {/* QR Code Placeholder */}
        <div className="mt-8 flex justify-center">
          <div className="w-32 h-32 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center text-xs text-muted-foreground text-center p-2">
            [QR Code]
            <br/>
            هيئة الزكاة والضريبة
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>شكراً لتعاملكم معنا</p>
          <p className="mt-1">support@sary.com | 9200XXXXX</p>
        </div>
      </Card>
    </div>
  );
}
