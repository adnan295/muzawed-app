import { MobileLayout } from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  AlertTriangle,
  ChevronLeft,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Phone,
  FileText,
  ShoppingCart,
  MapPin,
  Heart,
  Wallet,
  UserX,
  Lock,
  Send,
  Loader2,
} from 'lucide-react';

export default function DeleteAccount() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = useMutation({
    mutationFn: async (data: { phone: string; reason?: string }) => {
      const res = await fetch('/api/account-deletion-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'حدث خطأ');
      }
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (error: Error) => {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    },
  });

  const handleSubmit = () => {
    if (!phone || phone.length < 9) {
      toast({ title: 'خطأ', description: 'يرجى إدخال رقم هاتف صحيح', variant: 'destructive' });
      return;
    }
    submitMutation.mutate({ phone, reason: reason || undefined });
  };

  const deletedDataItems = [
    { icon: UserX, text: 'معلومات الملف الشخصي (الاسم، رقم الهاتف)' },
    { icon: ShoppingCart, text: 'سجل الطلبات والمشتريات' },
    { icon: MapPin, text: 'العناوين المحفوظة' },
    { icon: Heart, text: 'قائمة المفضلات' },
    { icon: Wallet, text: 'رصيد المحفظة الإلكترونية' },
  ];

  const retainedDataItems = [
    { icon: FileText, text: 'سجلات الدفع والفواتير (7 سنوات - متطلب قانوني)' },
    { icon: Clock, text: 'سجلات المعاملات السابقة (5 سنوات - متطلب قانوني)' },
  ];

  const steps = [
    'املأ نموذج طلب الحذف أدناه برقم الهاتف المرتبط بحسابك',
    'سيتم مراجعة طلبك والتحقق من هويتك',
    'بعد تأكيد الطلب، سيتم حذف حسابك وبياناتك خلال 30 يوماً',
  ];

  if (submitted) {
    return (
      <MobileLayout hideHeader>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="p-8 text-center max-w-sm mx-auto border-none shadow-lg">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-lg font-bold mb-2" data-testid="text-success-title">تم إرسال طلبك بنجاح</h2>
            <p className="text-sm text-gray-600 mb-6" data-testid="text-success-message">
              سيتم مراجعة طلبك من قبل فريقنا والتواصل معك خلال 48 ساعة عبر رقم الهاتف المسجل.
            </p>
            <Button
              onClick={() => setLocation('/')}
              className="w-full rounded-xl bg-primary hover:bg-primary/90"
              data-testid="button-back-home"
            >
              العودة للرئيسية
            </Button>
          </Card>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout hideHeader>
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-3">
          <button onClick={() => setLocation('/profile')} className="p-1" data-testid="button-back-delete">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="bg-red-100 p-2 rounded-lg text-red-600">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold" data-testid="text-delete-title">طلب حذف الحساب</h1>
            <p className="text-xs text-muted-foreground">تطبيق مزود - منصة التوزيع بالجملة</p>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <Card className="p-4 border-none shadow-sm bg-amber-50 border-r-4 border-r-amber-400">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-amber-800 mb-1" data-testid="text-important-info">معلومات مهمة قبل حذف حسابك</h3>
                <p className="text-xs text-amber-700 leading-relaxed">
                  حذف الحساب هو إجراء نهائي ولا يمكن التراجع عنه. يرجى قراءة المعلومات أدناه بعناية.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-none shadow-sm bg-white">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2" data-testid="text-steps-title">
              <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              خطوات طلب حذف الحساب
            </h3>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3" data-testid={`step-${index}`}>
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center shrink-0 text-xs font-bold">
                    {index + 1}
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4">
            <Card className="p-4 border-none shadow-sm bg-white">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-red-600" data-testid="text-deleted-data-title">
                <Trash2 className="w-4 h-4" />
                البيانات التي سيتم حذفها
              </h3>
              <div className="space-y-2.5">
                {deletedDataItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2.5" data-testid={`deleted-item-${index}`}>
                    <item.icon className="w-4 h-4 text-red-400 shrink-0" />
                    <p className="text-xs text-gray-700">{item.text}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 border-none shadow-sm bg-white">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-amber-600" data-testid="text-retained-data-title">
                <Lock className="w-4 h-4" />
                البيانات المحتفظ بها مؤقتاً
              </h3>
              <div className="space-y-2.5">
                {retainedDataItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2.5" data-testid={`retained-item-${index}`}>
                    <item.icon className="w-4 h-4 text-amber-400 shrink-0" />
                    <p className="text-xs text-gray-700">{item.text}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-3 leading-relaxed">
                يتم الاحتفاظ بهذه البيانات للامتثال للمتطلبات القانونية والمحاسبية وسيتم حذفها تلقائياً بعد انتهاء فترة الاحتفاظ.
              </p>
            </Card>
          </div>

          <Card className="p-5 border-none shadow-sm bg-white">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2" data-testid="text-form-title">
              <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-red-600" />
              </div>
              نموذج طلب الحذف
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                  رقم الهاتف المرتبط بالحساب
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+963 XXX XXX XXXX"
                    className="rounded-xl pr-10 text-right"
                    dir="ltr"
                    type="tel"
                    data-testid="input-delete-phone"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                  سبب الحذف (اختياري)
                </label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="ساعدنا على تحسين خدماتنا بإخبارنا سبب رغبتك في حذف حسابك..."
                  className="rounded-xl min-h-[100px]"
                  dir="rtl"
                  data-testid="textarea-delete-reason"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={submitMutation.isPending || !phone}
                className="w-full rounded-xl bg-red-600 hover:bg-red-700 text-white h-12"
                data-testid="button-submit-delete"
              >
                {submitMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 ml-2" />
                    إرسال طلب الحذف
                  </>
                )}
              </Button>

              <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                بالضغط على "إرسال طلب الحذف"، أنت توافق على أنك تفهم أن هذا الإجراء نهائي ولا يمكن التراجع عنه.
              </p>
            </div>
          </Card>

          <Card className="p-4 border-none shadow-sm bg-gray-100">
            <h3 className="font-bold text-sm mb-2 text-center" data-testid="text-help-title">هل تحتاج مساعدة؟</h3>
            <p className="text-xs text-gray-600 text-center">
              إذا كان لديك أي استفسار حول حذف حسابك، تواصل معنا
            </p>
          </Card>
        </div>
      </div>
    </MobileLayout>
  );
}
