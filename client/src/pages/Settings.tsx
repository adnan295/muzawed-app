import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Globe, Bell, Moon, Lock, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function Settings() {
  return (
    <MobileLayout hideHeader>
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
          <h1 className="text-xl font-bold">الإعدادات</h1>
        </div>

        <div className="p-4 space-y-6">
          {/* General */}
          <div className="space-y-3">
             <h3 className="font-bold text-sm text-muted-foreground px-1">عام</h3>
             <Card className="border-none shadow-sm overflow-hidden">
                <div className="bg-white p-4 flex items-center justify-between border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-500" />
                    <span>اللغة</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary font-bold">العربية</Button>
                </div>
                <div className="bg-white p-4 flex items-center justify-between border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <Moon className="w-5 h-5 text-gray-500" />
                    <span>الوضع الليلي</span>
                  </div>
                  <Switch />
                </div>
             </Card>
          </div>

          {/* Notifications */}
          <div className="space-y-3">
             <h3 className="font-bold text-sm text-muted-foreground px-1">الإشعارات</h3>
             <Card className="border-none shadow-sm overflow-hidden">
                <div className="bg-white p-4 flex items-center justify-between border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-500" />
                    <span>إشعارات الطلبات</span>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="bg-white p-4 flex items-center justify-between border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-500" />
                    <span>العروض والخصومات</span>
                  </div>
                  <Switch defaultChecked />
                </div>
             </Card>
          </div>

          {/* Account */}
          <div className="space-y-3">
             <h3 className="font-bold text-sm text-muted-foreground px-1">الحساب والأمان</h3>
             <Card className="border-none shadow-sm overflow-hidden">
                <div className="bg-white p-4 flex items-center justify-between border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-gray-500" />
                    <span>تغيير كلمة المرور</span>
                  </div>
                </div>
                <div className="bg-white p-4 flex items-center justify-between border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer">
                   <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-gray-500" />
                    <span>عن التطبيق</span>
                  </div>
                </div>
             </Card>
          </div>

          <div className="pt-4 text-center">
             <Button variant="ghost" className="text-destructive hover:bg-destructive/5 hover:text-destructive w-full">
               حذف الحساب نهائياً
             </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
