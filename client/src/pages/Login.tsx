import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Smartphone, ArrowLeft, Lock, Eye, EyeOff, MessageCircle, RefreshCw } from 'lucide-react';
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
  const [step, setStep] = useState<'phone' | 'otp' | 'password'>('phone');
  const [userExists, setUserExists] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

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
      
      const response: any = await authAPI.checkPhone(fullPhone);
      
      if (response.exists) {
        setUserExists(true);
        setStep('password');
      } else {
        setUserExists(false);
        await sendOTP();
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

  const sendOTP = async () => {
    setOtpSending(true);
    try {
      const fullPhone = `+963${phone}`;
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'فشل في إرسال رمز التحقق');
      }
      
      toast({
        title: "تم الإرسال",
        description: "تم إرسال رمز التحقق عبر واتساب",
      });
      setStep('otp');
      setResendTimer(60);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل في إرسال رمز التحقق",
        variant: "destructive",
      });
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpCode || otpCode.length !== 6) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رمز التحقق المكون من 6 أرقام",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const fullPhone = `+963${phone}`;
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, code: otpCode }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'رمز التحقق غير صحيح');
      }
      
      toast({
        title: "تم التحقق",
        description: "تم التحقق من رقم هاتفك بنجاح",
      });
      
      // Pass the verification token to the registration page
      setLocation(`/register?phone=${encodeURIComponent(fullPhone)}&token=${encodeURIComponent(data.verificationToken)}`);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "رمز التحقق غير صحيح",
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
      // Check if account is locked
      if (error.message?.includes('قفل الحساب') || error.message?.includes('locked')) {
        toast({
          title: "تم قفل الحساب",
          description: "بسبب محاولات تسجيل دخول فاشلة متعددة. يرجى استخدام 'نسيت كلمة المرور' لإعادة تعيين كلمة المرور",
          variant: "destructive",
        });
        // Show forgot password option
        setStep('password');
      } else {
        toast({
          title: "خطأ",
          description: error.message || "كلمة السر غير صحيحة",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-purple-600 rounded-3xl mx-auto flex items-center justify-center text-white text-5xl font-bold mb-6 shadow-2xl shadow-primary/30">
            م
          </div>
          <h1 className="text-3xl font-bold text-foreground">مزود</h1>
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
          ) : step === 'otp' ? (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold">التحقق من الرقم</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  أرسلنا رمز تحقق مكون من 6 أرقام إلى واتساب
                </p>
                <p className="text-sm font-bold text-primary mt-1" dir="ltr">+963{phone}</p>
                <button 
                  type="button"
                  onClick={() => { setStep('phone'); setOtpCode(''); }}
                  className="text-primary text-sm mt-2 hover:underline"
                >
                  تغيير الرقم
                </button>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-base font-medium">رمز التحقق</Label>
                  <Input 
                    data-testid="input-otp"
                    className="text-center bg-gray-50/50 font-sans h-14 text-2xl tracking-[0.5em] rounded-xl border-gray-200 focus:border-primary" 
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    required
                    dir="ltr"
                  />
                </div>

                <Button 
                  data-testid="button-verify-otp"
                  className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity"
                  disabled={loading || otpCode.length !== 6}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      جاري التحقق...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      تأكيد
                      <ArrowLeft className="w-5 h-5" />
                    </span>
                  )}
                </Button>

                <div className="text-center">
                  {resendTimer > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      يمكنك إعادة الإرسال بعد {resendTimer} ثانية
                    </p>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={sendOTP}
                      disabled={otpSending}
                      className="text-primary hover:text-primary/80"
                      data-testid="button-resend-otp"
                    >
                      {otpSending ? (
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          جاري الإرسال...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4" />
                          إعادة إرسال الرمز
                        </span>
                      )}
                    </Button>
                  )}
                </div>
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
