import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Store, Lock, MapPin, ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { authAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import LocationPicker from '@/components/ui/LocationPicker';

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Get phone and verification token from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const phoneFromUrl = urlParams.get('phone') || '';
  const verificationToken = urlParams.get('token') || '';
  const isValid = !!(phoneFromUrl && verificationToken);
  
  const [formData, setFormData] = useState({
    phone: phoneFromUrl,
    facilityName: '',
    password: '',
    confirmPassword: '',
    latitude: null as number | null,
    longitude: null as number | null,
    locationAddress: '',
  });

  // Redirect if phone not verified (no token)
  useEffect(() => {
    if (!isValid) {
      toast({
        title: "تنبيه",
        description: "يجب التحقق من رقم الهاتف أولاً",
        variant: "destructive",
      });
      setLocation('/login');
    }
  }, [isValid, setLocation, toast]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      locationAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.facilityName.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم المنشأة",
        variant: "destructive",
      });
      return;
    }

    if (!formData.password || formData.password.length < 8) {
      toast({
        title: "خطأ",
        description: "كلمة السر يجب أن تكون 8 أحرف على الأقل",
        variant: "destructive",
      });
      return;
    }

    if (!/[A-Za-z]/.test(formData.password)) {
      toast({
        title: "خطأ",
        description: "كلمة السر يجب أن تحتوي على حرف واحد على الأقل",
        variant: "destructive",
      });
      return;
    }

    if (!/[0-9]/.test(formData.password)) {
      toast({
        title: "خطأ",
        description: "كلمة السر يجب أن تحتوي على رقم واحد على الأقل",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمة السر غير متطابقة",
        variant: "destructive",
      });
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      toast({
        title: "خطأ",
        description: "يرجى تحديد موقع المنشأة على الخريطة",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response: any = await authAPI.register({
        phone: formData.phone,
        facilityName: formData.facilityName,
        password: formData.password,
        latitude: formData.latitude,
        longitude: formData.longitude,
        verificationToken: verificationToken,
      });
      
      login(response.user);
      toast({
        title: "مرحباً بك في مزود",
        description: "تم إنشاء حسابك بنجاح",
      });
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

  // Don't render if not valid - redirect will happen via useEffect
  if (!isValid) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-3xl mx-auto flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-2xl shadow-primary/30">
            م
          </div>
          <h1 className="text-2xl font-bold text-foreground">إنشاء حساب جديد</h1>
          <p className="text-muted-foreground mt-1">أكمل معلومات منشأتك للتسجيل</p>
        </div>

        <Card className="p-6 border-none shadow-xl bg-white rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Phone Number (readonly) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">رقم الهاتف</Label>
              <div className="relative" dir="ltr">
                <Input 
                  className="text-left bg-gray-100 font-sans h-12 rounded-xl border-gray-200"
                  value={formData.phone}
                  disabled
                  data-testid="input-phone-display"
                />
                <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              </div>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                تم التحقق من رقم الهاتف
              </p>
            </div>

            {/* Facility Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">اسم المنشأة *</Label>
              <div className="relative">
                <Input 
                  data-testid="input-facility-name"
                  className="pr-12 bg-gray-50/50 h-12 rounded-xl border-gray-200 focus:border-primary" 
                  placeholder="مثال: سوبر ماركت الأمل"
                  value={formData.facilityName}
                  onChange={(e) => setFormData(prev => ({ ...prev, facilityName: e.target.value }))}
                  required
                />
                <Store className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">كلمة السر *</Label>
              <div className="relative">
                <Input 
                  data-testid="input-password"
                  type={showPassword ? "text" : "password"}
                  className="pr-12 pl-12 bg-gray-50/50 h-12 rounded-xl border-gray-200 focus:border-primary" 
                  placeholder="أدخل كلمة السر (8 أحرف، حرف + رقم)"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  minLength={8}
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

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">تأكيد كلمة السر *</Label>
              <div className="relative">
                <Input 
                  data-testid="input-confirm-password"
                  type={showPassword ? "text" : "password"}
                  className="pr-12 bg-gray-50/50 h-12 rounded-xl border-gray-200 focus:border-primary" 
                  placeholder="أعد إدخال كلمة السر"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            {/* Location Picker */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">موقع المنشأة *</Label>
              <LocationPicker
                initialLat={formData.latitude || undefined}
                initialLng={formData.longitude || undefined}
                onLocationSelect={handleLocationSelect}
                height="200px"
              />
            </div>

            <Button 
              data-testid="button-register"
              className="w-full h-12 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  جاري التسجيل...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  إنشاء الحساب
                  <ArrowLeft className="w-5 h-5" />
                </span>
              )}
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-6">
          بإنشاء حساب، أنت توافق على الشروط والأحكام وسياسة الخصوصية
        </p>
      </div>
    </div>
  );
}
