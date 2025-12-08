import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Building2, FileText, Upload, CheckCircle2, AlertCircle, Store } from 'lucide-react';
import { useState } from 'react';

export default function FacilityDetails() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <MobileLayout hideHeader>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">تفاصيل المنشأة</h1>
              <p className="text-xs text-muted-foreground">إدارة بيانات نشاطك التجاري</p>
            </div>
          </div>
          <Button 
            variant={isEditing ? "default" : "outline"} 
            size="sm" 
            onClick={() => setIsEditing(!isEditing)}
            className="h-9 font-bold"
          >
            {isEditing ? 'حفظ التغييرات' : 'تعديل البيانات'}
          </Button>
        </div>

        <div className="p-4 space-y-6">
          {/* Verification Status */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
             <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
             <div>
               <h3 className="font-bold text-sm text-green-800">حساب موثق</h3>
               <p className="text-xs text-green-700 mt-1">تم التحقق من صحة السجل التجاري والشهادة الضريبية. يمكنك الاستفادة من كافة خدمات الجملة.</p>
             </div>
          </div>

          {/* Basic Info */}
          <section className="space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              البيانات الأساسية
            </h3>
            <Card className="p-4 border-none shadow-sm space-y-4 bg-white">
              <div className="space-y-2">
                <Label>اسم المنشأة (حسب السجل التجاري)</Label>
                <Input defaultValue="شركة سوبر ماركت السعادة التجارية" disabled={!isEditing} className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label>نوع النشاط</Label>
                <Input defaultValue="مواد غذائية - تموينات" disabled={!isEditing} className="bg-gray-50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                   <Label>رقم السجل التجاري</Label>
                   <Input defaultValue="1010123456" disabled={!isEditing} className="bg-gray-50 font-mono text-left" />
                </div>
                <div className="space-y-2">
                   <Label>تاريخ انتهاء السجل</Label>
                   <Input defaultValue="1446/05/20" disabled={!isEditing} className="bg-gray-50 text-left" />
                </div>
              </div>
            </Card>
          </section>

          {/* Tax Info */}
          <section className="space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              البيانات الضريبية
            </h3>
            <Card className="p-4 border-none shadow-sm space-y-4 bg-white">
               <div className="space-y-2">
                   <Label>الرقم الضريبي (VAT)</Label>
                   <Input defaultValue="300123456789003" disabled={!isEditing} className="bg-gray-50 font-mono text-left" />
                </div>
                <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  يتم استخدام الرقم الضريبي لإصدار الفواتير الضريبية المعتمدة.
                </div>
            </Card>
          </section>

          {/* Documents */}
          <section className="space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Upload className="w-4 h-4 text-primary" />
              المستندات المرفقة
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 border-dashed border-2 border-gray-200 shadow-none flex flex-col items-center justify-center text-center gap-2 bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer h-32">
                 <FileText className="w-8 h-8 text-muted-foreground/50" />
                 <span className="text-xs font-bold text-muted-foreground">صورة السجل التجاري</span>
                 <span className="text-[10px] text-green-600 bg-green-100 px-2 py-0.5 rounded-full">تم الرفع</span>
              </Card>
              <Card className="p-4 border-dashed border-2 border-gray-200 shadow-none flex flex-col items-center justify-center text-center gap-2 bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer h-32">
                 <FileText className="w-8 h-8 text-muted-foreground/50" />
                 <span className="text-xs font-bold text-muted-foreground">شهادة الضريبة</span>
                 <span className="text-[10px] text-green-600 bg-green-100 px-2 py-0.5 rounded-full">تم الرفع</span>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </MobileLayout>
  );
}
