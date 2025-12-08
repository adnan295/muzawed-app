import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { Eye, EyeOff, Building2, Smartphone } from 'lucide-react';

export default function Login() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
           <div className="w-20 h-20 bg-primary rounded-3xl mx-auto flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-xl shadow-primary/20">
             س
           </div>
           <h1 className="text-2xl font-bold text-foreground">مرحباً بك في ساري</h1>
           <p className="text-muted-foreground mt-2">منصة الجملة الأولى في المملكة</p>
        </div>

        <Card className="p-6 border-none shadow-lg bg-white rounded-3xl">
          <form onSubmit={handleLogin} className="space-y-5">
            
            {isRegister && (
               <div className="space-y-2">
                 <Label>اسم المنشأة</Label>
                 <div className="relative">
                   <Building2 className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
                   <Input className="pr-10 bg-gray-50" placeholder="مثال: بقالة السعادة" />
                 </div>
               </div>
            )}

            <div className="space-y-2">
              <Label>رقم الجوال</Label>
              <div className="relative" dir="ltr">
                <span className="absolute left-3 top-3 text-sm font-bold text-muted-foreground border-r border-gray-200 pr-2">+966</span>
                <Input className="pl-16 text-left bg-gray-50 font-sans" placeholder="5XXXXXXXX" />
                <Smartphone className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>كلمة المرور</Label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  className="bg-gray-50 pr-10" 
                  placeholder="••••••••" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {!isRegister && (
                <div className="text-left">
                  <Button variant="link" className="text-xs text-primary p-0 h-auto">نسيت كلمة المرور؟</Button>
                </div>
              )}
            </div>

            <Button className="w-full h-12 text-lg font-bold rounded-xl shadow-lg shadow-primary/20">
              {isRegister ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isRegister ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟'}
              <Button 
                variant="link" 
                className="text-primary font-bold mr-1 p-0 h-auto"
                onClick={() => setIsRegister(!isRegister)}
              >
                {isRegister ? 'سجل دخولك' : 'سجل معنا الآن'}
              </Button>
            </p>
          </div>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-8">
          تطبق الشروط والأحكام وسياسة الخصوصية
        </p>
      </div>
    </div>
  );
}
