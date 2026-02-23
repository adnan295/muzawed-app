import { MobileLayout } from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { FileText, Shield, Clock, CreditCard, Package, AlertCircle, Loader2, ChevronLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';

const defaultPrivacySections = [
  {
    icon: Shield,
    title: 'جمع البيانات',
    content: 'نقوم بجمع المعلومات الضرورية فقط لتقديم خدماتنا، مثل: رقم الهاتف، اسم المنشأة، العنوان، وسجل الطلبات. لا نقوم بجمع بيانات غير ضرورية.',
  },
  {
    title: 'استخدام البيانات',
    content: 'نستخدم بياناتك لتوفير خدمات التوصيل، معالجة الطلبات، تحسين تجربة المستخدم، وإرسال الإشعارات المتعلقة بطلباتك.',
  },
  {
    title: 'مشاركة البيانات',
    content: 'لا نشارك بياناتك الشخصية مع أي طرف ثالث إلا عند الضرورة (مثل خدمات التوصيل) أو بموجب القانون. لا نبيع بياناتك أبداً.',
  },
  {
    title: 'حماية البيانات',
    content: 'نستخدم تقنيات تشفير متقدمة لحماية بياناتك. كلمات المرور مشفرة ولا يمكن لأي شخص الوصول إليها.',
  },
  {
    title: 'حقوقك',
    content: 'يحق لك طلب الوصول إلى بياناتك، تعديلها، أو حذفها في أي وقت. يمكنك تقديم طلب حذف الحساب من خلال صفحة "طلب حذف الحساب".',
  },
];

const defaultTermsSections = [
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
    content: 'باستخدامك لمنصة مزود، فإنك توافق على الالتزام بشروط الخدمة. نحتفظ بالحق في تعديل الأسعار والشروط دون إشعار مسبق. جميع الأسعار معروضة بالليرة السورية.',
  },
];

export default function Terms() {
  const [, setLocation] = useLocation();

  const { data: privacySetting, isLoading: loadingPrivacy } = useQuery({
    queryKey: ['site-settings', 'privacy_policy'],
    queryFn: async () => {
      const res = await fetch('/api/site-settings/privacy_policy');
      if (!res.ok) return null;
      return res.json();
    }
  });

  const { data: termsSetting, isLoading: loadingTerms } = useQuery({
    queryKey: ['site-settings', 'terms'],
    queryFn: async () => {
      const res = await fetch('/api/site-settings/terms');
      if (!res.ok) return null;
      return res.json();
    }
  });

  const isLoading = loadingPrivacy || loadingTerms;

  return (
    <MobileLayout hideHeader>
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-3">
          <button onClick={() => setLocation('/profile')} className="p-1" data-testid="button-back-terms">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold" data-testid="text-terms-title">سياسة الخصوصية والشروط والأحكام</h1>
            <p className="text-xs text-muted-foreground">سياسة الاستخدام والخصوصية</p>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <h2 className="text-base font-bold text-gray-900" data-testid="text-privacy-heading">سياسة الخصوصية</h2>
                </div>

                {privacySetting?.value ? (
                  <Card className="p-4 border-none shadow-sm bg-white">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700" dir="rtl" data-testid="text-privacy-content">
                      {privacySetting.value}
                    </div>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {defaultPrivacySections.map((section, index) => (
                      <Card key={index} className="p-4 border-none shadow-sm bg-white" data-testid={`card-privacy-${index}`}>
                        <h3 className="font-bold text-sm mb-2 text-primary">{section.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{section.content}</p>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <h2 className="text-base font-bold text-gray-900" data-testid="text-terms-heading">الشروط والأحكام</h2>
                </div>

                {termsSetting?.value ? (
                  <Card className="p-4 border-none shadow-sm bg-white">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700" dir="rtl" data-testid="text-terms-content">
                      {termsSetting.value}
                    </div>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {defaultTermsSections.map((section, index) => (
                      <Card key={index} className="p-4 border-none shadow-sm bg-white" data-testid={`card-terms-${index}`}>
                        <div className="flex items-start gap-3">
                          {section.icon && (
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                              <section.icon className="w-5 h-5 text-primary" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold text-sm mb-2">{section.title}</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">{section.content}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-center pt-4 space-y-2">
                <button
                  onClick={() => setLocation('/delete-account')}
                  className="text-xs text-red-500 underline"
                  data-testid="link-delete-account"
                >
                  طلب حذف الحساب
                </button>
                <p className="text-xs text-muted-foreground">
                  آخر تحديث: فبراير 2026
                </p>
                <p className="text-xs text-muted-foreground">
                  للاستفسارات، تواصل معنا عبر صفحة الدعم
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
