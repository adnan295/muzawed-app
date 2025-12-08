import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, CheckCircle2, Truck, Wallet, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'أفضل أسعار الجملة',
      description: 'نوفر لك كافة احتياجاتك من المواد الغذائية والاستهلاكية بأفضل أسعار الجملة في السوق.',
      icon: Wallet,
      color: 'bg-blue-500 text-white',
      bg: 'bg-blue-50'
    },
    {
      title: 'توصيل سريع ومجاني',
      description: 'اطلب اليوم واستلم طلبك غداً. توصيل مجاني للطلبات التي تتجاوز 500 ريال.',
      icon: Truck,
      color: 'bg-green-500 text-white',
      bg: 'bg-green-50'
    },
    {
      title: 'ضمان الجودة',
      description: 'جميع منتجاتنا أصلية ومضمونة 100%. نضمن لك تجربة شراء آمنة وموثوقة.',
      icon: CheckCircle2,
      color: 'bg-purple-500 text-white',
      bg: 'bg-purple-50'
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
    <div className={`min-h-screen flex flex-col items-center justify-between p-6 pb-12 font-sans relative overflow-hidden transition-colors duration-500 ${steps[step].bg}`} dir="rtl">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/40 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/40 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl -z-10"></div>
      
      {/* Decorative Particles */}
      <motion.div 
        animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-10 text-primary/20"
      >
        <Sparkles className="w-8 h-8" />
      </motion.div>

      <div className="w-full flex justify-end pt-8 relative z-20">
        <Button variant="ghost" className="text-muted-foreground hover:bg-white/50" onClick={() => setLocation('/login')}>تخطي</Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xs mx-auto w-full relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <div className={`w-40 h-40 rounded-[2rem] rotate-3 flex items-center justify-center mb-10 shadow-2xl transition-colors duration-500 ${steps[step].color}`}>
              <div className="-rotate-3">
                 {(() => {
                    const Icon = steps[step].icon;
                    return <Icon className="w-20 h-20" />;
                  })()}
              </div>
            </div>
            
            <h1 className="text-3xl font-black mb-4 text-gray-900">{steps[step].title}</h1>
            <p className="text-gray-600 leading-relaxed min-h-[80px] text-base">
              {steps[step].description}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-2 mt-10">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-500 ${i === step ? 'w-8 bg-gray-900' : 'w-2 bg-gray-300'}`}
            />
          ))}
        </div>
      </div>

      <div className="w-full max-w-xs space-y-4 relative z-20">
        <Button 
          className="w-full h-14 text-lg font-bold rounded-2xl shadow-xl shadow-gray-900/10 hover:shadow-gray-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]" 
          onClick={handleNext}
        >
          {step === steps.length - 1 ? 'ابدأ الآن' : 'التالي'}
          {step !== steps.length - 1 && <ArrowLeft className="w-5 h-5 mr-2" />}
        </Button>
      </div>
    </div>
  );
}
