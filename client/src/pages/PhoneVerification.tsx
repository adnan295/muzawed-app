import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Smartphone, ArrowLeft, ShieldCheck, MessageCircle } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

type Step = 'phone' | 'otp';

export default function PhoneVerification() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const fullPhone = `+963${phone}`;

  const handleSendOtp = async () => {
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
      const checkResult: any = await authAPI.checkPhone(fullPhone);
      if (checkResult.exists) {
        toast({
          title: "الرقم مسجل مسبقاً",
          description: "هذا الرقم مسجل بالفعل. يرجى تسجيل الدخول بدلاً من ذلك",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      await authAPI.sendOtp(fullPhone);
      toast({
        title: "تم الإرسال",
        description: "تم إرسال رمز التحقق عبر واتساب",
      });
      setStep('otp');
      setCountdown(60);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل في إرسال رمز التحقق",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpCode];
    newOtp[index] = value.slice(-1);
    setOtpCode(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newOtp = [...otpCode];
      for (let i = 0; i < pasted.length; i++) {
        newOtp[i] = pasted[i];
      }
      setOtpCode(newOtp);
      const focusIdx = Math.min(pasted.length, 5);
      inputRefs.current[focusIdx]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otpCode.join('');
    if (code.length !== 6) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رمز التحقق المكون من 6 أرقام",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result: any = await authAPI.verifyOtp(fullPhone, code);
      if (result.success && result.verificationToken) {
        toast({
          title: "تم التحقق",
          description: "تم التحقق من رقم الهاتف بنجاح",
        });
        setLocation(`/register?phone=${encodeURIComponent(fullPhone)}&token=${encodeURIComponent(result.verificationToken)}`);
      }
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

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      await authAPI.sendOtp(fullPhone);
      toast({
        title: "تم الإرسال",
        description: "تم إعادة إرسال رمز التحقق عبر واتساب",
      });
      setCountdown(60);
      setOtpCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل في إعادة إرسال رمز التحقق",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-3xl mx-auto flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-2xl shadow-primary/30">
            م
          </div>
          <h1 className="text-2xl font-bold text-foreground">إنشاء حساب جديد</h1>
          <p className="text-muted-foreground mt-1">
            {step === 'phone' ? 'أدخل رقم هاتفك للتحقق عبر واتساب' : 'أدخل رمز التحقق المرسل إلى واتساب'}
          </p>
        </div>

        <Card className="p-6 border-none shadow-xl bg-white rounded-3xl">
          {step === 'phone' ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-base font-medium">رقم الهاتف</Label>
                <div className="relative" dir="ltr">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground border-r border-gray-200 pr-3">+963</span>
                  <Input
                    data-testid="input-phone-verify"
                    className="pl-16 text-left bg-gray-50/50 font-sans h-14 text-lg rounded-xl border-gray-200 focus:border-primary"
                    placeholder="9XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    maxLength={10}
                    autoFocus
                  />
                  <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-100">
                <MessageCircle className="w-5 h-5 text-green-600 shrink-0" />
                <p className="text-xs text-green-700">سيتم إرسال رمز التحقق إلى رقمك عبر واتساب</p>
              </div>

              <Button
                data-testid="button-send-otp"
                className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity"
                disabled={loading || phone.length < 9}
                onClick={handleSendOtp}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    جاري الإرسال...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    إرسال رمز التحقق
                    <ArrowLeft className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full mx-auto flex items-center justify-center mb-3">
                  <ShieldCheck className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-sm text-muted-foreground">
                  تم إرسال رمز التحقق إلى
                </p>
                <p className="font-bold text-lg mt-1 font-sans" dir="ltr">{fullPhone}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-center block">رمز التحقق</Label>
                <div className="flex gap-2 justify-center" dir="ltr" onPaste={handleOtpPaste}>
                  {otpCode.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      data-testid={`input-otp-${index}`}
                      className="w-12 h-14 text-center text-xl font-bold bg-gray-50/50 rounded-xl border-gray-200 focus:border-primary font-sans"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      inputMode="numeric"
                    />
                  ))}
                </div>
              </div>

              <Button
                data-testid="button-verify-otp"
                className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity"
                disabled={loading || otpCode.join('').length !== 6}
                onClick={handleVerifyOtp}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    جاري التحقق...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    تأكيد الرمز
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                )}
              </Button>

              <div className="text-center space-y-2">
                <button
                  data-testid="button-resend-otp"
                  className={`text-sm ${countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-primary hover:underline cursor-pointer'}`}
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || loading}
                >
                  {countdown > 0 ? `إعادة الإرسال بعد ${countdown} ثانية` : 'إعادة إرسال الرمز'}
                </button>
                <button
                  className="block mx-auto text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => { setStep('phone'); setOtpCode(['', '', '', '', '', '']); }}
                >
                  تغيير رقم الهاتف
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-sm text-muted-foreground mb-2">لديك حساب بالفعل؟</p>
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl border-primary/30 text-primary hover:bg-primary/5"
              onClick={() => setLocation('/login')}
              data-testid="button-go-login"
            >
              تسجيل الدخول
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
