import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Building2, FileText, Upload, CheckCircle2, AlertCircle, Store, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { User, Address } from '@shared/schema';

export default function FacilityDetails() {
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [facilityName, setFacilityName] = useState('');
  const [businessType, setBusinessType] = useState('مواد غذائية - تموينات');
  const [commercialRegNo, setCommercialRegNo] = useState('');
  const [taxNumber, setTaxNumber] = useState('');

  const { data: addresses = [] } = useQuery<Address[]>({
    queryKey: ['addresses', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(`/api/addresses/${user.id}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user?.id,
  });

  const { data: userData, isLoading } = useQuery<User>({
    queryKey: ['user', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const res = await fetch(`/api/users/${user.id}`);
      if (!res.ok) throw new Error('فشل في تحميل البيانات');
      return res.json();
    },
    enabled: !!user?.id,
    onSuccess: (data: User) => {
      if (data) {
        setFacilityName(data.facilityName || '');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { facilityName: string }) => {
      const res = await fetch(`/api/users/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('فشل في تحديث البيانات');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast({
        title: "تم الحفظ",
        description: "تم تحديث بيانات المنشأة بنجاح",
        className: "bg-secondary text-white border-none",
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حفظ التغييرات",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (isEditing) {
      updateMutation.mutate({ facilityName });
    } else {
      setIsEditing(true);
    }
  };

  if (!user) {
    return (
      <MobileLayout hideHeader>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-muted-foreground">يرجى تسجيل الدخول</p>
        </div>
      </MobileLayout>
    );
  }

  if (isLoading) {
    return (
      <MobileLayout hideHeader>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];

  return (
    <MobileLayout hideHeader>
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold" data-testid="text-facility-title">تفاصيل المنشأة</h1>
              <p className="text-xs text-muted-foreground">إدارة بيانات نشاطك التجاري</p>
            </div>
          </div>
          <Button 
            variant={isEditing ? "default" : "outline"} 
            size="sm" 
            onClick={handleSave}
            className="h-9 font-bold"
            disabled={updateMutation.isPending}
            data-testid="button-edit-save"
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isEditing ? 'حفظ التغييرات' : 'تعديل البيانات'}
          </Button>
        </div>

        <div className="p-4 space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
             <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
             <div>
               <h3 className="font-bold text-sm text-green-800">حساب موثق</h3>
               <p className="text-xs text-green-700 mt-1">تم التحقق من صحة بياناتك. يمكنك الاستفادة من كافة خدمات الجملة.</p>
             </div>
          </div>

          <section className="space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              البيانات الأساسية
            </h3>
            <Card className="p-4 border-none shadow-sm space-y-4 bg-white">
              <div className="space-y-2">
                <Label>اسم المنشأة</Label>
                <Input 
                  value={facilityName} 
                  onChange={(e) => setFacilityName(e.target.value)}
                  disabled={!isEditing} 
                  className="bg-gray-50" 
                  data-testid="input-facility-name"
                />
              </div>
              <div className="space-y-2">
                <Label>رقم الهاتف</Label>
                <Input 
                  value={userData?.phone || ''} 
                  disabled 
                  className="bg-gray-50 font-mono text-left" 
                  dir="ltr"
                  data-testid="input-phone"
                />
              </div>
              <div className="space-y-2">
                <Label>نوع النشاط</Label>
                <Input 
                  value={businessType} 
                  onChange={(e) => setBusinessType(e.target.value)}
                  disabled={!isEditing} 
                  className="bg-gray-50" 
                  data-testid="input-business-type"
                />
              </div>
              {defaultAddress && (
                <div className="space-y-2">
                  <Label>العنوان</Label>
                  <Input 
                    value={defaultAddress.details} 
                    disabled 
                    className="bg-gray-50" 
                  />
                </div>
              )}
            </Card>
          </section>

          <section className="space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              البيانات الضريبية (اختياري)
            </h3>
            <Card className="p-4 border-none shadow-sm space-y-4 bg-white">
               <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-2">
                    <Label>رقم السجل التجاري</Label>
                    <Input 
                      value={commercialRegNo} 
                      onChange={(e) => setCommercialRegNo(e.target.value)}
                      placeholder="اختياري"
                      disabled={!isEditing} 
                      className="bg-gray-50 font-mono text-left" 
                      data-testid="input-commercial-reg"
                    />
                 </div>
                 <div className="space-y-2">
                    <Label>الرقم الضريبي</Label>
                    <Input 
                      value={taxNumber} 
                      onChange={(e) => setTaxNumber(e.target.value)}
                      placeholder="اختياري"
                      disabled={!isEditing} 
                      className="bg-gray-50 font-mono text-left" 
                      data-testid="input-tax-number"
                    />
                 </div>
               </div>
               <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 flex gap-2">
                 <AlertCircle className="w-4 h-4 shrink-0" />
                 يتم استخدام الرقم الضريبي لإصدار الفواتير الضريبية المعتمدة (اختياري).
               </div>
            </Card>
          </section>

          <section className="space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Upload className="w-4 h-4 text-primary" />
              المستندات (اختياري)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 border-dashed border-2 border-gray-200 shadow-none flex flex-col items-center justify-center text-center gap-2 bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer h-32">
                 <FileText className="w-8 h-8 text-muted-foreground/50" />
                 <span className="text-xs font-bold text-muted-foreground">صورة السجل التجاري</span>
                 <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">لم يتم الرفع</span>
              </Card>
              <Card className="p-4 border-dashed border-2 border-gray-200 shadow-none flex flex-col items-center justify-center text-center gap-2 bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer h-32">
                 <FileText className="w-8 h-8 text-muted-foreground/50" />
                 <span className="text-xs font-bold text-muted-foreground">شهادة الضريبة</span>
                 <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">لم يتم الرفع</span>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </MobileLayout>
  );
}
