import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, ChevronLeft } from 'lucide-react';
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

function useCountdown(endDate: string) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('انتهى');
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  return timeLeft;
}

function FlashSaleCard({ sale }: { sale: Promotion }) {
  const [, setLocation] = useLocation();
  const countdown = useCountdown(sale.endDate);

  const discountLabel =
    sale.discountValue && sale.discountType
      ? sale.discountType === 'percentage'
        ? `${parseFloat(sale.discountValue)}% خصم`
        : `${parseFloat(sale.discountValue).toLocaleString('ar-SY')} ل.س خصم`
      : null;

  const gradients = [
    'from-orange-500 to-red-600',
    'from-purple-600 to-pink-600',
    'from-blue-600 to-cyan-500',
    'from-green-500 to-emerald-600',
  ];
  const gradient = gradients[sale.id % gradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`relative bg-gradient-to-l ${gradient} rounded-2xl p-4 text-white overflow-hidden cursor-pointer flex-shrink-0 w-72`}
      data-testid={`flash-sale-card-${sale.id}`}
      onClick={() => setLocation('/flash-sales')}
    >
      <div className="absolute -top-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />
      <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
          <span className="text-xs font-bold text-yellow-200 uppercase tracking-wider">عرض سريع</span>
          {discountLabel && (
            <Badge className="bg-white/20 text-white border-0 text-xs font-bold px-2 py-0.5 rounded-full">
              {discountLabel}
            </Badge>
          )}
        </div>

        <h3 className="font-black text-base leading-tight mb-1">{sale.name}</h3>
        {sale.description && (
          <p className="text-white/80 text-xs mb-3 line-clamp-1">{sale.description}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-black/20 rounded-xl px-3 py-1.5">
            <Clock className="w-3.5 h-3.5 text-yellow-300" />
            <span className="font-mono font-bold text-sm text-yellow-100">{countdown}</span>
          </div>
          <div className="flex items-center gap-1 text-white/70 text-xs">
            <span>اكتشف</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function FlashSaleBanner() {
  const { data: sales = [] } = useQuery<Promotion[]>({
    queryKey: ['flash-sales-active'],
    queryFn: async () => {
      const res = await fetch('/api/flash-sales/active');
      return res.json();
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });

  if (sales.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="px-4 mb-2"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5 bg-orange-100 px-3 py-1.5 rounded-full">
            <Zap className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            <span className="text-xs font-black text-orange-600">عروض سريعة</span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-orange-200 to-transparent" />
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          {sales.map((sale) => (
            <div key={sale.id} className="snap-start">
              <FlashSaleCard sale={sale} />
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
