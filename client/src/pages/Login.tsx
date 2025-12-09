import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { Smartphone, ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { authAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'phone' | 'password'>('phone');
  const [userExists, setUserExists] = useState(false);

  const handleCheckPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || phone.length < 9) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رقم هاتف صحيح",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const fullPhone = `+963${phone}`;
      
      // Check if user exists
      const response: any = await authAPI.checkPhone(fullPhone);
      
      if (response.exists) {
        // User exists, show password field
        setUserExists(true);
        setStep('password');
      } else {
        // User doesn't exist, redirect to registration
        setLocation(`/register?phone=${encodeURIComponent(fullPhone)}`);
      }
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال كلمة السر",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const fullPhone = `+963${phone}`;
      const response: any = await authAPI.login(fullPhone, password);
      login(response.user);
      toast({
        title: "مرحباً بك",
        description: "تم تسجيل الدخول بنجاح",
      });
      setLocation('/');
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "كلمة السر غير صحيحة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-purple-600 rounded-3xl mx-auto flex items-center justify-center text-white text-5xl font-bold mb-6 shadow-2xl shadow-primary/30">
            س
          </div>
          <h1 className="text-3xl font-bold text-foreground">ساري</h1>
          <p className="text-muted-foreground mt-2 text-lg">منصة الجملة للسوق السوري</p>
        </div>

        <Card className="p-8 border-none shadow-xl bg-white rounded-3xl">
          {step === 'phone' ? (
            <>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold">تسجيل الدخول</h2>
                <p className="text-sm text-muted-foreground mt-1">أدخل رقم هاتفك للمتابعة</p>
              </div>

              <form onSubmit={handleCheckPhone} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-base font-medium">رقم الهاتف</Label>
                  <div className="relative" dir="ltr">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground border-r border-gray-200 pr-3">+963</span>
                    <Input 
                      data-testid="input-phone"
                      className="pl-16 text-left bg-gray-50/50 font-sans h-14 text-lg rounded-xl border-gray-200 focus:border-primary" 
                      placeholder="9XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      maxLength={10}
                      required
                    />
                    <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  </div>
                </div>

                <Button 
                  data-testid="button-submit"
                  className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity"
                  disabled={loading || phone.length < 9}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      جاري التحقق...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      متابعة
                      <ArrowLeft className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold">أدخل كلمة السر</h2>
                <p className="text-sm text-muted-foreground mt-1" dir="ltr">+963{phone}</p>
                <button 
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-primary text-sm mt-2 hover:underline"
                >
                  تغيير الرقم
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-base font-medium">كلمة السر</Label>
                  <div className="relative">
                    <Input 
                      data-testid="input-password"
                      type={showPassword ? "text" : "password"}
                      className="pr-12 pl-12 bg-gray-50/50 h-14 text-lg rounded-xl border-gray-200 focus:border-primary" 
                      placeholder="أدخل كلمة السر"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button 
                  data-testid="button-login"
                  className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity"
                  disabled={loading || !password}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      جاري الدخول...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      تسجيل الدخول
                      <ArrowLeft className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </form>
            </>
          )}
        </Card>

        <p className="text-center text-xs text-gray-400 mt-8">
          بالمتابعة، أنت توافق على الشروط والأحكام وسياسة الخصوصية
        </p>
      </div>
    </div>
  );
}
