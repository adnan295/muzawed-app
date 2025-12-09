import { useState } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Globe, Bell, Moon, Lock, Info, Eye, EyeOff } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from 'next-themes';
import type { NotificationPreferences } from '@shared/schema';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const { data: notifPrefs } = useQuery<NotificationPreferences>({
    queryKey: ['notificationPreferences', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/notification-preferences/${user?.id}`);
      if (!res.ok) throw new Error('Failed to fetch preferences');
      return res.json();
    },
    enabled: !!user?.id,
  });

  const updatePrefsMutation = useMutation({
    mutationFn: async (data: Partial<NotificationPreferences>) => {
      const res = await fetch(`/api/notification-preferences/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update preferences');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationPreferences', user?.id] });
      toast({ title: 'تم الحفظ', description: 'تم تحديث إعدادات الإشعارات' });
    },
    onError: () => {
      toast({ title: 'خطأ', description: 'فشل في تحديث الإعدادات', variant: 'destructive' });
    },
  });

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال كلمة السر الحالية",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "خطأ",
        description: "كلمة السر الجديدة يجب أن تكون 6 أحرف على الأقل",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمة السر الجديدة غير متطابقة",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/users/${user?.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'حدث خطأ');
      }

      toast({
        title: "تم بنجاح",
        description: "تم تغيير كلمة السر بنجاح",
      });
      setIsPasswordDialogOpen(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تغيير كلمة السر",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
                <div className="bg-white dark:bg-gray-800 p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div className="flex items-center gap-3">
                    <Moon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <span>الوضع الليلي</span>
                  </div>
                  <Switch 
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => {
                      setTheme(checked ? 'dark' : 'light');
                      toast({
                        title: checked ? 'تم تفعيل الوضع الليلي' : 'تم تفعيل الوضع النهاري',
                        description: checked ? 'تم التبديل إلى الوضع الداكن' : 'تم التبديل إلى الوضع الفاتح',
                      });
                    }}
                    data-testid="switch-dark-mode"
                  />
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
                  <Switch 
                    checked={notifPrefs?.ordersEnabled ?? true}
                    onCheckedChange={(checked) => updatePrefsMutation.mutate({ ordersEnabled: checked })}
                    data-testid="switch-orders-notifications"
                  />
                </div>
                <div className="bg-white p-4 flex items-center justify-between border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-500" />
                    <span>العروض والخصومات</span>
                  </div>
                  <Switch 
                    checked={notifPrefs?.promotionsEnabled ?? true}
                    onCheckedChange={(checked) => updatePrefsMutation.mutate({ promotionsEnabled: checked })}
                    data-testid="switch-promotions-notifications"
                  />
                </div>
             </Card>
          </div>

          {/* Account */}
          <div className="space-y-3">
             <h3 className="font-bold text-sm text-muted-foreground px-1">الحساب والأمان</h3>
             <Card className="border-none shadow-sm overflow-hidden">
                <div 
                  className="bg-white p-4 flex items-center justify-between border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setIsPasswordDialogOpen(true)}
                  data-testid="button-change-password"
                >
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

      {/* Password Change Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">تغيير كلمة المرور</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>كلمة السر الحالية</Label>
              <div className="relative">
                <Input
                  type={showPasswords ? "text" : "password"}
                  placeholder="أدخل كلمة السر الحالية"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="pr-4 pl-10 h-12 rounded-xl"
                  data-testid="input-current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>كلمة السر الجديدة</Label>
              <Input
                type={showPasswords ? "text" : "password"}
                placeholder="أدخل كلمة السر الجديدة (6 أحرف على الأقل)"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="h-12 rounded-xl"
                data-testid="input-new-password"
              />
            </div>

            <div className="space-y-2">
              <Label>تأكيد كلمة السر الجديدة</Label>
              <Input
                type={showPasswords ? "text" : "password"}
                placeholder="أعد إدخال كلمة السر الجديدة"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="h-12 rounded-xl"
                data-testid="input-confirm-new-password"
              />
            </div>

            <Button
              className="w-full h-12 rounded-xl mt-4"
              onClick={handleChangePassword}
              disabled={loading}
              data-testid="button-save-password"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  جاري الحفظ...
                </span>
              ) : (
                'حفظ كلمة السر الجديدة'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}
