import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'خطأ في تسجيل الدخول',
          description: data.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      localStorage.setItem('adminAuth', JSON.stringify({ 
        staffId: data.staff.id,
        email: data.staff.email,
        name: data.staff.name,
        role: data.staff.role,
        permissions: data.staff.permissions,
        loggedIn: true, 
        timestamp: Date.now() 
      }));
      
      toast({
        title: 'تم تسجيل الدخول بنجاح',
        description: `مرحباً ${data.staff.name}`,
      });
      setLocation('/admin');
    } catch (error) {
      toast({
        title: 'خطأ في الاتصال',
        description: 'تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md p-8 border-none shadow-2xl bg-white/95 backdrop-blur-sm rounded-3xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">لوحة الإدارة</h1>
          <p className="text-gray-500 mt-2">قم بتسجيل الدخول للوصول إلى لوحة التحكم</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <Label htmlFor="email" className="text-gray-700 font-medium">البريد الإلكتروني</Label>
            <div className="relative mt-2">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pr-11 rounded-xl h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                placeholder="أدخل بريدك الإلكتروني"
                required
                data-testid="input-admin-email"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password" className="text-gray-700 font-medium">كلمة المرور</Label>
            <div className="relative mt-2">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-11 pl-11 rounded-xl h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                placeholder="••••••••"
                required
                data-testid="input-admin-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-lg shadow-lg"
            disabled={isLoading}
            data-testid="button-admin-login"
          >
            {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            للدخول يجب أن يكون لديك حساب موظف مفعّل
          </p>
        </div>
      </Card>
    </div>
  );
}
