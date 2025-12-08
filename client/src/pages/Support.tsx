import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MessageCircle, HelpCircle, ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Support() {
  return (
    <MobileLayout hideHeader>
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-primary p-6 pb-12 rounded-b-[2rem] text-white shadow-lg text-center">
          <h1 className="text-xl font-bold mb-2">مركز المساعدة</h1>
          <p className="text-white/80 text-sm">كيف يمكننا مساعدتك اليوم؟</p>
        </div>

        <div className="px-4 -mt-8 relative z-20 space-y-6">
          {/* Contact Channels */}
          <Card className="p-4 border-none shadow-md bg-white rounded-2xl grid grid-cols-3 gap-2">
             <Button variant="ghost" className="flex flex-col h-auto py-3 gap-2 hover:bg-gray-50">
               <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                 <MessageCircle className="w-5 h-5" />
               </div>
               <span className="text-xs font-bold">واتساب</span>
             </Button>
             <Button variant="ghost" className="flex flex-col h-auto py-3 gap-2 hover:bg-gray-50">
               <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                 <Phone className="w-5 h-5" />
               </div>
               <span className="text-xs font-bold">اتصال</span>
             </Button>
             <Button variant="ghost" className="flex flex-col h-auto py-3 gap-2 hover:bg-gray-50">
               <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                 <Mail className="w-5 h-5" />
               </div>
               <span className="text-xs font-bold">إيميل</span>
             </Button>
          </Card>

          {/* FAQ */}
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
                  نوفر خيارات دفع متعددة تشمل البطاقات الائتمانية، مدى، Apple Pay، والدفع عند الاستلام.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="bg-white rounded-xl border border-gray-100 px-4">
                <AccordionTrigger className="hover:no-underline font-semibold text-sm">هل يوجد حد أدنى للطلب؟</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  نعم، الحد الأدنى للطلب هو 150000 ليرة. التوصيل مجاني للطلبات فوق 500000 ليرة.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-sm mb-4">أرسل لنا رسالة</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">الموضوع</label>
                <Input placeholder="اختر موضوع الرسالة" className="bg-gray-50 border-gray-200" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">الرسالة</label>
                <Textarea placeholder="اكتب تفاصيل مشكلتك هنا..." className="bg-gray-50 border-gray-200 min-h-[100px]" />
              </div>
              <Button className="w-full font-bold">إرسال</Button>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
