import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Store, FileText, Upload } from 'lucide-react';

export default function FacilityDetails() {
  return (
    <MobileLayout hideHeader>
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-primary p-6 pb-12 rounded-b-[2rem] text-white shadow-lg mb-4">
          <div className="flex items-center gap-3 mb-2">
             <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
               <Store className="w-6 h-6 text-white" />
             </div>
             <h1 className="text-xl font-bold">تفاصيل المنشأة</h1>
          </div>
          <p className="text-white/80 text-sm">بيانات السجل التجاري والملف الضريبي</p>
        </div>

        <div className="px-4 -mt-8 relative z-20 space-y-4">
          <Card className="p-5 border-none shadow-md space-y-4">
            <div className="space-y-2">
              <Label htmlFor="facilityName">اسم المنشأة (كما في السجل)</Label>
              <Input id="facilityName" defaultValue="سوبر ماركت السعادة" className="bg-gray-50" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="crNumber">رقم السجل التجاري</Label>
              <Input id="crNumber" defaultValue="1010123456" className="bg-gray-50" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vatNumber">الرقم الضريبي</Label>
              <Input id="vatNumber" defaultValue="300123456789003" className="bg-gray-50" />
            </div>
            
            <div className="pt-2">
               <Label className="mb-2 block">المستندات المرفقة</Label>
               <div className="grid grid-cols-2 gap-3">
                 <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 cursor-pointer transition-colors bg-white">
                    <FileText className="w-6 h-6 text-green-500 mb-2" />
                    <span className="text-xs font-bold">السجل التجاري</span>
                    <span className="text-[10px] text-green-600 mt-1">تم التحقق</span>
                 </div>
                 <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 cursor-pointer transition-colors bg-white">
                    <FileText className="w-6 h-6 text-green-500 mb-2" />
                    <span className="text-xs font-bold">شهادة الضريبة</span>
                    <span className="text-[10px] text-green-600 mt-1">تم التحقق</span>
                 </div>
               </div>
            </div>
          </Card>

          <Button className="w-full h-12 font-bold text-lg shadow-lg shadow-primary/20">
            حفظ التغييرات
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
