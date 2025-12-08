import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Plus, Trash2, Edit2, Check } from 'lucide-react';

export default function Addresses() {
  const addresses = [
    {
      id: 1,
      title: 'الفرع الرئيسي - الملقا',
      details: 'الرياض، حي الملقا، شارع أنس بن مالك',
      type: 'محل تجاري',
      isDefault: true,
    },
    {
      id: 2,
      title: 'مستودع السلي',
      details: 'الرياض، حي السلي، مخرج 16',
      type: 'مستودع',
      isDefault: false,
    },
  ];

  return (
    <MobileLayout hideHeader>
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between">
          <h1 className="text-xl font-bold">عناويني</h1>
          <Button size="sm" variant="ghost" className="text-primary hover:text-primary/80 p-0 h-auto font-bold">
            <Plus className="w-4 h-4 ml-1" />
            إضافة جديد
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {addresses.map((address) => (
            <Card key={address.id} className={`p-4 border-none shadow-sm ${address.isDefault ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className={`w-5 h-5 ${address.isDefault ? 'text-primary' : 'text-muted-foreground'}`} />
                  <h3 className="font-bold">{address.title}</h3>
                </div>
                {address.isDefault && (
                  <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
                    الافتراضي
                  </span>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mr-7 mb-4 leading-relaxed">
                {address.details}
                <br />
                <span className="text-xs opacity-70">نوع الموقع: {address.type}</span>
              </p>

              <div className="flex gap-2 mr-7">
                <Button variant="outline" size="sm" className="h-8 text-xs flex-1">
                  <Edit2 className="w-3 h-3 ml-1" />
                  تعديل
                </Button>
                {!address.isDefault && (
                  <Button variant="outline" size="sm" className="h-8 text-xs flex-1 text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/5">
                    <Trash2 className="w-3 h-3 ml-1" />
                    حذف
                  </Button>
                )}
                {!address.isDefault && (
                   <Button variant="ghost" size="sm" className="h-8 text-xs flex-1 text-primary hover:text-primary hover:bg-primary/5">
                    <Check className="w-3 h-3 ml-1" />
                    تعيين كافتراضي
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
