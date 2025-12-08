import { MobileLayout } from '@/components/layout/MobileLayout';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Package, CheckCircle2, XCircle } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Orders() {
  const orders = [
    {
      id: '12345',
      date: 'اليوم',
      status: 'active',
      statusLabel: 'قيد التجهيز',
      total: '718.75',
      items: 8,
      icon: Clock,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: '12300',
      date: '05 ديسمبر',
      status: 'completed',
      statusLabel: 'تم التوصيل',
      total: '450.00',
      items: 12,
      icon: CheckCircle2,
      color: 'bg-green-100 text-green-600',
    },
    {
      id: '11250',
      date: '28 نوفمبر',
      status: 'cancelled',
      statusLabel: 'ملغي',
      total: '120.50',
      items: 3,
      icon: XCircle,
      color: 'bg-red-100 text-red-600',
    },
  ];

  return (
    <MobileLayout hideHeader>
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
          <h1 className="text-xl font-bold">طلباتي</h1>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <div className="bg-white px-4 pb-2 border-b border-gray-100">
            <TabsList className="w-full bg-gray-100 p-1 h-10 rounded-lg grid grid-cols-3">
              <TabsTrigger value="all" className="text-xs font-bold rounded-md">الكل</TabsTrigger>
              <TabsTrigger value="active" className="text-xs font-bold rounded-md">الحالية</TabsTrigger>
              <TabsTrigger value="previous" className="text-xs font-bold rounded-md">السابقة</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="p-4 space-y-3 mt-0">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </TabsContent>
          
          <TabsContent value="active" className="p-4 space-y-3 mt-0">
            {orders.filter(o => o.status === 'active').map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </TabsContent>

          <TabsContent value="previous" className="p-4 space-y-3 mt-0">
            {orders.filter(o => o.status !== 'active').map((order) => (
               <OrderCard key={order.id} order={order} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}

function OrderCard({ order }: { order: any }) {
  const [, setLocation] = useLocation();

  return (
    <Card 
      className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white overflow-hidden"
      onClick={() => setLocation(`/order/${order.id}`)}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.color}`}>
              <order.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">طلب #{order.id}</h3>
              <p className="text-xs text-muted-foreground">{order.date}</p>
            </div>
          </div>
          <Badge variant={order.status === 'active' ? 'default' : 'secondary'} className={
            order.status === 'active' ? 'bg-primary' : 
            order.status === 'completed' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 
            'bg-red-100 text-red-700 hover:bg-red-100'
          }>
            {order.statusLabel}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center text-sm border-t border-gray-50 pt-3 mt-2">
          <span className="text-muted-foreground">{order.items} منتجات</span>
          <span className="font-bold">{order.total} ر.س</span>
        </div>
      </div>
    </Card>
  );
}
