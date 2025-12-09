import { MobileLayout } from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { FileText, Shield, Clock, CreditCard, Package, AlertCircle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const defaultSections = [
  {
    icon: Shield,
    title: 'سياسة الخصوصية',
    content: 'نحن ملتزمون بحماية خصوصية بياناتك الشخصية. يتم جمع المعلومات الضرورية فقط لتقديم خدماتنا بشكل أفضل، ولا نشارك بياناتك مع أي طرف ثالث دون موافقتك.',
  },
  {
    icon: Package,
    title: 'سياسة التوصيل',
    content: 'يتم توصيل الطلبات خلال 24-48 ساعة من تأكيد الطلب. رسوم التوصيل تختلف حسب المنطقة وحجم الطلب. التوصيل مجاني للطلبات التي تتجاوز الحد الأدنى المحدد.',
  },
  {
    icon: Clock,
    title: 'سياسة الإلغاء والإرجاع',
    content: 'يمكنك إلغاء طلبك قبل شحنه. بعد الاستلام، يمكن إرجاع المنتجات خلال 3 أيام بشرط أن تكون في حالتها الأصلية. المنتجات القابلة للتلف غير قابلة للإرجاع.',
  },
  {
    icon: CreditCard,
    title: 'طرق الدفع',
    content: 'نقبل الدفع نقداً عند الاستلام، والدفع عبر المحفظة الإلكترونية، والدفع الآجل للعملاء المؤهلين حسب مستوى العضوية. لا نقبل بطاقات الائتمان حالياً.',
  },
  {
    icon: AlertCircle,
    title: 'الحد الأدنى للطلب',
    content: 'كل منتج له حد أدنى للطلب محدد. هذا لأننا نبيع بالجملة للمنشآت التجارية فقط. يرجى مراجعة الحد الأدنى لكل منتج قبل الشراء.',
  },
  {
    icon: FileText,
    title: 'الشروط العامة',
    content: 'باستخدامك لمنصة ساري، فإنك توافق على الالتزام بشروط الخدمة. نحتفظ بالحق في تعديل الأسعار والشروط دون إشعار مسبق. جميع الأسعار معروضة بالليرة السورية ولا تشمل ضريبة القيمة المضافة.',
  },
];

export default function Terms() {
  const { data: termsSetting, isLoading } = useQuery({
    queryKey: ['site-settings', 'terms'],
    queryFn: async () => {
      const res = await fetch('/api/site-settings/terms');
      if (!res.ok) return null;
      return res.json();
    }
  });

  const hasCustomTerms = termsSetting?.value;

  return (
    <MobileLayout hideHeader>
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold" data-testid="text-terms-title">الشروط والأحكام</h1>
            <p className="text-xs text-muted-foreground">سياسة الاستخدام والخصوصية</p>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : hasCustomTerms ? (
            <Card className="p-4 border-none shadow-sm bg-white">
              <div className="prose prose-sm max-w-none text-right" dir="rtl">
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                  {termsSetting.value}
                </div>
              </div>
            </Card>
          ) : (
            defaultSections.map((section, index) => (
              <Card key={index} className="p-4 border-none shadow-sm bg-white">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm mb-2">{section.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{section.content}</p>
                  </div>
                </div>
              </Card>
            ))
          )}

          <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground">
              آخر تحديث: ديسمبر 2024
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              للاستفسارات، تواصل معنا عبر صفحة الدعم
            </p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
