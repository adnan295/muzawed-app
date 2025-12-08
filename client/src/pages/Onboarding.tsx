import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, CheckCircle2, Truck, Wallet } from 'lucide-react';

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'أفضل أسعار الجملة',
      description: 'نوفر لك كافة احتياجاتك من المواد الغذائية والاستهلاكية بأفضل أسعار الجملة في السوق.',
      icon: Wallet,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'توصيل سريع ومجاني',
      description: 'اطلب اليوم واستلم طلبك غداً. توصيل مجاني للطلبات التي تتجاوز 500 ريال.',
      icon: Truck,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'ضمان الجودة',
      description: 'جميع منتجاتنا أصلية ومضمونة 100%. نضمن لك تجربة شراء آمنة وموثوقة.',
      icon: CheckCircle2,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      setLocation('/login');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between p-6 pb-12 font-sans relative overflow-hidden" dir="rtl">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl -z-10"></div>

      <div className="w-full flex justify-end pt-4">
        <Button variant="ghost" className="text-muted-foreground" onClick={() => setLocation('/login')}>تخطي</Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xs mx-auto w-full">
        <div className={`w-32 h-32 rounded-3xl flex items-center justify-center mb-8 shadow-xl transition-colors duration-500 ${steps[step].color}`}>
          {(() => {
            const Icon = steps[step].icon;
            return <Icon className="w-16 h-16" />;
          })()}
        </div>
        
        <h1 className="text-2xl font-bold mb-3 text-foreground transition-all duration-300">{steps[step].title}</h1>
        <p className="text-muted-foreground leading-relaxed transition-all duration-300 min-h-[80px]">
          {steps[step].description}
        </p>

        <div className="flex gap-2 mt-8">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary' : 'w-2 bg-gray-200'}`}
            />
          ))}
        </div>
      </div>

      <div className="w-full max-w-xs space-y-4">
        <Button className="w-full h-12 text-lg font-bold rounded-xl shadow-lg shadow-primary/20" onClick={handleNext}>
          {step === steps.length - 1 ? 'ابدأ الآن' : 'التالي'}
          {step !== steps.length - 1 && <ArrowLeft className="w-5 h-5 mr-2" />}
        </Button>
      </div>
    </div>
  );
}
