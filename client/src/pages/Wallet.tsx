import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownLeft, Wallet as WalletIcon, CreditCard, History } from 'lucide-react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { walletAPI } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Wallet {
  id: number;
  userId: number;
  balance: string;
}

interface Transaction {
  id: number;
  walletId: number;
  type: string;
  amount: string;
  title: string;
  method: string;
  createdAt: string;
}

export default function Wallet() {
  const { user, isAuthenticated } = useAuth();

  const { data: wallet } = useQuery<Wallet>({
    queryKey: ['wallet', user?.id],
    queryFn: () => walletAPI.get(user!.id) as Promise<Wallet>,
    enabled: !!user?.id,
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ['wallet-transactions', user?.id],
    queryFn: () => walletAPI.getTransactions(user!.id) as Promise<Transaction[]>,
    enabled: !!user?.id,
  });

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd MMMM yyyy', { locale: ar });
    } catch {
      return dateStr;
    }
  };

  if (!isAuthenticated) {
    return (
      <MobileLayout hideHeader>
        <div className="flex flex-col items-center justify-center h-[80vh] p-4">
          <WalletIcon className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-bold mb-2">سجل دخولك أولاً</h2>
          <p className="text-gray-500 text-center mb-6">يجب تسجيل الدخول لعرض المحفظة</p>
          <Link href="/login">
            <Button className="rounded-xl px-8">تسجيل الدخول</Button>
          </Link>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout hideHeader>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="bg-primary p-6 pb-12 rounded-b-[2rem] text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
             <h1 className="text-xl font-bold mb-6 text-center">المحفظة</h1>
             
             <div className="text-center mb-4">
               <p className="text-blue-200 text-sm mb-1">الرصيد الحالي</p>
               <h2 className="text-4xl font-bold tracking-tight" data-testid="text-balance">
                 {wallet?.balance || '0.00'} <span className="text-lg font-normal">ر.س</span>
               </h2>
             </div>

             <div className="flex justify-center gap-3 mt-6">
               <Button className="bg-white text-primary hover:bg-white/90 font-bold w-32 rounded-xl shadow-lg shadow-black/10 border-0">
                 <ArrowDownLeft className="w-4 h-4 ml-2" />
                 شحن
               </Button>
               <Link href="/cards">
                 <Button variant="outline" className="bg-primary/50 text-white border-white/20 hover:bg-primary/70 font-bold w-32 rounded-xl backdrop-blur-sm">
                   <CreditCard className="w-4 h-4 ml-2" />
                   البطاقات
                 </Button>
               </Link>
             </div>
          </div>
        </div>

        <div className="px-4 -mt-6 relative z-20">
          <Card className="p-4 border-none shadow-md bg-white rounded-2xl mb-4">
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold flex items-center gap-2">
                 <History className="w-4 h-4 text-primary" />
                 آخر العمليات
               </h3>
               <Button variant="link" className="text-xs text-muted-foreground p-0 h-auto">عرض الكل</Button>
             </div>
             
             {transactions.length === 0 ? (
               <p className="text-center text-gray-500 py-4">لا توجد عمليات سابقة</p>
             ) : (
               <div className="space-y-4">
                 {transactions.map((tx) => (
                   <div key={tx.id} className="flex items-center justify-between" data-testid={`transaction-${tx.id}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'payment' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                          {tx.type === 'payment' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground">{tx.title}</p>
                          <p className="text-[10px] text-muted-foreground">{formatDate(tx.createdAt)} • {tx.method}</p>
                        </div>
                      </div>
                      <span className={`font-bold text-sm ${tx.type === 'payment' ? 'text-red-600' : 'text-green-600'}`}>
                        {tx.type === 'payment' ? '-' : '+'}{tx.amount} ر.س
                      </span>
                   </div>
                 ))}
               </div>
             )}
          </Card>

          <Card className="p-4 border-none shadow-sm bg-white rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-50 p-3 rounded-xl">
                 <WalletIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm">برنامج الولاء (قريباً)</h3>
                <p className="text-xs text-muted-foreground mt-1">اكسب نقاط مع كل طلب واستبدلها برصيد</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MobileLayout>
  );
}
