import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowUpRight, ArrowDownLeft, Wallet as WalletIcon, History, Clock, CheckCircle, XCircle, QrCode, Info } from 'lucide-react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletAPI } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useState } from 'react';
import { toast } from 'sonner';

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

interface DepositRequest {
  id: number;
  userId: number;
  amount: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export default function Wallet() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositNotes, setDepositNotes] = useState('');

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

  const { data: depositRequests = [] } = useQuery<DepositRequest[]>({
    queryKey: ['deposit-requests', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/wallet/deposit-requests/${user!.id}`);
      return res.json();
    },
    enabled: !!user?.id,
  });

  const createDepositMutation = useMutation({
    mutationFn: async (data: { userId: number; amount: string; notes?: string }) => {
      const res = await fetch('/api/wallet/deposit-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('فشل في إرسال الطلب');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deposit-requests', user?.id] });
      toast.success('تم إرسال طلب الشحن بنجاح');
      setDepositOpen(false);
      setDepositAmount('');
      setDepositNotes('');
    },
    onError: () => {
      toast.error('حدث خطأ أثناء إرسال الطلب');
    },
  });

  const handleSubmitDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error('الرجاء إدخال مبلغ صالح');
      return;
    }
    createDepositMutation.mutate({
      userId: user!.id,
      amount: depositAmount,
      notes: depositNotes || undefined,
    });
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd MMMM yyyy', { locale: ar });
    } catch {
      return dateStr;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد المراجعة';
      case 'approved': return 'تمت الموافقة';
      case 'rejected': return 'مرفوض';
      default: return status;
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

  const pendingRequests = depositRequests.filter(r => r.status === 'pending');

  return (
    <MobileLayout hideHeader>
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-primary p-6 pb-12 rounded-b-[2rem] text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
             <h1 className="text-xl font-bold mb-6 text-center">المحفظة</h1>
             
             <div className="text-center mb-4">
               <p className="text-blue-200 text-sm mb-1">الرصيد الحالي</p>
               <h2 className="text-4xl font-bold tracking-tight" data-testid="text-balance">
                 {wallet?.balance || '0.00'} <span className="text-lg font-normal">ل.س</span>
               </h2>
               <p className="text-xs text-blue-200 mt-2 flex items-center justify-center gap-1">
                 <Info className="w-3 h-3" />
                 احصل على خصم 1% عند الدفع بالمحفظة
               </p>
             </div>

             <div className="flex justify-center gap-3 mt-6">
               <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
                 <DialogTrigger asChild>
                   <Button className="bg-white text-primary hover:bg-white/90 font-bold w-32 rounded-xl shadow-lg shadow-black/10 border-0" data-testid="button-deposit">
                     <ArrowDownLeft className="w-4 h-4 ml-2" />
                     شحن
                   </Button>
                 </DialogTrigger>
                 <DialogContent className="max-w-sm mx-auto" dir="rtl">
                   <DialogHeader>
                     <DialogTitle className="text-center text-lg">شحن المحفظة عبر بشام كاش</DialogTitle>
                   </DialogHeader>
                   <div className="space-y-4 py-4">
                     <div className="flex flex-col items-center gap-3 p-4 bg-gray-50 rounded-xl">
                       <QrCode className="w-32 h-32 text-primary" />
                       <p className="text-sm text-center text-gray-600">امسح رمز QR أو أرسل المبلغ إلى حساب المتجر</p>
                       <div className="bg-white p-3 rounded-lg border text-center w-full">
                         <p className="text-xs text-gray-500">رقم حساب بشام كاش</p>
                         <p className="font-bold text-lg text-primary" dir="ltr">0933-123-456</p>
                       </div>
                     </div>

                     <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                       <p className="text-xs text-yellow-800 text-center">
                         بعد إرسال المبلغ عبر بشام كاش، أدخل المبلغ أدناه وسنقوم بمراجعة الطلب وإضافة الرصيد خلال ساعات قليلة
                       </p>
                     </div>

                     <div>
                       <label className="text-sm font-medium mb-1 block">المبلغ (ل.س)</label>
                       <Input
                         type="number"
                         placeholder="أدخل المبلغ المُرسل"
                         value={depositAmount}
                         onChange={(e) => setDepositAmount(e.target.value)}
                         className="text-lg"
                         data-testid="input-deposit-amount"
                       />
                     </div>

                     <div>
                       <label className="text-sm font-medium mb-1 block">ملاحظات (اختياري)</label>
                       <Input
                         placeholder="رقم العملية أو أي ملاحظة"
                         value={depositNotes}
                         onChange={(e) => setDepositNotes(e.target.value)}
                         data-testid="input-deposit-notes"
                       />
                     </div>

                     <Button
                       className="w-full rounded-xl"
                       onClick={handleSubmitDeposit}
                       disabled={createDepositMutation.isPending}
                       data-testid="button-submit-deposit"
                     >
                       {createDepositMutation.isPending ? 'جارٍ الإرسال...' : 'إرسال طلب الشحن'}
                     </Button>
                   </div>
                 </DialogContent>
               </Dialog>
             </div>
          </div>
        </div>

        <div className="px-4 -mt-6 relative z-20 space-y-4">
          {pendingRequests.length > 0 && (
            <Card className="p-4 border-none shadow-md bg-yellow-50 rounded-2xl border-yellow-200">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-yellow-600" />
                <h3 className="font-bold text-sm text-yellow-800">طلبات شحن قيد المراجعة</h3>
              </div>
              <div className="space-y-2">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between bg-white p-3 rounded-lg" data-testid={`pending-request-${req.id}`}>
                    <div>
                      <p className="font-bold text-sm">{req.amount} ل.س</p>
                      <p className="text-xs text-gray-500">{formatDate(req.createdAt)}</p>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">قيد المراجعة</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-4 border-none shadow-md bg-white rounded-2xl">
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold flex items-center gap-2">
                 <History className="w-4 h-4 text-primary" />
                 آخر العمليات
               </h3>
             </div>
             
             {transactions.length === 0 ? (
               <p className="text-center text-gray-500 py-4">لا توجد عمليات سابقة</p>
             ) : (
               <div className="space-y-4">
                 {transactions.slice(0, 5).map((tx) => (
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
                        {tx.type === 'payment' ? '-' : '+'}{tx.amount} ل.س
                      </span>
                   </div>
                 ))}
               </div>
             )}
          </Card>

          {depositRequests.length > 0 && (
            <Card className="p-4 border-none shadow-sm bg-white rounded-2xl">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                <History className="w-4 h-4 text-gray-500" />
                سجل طلبات الشحن
              </h3>
              <div className="space-y-3">
                {depositRequests.slice(0, 10).map((req) => (
                  <div key={req.id} className="flex items-center justify-between py-2 border-b last:border-0" data-testid={`deposit-request-${req.id}`}>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(req.status)}
                      <div>
                        <p className="font-medium text-sm">{req.amount} ل.س</p>
                        <p className="text-xs text-gray-500">{formatDate(req.createdAt)}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      req.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {getStatusText(req.status)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
