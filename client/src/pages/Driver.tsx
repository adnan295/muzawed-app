import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Package, MapPin, Phone, User, Navigation, Truck, CheckCircle, Clock, 
  XCircle, Map, List, RefreshCw, ChevronLeft, Copy, ExternalLink, LogIn, LogOut, Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

interface DriverSession {
  id: number;
  name: string;
  phone: string;
  vehicleType?: string;
}

interface DeliveryOrder {
  id: number;
  userId: number;
  status: string;
  total: string;
  paymentMethod: string;
  createdAt: string;
  address?: {
    id: number;
    title: string;
    details: string;
    latitude: string;
    longitude: string;
    cityId: number;
  };
  user?: {
    id: number;
    phone: string;
    facilityName: string;
  };
  items?: {
    productName: string;
    quantity: number;
  }[];
}

function DeliveryMapMultiple({ orders }: { orders: DeliveryOrder[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    let mapInstance: any = null;

    const initMap = async () => {
      if (!mapRef.current) return;

      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const defaultCenter: [number, number] = [33.5138, 36.2765];
      mapInstance = L.map(mapRef.current).setView(defaultCenter, 12);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(mapInstance);

      const bounds: [number, number][] = [];

      orders.forEach((order, index) => {
        if (order.address?.latitude && order.address?.longitude) {
          const lat = parseFloat(order.address.latitude);
          const lng = parseFloat(order.address.longitude);
          bounds.push([lat, lng]);

          const statusColors: Record<string, string> = {
            pending: '#f59e0b',
            confirmed: '#3b82f6',
            processing: '#8b5cf6',
            shipped: '#06b6d4',
            delivered: '#22c55e',
            cancelled: '#ef4444',
          };

          const color = statusColors[order.status] || '#6b7280';

          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background: ${color}; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">${index + 1}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          });

          L.marker([lat, lng], { icon: customIcon })
            .addTo(mapInstance)
            .bindPopup(`
              <div style="text-align: right; direction: rtl; min-width: 150px;">
                <strong>طلب #${order.id}</strong><br/>
                <span>${order.user?.facilityName || 'عميل'}</span><br/>
                <span style="color: ${color};">${getStatusLabel(order.status)}</span><br/>
                <span>${parseFloat(order.total).toLocaleString('ar-SY')} ل.س</span>
              </div>
            `);
        }
      });

      if (bounds.length > 0) {
        mapInstance.fitBounds(bounds, { padding: [30, 30] });
      }

      setMapLoaded(true);
    };

    initMap();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [orders]);

  return (
    <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200" style={{ height: '400px' }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <MapPin className="w-8 h-8 text-purple-500 mx-auto mb-2 animate-bounce" />
            <p className="text-sm text-gray-600">جاري تحميل الخريطة...</p>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'قيد الانتظار',
    confirmed: 'مؤكد',
    processing: 'قيد التجهيز',
    shipped: 'قيد التوصيل',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي',
  };
  return labels[status] || status;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped: 'bg-cyan-100 text-cyan-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}

export default function Driver() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Login state
  const [driver, setDriver] = useState<DriverSession | null>(() => {
    const saved = localStorage.getItem('driverSession');
    return saved ? JSON.parse(saved) : null;
  });
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async () => {
    if (!loginPhone || !loginPassword) {
      toast({ title: 'يرجى إدخال رقم الهاتف وكلمة المرور', variant: 'destructive' });
      return;
    }
    
    setLoginLoading(true);
    try {
      const res = await fetch('/api/driver/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: loginPhone, password: loginPassword }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        toast({ title: data.error || 'فشل تسجيل الدخول', variant: 'destructive' });
        return;
      }
      
      setDriver(data.driver);
      localStorage.setItem('driverSession', JSON.stringify(data.driver));
      toast({ title: `مرحباً ${data.driver.name}`, className: 'bg-green-600 text-white' });
    } catch (error) {
      toast({ title: 'حدث خطأ في الاتصال', variant: 'destructive' });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setDriver(null);
    localStorage.removeItem('driverSession');
    toast({ title: 'تم تسجيل الخروج', className: 'bg-gray-600 text-white' });
  };

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['driverOrders', driver?.id],
    queryFn: async () => {
      if (!driver) return [];
      const res = await fetch(`/api/driver/orders?driverId=${driver.id}`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json() as Promise<DeliveryOrder[]>;
    },
    refetchInterval: 30000,
    enabled: !!driver,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driverOrders'] });
      toast({ title: 'تم تحديث حالة الطلب', className: 'bg-green-600 text-white' });
    },
    onError: () => {
      toast({ title: 'حدث خطأ', variant: 'destructive' });
    },
  });

  // Show login screen if not authenticated
  if (!driver) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-600 to-purple-800 flex items-center justify-center p-4" dir="rtl">
        <Card className="w-full max-w-md p-6 rounded-3xl shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-10 h-10 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">تطبيق السائق</h1>
            <p className="text-gray-500 mt-1">سجل دخولك للوصول إلى الطلبات</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone">رقم الهاتف</Label>
              <div className="relative mt-1">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+963..."
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  className="pr-10 rounded-xl"
                  dir="ltr"
                  data-testid="input-driver-phone"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative mt-1">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="كلمة المرور"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="pr-10 rounded-xl"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  data-testid="input-driver-password"
                />
              </div>
            </div>
            
            <Button
              className="w-full rounded-xl gap-2 bg-purple-600 hover:bg-purple-700"
              onClick={handleLogin}
              disabled={loginLoading}
              data-testid="button-driver-login"
            >
              {loginLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              تسجيل الدخول
            </Button>
          </div>
          
          <p className="text-xs text-gray-400 text-center mt-4">
            كلمة المرور الافتراضية: آخر 4 أرقام من رقم الهاتف
          </p>
        </Card>
      </div>
    );
  }

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return ['confirmed', 'processing', 'shipped'].includes(order.status);
    return order.status === statusFilter;
  });

  const ordersWithLocation = filteredOrders.filter(o => o.address?.latitude && o.address?.longitude);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    active: orders.filter(o => ['confirmed', 'processing', 'shipped'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white" dir="rtl">
      <div className="bg-gradient-to-l from-purple-600 to-purple-500 text-white p-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-xl" onClick={handleLogout} data-testid="button-logout">
            <LogOut className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <h1 className="text-xl font-bold flex items-center justify-center gap-2">
              <Truck className="w-6 h-6" />
              تطبيق السائق
            </h1>
            <p className="text-xs text-purple-100 mt-1">مرحباً {driver.name}</p>
          </div>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-xl" onClick={() => refetch()}>
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <Card className="bg-white/20 backdrop-blur border-none p-3 text-center rounded-xl">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs opacity-90">الكل</p>
          </Card>
          <Card className="bg-amber-400/30 backdrop-blur border-none p-3 text-center rounded-xl">
            <p className="text-2xl font-bold">{stats.pending}</p>
            <p className="text-xs opacity-90">انتظار</p>
          </Card>
          <Card className="bg-blue-400/30 backdrop-blur border-none p-3 text-center rounded-xl">
            <p className="text-2xl font-bold">{stats.active}</p>
            <p className="text-xs opacity-90">نشط</p>
          </Card>
          <Card className="bg-green-400/30 backdrop-blur border-none p-3 text-center rounded-xl">
            <p className="text-2xl font-bold">{stats.delivered}</p>
            <p className="text-xs opacity-90">تم</p>
          </Card>
        </div>
      </div>

      <div className="p-4 -mt-3">
        <div className="flex gap-2 mb-4">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            className="flex-1 rounded-xl gap-2"
            onClick={() => setViewMode('list')}
            data-testid="view-list"
          >
            <List className="w-4 h-4" />القائمة
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            className="flex-1 rounded-xl gap-2"
            onClick={() => setViewMode('map')}
            data-testid="view-map"
          >
            <Map className="w-4 h-4" />الخريطة
          </Button>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {[
            { value: 'all', label: 'الكل' },
            { value: 'active', label: 'النشطة' },
            { value: 'pending', label: 'انتظار' },
            { value: 'shipped', label: 'قيد التوصيل' },
            { value: 'delivered', label: 'تم التوصيل' },
          ].map(filter => (
            <Button
              key={filter.value}
              variant={statusFilter === filter.value ? 'default' : 'outline'}
              size="sm"
              className="rounded-full whitespace-nowrap"
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {viewMode === 'map' ? (
          <div className="space-y-4">
            <DeliveryMapMultiple orders={ordersWithLocation} />
            <p className="text-sm text-gray-500 text-center">
              {ordersWithLocation.length} طلب على الخريطة
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-320px)]">
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-500 mb-2" />
                  <p className="text-gray-500">جاري تحميل الطلبات...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">لا توجد طلبات</p>
                </div>
              ) : (
                filteredOrders.map((order, index) => (
                  <Card
                    key={order.id}
                    className="p-4 border-none shadow-md rounded-2xl cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedOrder(order)}
                    data-testid={`order-card-${order.id}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-bold">طلب #{order.id}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString('ar-SY')}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} rounded-full`}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{order.user?.facilityName || 'عميل'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span dir="ltr">{order.user?.phone || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{order.address?.title || 'بدون عنوان'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <span className="font-bold text-purple-600">
                        {parseFloat(order.total).toLocaleString('ar-SY')} ل.س
                      </span>
                      <Badge className={`rounded-full ${order.paymentMethod === 'cash' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                        {order.paymentMethod === 'cash' ? '💵 نقدي' : '📅 آجل'}
                      </Badge>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden max-h-[90vh]">
          <DialogHeader className="p-4 bg-gradient-to-l from-purple-600 to-purple-500 text-white">
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              طلب #{selectedOrder?.id}
            </DialogTitle>
            <DialogDescription className="text-purple-100">
              {selectedOrder && new Date(selectedOrder.createdAt).toLocaleString('ar-SY')}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <ScrollArea className="max-h-[60vh]">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">الحالة:</span>
                  <Badge className={`${getStatusColor(selectedOrder.status)} rounded-full`}>
                    {getStatusLabel(selectedOrder.status)}
                  </Badge>
                </div>

                <Card className="p-4 bg-blue-50 rounded-2xl border-none">
                  <h4 className="font-bold mb-2 flex items-center gap-2 text-blue-700">
                    <User className="w-4 h-4" />بيانات العميل
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">الاسم:</span>
                      <span className="font-bold">{selectedOrder.user?.facilityName || 'عميل'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">الهاتف:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono" dir="ltr">{selectedOrder.user?.phone}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full"
                          onClick={() => window.open(`tel:${selectedOrder.user?.phone}`)}
                        >
                          <Phone className="w-4 h-4 text-blue-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-purple-50 rounded-2xl border-none">
                  <h4 className="font-bold mb-2 flex items-center gap-2 text-purple-700">
                    <MapPin className="w-4 h-4" />عنوان التوصيل
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p className="font-bold">{selectedOrder.address?.title}</p>
                    {selectedOrder.address?.details && (
                      <p className="text-gray-600">{selectedOrder.address.details}</p>
                    )}
                  </div>
                  {selectedOrder.address?.latitude && selectedOrder.address?.longitude && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        className="flex-1 rounded-xl gap-2 bg-purple-600 hover:bg-purple-700"
                        onClick={() => {
                          window.open(
                            `https://www.google.com/maps/dir/?api=1&destination=${selectedOrder.address?.latitude},${selectedOrder.address?.longitude}`,
                            '_blank'
                          );
                        }}
                        data-testid="button-navigate"
                      >
                        <Navigation className="w-4 h-4" />الملاحة
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-xl gap-2"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${selectedOrder.address?.latitude}, ${selectedOrder.address?.longitude}`
                          );
                          toast({ title: 'تم نسخ الإحداثيات', className: 'bg-green-600 text-white' });
                        }}
                        data-testid="button-copy-location"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </Card>

                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <Card className="p-4 bg-gray-50 rounded-2xl border-none">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <Package className="w-4 h-4" />المنتجات ({selectedOrder.items.length})
                    </h4>
                    <div className="space-y-2 text-sm">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{item.productName}</span>
                          <span className="font-bold">×{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                <div className="p-4 bg-green-50 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">الإجمالي:</span>
                    <span className="text-xl font-bold text-green-600">
                      {parseFloat(selectedOrder.total).toLocaleString('ar-SY')} ل.س
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-green-200">
                    <span className="font-bold">طريقة الدفع:</span>
                    <Badge className={`rounded-full text-sm px-3 py-1 ${selectedOrder.paymentMethod === 'cash' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                      {selectedOrder.paymentMethod === 'cash' ? '💵 الدفع نقداً عند الاستلام' : '📅 دفع آجل (ذمم)'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">تحديث الحالة:</label>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) => {
                      updateStatusMutation.mutate({ orderId: selectedOrder.id, status: value });
                      setSelectedOrder({ ...selectedOrder, status: value });
                    }}
                  >
                    <SelectTrigger className="w-full rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">مؤكد</SelectItem>
                      <SelectItem value="processing">قيد التجهيز</SelectItem>
                      <SelectItem value="shipped">قيد التوصيل</SelectItem>
                      <SelectItem value="delivered">تم التوصيل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full rounded-xl gap-2 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    updateStatusMutation.mutate({ orderId: selectedOrder.id, status: 'delivered' });
                    setSelectedOrder(null);
                  }}
                  disabled={selectedOrder.status === 'delivered'}
                  data-testid="button-mark-delivered"
                >
                  <CheckCircle className="w-5 h-5" />
                  تم التوصيل
                </Button>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
