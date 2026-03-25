import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FileText, Edit, Check, X } from 'lucide-react';

const settingsConfig = [
  { key: 'min_android_version', label: 'الحد الأدنى لإصدار التطبيق (Android)', placeholder: '1.0.0', description: 'المستخدمون الذين يملكون إصداراً أقل من هذا سيُطلب منهم التحديث تلقائياً. اتركه كـ 1.0.0 لعدم إجبار أحد على التحديث.' },
  { key: 'play_store_url', label: 'رابط التطبيق على Google Play', placeholder: 'https://play.google.com/store/apps/details?id=com.muzawed.app', description: 'الرابط الذي سيُوجَّه إليه المستخدم عند الضغط على زر "تحديث الآن".' },
  { key: 'exchange_rate_usd', label: 'سعر صرف الدولار (ل.س)', placeholder: '15000', description: 'سعر الصرف للمنتجات المسعرة بالدولار - سيتم عرض السعر بالليرة السورية للعملاء' },
  { key: 'privacy_policy', label: 'سياسة الخصوصية', placeholder: 'أدخل نص سياسة الخصوصية هنا...' },
  { key: 'terms', label: 'الشروط والأحكام', placeholder: 'أدخل نص الشروط والأحكام هنا...' },
  { key: 'support_phone', label: 'رقم الدعم الفني', placeholder: '+963 XXX XXX XXX' },
  { key: 'support_email', label: 'بريد الدعم الفني', placeholder: 'support@example.com' },
  { key: 'support_whatsapp', label: 'رقم واتساب الدعم', placeholder: '+963 XXX XXX XXX' },
  { key: 'support_hours', label: 'ساعات العمل', placeholder: 'السبت - الخميس: 9 صباحاً - 6 مساءً' },
  { key: 'about_us', label: 'عن التطبيق', placeholder: 'وصف مختصر عن التطبيق...' },
];

export default function SiteSettingsSection() {
  const { toast } = useToast();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const { data: settings = [], refetch } = useQuery<any[]>({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const res = await fetch('/api/site-settings');
      if (!res.ok) return [];
      return res.json();
    }
  });

  const getSetting = (key: string) => {
    const setting = settings.find((s: any) => s.key === key);
    return setting?.value || '';
  };

  const handleSave = async (key: string, label: string) => {
    try {
      await fetch('/api/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: editValue, label })
      });
      toast({ title: 'تم حفظ الإعداد بنجاح', className: 'bg-green-600 text-white' });
      setEditingKey(null);
      refetch();
    } catch {
      toast({ title: 'حدث خطأ أثناء الحفظ', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 mt-8">
      <div className="flex items-center gap-3 mb-4">
        <FileText className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-bold">إعدادات الموقع والمحتوى</h3>
      </div>

      <div className="grid gap-4">
        {settingsConfig.map((config) => (
          <Card key={config.key} className="p-4 rounded-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Label className="text-base font-semibold mb-1 block">{config.label}</Label>
                {'description' in config && config.description && (
                  <p className="text-xs text-gray-500 mb-2">{config.description}</p>
                )}
                {editingKey === config.key ? (
                  <div className="space-y-3">
                    {config.key === 'terms' || config.key === 'about_us' || config.key === 'privacy_policy' ? (
                      <Textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder={config.placeholder}
                        className="min-h-[200px] rounded-xl"
                        dir="rtl"
                        data-testid={`textarea-${config.key}`}
                      />
                    ) : (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder={config.placeholder}
                        className="rounded-xl"
                        dir="rtl"
                        data-testid={`input-${config.key}`}
                      />
                    )}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSave(config.key, config.label)}
                        className="rounded-xl bg-green-600 hover:bg-green-700"
                        data-testid={`save-${config.key}`}
                      >
                        <Check className="w-4 h-4 ml-2" />
                        حفظ
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingKey(null)}
                        className="rounded-xl"
                        data-testid={`cancel-${config.key}`}
                      >
                        <X className="w-4 h-4 ml-2" />
                        إلغاء
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600 text-sm line-clamp-2 flex-1">
                      {getSetting(config.key) || <span className="text-gray-400">لم يتم تعيين قيمة</span>}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl mr-4"
                      onClick={() => {
                        setEditingKey(config.key);
                        setEditValue(getSetting(config.key));
                      }}
                      data-testid={`edit-${config.key}`}
                    >
                      <Edit className="w-4 h-4 ml-2" />
                      تعديل
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
