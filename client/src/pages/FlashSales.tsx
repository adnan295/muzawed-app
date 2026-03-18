import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Zap, Clock, ArrowRight, Tag, ChevronLeft } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';

interface Promotion {
  id: number;
  name: string;
  description: string | null;
  type: string;
  discountType: string | null;
  discountValue: string | null;
  targetType: string | null;
  targetIds: string[] | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  priority: number;
}

function Countdown({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ h: 0, m: 0, s: 0 });
        return;
      }
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-1">
      {[timeLeft.h, timeLeft.m, timeLeft.s].map((val, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className="bg-black/80 text-yellow-300 font-mono font-black text-lg w-10 h-10 rounded-xl flex items-center justify-center">
            {pad(val)}
          </div>
          {i < 2 && <span className="text-gray-400 font-bold text-lg">:</span>}
        </div>
      ))}
    </div>
  );
}

export default function FlashSales() {
  const [, setLocation] = useLocation();

  const { data: sales = [], isLoading } = useQuery<Promotion[]>({
    queryKey: ['flash-sales-active'],
    queryFn: async () => {
      const res = await fetch('/api/flash-sales/active');
      return res.json();
    },
    refetchInterval: 30000,
  });

  const gradients = [
    ['from-orange-500 to-red-600', 'bg-orange-50 border-orange-100'],
    ['from-purple-600 to-pink-600', 'bg-purple-50 border-purple-100'],
    ['from-blue-600 to-cyan-500', 'bg-blue-50 border-blue-100'],
    ['from-green-500 to-emerald-600', 'bg-green-50 border-green-100'],
  ];

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="gradient-primary text-white px-5 pt-6 pb-10 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-yellow-300/10 rounded-full blur-2xl" />
          <button
            onClick={() => setLocation('/')}
            className="relative z-10 flex items-center gap-2 text-white/80 text-sm mb-4 hover:text-white"
            data-testid="button-back"
          >
            <ArrowRight className="w-4 h-4" />
            رجوع
          </button>
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-yellow-400/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-yellow-300 fill-yellow-300" />
            </div>
            <div>
              <h1 className="text-2xl font-black">العروض السريعة</h1>
              <p className="text-purple-200 text-sm">خصومات لوقت محدود</p>
            </div>
          </div>
        </div>

        <div className="px-4 -mt-6 space-y-4 pb-8">
          {isLoading && (
            <div className="space-y-4 mt-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && sales.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-10 text-center mt-4 shadow-sm"
            >
              <Zap className="w-14 h-14 mx-auto mb-4 text-gray-200" />
              <h3 className="font-bold text-gray-600 text-lg mb-1">لا توجد عروض حالياً</h3>
              <p className="text-gray-400 text-sm">تابع التطبيق لتصلك إشعارات العروض السريعة</p>
            </motion.div>
          )}

          {sales.map((sale, idx) => {
            const [headerGradient, cardBg] = gradients[idx % gradients.length];
            const discountLabel =
              sale.discountValue && sale.discountType
                ? sale.discountType === 'percentage'
                  ? `${parseFloat(sale.discountValue)}% خصم`
                  : `${parseFloat(sale.discountValue).toLocaleString('ar-SY')} ل.س خصم`
                : null;

            return (
              <motion.div
                key={sale.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`rounded-2xl border overflow-hidden shadow-sm ${cardBg}`}
                data-testid={`flash-sale-${sale.id}`}
              >
                <div className={`bg-gradient-to-l ${headerGradient} px-5 py-4 text-white relative overflow-hidden`}>
                  <div className="absolute -top-4 -left-4 w-16 h-16 bg-white/10 rounded-full" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                        <span className="text-xs font-bold text-yellow-200 uppercase tracking-wider">عرض سريع</span>
                      </div>
                      <h3 className="font-black text-xl">{sale.name}</h3>
                    </div>
                    {discountLabel && (
                      <Badge className="bg-white/20 text-white border-0 font-black text-base px-4 py-1.5 rounded-2xl">
                        {discountLabel}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  {sale.description && (
                    <p className="text-gray-600 text-sm mb-4">{sale.description}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span>ينتهي خلال</span>
                      </div>
                      <Countdown endDate={sale.endDate} />
                    </div>

                    <div className="text-left">
                      {sale.targetType && (
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                          <Tag className="w-3.5 h-3.5" />
                          <span>
                            {sale.targetType === 'all'
                              ? 'جميع المنتجات'
                              : sale.targetType === 'category'
                              ? 'قسم معين'
                              : 'منتجات محددة'}
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-gray-400">
                        حتى {new Date(sale.endDate).toLocaleDateString('ar-SY', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setLocation('/categories')}
                    className={`mt-4 w-full py-3 rounded-xl font-bold text-white bg-gradient-to-l ${headerGradient} text-sm flex items-center justify-center gap-2`}
                    data-testid={`button-shop-now-${sale.id}`}
                  >
                    تسوق الآن
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </MobileLayout>
  );
}
