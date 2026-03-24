import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PRODUCTS } from '@/lib/data';
import { useLocation, useRoute } from 'wouter';
import { ChevronRight, Package, Truck, CheckCircle2, MapPin, Phone, FileText, Repeat, Printer, Share2, Download } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';

export default function OrderDetails() {
  const [, params] = useRoute('/order/:id');
  const [, paramsAlt] = useRoute('/orders/:id');
  const [, setLocation] = useLocation();
  const orderId = params?.id || paramsAlt?.id || '12345';
  const printRef = useRef<HTMLDivElement>(null);

  const steps = [
    { label: 'تم استلام الطلب', date: '08:30 ص', status: 'completed', icon: Package },
    { label: 'تجهيز الطلب', date: '09:15 ص', status: 'completed', icon: CheckCircle2 },
    { label: 'خرج للتوصيل', date: '10:00 ص', status: 'active', icon: Truck },
    { label: 'تم التوصيل', date: '---', status: 'pending', icon: MapPin },
  ];

  const items = [PRODUCTS[0], PRODUCTS[3], PRODUCTS[1]];
  const total = items.reduce((acc, item) => acc + (item.price * item.minOrder), 0);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    try {
      const date = new Date().toLocaleDateString('ar-SA');
      const rows = items.map(item =>
        `<tr><td style="padding:6px 8px;border-bottom:1px solid #f0f0f0">${item.name}</td><td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;text-align:center">${item.minOrder}</td><td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;text-align:left;font-weight:bold">${(item.price * item.minOrder).toLocaleString()} ل.س</td></tr>`
      ).join('');

      const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>فاتورة #${orderId}</title><style>body{font-family:Arial,sans-serif;padding:32px;max-width:600px;margin:auto;color:#1a1a1a}h1{color:#7c3aed}table{width:100%;border-collapse:collapse}th{background:#f5f3ff;padding:8px;text-align:right}.total{font-size:1.1rem;font-weight:bold;color:#7c3aed}</style></head><body><h1>فاتورة — طلب رقم #${orderId}</h1><p>التاريخ: ${date}</p><hr/><table><thead><tr><th>المنتج</th><th>الكمية</th><th>الإجمالي</th></tr></thead><tbody>${rows}</tbody></table><hr/><p class="total">الإجمالي: ${total.toLocaleString()} ل.س</p></body></html>`;

      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `muzwd-order-${orderId}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('تم تحميل الفاتورة');
    } catch {
      toast.error('فشل تحميل الفاتورة');
    }
  };

  const handleShare = async () => {
    const text = `طلب Muzwd رقم #${orderId}\nالإجمالي: ${total.toLocaleString()} ل.س\n${window.location.href}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `طلب #${orderId}`, text, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success('تم نسخ تفاصيل الطلب');
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') toast.error('فشل المشاركة');
    }
  };

  const handleReorder = () => {
    toast.success('تمت إضافة المنتجات للسلة');
    setLocation('/cart');
  };

  return (
    <MobileLayout hideHeader>
      <div className="min-h-screen bg-gray-50 pb-24" ref={printRef}>
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

          {/* Primary Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 bg-white border-gray-200" onClick={() => setLocation(`/invoice/${orderId}`)}>
              <FileText className="w-4 h-4 ml-2" />
              الفاتورة
            </Button>
            <Button className="flex-1 shadow-sm bg-primary text-white" onClick={handleReorder} data-testid="button-reorder">
              <Repeat className="w-4 h-4 ml-2" />
              إعادة الطلب
            </Button>
          </div>

          {/* Secondary Actions — print / download / share */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-white border-gray-200 rounded-xl text-gray-600"
              onClick={handlePrint}
              data-testid="button-print"
            >
              <Printer className="w-4 h-4 ml-1.5" />
              طباعة
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-white border-gray-200 rounded-xl text-gray-600"
              onClick={handleDownload}
              data-testid="button-download"
            >
              <Download className="w-4 h-4 ml-1.5" />
              تحميل
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-white border-gray-200 rounded-xl text-gray-600"
              onClick={handleShare}
              data-testid="button-share"
            >
              <Share2 className="w-4 h-4 ml-1.5" />
              مشاركة
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
            <h3 className="font-bold text-sm mb-3">المنتجات ({items.length})</h3>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-lg p-1 shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain mix-blend-multiply"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold line-clamp-1">{item.name}</p>
                    <p className="text-xs text-muted-foreground">الكمية: {item.minOrder}</p>
                  </div>
                  <span className="font-bold text-sm">{(item.price * item.minOrder).toLocaleString()} ل.س</span>
                </div>
              ))}
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between items-center font-bold">
              <span>الإجمالي</span>
              <span className="text-primary">{total.toLocaleString()} ل.س</span>
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
              <Button size="icon" className="rounded-full h-10 w-10 shadow-md" onClick={() => toast.info('جاري الاتصال...')}>
                <Phone className="w-5 h-5" />
              </Button>
            </div>
          </Card>

        </div>
      </div>

      {/* Print styles — visible only when printing */}
      <style>{`
        @media print {
          body > *:not(.print-area) { display: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </MobileLayout>
  );
}
