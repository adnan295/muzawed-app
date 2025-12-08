import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CreditCard, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Cards() {
  const [, setLocation] = useLocation();

  const cards = [
    { id: 1, type: 'Visa', last4: '4242', expiry: '12/25', holder: 'MOHAMMED AHMED', color: 'bg-slate-800 text-white' },
    { id: 2, type: 'Mastercard', last4: '8899', expiry: '09/26', holder: 'MOHAMMED AHMED', color: 'bg-indigo-600 text-white' },
  ];

  return (
    <MobileLayout hideHeader>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="bg-primary/10 p-2 rounded-lg text-primary">
               <CreditCard className="w-5 h-5" />
             </div>
             <div>
               <h1 className="text-lg font-bold">البطاقات المحفوظة</h1>
               <p className="text-xs text-muted-foreground">إدارة طرق الدفع الخاصة بك</p>
             </div>
          </div>
          <Button size="sm" variant="outline" className="h-9 text-xs font-bold border-dashed border-gray-300">
            <Plus className="w-3 h-3 ml-1" />
            إضافة بطاقة
          </Button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-blue-50 p-3 rounded-xl border border-blue-100">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>بياناتك المالية مشفرة ومحمية بأعلى معايير الأمان.</span>
          </div>

          {cards.map((card) => (
            <div key={card.id} className={`rounded-2xl p-6 shadow-lg relative overflow-hidden ${card.color}`}>
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              
              <div className="relative z-10 flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <span className="font-bold tracking-wider">{card.type}</span>
                  <CreditCard className="w-8 h-8 opacity-80" />
                </div>
                
                <div className="space-y-4">
                  <div className="font-mono text-xl tracking-[0.2em] opacity-90">
                    •••• •••• •••• {card.last4}
                  </div>
                  <div className="flex justify-between items-end text-xs opacity-80">
                    <div>
                      <span className="block mb-1 text-[10px] uppercase">حامل البطاقة</span>
                      <span className="font-bold">{card.holder}</span>
                    </div>
                    <div>
                      <span className="block mb-1 text-[10px] uppercase">تاريخ الانتهاء</span>
                      <span className="font-bold">{card.expiry}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-4 left-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full w-8 h-8"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <Button className="w-full h-14 border-2 border-dashed border-gray-200 bg-transparent text-gray-500 hover:bg-gray-50 hover:text-primary hover:border-primary/30 rounded-2xl flex flex-col items-center justify-center gap-1 mt-4">
            <Plus className="w-6 h-6" />
            <span className="text-xs font-bold">إضافة بطاقة جديدة</span>
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
