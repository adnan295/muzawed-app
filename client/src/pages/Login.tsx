import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { Eye, EyeOff, Building2, Smartphone } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { authAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    facilityName: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        // Register
        const response: any = await authAPI.register({
          phone: `+966${formData.phone}`,
          password: formData.password,
          facilityName: formData.facilityName,
        });
        login(response.user);
        toast({
          title: "تم إنشاء الحساب بنجاح",
          description: "مرحباً بك في ساري",
        });
      } else {
        // Login
        const response: any = await authAPI.login(
          `+966${formData.phone}`,
          formData.password
        );
        login(response.user);
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك مجدداً",
        });
      }
      setLocation('/');
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
                   <Input 
                     data-testid="input-facility-name"
                     className="pr-10 bg-gray-50" 
                     placeholder="مثال: بقالة السعادة" 
                     value={formData.facilityName}
                     onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })}
                     required={isRegister}
                   />
                 </div>
               </div>
            )}

            <div className="space-y-2">
              <Label>رقم الجوال</Label>
              <div className="relative" dir="ltr">
                <span className="absolute left-3 top-3 text-sm font-bold text-muted-foreground border-r border-gray-200 pr-2">+966</span>
                <Input 
                  data-testid="input-phone"
                  className="pl-16 text-left bg-gray-50 font-sans" 
                  placeholder="5XXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
                <Smartphone className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>كلمة المرور</Label>
              <div className="relative">
                <Input 
                  data-testid="input-password"
                  type={showPassword ? "text" : "password"} 
                  className="bg-gray-50 pr-10" 
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
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

            <Button 
              data-testid="button-submit"
              className="w-full h-12 text-lg font-bold rounded-xl shadow-lg shadow-primary/20"
              disabled={loading}
            >
              {loading ? 'جاري التحميل...' : isRegister ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
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
