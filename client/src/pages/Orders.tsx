import { MobileLayout } from '@/components/layout/MobileLayout';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Package, CheckCircle2, XCircle, ShoppingBag } from 'lucide-react';
import { useLocation, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ordersAPI } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Order {
  id: number;
  userId: number;
  status: string;
  subtotal: string;
  tax: string;
  total: string;
  paymentMethod: string;
  createdAt: string;
}

export default function Orders() {
  const { user, isAuthenticated } = useAuth();

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['orders', user?.id],
    queryFn: () => ordersAPI.getAll(user!.id) as Promise<Order[]>,
    enabled: !!user?.id,
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'قيد الانتظار', icon: Clock, color: 'bg-yellow-100 text-yellow-600' };
      case 'processing':
        return { label: 'قيد التجهيز', icon: Clock, color: 'bg-blue-100 text-blue-600' };
      case 'shipped':
        return { label: 'قيد التوصيل', icon: Package, color: 'bg-purple-100 text-purple-600' };
      case 'delivered':
        return { label: 'تم التوصيل', icon: CheckCircle2, color: 'bg-green-100 text-green-600' };
      case 'cancelled':
        return { label: 'ملغي', icon: XCircle, color: 'bg-red-100 text-red-600' };
      default:
        return { label: status, icon: Clock, color: 'bg-gray-100 text-gray-600' };
    }
  };

  if (!isAuthenticated) {
    return (
      <MobileLayout hideHeader hideNav>
        <div className="flex flex-col items-center justify-center h-[80vh] p-4">
          <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-bold mb-2">سجل دخولك أولاً</h2>
          <p className="text-gray-500 text-center mb-6">يجب تسجيل الدخول لعرض طلباتك</p>
          <Link href="/login">
            <Button className="rounded-xl px-8">تسجيل الدخول</Button>
          </Link>
        </div>
      </MobileLayout>
    );
  }

  if (isLoading) {
    return (
      <MobileLayout hideHeader hideNav>
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="h-12 bg-gray-100 rounded animate-pulse mb-4" />
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse mb-3" />
          ))}
        </div>
      </MobileLayout>
    );
  }

  const activeOrders = orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status));
  const previousOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));

  return (
    <MobileLayout hideHeader hideNav>
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
          <h1 className="text-xl font-bold">طلباتي</h1>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] p-4">
            <Package className="w-16 h-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-bold mb-2">لا توجد طلبات</h2>
            <p className="text-gray-500 text-center mb-6">لم تقم بأي طلبات بعد</p>
            <Link href="/">
              <Button className="rounded-xl px-8">تسوق الآن</Button>
            </Link>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <div className="bg-white px-4 pb-2 border-b border-gray-100">
              <TabsList className="w-full bg-gray-100 p-1 h-10 rounded-lg grid grid-cols-3">
                <TabsTrigger value="all" className="text-xs font-bold rounded-md">الكل ({orders.length})</TabsTrigger>
                <TabsTrigger value="active" className="text-xs font-bold rounded-md">الحالية ({activeOrders.length})</TabsTrigger>
                <TabsTrigger value="previous" className="text-xs font-bold rounded-md">السابقة ({previousOrders.length})</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="p-4 space-y-3 mt-0">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} statusInfo={getStatusInfo(order.status)} />
              ))}
            </TabsContent>
            
            <TabsContent value="active" className="p-4 space-y-3 mt-0">
              {activeOrders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">لا توجد طلبات حالية</p>
              ) : (
                activeOrders.map((order) => (
                  <OrderCard key={order.id} order={order} statusInfo={getStatusInfo(order.status)} />
                ))
              )}
            </TabsContent>

            <TabsContent value="previous" className="p-4 space-y-3 mt-0">
              {previousOrders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">لا توجد طلبات سابقة</p>
              ) : (
                previousOrders.map((order) => (
                  <OrderCard key={order.id} order={order} statusInfo={getStatusInfo(order.status)} />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MobileLayout>
  );
}

function OrderCard({ order, statusInfo }: { order: Order; statusInfo: any }) {
  const [, setLocation] = useLocation();
  const Icon = statusInfo.icon;

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd MMMM yyyy', { locale: ar });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card 
      className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white overflow-hidden"
      onClick={() => setLocation(`/order/${order.id}`)}
      data-testid={`order-card-${order.id}`}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusInfo.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">طلب #{order.id}</h3>
              <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
            </div>
          </div>
          <Badge className={statusInfo.color}>
            {statusInfo.label}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center text-sm border-t border-gray-50 pt-3 mt-2">
          <span className="text-muted-foreground">الدفع: {order.paymentMethod === 'wallet' ? 'المحفظة' : order.paymentMethod === 'card' ? 'بطاقة' : 'نقدي'}</span>
          <span className="font-bold">{order.total} ل.س</span>
        </div>
      </div>
    </Card>
  );
}
