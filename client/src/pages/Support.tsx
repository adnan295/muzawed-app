import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MessageCircle, HelpCircle, Clock, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Support() {
  const { data: settings = [], isLoading } = useQuery<any[]>({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const res = await fetch('/api/site-settings');
      if (!res.ok) return [];
      return res.json();
    }
  });

  const getSetting = (key: string, defaultValue: string = '') => {
    const setting = settings.find((s: any) => s.key === key);
    return setting?.value || defaultValue;
  };

  const supportPhone = getSetting('support_phone', '+963 XXX XXX XXX');
  const supportEmail = getSetting('support_email', 'support@sary.sy');
  const supportWhatsapp = getSetting('support_whatsapp', '+963 XXX XXX XXX');
  const supportHours = getSetting('support_hours', 'السبت - الخميس: 9 صباحاً - 6 مساءً');

  return (
    <MobileLayout hideHeader>
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-primary p-6 pb-12 rounded-b-[2rem] text-white shadow-lg text-center">
          <h1 className="text-xl font-bold mb-2" data-testid="text-support-title">مركز المساعدة</h1>
          <p className="text-white/80 text-sm">كيف يمكننا مساعدتك اليوم؟</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="px-4 -mt-8 relative z-20 space-y-6">
            <Card className="p-4 border-none shadow-md bg-white rounded-2xl">
              <div className="grid grid-cols-3 gap-2 mb-4">
                <a
                  href={`https://wa.me/${supportWhatsapp.replace(/[^0-9+]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center py-3 gap-2 hover:bg-gray-50 rounded-xl transition-colors"
                  data-testid="link-support-whatsapp"
                >
                  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold">واتساب</span>
                </a>
                <a
                  href={`tel:${supportPhone.replace(/\s/g, '')}`}
                  className="flex flex-col items-center py-3 gap-2 hover:bg-gray-50 rounded-xl transition-colors"
                  data-testid="link-support-phone"
                >
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold">اتصال</span>
                </a>
                <a
                  href={`mailto:${supportEmail}`}
                  className="flex flex-col items-center py-3 gap-2 hover:bg-gray-50 rounded-xl transition-colors"
                  data-testid="link-support-email"
                >
                  <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold">إيميل</span>
                </a>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-gray-50 p-2 rounded-lg">
                <Clock className="w-4 h-4" />
                <span>{supportHours}</span>
              </div>
            </Card>

            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                الأسئلة الشائعة
              </h3>
              <Accordion type="single" collapsible className="space-y-2">
                <AccordionItem value="item-1" className="bg-white rounded-xl border border-gray-100 px-4">
                  <AccordionTrigger className="hover:no-underline font-semibold text-sm">كيف يمكنني تتبع طلبي؟</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm">
                    يمكنك تتبع طلبك من خلال الذهاب إلى صفحة "طلباتي" في القائمة السفلية، واختيار الطلب الحالي لمعرفة حالته وموقع المندوب.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2" className="bg-white rounded-xl border border-gray-100 px-4">
                  <AccordionTrigger className="hover:no-underline font-semibold text-sm">ما هي طرق الدفع المتاحة؟</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm">
                    نوفر خيارات دفع متعددة تشمل الدفع نقداً عند الاستلام، المحفظة الإلكترونية، والدفع الآجل للعملاء المؤهلين حسب مستوى العضوية.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3" className="bg-white rounded-xl border border-gray-100 px-4">
                  <AccordionTrigger className="hover:no-underline font-semibold text-sm">هل يوجد حد أدنى للطلب؟</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm">
                    نعم، الحد الأدنى للطلب يختلف حسب المنتج. يرجى مراجعة تفاصيل كل منتج لمعرفة الحد الأدنى. التوصيل مجاني للطلبات التي تتجاوز حداً معيناً.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-sm mb-4">أرسل لنا رسالة</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">الموضوع</label>
                  <Input placeholder="اختر موضوع الرسالة" className="bg-gray-50 border-gray-200" data-testid="input-support-subject" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">الرسالة</label>
                  <Textarea placeholder="اكتب تفاصيل مشكلتك هنا..." className="bg-gray-50 border-gray-200 min-h-[100px]" data-testid="textarea-support-message" />
                </div>
                <Button className="w-full font-bold" data-testid="button-send-support">إرسال</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
