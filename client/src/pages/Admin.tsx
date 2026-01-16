import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ImageUploader } from '@/components/ImageUploader';
import { 
  Package, ShoppingCart, Users, TrendingUp, Plus, Search, Edit, Trash2, ArrowRight,
  LayoutDashboard, Box, ClipboardList, Settings, DollarSign, Eye, CheckCircle, Clock,
  XCircle, Truck, BarChart3, PieChart, Activity, RefreshCw, Bell, Download, Upload,
  Tag, Percent, Calendar, Filter, MoreVertical, Star, MessageSquare, Zap, Target,
  Award, Megaphone, Layers, Globe, FileText, TrendingDown, AlertTriangle, ChevronUp,
  ChevronDown, Mail, Phone, MapPin, Building, CreditCard, Wallet, UserCog, Headphones,
  Gift, Warehouse, Receipt, Copy, ExternalLink, Shield, Lock, Key, UserPlus, TicketIcon,
  MessageCircle, Send, Archive, Printer, QrCode, Barcode, PackageCheck, PackageX, Timer,
  Banknote, PiggyBank, Coins, Crown, Medal, Trophy, Repeat, RotateCcw, Navigation, UserMinus,
  TruckIcon, MapPinned, Factory, ShoppingBag, FileSpreadsheet, File, MailCheck, FileDown,
  Sparkles, Flame, ThumbsUp, ThumbsDown, AlertCircle, Info, HelpCircle, CircleDollarSign,
  BadgePercent, Gauge, ArrowUpRight, ArrowDownRight, Hash, Split, Merge,
  GitBranch, Network, Boxes, Container, Handshake, Building2, Store, Home, ArrowLeftRight, LogOut, MousePointer, EyeOff, Check, X
} from 'lucide-react';
import { Link } from 'wouter';
import { productsAPI, categoriesAPI, brandsAPI, notificationsAPI, activityLogsAPI, inventoryAPI, adminAPI, citiesAPI, warehousesAPI, productInventoryAPI, driversAPI, vehiclesAPI, returnsAPI, customersAPI, bannersAPI, segmentsAPI, suppliersAPI, reportsAPI, expensesAPI, expenseCategoriesAPI, deliverySettingsAPI, staffAPI, promotionsAPI, creditsAPI, couponsAPI, erpSettingsAPI, erpProductsAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, LineChart, Line, Legend, ComposedChart, RadialBarChart, RadialBar, Treemap, FunnelChart, Funnel, LabelList } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: number;
  name: string;
  categoryId: number;
  brandId?: number | null;
  price: string;
  originalPrice?: string | null;
  image: string;
  minOrder: number;
  unit: string;
  stock: number;
}

interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

interface Brand {
  id: number;
  name: string;
  logo: string;
}

interface City {
  id: number;
  name: string;
  region: string;
  isActive: boolean;
}

interface WarehouseData {
  id: number;
  name: string;
  code: string;
  cityId: number;
  address?: string;
  phone?: string;
  capacity: number;
  isActive: boolean;
}

interface Driver {
  id: number;
  name: string;
  phone: string;
  licenseNumber?: string;
  vehiclePlate?: string;
  vehicleType?: string;
  cityId?: number;
  warehouseId?: number;
  status: string;
  rating?: string;
  completedDeliveries: number;
  isActive: boolean;
  notes?: string;
}

interface Vehicle {
  id: number;
  plateNumber: string;
  type: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  capacity?: string;
  fuelType?: string;
  driverId?: number;
  warehouseId?: number;
  status: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  insuranceExpiryDate?: string;
  licenseExpiryDate?: string;
  mileage: number;
  notes?: string;
  isActive: boolean;
}

interface ReturnRequest {
  id: number;
  returnNumber: string;
  orderId: number;
  userId: number;
  reason: string;
  status: string;
  refundAmount?: string;
  refundMethod?: string;
  notes?: string;
  images?: string[];
  processedBy?: number;
  createdAt: string;
  processedAt?: string;
}

interface Staff {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  department?: string | null;
  warehouseId?: number | null;
  permissions?: string[] | null;
  status: string;
  avatar?: string | null;
  createdAt: string;
}

// Delivery Map View Component
function DeliveryMapView({ lat, lng, label }: { lat: number; lng: number; label: string }) {
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

      mapInstance = L.map(mapRef.current).setView([lat, lng], 15);
      
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(mapInstance);

      L.marker([lat, lng]).addTo(mapInstance).bindPopup(label).openPopup();
      setMapLoaded(true);
    };

    initMap();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [lat, lng, label]);

  return (
    <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200" style={{ height: '300px' }}>
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

const salesData = [
  { name: 'يناير', sales: 45000, orders: 240, customers: 180, returns: 12 },
  { name: 'فبراير', sales: 52000, orders: 280, customers: 210, returns: 15 },
  { name: 'مارس', sales: 61000, orders: 320, customers: 250, returns: 18 },
  { name: 'أبريل', sales: 58000, orders: 290, customers: 230, returns: 14 },
  { name: 'مايو', sales: 72000, orders: 380, customers: 290, returns: 20 },
  { name: 'يونيو', sales: 85000, orders: 420, customers: 340, returns: 22 },
  { name: 'يوليو', sales: 95000, orders: 480, customers: 390, returns: 25 },
];

const hourlyData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  orders: Math.floor(Math.random() * 50) + 10,
  revenue: Math.floor(Math.random() * 5000) + 1000,
}));

const categoryPieData = [
  { name: 'مشروبات', value: 35, color: '#8b5cf6' },
  { name: 'منظفات', value: 25, color: '#06b6d4' },
  { name: 'مواد غذائية', value: 20, color: '#10b981' },
  { name: 'ألبان', value: 12, color: '#f59e0b' },
  { name: 'أخرى', value: 8, color: '#ef4444' },
];

const funnelData = [
  { name: 'زيارات', value: 50000, fill: '#8b5cf6' },
  { name: 'تسجيل', value: 25000, fill: '#06b6d4' },
  { name: 'إضافة للسلة', value: 15000, fill: '#10b981' },
  { name: 'بدء الدفع', value: 8000, fill: '#f59e0b' },
  { name: 'طلب مكتمل', value: 5000, fill: '#ef4444' },
];


const mockTickets = [
  { id: 1, ticketNumber: 'TKT-001', customer: 'سوبر ماركت الفيصل', subject: 'مشكلة في الطلب #1024', category: 'order', priority: 'high', status: 'open', assignedTo: 'محمد خالد', createdAt: '10 دقائق', messages: 3 },
  { id: 2, ticketNumber: 'TKT-002', customer: 'بقالة النور', subject: 'استفسار عن المنتجات', category: 'product', priority: 'medium', status: 'in_progress', assignedTo: 'سارة علي', createdAt: '30 دقيقة', messages: 5 },
  { id: 3, ticketNumber: 'TKT-003', customer: 'مركز السعادة', subject: 'طلب استرجاع', category: 'payment', priority: 'urgent', status: 'open', assignedTo: null, createdAt: '1 ساعة', messages: 1 },
  { id: 4, ticketNumber: 'TKT-004', customer: 'ميني ماركت الخير', subject: 'مشكلة تقنية', category: 'technical', priority: 'low', status: 'resolved', assignedTo: 'محمد خالد', createdAt: '2 ساعة', messages: 8 },
];

const mockCoupons = [
  { id: 1, code: 'SUMMER2024', type: 'percentage', value: 15, minOrder: 200, maxDiscount: 100, usageLimit: 1000, usageCount: 456, isActive: true, endDate: '2024-08-31' },
  { id: 2, code: 'WELCOME50', type: 'fixed', value: 50, minOrder: 300, maxDiscount: null, usageLimit: 500, usageCount: 123, isActive: true, endDate: '2024-12-31' },
  { id: 3, code: 'FLASH20', type: 'percentage', value: 20, minOrder: 150, maxDiscount: 75, usageLimit: 200, usageCount: 200, isActive: false, endDate: '2024-06-30' },
];


const mockLoyaltyTiers = [
  { tier: 'bronze', name: 'برونزي', minPoints: 0, discount: 0, customers: 4500, color: 'from-orange-600 to-orange-700', icon: Star },
  { tier: 'silver', name: 'فضي', minPoints: 1000, discount: 5, customers: 3200, color: 'from-gray-400 to-gray-500', icon: Medal },
  { tier: 'gold', name: 'ذهبي', minPoints: 5000, discount: 10, customers: 1800, color: 'from-yellow-500 to-yellow-600', icon: Trophy },
  { tier: 'platinum', name: 'بلاتيني', minPoints: 15000, discount: 15, customers: 500, color: 'from-purple-500 to-purple-600', icon: Crown },
];

const mockSuppliers = [
  { id: 1, name: 'شركة المراعي', code: 'SUP-001', contact: 'محمد العمري', phone: '0501234567', city: 'الرياض', rating: 5, orders: 156, balance: 45000 },
  { id: 2, name: 'شركة صافولا', code: 'SUP-002', contact: 'أحمد الفهد', phone: '0559876543', city: 'جدة', rating: 4, orders: 98, balance: 32000 },
  { id: 3, name: 'شركة نادك', code: 'SUP-003', contact: 'خالد السالم', phone: '0543216789', city: 'الدمام', rating: 5, orders: 124, balance: 28500 },
  { id: 4, name: 'شركة بيبسي', code: 'SUP-004', contact: 'سعد الدوسري', phone: '0567891234', city: 'الرياض', rating: 4, orders: 87, balance: 52000 },
];


const mockShipments = [
  { id: 1, trackingNumber: 'SHP-2024-001', orderId: 1024, carrier: 'in_house', status: 'in_transit', driver: 'سعيد محمد', phone: '0501234567', eta: '30 دقيقة', location: 'حي النرجس' },
  { id: 2, trackingNumber: 'SHP-2024-002', orderId: 1025, carrier: 'aramex', status: 'out_for_delivery', driver: 'أحمد علي', phone: '0559876543', eta: '15 دقيقة', location: 'حي الملقا' },
  { id: 3, trackingNumber: 'SHP-2024-003', orderId: 1026, carrier: 'smsa', status: 'preparing', driver: null, phone: null, eta: '2 ساعة', location: 'المستودع' },
];

const mockReturns = [
  { id: 1, returnNumber: 'RET-001', orderId: 1020, customer: 'سوبر ماركت النور', reason: 'منتج تالف', status: 'pending', amount: 250, date: '2024-05-10' },
  { id: 2, returnNumber: 'RET-002', orderId: 1018, customer: 'بقالة الأمل', reason: 'منتج خاطئ', status: 'approved', amount: 180, date: '2024-05-09' },
  { id: 3, returnNumber: 'RET-003', orderId: 1015, customer: 'مركز الخير', reason: 'تاريخ انتهاء قريب', status: 'refunded', amount: 420, date: '2024-05-08' },
];


const recentActivities = [
  { id: 1, type: 'order', message: 'طلب جديد #1024 من سوبر ماركت النور', time: '5 دقائق', icon: ShoppingCart, color: 'bg-blue-100 text-blue-600' },
  { id: 2, type: 'user', message: 'عميل جديد: بقالة الأمل', time: '15 دقيقة', icon: Users, color: 'bg-green-100 text-green-600' },
  { id: 3, type: 'stock', message: 'تنبيه: مخزون بيبسي منخفض (15 وحدة)', time: '30 دقيقة', icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-600' },
  { id: 4, type: 'ticket', message: 'تذكرة دعم جديدة TKT-005', time: '45 دقيقة', icon: Headphones, color: 'bg-purple-100 text-purple-600' },
  { id: 5, type: 'payment', message: 'استلام دفعة 2,500 ل.س', time: '1 ساعة', icon: CreditCard, color: 'bg-emerald-100 text-emerald-600' },
  { id: 6, type: 'return', message: 'طلب استرجاع RET-004', time: '2 ساعة', icon: RotateCcw, color: 'bg-red-100 text-red-600' },
];

const kpiData = [
  { name: 'معدل التحويل', value: 12.5, target: 15, unit: '%', trend: 'up', change: 2.3 },
  { name: 'متوسط قيمة الطلب', value: 850, target: 1000, unit: 'ل.س', trend: 'up', change: 45 },
  { name: 'معدل إعادة الطلب', value: 68, target: 75, unit: '%', trend: 'up', change: 5 },
  { name: 'وقت التوصيل', value: 2.4, target: 2, unit: 'ساعة', trend: 'down', change: -0.3 },
  { name: 'رضا العملاء', value: 4.6, target: 4.8, unit: '/5', trend: 'up', change: 0.2 },
  { name: 'معدل الإلغاء', value: 3.2, target: 2, unit: '%', trend: 'down', change: -0.5 },
];

interface DepositRequest {
  id: number;
  userId: number;
  amount: string;
  status: 'pending' | 'approved' | 'rejected';
  proofImageUrl?: string | null;
  notes?: string | null;
  reviewedBy?: number | null;
  reviewNotes?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
}

function DepositsManagementSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState<DepositRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

  const { data: depositRequests = [], refetch } = useQuery<DepositRequest[]>({
    queryKey: ['admin-deposit-requests', statusFilter],
    queryFn: async () => {
      const res = await fetch(`/api/admin/deposit-requests?status=${statusFilter}`);
      return res.json();
    }
  });

  const { data: allUsers = [] } = useQuery<any[]>({
    queryKey: ['all-users-for-deposits'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      return res.json();
    }
  });

  const getUserName = (userId: number) => {
    const user = allUsers.find((u: any) => u.id === userId);
    return user?.facilityName || user?.phone || `عميل #${userId}`;
  };

  const handleAction = async () => {
    if (!selectedRequest) return;
    try {
      const endpoint = actionType === 'approve' 
        ? `/api/admin/deposit-requests/${selectedRequest.id}/approve`
        : `/api/admin/deposit-requests/${selectedRequest.id}/reject`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewedBy: 1, notes: reviewNotes || undefined })
      });
      if (!res.ok) throw new Error('فشل في معالجة الطلب');
      toast({ 
        title: actionType === 'approve' ? 'تمت الموافقة بنجاح' : 'تم رفض الطلب',
        className: actionType === 'approve' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      });
      setIsActionDialogOpen(false);
      setSelectedRequest(null);
      setReviewNotes('');
      refetch();
    } catch (error: any) {
      toast({ title: error.message, variant: 'destructive' });
    }
  };

  const pendingCount = depositRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      <Card className="p-6 border-none shadow-lg rounded-2xl bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-2xl flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              طلبات شحن المحفظة
            </h3>
            <p className="text-purple-200 mt-2">إدارة طلبات شحن الرصيد عبر بشام كاش</p>
          </div>
          <div className="flex gap-2">
            {statusFilter === 'pending' && pendingCount > 0 && (
              <Badge className="bg-yellow-400 text-yellow-900 px-3 py-1 text-lg font-bold">{pendingCount} طلب قيد الانتظار</Badge>
            )}
            <Button variant="outline" className="rounded-xl gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4" />تحديث
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`p-4 border-none shadow-lg rounded-2xl cursor-pointer transition-all ${statusFilter === 'pending' ? 'ring-2 ring-yellow-500 bg-yellow-50' : 'bg-white'}`} onClick={() => setStatusFilter('pending')}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center text-white">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-yellow-600">قيد الانتظار</p>
              <p className="text-2xl font-bold text-yellow-800">{depositRequests.filter(r => r.status === 'pending').length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className={`p-4 border-none shadow-lg rounded-2xl cursor-pointer transition-all ${statusFilter === 'approved' ? 'ring-2 ring-green-500 bg-green-50' : 'bg-white'}`} onClick={() => setStatusFilter('approved')}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-green-600">تمت الموافقة</p>
              <p className="text-2xl font-bold text-green-800">{depositRequests.filter(r => r.status === 'approved').length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className={`p-4 border-none shadow-lg rounded-2xl cursor-pointer transition-all ${statusFilter === 'rejected' ? 'ring-2 ring-red-500 bg-red-50' : 'bg-white'}`} onClick={() => setStatusFilter('rejected')}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center text-white">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-red-600">مرفوض</p>
              <p className="text-2xl font-bold text-red-800">{depositRequests.filter(r => r.status === 'rejected').length || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 border-none shadow-lg rounded-2xl">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-purple-600" />
          {statusFilter === 'pending' ? 'الطلبات قيد الانتظار' : statusFilter === 'approved' ? 'الطلبات المعتمدة' : 'الطلبات المرفوضة'}
        </h3>
        {depositRequests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>لا توجد طلبات {statusFilter === 'pending' ? 'قيد الانتظار' : statusFilter === 'approved' ? 'معتمدة' : 'مرفوضة'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">#</TableHead>
                  <TableHead className="text-right">العميل</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">تاريخ الطلب</TableHead>
                  <TableHead className="text-right">ملاحظات</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  {statusFilter === 'pending' && <TableHead className="text-right">إجراءات</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {depositRequests.map((request) => (
                  <TableRow key={request.id} data-testid={`deposit-request-row-${request.id}`}>
                    <TableCell className="font-medium">{request.id}</TableCell>
                    <TableCell>{getUserName(request.userId)}</TableCell>
                    <TableCell className="font-bold text-green-600">{parseFloat(request.amount).toLocaleString()} ل.س</TableCell>
                    <TableCell className="text-sm text-gray-500">{new Date(request.createdAt).toLocaleDateString('ar-SY')}</TableCell>
                    <TableCell className="text-sm">{request.notes || '-'}</TableCell>
                    <TableCell>
                      {request.status === 'pending' && <Badge className="bg-yellow-100 text-yellow-700 rounded-full">قيد الانتظار</Badge>}
                      {request.status === 'approved' && <Badge className="bg-green-100 text-green-700 rounded-full">معتمد</Badge>}
                      {request.status === 'rejected' && <Badge className="bg-red-100 text-red-700 rounded-full">مرفوض</Badge>}
                    </TableCell>
                    {statusFilter === 'pending' && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="rounded-lg bg-green-600 hover:bg-green-700 text-xs"
                            onClick={() => {
                              setSelectedRequest(request);
                              setActionType('approve');
                              setIsActionDialogOpen(true);
                            }}
                            data-testid={`btn-approve-${request.id}`}
                          >
                            <CheckCircle className="w-3 h-3 ml-1" />موافقة
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            className="rounded-lg text-xs"
                            onClick={() => {
                              setSelectedRequest(request);
                              setActionType('reject');
                              setIsActionDialogOpen(true);
                            }}
                            data-testid={`btn-reject-${request.id}`}
                          >
                            <XCircle className="w-3 h-3 ml-1" />رفض
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-center">
              {actionType === 'approve' ? 'تأكيد الموافقة على الطلب' : 'تأكيد رفض الطلب'}
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">العميل:</span>
                  <span className="font-medium">{getUserName(selectedRequest.userId)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">المبلغ:</span>
                  <span className="font-bold text-green-600">{parseFloat(selectedRequest.amount).toLocaleString()} ل.س</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ملاحظات العميل:</span>
                  <span>{selectedRequest.notes || '-'}</span>
                </div>
              </div>
              
              <div>
                <Label>ملاحظات المراجعة (اختياري)</Label>
                <Textarea 
                  className="mt-1 rounded-xl" 
                  placeholder="أضف ملاحظة..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-xl" 
                  onClick={() => setIsActionDialogOpen(false)}
                >
                  إلغاء
                </Button>
                <Button 
                  className={`flex-1 rounded-xl ${actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                  onClick={handleAction}
                >
                  {actionType === 'approve' ? 'تأكيد الموافقة' : 'تأكيد الرفض'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DeliverySettingsSection({ warehouses }: { warehouses: any[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    warehouseId: '',
    baseFee: '',
    freeThresholdAmount: '',
    freeThresholdQuantity: '',
    isEnabled: true,
    notes: ''
  });

  const { data: deliverySettings = [], refetch } = useQuery<any[]>({
    queryKey: ['delivery-settings'],
    queryFn: async () => {
      const data = await deliverySettingsAPI.getAll();
      return data as any[];
    }
  });

  const resetForm = () => {
    setFormData({ warehouseId: '', baseFee: '', freeThresholdAmount: '', freeThresholdQuantity: '', isEnabled: true, notes: '' });
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!formData.warehouseId || !formData.baseFee) {
      toast({ title: 'يرجى ملء الحقول المطلوبة', variant: 'destructive' });
      return;
    }
    try {
      const data = {
        warehouseId: parseInt(formData.warehouseId),
        baseFee: formData.baseFee,
        freeThresholdAmount: formData.freeThresholdAmount || undefined,
        freeThresholdQuantity: formData.freeThresholdQuantity ? parseInt(formData.freeThresholdQuantity) : undefined,
        isEnabled: formData.isEnabled,
        notes: formData.notes || undefined
      };
      if (editingId) {
        await deliverySettingsAPI.update(editingId, data);
        toast({ title: 'تم تحديث إعدادات التوصيل بنجاح', className: 'bg-green-600 text-white' });
      } else {
        await deliverySettingsAPI.create(data);
        toast({ title: 'تم إضافة إعدادات التوصيل بنجاح', className: 'bg-green-600 text-white' });
      }
      refetch();
      setIsAddOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: error.message || 'حدث خطأ', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف إعدادات التوصيل هذه؟')) return;
    try {
      await deliverySettingsAPI.delete(id);
      toast({ title: 'تم حذف إعدادات التوصيل', className: 'bg-green-600 text-white' });
      refetch();
    } catch (error: any) {
      toast({ title: error.message || 'حدث خطأ', variant: 'destructive' });
    }
  };

  const getWarehouseName = (warehouseId: number) => {
    const wh = warehouses.find((w: any) => w.id === warehouseId);
    return wh?.name || `مستودع ${warehouseId}`;
  };

  const formatCurrency = (value: string | number) => {
    return parseFloat(value?.toString() || '0').toLocaleString('ar-SY') + ' ل.س';
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-none shadow-lg rounded-2xl bg-gradient-to-l from-blue-600 to-indigo-700 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Truck className="w-6 h-6" />
              إعدادات رسوم التوصيل
            </h2>
            <p className="text-blue-100 mt-1">إدارة رسوم التوصيل لكل مستودع مع إمكانية تحديد حد الشحن المجاني</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-white text-blue-600 hover:bg-blue-50 rounded-xl gap-2" data-testid="button-add-delivery-setting">
                <Plus className="w-4 h-4" />إضافة إعدادات
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingId ? 'تعديل إعدادات التوصيل' : 'إضافة إعدادات توصيل جديدة'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>المستودع *</Label>
                  <Select value={formData.warehouseId} onValueChange={(v) => setFormData({ ...formData, warehouseId: v })}>
                    <SelectTrigger className="rounded-xl mt-1" data-testid="select-warehouse">
                      <SelectValue placeholder="اختر المستودع" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((wh: any) => (
                        <SelectItem key={wh.id} value={wh.id.toString()}>{wh.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>رسوم التوصيل الأساسية (ل.س) *</Label>
                  <Input 
                    className="rounded-xl mt-1" 
                    type="number" 
                    placeholder="مثال: 5000" 
                    value={formData.baseFee}
                    onChange={(e) => setFormData({ ...formData, baseFee: e.target.value })}
                    data-testid="input-base-fee"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>حد الشحن المجاني (المبلغ)</Label>
                    <Input 
                      className="rounded-xl mt-1" 
                      type="number" 
                      placeholder="مثال: 100000"
                      value={formData.freeThresholdAmount}
                      onChange={(e) => setFormData({ ...formData, freeThresholdAmount: e.target.value })}
                      data-testid="input-free-threshold-amount"
                    />
                    <p className="text-xs text-gray-500 mt-1">الطلبات أكثر من هذا المبلغ = شحن مجاني</p>
                  </div>
                  <div>
                    <Label>حد الشحن المجاني (الكمية)</Label>
                    <Input 
                      className="rounded-xl mt-1" 
                      type="number" 
                      placeholder="مثال: 10"
                      value={formData.freeThresholdQuantity}
                      onChange={(e) => setFormData({ ...formData, freeThresholdQuantity: e.target.value })}
                      data-testid="input-free-threshold-quantity"
                    />
                    <p className="text-xs text-gray-500 mt-1">الطلبات أكثر من هذه الكمية = شحن مجاني</p>
                  </div>
                </div>
                <div>
                  <Label>ملاحظات</Label>
                  <Textarea 
                    className="rounded-xl mt-1" 
                    placeholder="ملاحظات إضافية..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={formData.isEnabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, isEnabled: checked })}
                    data-testid="switch-is-enabled"
                  />
                  <Label>تفعيل رسوم التوصيل</Label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1 rounded-xl" onClick={handleSubmit} data-testid="button-save-delivery-setting">
                    {editingId ? 'تحديث' : 'إضافة'}
                  </Button>
                  <Button variant="outline" className="rounded-xl" onClick={() => { setIsAddOpen(false); resetForm(); }}>
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4 border-none shadow-lg rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
              <Warehouse className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{deliverySettings.length}</p>
              <p className="text-sm text-blue-600">إعدادات مستودع</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-none shadow-lg rounded-2xl bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{deliverySettings.filter((s: any) => s.isEnabled).length}</p>
              <p className="text-sm text-green-600">مفعّلة</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-none shadow-lg rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-700">{deliverySettings.filter((s: any) => s.freeThresholdAmount || s.freeThresholdQuantity).length}</p>
              <p className="text-sm text-purple-600">بشحن مجاني</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-none shadow-lg rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-700">
                {deliverySettings.length > 0 ? formatCurrency(Math.round(deliverySettings.reduce((sum: number, s: any) => sum + parseFloat(s.baseFee || '0'), 0) / deliverySettings.length)) : '0 ل.س'}
              </p>
              <p className="text-sm text-orange-600">متوسط الرسوم</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 border-none shadow-lg rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">المستودع</TableHead>
              <TableHead className="text-right">رسوم التوصيل</TableHead>
              <TableHead className="text-right">حد الشحن المجاني (المبلغ)</TableHead>
              <TableHead className="text-right">حد الشحن المجاني (الكمية)</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">ملاحظات</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliverySettings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  لا توجد إعدادات توصيل. اضغط على "إضافة إعدادات" لإنشاء أول إعداد.
                </TableCell>
              </TableRow>
            ) : (
              deliverySettings.map((setting: any) => (
                <TableRow key={setting.id} data-testid={`row-delivery-setting-${setting.id}`}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Warehouse className="w-4 h-4 text-blue-500" />
                      {getWarehouseName(setting.warehouseId)}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-blue-600">{formatCurrency(setting.baseFee)}</TableCell>
                  <TableCell>{setting.freeThresholdAmount ? formatCurrency(setting.freeThresholdAmount) : <span className="text-gray-400">-</span>}</TableCell>
                  <TableCell>{setting.freeThresholdQuantity ? `${setting.freeThresholdQuantity} قطعة` : <span className="text-gray-400">-</span>}</TableCell>
                  <TableCell>
                    <Badge className={setting.isEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                      {setting.isEnabled ? 'مفعّل' : 'معطّل'}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{setting.notes || <span className="text-gray-400">-</span>}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg"
                        onClick={() => {
                          setEditingId(setting.id);
                          setFormData({
                            warehouseId: setting.warehouseId.toString(),
                            baseFee: setting.baseFee,
                            freeThresholdAmount: setting.freeThresholdAmount || '',
                            freeThresholdQuantity: setting.freeThresholdQuantity?.toString() || '',
                            isEnabled: setting.isEnabled,
                            notes: setting.notes || ''
                          });
                          setIsAddOpen(true);
                        }}
                        data-testid={`edit-delivery-setting-${setting.id}`}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(setting.id)}
                        data-testid={`delete-delivery-setting-${setting.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function SiteSettingsSection() {
  const { toast } = useToast();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const { data: settings = [], refetch } = useQuery<any[]>({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const res = await fetch('/api/site-settings');
      if (!res.ok) return [];
      return res.json();
    }
  });

  const settingsConfig = [
    { key: 'exchange_rate_usd', label: 'سعر صرف الدولار (ل.س)', placeholder: '15000', description: 'سعر الصرف للمنتجات المسعرة بالدولار - سيتم عرض السعر بالليرة السورية للعملاء' },
    { key: 'terms', label: 'الشروط والأحكام', placeholder: 'أدخل نص الشروط والأحكام هنا...' },
    { key: 'support_phone', label: 'رقم الدعم الفني', placeholder: '+963 XXX XXX XXX' },
    { key: 'support_email', label: 'بريد الدعم الفني', placeholder: 'support@example.com' },
    { key: 'support_whatsapp', label: 'رقم واتساب الدعم', placeholder: '+963 XXX XXX XXX' },
    { key: 'support_hours', label: 'ساعات العمل', placeholder: 'السبت - الخميس: 9 صباحاً - 6 مساءً' },
    { key: 'about_us', label: 'عن التطبيق', placeholder: 'وصف مختصر عن التطبيق...' },
  ];

  const getSetting = (key: string) => {
    const setting = settings.find((s: any) => s.key === key);
    return setting?.value || '';
  };

  const handleSave = async (key: string, label: string) => {
    try {
      await fetch('/api/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: editValue, label })
      });
      toast({ title: 'تم حفظ الإعداد بنجاح', className: 'bg-green-600 text-white' });
      setEditingKey(null);
      refetch();
    } catch (error) {
      toast({ title: 'حدث خطأ أثناء الحفظ', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 mt-8">
      <div className="flex items-center gap-3 mb-4">
        <FileText className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-bold">إعدادات الموقع والمحتوى</h3>
      </div>

      <div className="grid gap-4">
        {settingsConfig.map((config) => (
          <Card key={config.key} className="p-4 rounded-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Label className="text-base font-semibold mb-1 block">{config.label}</Label>
                {'description' in config && config.description && (
                  <p className="text-xs text-gray-500 mb-2">{config.description}</p>
                )}
                {editingKey === config.key ? (
                  <div className="space-y-3">
                    {config.key === 'terms' || config.key === 'about_us' ? (
                      <Textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder={config.placeholder}
                        className="min-h-[200px] rounded-xl"
                        dir="rtl"
                        data-testid={`textarea-${config.key}`}
                      />
                    ) : (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder={config.placeholder}
                        className="rounded-xl"
                        dir="rtl"
                        data-testid={`input-${config.key}`}
                      />
                    )}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSave(config.key, config.label)}
                        className="rounded-xl bg-green-600 hover:bg-green-700"
                        data-testid={`save-${config.key}`}
                      >
                        <Check className="w-4 h-4 ml-2" />
                        حفظ
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingKey(null)}
                        className="rounded-xl"
                        data-testid={`cancel-${config.key}`}
                      >
                        <X className="w-4 h-4 ml-2" />
                        إلغاء
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600 text-sm line-clamp-2 flex-1">
                      {getSetting(config.key) || <span className="text-gray-400">لم يتم تعيين قيمة</span>}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl mr-4"
                      onClick={() => {
                        setEditingKey(config.key);
                        setEditValue(getSetting(config.key));
                      }}
                      data-testid={`edit-${config.key}`}
                    >
                      <Edit className="w-4 h-4 ml-2" />
                      تعديل
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface ErpSettingsSectionProps {
  warehouses: WarehouseData[];
}

function ErpSettingsSection({ warehouses }: ErpSettingsSectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null);
  const [isAddSettingOpen, setIsAddSettingOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<any>(null);
  const [newSetting, setNewSetting] = useState({
    warehouseId: '',
    erpUrl: '',
    apiKey: '',
    isActive: true,
  });
  const [syncingWarehouse, setSyncingWarehouse] = useState<number | null>(null);

  const { data: erpSettings = [], refetch: refetchSettings } = useQuery<any[]>({
    queryKey: ['erp-settings'],
    queryFn: () => erpSettingsAPI.getAll(),
  });

  const { data: erpProducts = [], refetch: refetchProducts } = useQuery<any[]>({
    queryKey: ['erp-products', selectedWarehouseId],
    queryFn: () => selectedWarehouseId ? erpProductsAPI.getByWarehouse(selectedWarehouseId) : Promise.resolve([]),
    enabled: !!selectedWarehouseId,
  });

  const handleSaveSetting = async () => {
    try {
      const data = {
        warehouseId: parseInt(newSetting.warehouseId),
        erpUrl: newSetting.erpUrl,
        apiKey: newSetting.apiKey || undefined,
        isActive: newSetting.isActive,
      };
      
      if (editingSetting) {
        await erpSettingsAPI.update(editingSetting.id, data);
        toast({ title: 'تم تحديث إعدادات ERP بنجاح' });
      } else {
        await erpSettingsAPI.create(data);
        toast({ title: 'تم إضافة إعدادات ERP بنجاح' });
      }
      
      setIsAddSettingOpen(false);
      setEditingSetting(null);
      setNewSetting({ warehouseId: '', erpUrl: '', apiKey: '', isActive: true });
      refetchSettings();
    } catch (error: any) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteSetting = async (id: number) => {
    try {
      await erpSettingsAPI.delete(id);
      toast({ title: 'تم حذف إعدادات ERP بنجاح' });
      refetchSettings();
    } catch (error: any) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    }
  };

  const handleSync = async (warehouseId: number) => {
    setSyncingWarehouse(warehouseId);
    try {
      const result = await erpProductsAPI.sync(warehouseId);
      toast({ title: 'تمت المزامنة بنجاح', description: result.message });
      if (selectedWarehouseId === warehouseId) {
        refetchProducts();
      }
      refetchSettings();
    } catch (error: any) {
      toast({ title: 'فشل في المزامنة', description: error.message, variant: 'destructive' });
    } finally {
      setSyncingWarehouse(null);
    }
  };

  const getWarehouseName = (warehouseId: number) => {
    return warehouses.find(w => w.id === warehouseId)?.name || 'غير معروف';
  };

  const warehousesWithoutSettings = warehouses.filter(
    w => !erpSettings.find((s: any) => s.warehouseId === w.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Network className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold">إدارة اتصالات ERP</h3>
        </div>
        <Button
          onClick={() => {
            setNewSetting({ warehouseId: '', erpUrl: '', apiKey: '', isActive: true });
            setEditingSetting(null);
            setIsAddSettingOpen(true);
          }}
          className="rounded-xl bg-primary hover:bg-primary/90"
          disabled={warehousesWithoutSettings.length === 0}
          data-testid="button-add-erp-setting"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة اتصال ERP
        </Button>
      </div>

      <Card className="p-4 rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">المستودع</TableHead>
              <TableHead className="text-right">رابط ERP</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">آخر مزامنة</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {erpSettings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                  لا توجد إعدادات ERP. أضف اتصال جديد للبدء.
                </TableCell>
              </TableRow>
            ) : (
              erpSettings.map((setting: any) => (
                <TableRow key={setting.id}>
                  <TableCell className="font-medium">{getWarehouseName(setting.warehouseId)}</TableCell>
                  <TableCell className="text-sm text-gray-600 max-w-[200px] truncate" title={setting.erpUrl}>
                    {setting.erpUrl}
                  </TableCell>
                  <TableCell>
                    <Badge variant={setting.isActive ? "default" : "secondary"} className={setting.isActive ? "bg-green-100 text-green-700" : ""}>
                      {setting.isActive ? 'نشط' : 'معطل'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {setting.lastSyncAt ? (
                      <div className="flex flex-col">
                        <span>{new Date(setting.lastSyncAt).toLocaleDateString('ar-SY')}</span>
                        <Badge variant={setting.lastSyncStatus === 'success' ? "default" : "destructive"} className={`text-xs mt-1 ${setting.lastSyncStatus === 'success' ? 'bg-green-100 text-green-700' : ''}`}>
                          {setting.lastSyncStatus === 'success' ? 'ناجح' : 'فشل'}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-gray-400">لم تتم المزامنة</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg"
                        onClick={() => handleSync(setting.warehouseId)}
                        disabled={syncingWarehouse === setting.warehouseId || !setting.isActive}
                        data-testid={`sync-erp-${setting.id}`}
                      >
                        <RefreshCw className={`w-3 h-3 ml-1 ${syncingWarehouse === setting.warehouseId ? 'animate-spin' : ''}`} />
                        مزامنة
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg"
                        onClick={() => setSelectedWarehouseId(setting.warehouseId)}
                        data-testid={`view-products-${setting.id}`}
                      >
                        <Eye className="w-3 h-3 ml-1" />
                        المنتجات
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg"
                        onClick={() => {
                          setEditingSetting(setting);
                          setNewSetting({
                            warehouseId: setting.warehouseId.toString(),
                            erpUrl: setting.erpUrl,
                            apiKey: setting.apiKey || '',
                            isActive: setting.isActive,
                          });
                          setIsAddSettingOpen(true);
                        }}
                        data-testid={`edit-erp-${setting.id}`}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteSetting(setting.id)}
                        data-testid={`delete-erp-${setting.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {selectedWarehouseId && (
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Box className="w-5 h-5 text-primary" />
              <h4 className="font-bold">منتجات ERP - {getWarehouseName(selectedWarehouseId)}</h4>
              <Badge variant="secondary">{erpProducts.length} منتج</Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => setSelectedWarehouseId(null)}
              data-testid="button-close-products"
            >
              <X className="w-4 h-4 ml-2" />
              إغلاق
            </Button>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">الباركود</TableHead>
                <TableHead className="text-right">الفئة</TableHead>
                <TableHead className="text-right">السعر (ل.س)</TableHead>
                <TableHead className="text-right">السعر الجديد</TableHead>
                <TableHead className="text-right">الكمية</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {erpProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    لا توجد منتجات. قم بالمزامنة لجلب المنتجات.
                  </TableCell>
                </TableRow>
              ) : (
                erpProducts.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-sm text-gray-600">{product.barcode || '-'}</TableCell>
                    <TableCell className="text-sm text-gray-600">{product.category || '-'}</TableCell>
                    <TableCell className="font-bold text-primary">{parseFloat(product.price).toLocaleString('ar-SY')} ل.س</TableCell>
                    <TableCell className="text-sm text-green-600">
                      {product.priceNew ? `${parseFloat(product.priceNew).toLocaleString('ar-SY')} ل.س` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.availableQuantity > 0 ? "default" : "destructive"} className={product.availableQuantity > 0 ? "bg-green-100 text-green-700" : ""}>
                        {product.availableQuantity}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={isAddSettingOpen} onOpenChange={setIsAddSettingOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingSetting ? 'تعديل إعدادات ERP' : 'إضافة اتصال ERP'}</DialogTitle>
            <DialogDescription>قم بإعداد رابط API الخارجي لجلب المنتجات</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>المستودع</Label>
              <Select
                value={newSetting.warehouseId}
                onValueChange={(value) => setNewSetting({ ...newSetting, warehouseId: value })}
                disabled={!!editingSetting}
              >
                <SelectTrigger className="rounded-xl" data-testid="select-warehouse-erp">
                  <SelectValue placeholder="اختر المستودع" />
                </SelectTrigger>
                <SelectContent>
                  {(editingSetting ? warehouses : warehousesWithoutSettings).map((w) => (
                    <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>رابط ERP API</Label>
              <Input
                value={newSetting.erpUrl}
                onChange={(e) => setNewSetting({ ...newSetting, erpUrl: e.target.value })}
                placeholder="https://api.example.com"
                className="rounded-xl"
                dir="ltr"
                data-testid="input-erp-url"
              />
              <p className="text-xs text-gray-500 mt-1">سيتم الجلب من /api/public/products</p>
            </div>
            <div>
              <Label>مفتاح API (اختياري)</Label>
              <Input
                value={newSetting.apiKey}
                onChange={(e) => setNewSetting({ ...newSetting, apiKey: e.target.value })}
                placeholder="API Key"
                className="rounded-xl"
                dir="ltr"
                type="password"
                data-testid="input-erp-api-key"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={newSetting.isActive}
                onCheckedChange={(checked) => setNewSetting({ ...newSetting, isActive: checked })}
                data-testid="switch-erp-active"
              />
              <Label>تفعيل الاتصال</Label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSaveSetting}
                className="flex-1 rounded-xl bg-primary hover:bg-primary/90"
                disabled={!newSetting.warehouseId || !newSetting.erpUrl}
                data-testid="button-save-erp-setting"
              >
                <Check className="w-4 h-4 ml-2" />
                {editingSetting ? 'تحديث' : 'إضافة'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddSettingOpen(false);
                  setEditingSetting(null);
                }}
                className="rounded-xl"
                data-testid="button-cancel-erp-setting"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStaff, setCurrentStaff] = useState<{ id: number; role: string; warehouseId?: number | null } | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<number | null>(null);
  const [newCoupon, setNewCoupon] = useState({
    code: '', type: 'percentage', value: '', minOrder: '', maxDiscount: '', usageLimit: '', endDate: ''
  });
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', icon: '📦', color: 'from-blue-400 to-blue-500' });
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);
  const [newBrand, setNewBrand] = useState({ name: '', logo: '🏷️' });
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [filterStock, setFilterStock] = useState<string>('all');
  const [isAddPromotionOpen, setIsAddPromotionOpen] = useState(false);
  const [isEditPromotionOpen, setIsEditPromotionOpen] = useState(false);
  const [isDeletePromotionOpen, setIsDeletePromotionOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<any>(null);
  const [promotionToDelete, setPromotionToDelete] = useState<any>(null);
  const [newPromotion, setNewPromotion] = useState({
    name: '', type: 'flash_sale', description: '', discountType: 'percentage', discountValue: '',
    targetType: 'all', startDate: '', endDate: '', isActive: true, priority: 0
  });
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dateRange, setDateRange] = useState('week');
  const [selectedTicket, setSelectedTicket] = useState<typeof mockTickets[0] | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<typeof mockShipments[0] | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderFilterStatus, setOrderFilterStatus] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderDateFilter, setOrderDateFilter] = useState('all');
  const [orderWarehouseFilter, setOrderWarehouseFilter] = useState('all');
  const [orderNotes, setOrderNotes] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productSort, setProductSort] = useState('name');
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [productViewMode, setProductViewMode] = useState<'table' | 'grid'>('table');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [newProduct, setNewProduct] = useState({
    name: '', categoryId: '', brandId: '', price: '', originalPrice: '',
    image: '', minOrder: '1', unit: 'كرتون', stock: '100', priceCurrency: 'SYP',
  });
  const [exchangeRate, setExchangeRate] = useState('15000');
  const [productInventory, setProductInventory] = useState<{ warehouseId: number; stock: number }[]>([]);
  const [productPriceTiers, setProductPriceTiers] = useState<{ minQuantity: string; maxQuantity: string; price: string; discountPercent: string }[]>([]);

  // Warehouse management state
  const [isAddWarehouseOpen, setIsAddWarehouseOpen] = useState(false);
  const [isAddCityOpen, setIsAddCityOpen] = useState(false);
  const [newWarehouse, setNewWarehouse] = useState({
    name: '', code: '', cityId: '', address: '', phone: '', capacity: '1000',
  });
  const [newCity, setNewCity] = useState({ name: '', region: '' });
  const [pendingWarehouseDelete, setPendingWarehouseDelete] = useState<{ id: number; name: string; timer: NodeJS.Timeout } | null>(null);

  // Driver management state
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [newDriver, setNewDriver] = useState({
    name: '', phone: '', licenseNumber: '', vehiclePlate: '', vehicleType: 'فان توصيل',
    cityId: '', warehouseId: '', status: 'available', notes: '',
  });

  // Vehicle management state
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [newVehicle, setNewVehicle] = useState({
    plateNumber: '', type: 'فان توصيل', brand: '', model: '', year: '', color: '',
    capacity: '', fuelType: 'ديزل', driverId: '', warehouseId: '', status: 'available', mileage: '0', notes: '',
  });

  // Staff management state
  const [staffSearch, setStaffSearch] = useState('');
  const [staffRoleFilter, setStaffRoleFilter] = useState('all');
  const [staffDepartmentFilter, setStaffDepartmentFilter] = useState('all');
  const [staffStatusFilter, setStaffStatusFilter] = useState('all');
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [isEditStaffOpen, setIsEditStaffOpen] = useState(false);
  const [isDeleteStaffOpen, setIsDeleteStaffOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [permissionsStaff, setPermissionsStaff] = useState<Staff | null>(null);
  const [newStaff, setNewStaff] = useState({
    name: '', email: '', phone: '', password: '', role: 'sales', department: 'المبيعات',
    warehouseId: null as number | null,
    permissions: [] as string[], status: 'active', avatar: ''
  });

  // Loyalty program state
  const [isLoyaltySettingsOpen, setIsLoyaltySettingsOpen] = useState(false);
  const [loyaltySettings, setLoyaltySettings] = useState({
    earnRate: '1',
    earnPerAmount: '10',
    redeemPoints: '100',
    redeemValue: '10',
    validityMonths: '12'
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: products = [], refetch: refetchProducts } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => productsAPI.getAll() as Promise<Product[]>,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll() as Promise<Category[]>,
  });

  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ['brands'],
    queryFn: () => brandsAPI.getAll() as Promise<Brand[]>,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await notificationsAPI.getAll()) as any[],
  });

  const { data: unreadCount = { count: 0 } } = useQuery({
    queryKey: ['unreadNotifications'],
    queryFn: async () => (await notificationsAPI.getUnreadCount()) as { count: number },
  });

  const { data: activityLogs = [] } = useQuery({
    queryKey: ['activityLogs'],
    queryFn: async () => (await activityLogsAPI.getAll(20)) as any[],
  });

  const { data: lowStockProductsData = [] } = useQuery({
    queryKey: ['lowStockProducts'],
    queryFn: async () => (await inventoryAPI.getLowStock(30)) as any[],
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => (await adminAPI.getStats()) as any,
  });

  const { data: adminOrders = [] } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: async () => (await adminAPI.getOrders()) as any[],
  });

  const { data: adminUsers = [] } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => (await adminAPI.getUsers()) as any[],
  });

  const { data: cities = [], refetch: refetchCities } = useQuery<City[]>({
    queryKey: ['cities'],
    queryFn: () => citiesAPI.getAll() as Promise<City[]>,
  });

  const { data: warehousesList = [], refetch: refetchWarehouses } = useQuery<WarehouseData[]>({
    queryKey: ['warehouses'],
    queryFn: () => warehousesAPI.getAll() as Promise<WarehouseData[]>,
  });

  const { data: driversList = [], refetch: refetchDrivers } = useQuery<Driver[]>({
    queryKey: ['drivers'],
    queryFn: () => driversAPI.getAll() as Promise<Driver[]>,
  });

  const { data: vehiclesList = [], refetch: refetchVehicles } = useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesAPI.getAll() as Promise<Vehicle[]>,
  });

  const { data: returnsList = [], refetch: refetchReturns } = useQuery<ReturnRequest[]>({
    queryKey: ['returns'],
    queryFn: () => returnsAPI.getAll() as Promise<ReturnRequest[]>,
  });

  // Banners Query
  const { data: bannersList = [], refetch: refetchBanners } = useQuery<any[]>({
    queryKey: ['banners'],
    queryFn: () => bannersAPI.getAll() as Promise<any[]>,
  });

  // Customer Segments Query
  const { data: segmentsList = [], refetch: refetchSegments } = useQuery<any[]>({
    queryKey: ['segments'],
    queryFn: () => segmentsAPI.getAll() as Promise<any[]>,
  });

  // Suppliers Query
  const { data: suppliersList = [], refetch: refetchSuppliers } = useQuery<any[]>({
    queryKey: ['suppliers'],
    queryFn: () => suppliersAPI.getAll() as Promise<any[]>,
  });

  // Promotions Query
  const { data: promotionsList = [], refetch: refetchPromotions } = useQuery<any[]>({
    queryKey: ['promotions'],
    queryFn: () => promotionsAPI.getAll() as Promise<any[]>,
  });

  // Coupons Query
  const { data: couponsList = [], refetch: refetchCoupons } = useQuery<any[]>({
    queryKey: ['coupons'],
    queryFn: () => couponsAPI.getAll() as Promise<any[]>,
  });

  // Credits/Receivables Query
  const { data: creditsList = [], refetch: refetchCredits } = useQuery<any[]>({
    queryKey: ['credits'],
    queryFn: () => creditsAPI.getAll() as Promise<any[]>,
  });

  // Pending Credits sorted by due date
  const { data: pendingCreditsList = [], refetch: refetchPendingCredits } = useQuery<any[]>({
    queryKey: ['pendingCredits'],
    queryFn: () => creditsAPI.getAllPending() as Promise<any[]>,
  });

  const [selectedCreditUser, setSelectedCreditUser] = useState<any>(null);
  const [creditTransactions, setCreditTransactions] = useState<any[]>([]);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  
  // Map state for order delivery
  const [showDeliveryMap, setShowDeliveryMap] = useState(false);
  const [mapOrderAddress, setMapOrderAddress] = useState<{ lat: number; lng: number; label: string } | null>(null);

  // Product Profit Report Query
  const { data: profitReport, isLoading: profitReportLoading, refetch: refetchProfitReport } = useQuery({
    queryKey: ['productProfitReport'],
    queryFn: () => reportsAPI.getProductProfit(),
  });

  // Expenses Queries
  const { data: expensesList = [], isLoading: expensesLoading, refetch: refetchExpenses } = useQuery<any[]>({
    queryKey: ['expenses'],
    queryFn: () => expensesAPI.getAll() as Promise<any[]>,
  });

  const { data: expenseCategoriesList = [], refetch: refetchExpenseCategories } = useQuery<any[]>({
    queryKey: ['expenseCategories'],
    queryFn: () => expenseCategoriesAPI.getAll() as Promise<any[]>,
  });

  const { data: expenseSummary = { totalExpenses: 0, byCategory: [], byMonth: [] }, refetch: refetchExpenseSummary } = useQuery<{ totalExpenses: number; byCategory: any[]; byMonth: any[] }>({
    queryKey: ['expenseSummary'],
    queryFn: () => expensesAPI.getSummary() as Promise<{ totalExpenses: number; byCategory: any[]; byMonth: any[] }>,
  });

  // Staff Query
  const { data: staffList = [], isLoading: staffLoading, refetch: refetchStaff } = useQuery<Staff[]>({
    queryKey: ['staff'],
    queryFn: () => staffAPI.getAll() as Promise<Staff[]>,
  });

  // Staff Mutations
  const createStaffMutation = useMutation({
    mutationFn: (data: any) => staffAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setIsAddStaffOpen(false);
      setNewStaff({ name: '', email: '', phone: '', password: '', role: 'sales', department: 'المبيعات', warehouseId: null, permissions: [], status: 'active', avatar: '' });
      toast({ title: 'تم إضافة الموظف بنجاح' });
    },
    onError: (error: any) => {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    },
  });

  const updateStaffMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => staffAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setIsEditStaffOpen(false);
      setEditingStaff(null);
      toast({ title: 'تم تحديث الموظف بنجاح' });
    },
    onError: (error: any) => {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    },
  });

  const deleteStaffMutation = useMutation({
    mutationFn: (id: number) => staffAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setIsDeleteStaffOpen(false);
      setStaffToDelete(null);
      toast({ title: 'تم حذف الموظف بنجاح' });
    },
    onError: (error: any) => {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    },
  });

  // Promotions Mutations
  const createPromotionMutation = useMutation({
    mutationFn: (data: any) => promotionsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      setIsAddPromotionOpen(false);
      setNewPromotion({ name: '', type: 'flash_sale', description: '', discountType: 'percentage', discountValue: '', targetType: 'all', startDate: '', endDate: '', isActive: true, priority: 0 });
      toast({ title: 'تم إنشاء العرض بنجاح' });
    },
    onError: (error: any) => {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    },
  });

  const updatePromotionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => promotionsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      setIsEditPromotionOpen(false);
      setEditingPromotion(null);
      toast({ title: 'تم تحديث العرض بنجاح' });
    },
    onError: (error: any) => {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    },
  });

  const deletePromotionMutation = useMutation({
    mutationFn: (id: number) => promotionsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      setIsDeletePromotionOpen(false);
      setPromotionToDelete(null);
      toast({ title: 'تم حذف العرض بنجاح' });
    },
    onError: (error: any) => {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    },
  });

  // Customer Stats Queries
  const { data: customerStats = { total: 0, newThisMonth: 0, vipCount: 0, activeCount: 0, inactiveCount: 0, avgCustomerValue: 0, retentionRate: 0, reorderRate: 0, satisfactionRate: 0, conversionRate: 0 } } = useQuery<any>({
    queryKey: ['customerStats'],
    queryFn: () => customersAPI.getStats(),
  });

  const { data: topCustomers = [] } = useQuery<any[]>({
    queryKey: ['topCustomers'],
    queryFn: () => customersAPI.getTopCustomers(5) as Promise<any[]>,
  });

  const { data: customerGrowthData = [] } = useQuery<any[]>({
    queryKey: ['customerGrowth'],
    queryFn: () => customersAPI.getGrowthData() as Promise<any[]>,
  });

  // Customer search and filter state
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerStatusFilter, setCustomerStatusFilter] = useState('all');
  const [customerCityFilter, setCustomerCityFilter] = useState('all');
  const [showAddCustomerDialog, setShowAddCustomerDialog] = useState(false);
  const [showAddBannerDialog, setShowAddBannerDialog] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [selectedBannerIds, setSelectedBannerIds] = useState<number[]>([]);
  const [bannerSearch, setBannerSearch] = useState('');
  const [bannerStatusFilter, setBannerStatusFilter] = useState('all');
  const [newBanner, setNewBanner] = useState({
    title: '',
    subtitle: '',
    image: '',
    buttonText: 'اطلب الآن',
    buttonLink: '',
    colorClass: 'from-primary to-purple-800',
    position: 0,
    isActive: true,
    startDate: '',
    endDate: '',
    targetAudience: 'all',
    targetCityId: null as number | null,
  });

  const { data: bannerStats = { totalViews: 0, totalClicks: 0, avgCtr: 0 } } = useQuery<any>({
    queryKey: ['bannerStats'],
    queryFn: () => bannersAPI.getStats(),
  });

  // Banner Products State
  const [showBannerProductsDialog, setShowBannerProductsDialog] = useState(false);
  const [managingBanner, setManagingBanner] = useState<any>(null);
  const [bannerProducts, setBannerProducts] = useState<any[]>([]);
  const [loadingBannerProducts, setLoadingBannerProducts] = useState(false);
  const [selectedProductForBanner, setSelectedProductForBanner] = useState<number | null>(null);
  const [productPromoPrice, setProductPromoPrice] = useState('');
  const [productQuantity, setProductQuantity] = useState('1');

  // Banner Viewers State
  const [showBannerViewersDialog, setShowBannerViewersDialog] = useState(false);
  const [viewingBanner, setViewingBanner] = useState<any>(null);
  const [bannerViewers, setBannerViewers] = useState<any[]>([]);
  const [loadingBannerViewers, setLoadingBannerViewers] = useState(false);

  // Customer Segments State
  const [showAddSegmentDialog, setShowAddSegmentDialog] = useState(false);
  const [editingSegment, setEditingSegment] = useState<any>(null);
  const [newSegment, setNewSegment] = useState({
    name: '',
    description: '',
    criteria: '',
    isActive: true,
  });

  // Supplier Management State
  const [showSupplierDetailDialog, setShowSupplierDetailDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [supplierDashboard, setSupplierDashboard] = useState<any>(null);
  const [loadingSupplierDashboard, setLoadingSupplierDashboard] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    code: '',
    contactPerson: '',
    phone: '',
    email: '',
    city: '',
    rating: 5,
    isActive: true,
  });
  const [supplierTransaction, setSupplierTransaction] = useState({
    warehouseId: 0,
    productId: 0,
    quantity: 0,
    unitPrice: '',
    amount: '',
    paymentMethod: 'cash',
    referenceNumber: '',
    notes: '',
  });

  // Expenses State
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showExpenseCategoryDialog, setShowExpenseCategoryDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [editingExpenseCategory, setEditingExpenseCategory] = useState<any>(null);
  const [expenseForm, setExpenseForm] = useState({
    categoryId: undefined as number | undefined,
    amount: '',
    description: '',
    warehouseId: undefined as number | undefined,
    paymentMethod: 'cash',
    reference: '',
    notes: '',
  });
  const [expenseCategoryForm, setExpenseCategoryForm] = useState({
    name: '',
    description: '',
    color: '#6366f1',
  });

  const handleViewSupplierDashboard = async (supplier: any) => {
    setSelectedSupplier(supplier);
    setShowSupplierDetailDialog(true);
    setLoadingSupplierDashboard(true);
    try {
      const dashboard = await suppliersAPI.getDashboard(supplier.id);
      setSupplierDashboard(dashboard);
    } catch (error) {
      console.error('Error fetching supplier dashboard:', error);
      toast({ title: 'حدث خطأ في تحميل بيانات المورد', variant: 'destructive' });
    }
    setLoadingSupplierDashboard(false);
  };

  const handleRecordImport = async () => {
    if (!selectedSupplier || !supplierTransaction.warehouseId || !supplierTransaction.productId || !supplierTransaction.quantity || !supplierTransaction.unitPrice) {
      toast({ title: 'يرجى تعبئة جميع الحقول المطلوبة', variant: 'destructive' });
      return;
    }
    try {
      await suppliersAPI.recordImport(selectedSupplier.id, {
        warehouseId: supplierTransaction.warehouseId,
        productId: supplierTransaction.productId,
        quantity: supplierTransaction.quantity,
        unitPrice: supplierTransaction.unitPrice,
        notes: supplierTransaction.notes,
      });
      toast({ title: 'تم تسجيل الوارد بنجاح', className: 'bg-green-600 text-white' });
      setShowImportDialog(false);
      setSupplierTransaction({ warehouseId: 0, productId: 0, quantity: 0, unitPrice: '', amount: '', paymentMethod: 'cash', referenceNumber: '', notes: '' });
      await handleViewSupplierDashboard(selectedSupplier);
    } catch (error) {
      toast({ title: 'حدث خطأ', variant: 'destructive' });
    }
  };

  const handleRecordExport = async () => {
    if (!selectedSupplier || !supplierTransaction.warehouseId || !supplierTransaction.productId || !supplierTransaction.quantity || !supplierTransaction.unitPrice) {
      toast({ title: 'يرجى تعبئة جميع الحقول المطلوبة', variant: 'destructive' });
      return;
    }
    try {
      await suppliersAPI.recordExport(selectedSupplier.id, {
        warehouseId: supplierTransaction.warehouseId,
        productId: supplierTransaction.productId,
        quantity: supplierTransaction.quantity,
        unitPrice: supplierTransaction.unitPrice,
        notes: supplierTransaction.notes,
      });
      toast({ title: 'تم تسجيل الصادر بنجاح', className: 'bg-green-600 text-white' });
      setShowExportDialog(false);
      setSupplierTransaction({ warehouseId: 0, productId: 0, quantity: 0, unitPrice: '', amount: '', paymentMethod: 'cash', referenceNumber: '', notes: '' });
      await handleViewSupplierDashboard(selectedSupplier);
    } catch (error) {
      toast({ title: 'حدث خطأ', variant: 'destructive' });
    }
  };

  const handleRecordPayment = async () => {
    if (!selectedSupplier || !supplierTransaction.amount || !supplierTransaction.paymentMethod) {
      toast({ title: 'يرجى تعبئة المبلغ وطريقة الدفع', variant: 'destructive' });
      return;
    }
    try {
      await suppliersAPI.recordPayment(selectedSupplier.id, {
        amount: supplierTransaction.amount,
        paymentMethod: supplierTransaction.paymentMethod,
        referenceNumber: supplierTransaction.referenceNumber,
        notes: supplierTransaction.notes,
      });
      toast({ title: 'تم تسجيل الدفعة بنجاح', className: 'bg-green-600 text-white' });
      setShowPaymentDialog(false);
      setSupplierTransaction({ warehouseId: 0, productId: 0, quantity: 0, unitPrice: '', amount: '', paymentMethod: 'cash', referenceNumber: '', notes: '' });
      await handleViewSupplierDashboard(selectedSupplier);
    } catch (error) {
      toast({ title: 'حدث خطأ', variant: 'destructive' });
    }
  };

  const handleSaveSupplier = async () => {
    try {
      if (editingSupplier) {
        await suppliersAPI.update(editingSupplier.id, newSupplier);
        toast({ title: 'تم تحديث المورد بنجاح' });
      } else {
        await suppliersAPI.create(newSupplier);
        toast({ title: 'تم إضافة المورد بنجاح' });
      }
      setIsAddSupplierOpen(false);
      setEditingSupplier(null);
      setNewSupplier({ name: '', code: '', contactPerson: '', phone: '', email: '', city: '', rating: 5, isActive: true });
      refetchSuppliers();
    } catch (error) {
      toast({ title: 'حدث خطأ', variant: 'destructive' });
    }
  };

  const handleDeleteSupplier = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المورد؟')) return;
    try {
      await suppliersAPI.delete(id);
      toast({ title: 'تم حذف المورد' });
      refetchSuppliers();
    } catch (error) {
      toast({ title: 'حدث خطأ', variant: 'destructive' });
    }
  };

  const fetchBannerProducts = async (bannerId: number) => {
    setLoadingBannerProducts(true);
    try {
      const res = await fetch(`/api/banners/${bannerId}/products`);
      const data = await res.json();
      setBannerProducts(data);
    } catch (error) {
      console.error('Error fetching banner products:', error);
    }
    setLoadingBannerProducts(false);
  };

  const handleManageBannerProducts = async (banner: any) => {
    setManagingBanner(banner);
    setShowBannerProductsDialog(true);
    await fetchBannerProducts(banner.id);
  };

  const handleViewBannerViewers = async (banner: any) => {
    setViewingBanner(banner);
    setShowBannerViewersDialog(true);
    setLoadingBannerViewers(true);
    try {
      const viewers = await bannersAPI.getViewers(banner.id);
      setBannerViewers(viewers);
    } catch (error) {
      console.error('Error fetching banner viewers:', error);
    }
    setLoadingBannerViewers(false);
  };

  const handleAddProductToBanner = async () => {
    if (!managingBanner || !selectedProductForBanner || !productPromoPrice) return;
    try {
      await fetch(`/api/banners/${managingBanner.id}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductForBanner,
          promoPrice: productPromoPrice,
          quantity: parseInt(productQuantity) || 1
        })
      });
      await fetchBannerProducts(managingBanner.id);
      setSelectedProductForBanner(null);
      setProductPromoPrice('');
      setProductQuantity('1');
      toast({ title: 'تمت إضافة المنتج للباقة', className: 'bg-green-600 text-white' });
    } catch (error) {
      toast({ title: 'حدث خطأ', variant: 'destructive' });
    }
  };

  const handleRemoveProductFromBanner = async (bannerProductId: number) => {
    try {
      await fetch(`/api/banner-products/${bannerProductId}`, { method: 'DELETE' });
      await fetchBannerProducts(managingBanner.id);
      toast({ title: 'تم إزالة المنتج من الباقة', className: 'bg-green-600 text-white' });
    } catch (error) {
      toast({ title: 'حدث خطأ', variant: 'destructive' });
    }
  };

  // Expense Handlers
  const handleSaveExpense = async () => {
    try {
      if (editingExpense) {
        await expensesAPI.update(editingExpense.id, {
          categoryId: expenseForm.categoryId,
          warehouseId: expenseForm.warehouseId,
          amount: expenseForm.amount,
          description: expenseForm.description,
          notes: expenseForm.notes,
          paymentMethod: expenseForm.paymentMethod,
          reference: expenseForm.reference,
        });
        toast({ title: 'تم تحديث المصروف', className: 'bg-green-600 text-white' });
      } else {
        await expensesAPI.create({
          categoryId: expenseForm.categoryId!,
          warehouseId: expenseForm.warehouseId,
          amount: expenseForm.amount,
          description: expenseForm.description,
          notes: expenseForm.notes,
          paymentMethod: expenseForm.paymentMethod,
          reference: expenseForm.reference,
        });
        toast({ title: 'تم إضافة المصروف', className: 'bg-green-600 text-white' });
      }
      setShowExpenseDialog(false);
      setEditingExpense(null);
      setExpenseForm({ categoryId: undefined, amount: '', description: '', warehouseId: undefined, paymentMethod: 'cash', reference: '', notes: '' });
      refetchExpenses();
      refetchExpenseSummary();
    } catch (error) {
      toast({ title: 'حدث خطأ', variant: 'destructive' });
    }
  };

  const handleDeleteExpense = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المصروف؟')) return;
    try {
      await expensesAPI.delete(id);
      toast({ title: 'تم حذف المصروف', className: 'bg-green-600 text-white' });
      refetchExpenses();
      refetchExpenseSummary();
    } catch (error) {
      toast({ title: 'حدث خطأ', variant: 'destructive' });
    }
  };

  const handleSaveExpenseCategory = async () => {
    try {
      if (editingExpenseCategory) {
        await expenseCategoriesAPI.update(editingExpenseCategory.id, {
          name: expenseCategoryForm.name,
          description: expenseCategoryForm.description,
          color: expenseCategoryForm.color,
        });
        toast({ title: 'تم تحديث الفئة', className: 'bg-green-600 text-white' });
      } else {
        await expenseCategoriesAPI.create({
          name: expenseCategoryForm.name,
          description: expenseCategoryForm.description,
          color: expenseCategoryForm.color,
        });
        toast({ title: 'تم إضافة الفئة', className: 'bg-green-600 text-white' });
      }
      setShowExpenseCategoryDialog(false);
      setEditingExpenseCategory(null);
      setExpenseCategoryForm({ name: '', description: '', color: '#6366f1' });
      refetchExpenseCategories();
    } catch (error) {
      toast({ title: 'حدث خطأ', variant: 'destructive' });
    }
  };

  const handleDeleteExpenseCategory = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفئة؟')) return;
    try {
      await expenseCategoriesAPI.delete(id);
      toast({ title: 'تم حذف الفئة', className: 'bg-green-600 text-white' });
      refetchExpenseCategories();
    } catch (error) {
      toast({ title: 'حدث خطأ', variant: 'destructive' });
    }
  };

  const filteredBanners = bannersList.filter((b: any) => {
    const matchesSearch = bannerSearch === '' || b.title?.toLowerCase().includes(bannerSearch.toLowerCase());
    const matchesStatus = bannerStatusFilter === 'all' || 
      (bannerStatusFilter === 'active' && b.isActive) || 
      (bannerStatusFilter === 'inactive' && !b.isActive);
    return matchesSearch && matchesStatus;
  });
  const [newCustomer, setNewCustomer] = useState({
    phone: '',
    password: '',
    facilityName: '',
    commercialRegister: '',
    taxNumber: '',
    cityId: 0,
  });
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showEditCustomerDialog, setShowEditCustomerDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [customersPage, setCustomersPage] = useState(1);
  const customersPerPage = 20;

  const { data: customerDetails } = useQuery({
    queryKey: ['customerDetails', selectedCustomerId],
    queryFn: () => selectedCustomerId ? customersAPI.getDetails(selectedCustomerId) : null,
    enabled: !!selectedCustomerId,
  });

  useEffect(() => {
    const verifyAuth = async () => {
      const adminAuth = localStorage.getItem('adminAuth');
      if (!adminAuth) {
        setLocation('/admin/login');
        setIsLoading(false);
        return;
      }
      
      try {
        const auth = JSON.parse(adminAuth);
        if (!auth.loggedIn || !auth.staffId) {
          localStorage.removeItem('adminAuth');
          setLocation('/admin/login');
          setIsLoading(false);
          return;
        }
        
        // Verify with server
        const response = await fetch(`/api/auth/staff/verify/${auth.staffId}`, {
          credentials: 'include',
        });
        if (!response.ok) {
          localStorage.removeItem('adminAuth');
          setLocation('/admin/login');
          setIsLoading(false);
          return;
        }
        
        // Store current staff data for warehouse-based filtering
        const data = await response.json();
        setCurrentStaff({
          id: data.staff.id,
          role: data.staff.role,
          warehouseId: data.staff.warehouseId || null
        });
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('adminAuth');
        setLocation('/admin/login');
      }
      setIsLoading(false);
    };
    
    verifyAuth();
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    toast({
      title: 'تم تسجيل الخروج',
      description: 'تم تسجيل خروجك بنجاح',
    });
    setLocation('/admin/login');
  };

  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const lowStockProducts = products.filter(p => p.stock < 30);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const mockOrders = [
    { id: 1001, customer: 'سوبر ماركت الفيصل', phone: '0501234567', items: 5, total: '1,250.00', status: 'pending', time: '10 دقائق', address: 'الرياض' },
    { id: 1002, customer: 'بقالة النور', phone: '0559876543', items: 8, total: '890.50', status: 'processing', time: '25 دقيقة', address: 'جدة' },
    { id: 1003, customer: 'مركز السعادة', phone: '0543216789', items: 12, total: '2,340.00', status: 'shipped', time: '1 ساعة', address: 'الدمام' },
    { id: 1004, customer: 'ميني ماركت الخير', phone: '0567891234', items: 3, total: '450.00', status: 'delivered', time: '3 ساعات', address: 'مكة' },
    { id: 1005, customer: 'سوبرماركت الريان', phone: '0512345678', items: 6, total: '1,100.00', status: 'pending', time: '5 دقائق', address: 'الرياض' },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: any }> = {
      pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      processing: { label: 'قيد التجهيز', color: 'bg-blue-100 text-blue-700', icon: Package },
      shipped: { label: 'قيد التوصيل', color: 'bg-purple-100 text-purple-700', icon: Truck },
      delivered: { label: 'تم التوصيل', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-700', icon: XCircle },
      open: { label: 'مفتوحة', color: 'bg-blue-100 text-blue-700', icon: TicketIcon },
      in_progress: { label: 'قيد المعالجة', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      resolved: { label: 'تم الحل', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      closed: { label: 'مغلقة', color: 'bg-gray-100 text-gray-700', icon: Archive },
      in_transit: { label: 'في الطريق', color: 'bg-blue-100 text-blue-700', icon: Truck },
      out_for_delivery: { label: 'جاري التوصيل', color: 'bg-purple-100 text-purple-700', icon: Navigation },
      preparing: { label: 'قيد التجهيز', color: 'bg-orange-100 text-orange-700', icon: Package },
      approved: { label: 'موافق عليه', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      refunded: { label: 'تم الاسترداد', color: 'bg-emerald-100 text-emerald-700', icon: CircleDollarSign },
      active: { label: 'نشط', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      ended: { label: 'منتهي', color: 'bg-gray-100 text-gray-700', icon: Clock },
    };
    const s = statusMap[status] || statusMap.pending;
    return (
      <Badge className={`${s.color} gap-1`}>
        <s.icon className="w-3 h-3" />
        {s.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { label: string; color: string }> = {
      low: { label: 'منخفضة', color: 'bg-gray-100 text-gray-700' },
      medium: { label: 'متوسطة', color: 'bg-blue-100 text-blue-700' },
      high: { label: 'عالية', color: 'bg-orange-100 text-orange-700' },
      urgent: { label: 'عاجلة', color: 'bg-red-100 text-red-700' },
    };
    const p = priorityMap[priority] || priorityMap.medium;
    return <Badge className={p.color}>{p.label}</Badge>;
  };

  const stats = [
    { title: 'إجمالي المبيعات', value: dashboardStats?.totalRevenue?.toLocaleString('ar-SY') || '0', suffix: 'ل.س', icon: DollarSign, color: 'from-emerald-500 to-emerald-600', change: '+18%', changeType: 'up' },
    { title: 'الطلبات النشطة', value: dashboardStats?.totalOrders?.toLocaleString('ar-SY') || '0', suffix: 'طلب', icon: ShoppingCart, color: 'from-blue-500 to-blue-600', change: '+24%', changeType: 'up' },
    { title: 'العملاء المسجلين', value: dashboardStats?.totalCustomers?.toLocaleString('ar-SY') || '0', suffix: 'عميل', icon: Users, color: 'from-purple-500 to-purple-600', change: '+12%', changeType: 'up' },
    { title: 'منتجات منخفضة المخزون', value: dashboardStats?.lowStockProducts?.toString() || lowStockProductsData.length.toString(), suffix: 'منتج', icon: AlertTriangle, color: 'from-orange-500 to-orange-600', change: lowStockProductsData.length > 10 ? 'تنبيه!' : 'طبيعي', changeType: lowStockProductsData.length > 10 ? 'down' : 'up' },
  ];

  const handleEditProduct = async (product: Product) => {
    setEditingProductId(product.id);
    setNewProduct({
      name: product.name,
      categoryId: product.categoryId.toString(),
      brandId: product.brandId?.toString() || '',
      price: product.price,
      priceCurrency: (product as any).priceCurrency || 'SYP',
      originalPrice: product.originalPrice || '',
      image: product.image,
      minOrder: product.minOrder.toString(),
      unit: product.unit,
      stock: product.stock.toString(),
    });
    
    // Load existing price tiers
    try {
      const tiersRes = await fetch(`/api/products/${product.id}/price-tiers`);
      if (tiersRes.ok) {
        const tiers = await tiersRes.json();
        setProductPriceTiers(tiers.map((t: any) => ({
          minQuantity: t.minQuantity?.toString() || '',
          maxQuantity: t.maxQuantity?.toString() || '',
          price: t.price || '',
          discountPercent: t.discountPercent || '',
        })));
      }
    } catch (error) {
      setProductPriceTiers([]);
    }
    
    setIsAddProductOpen(true);
  };

  const handleAddProduct = async () => {
    try {
      const isEditing = editingProductId !== null;
      const url = isEditing ? `/api/products/${editingProductId}` : '/api/products';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProduct.name,
          categoryId: parseInt(newProduct.categoryId),
          brandId: newProduct.brandId ? parseInt(newProduct.brandId) : null,
          price: newProduct.price,
          priceCurrency: newProduct.priceCurrency,
          originalPrice: newProduct.originalPrice || null,
          image: newProduct.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
          minOrder: parseInt(newProduct.minOrder),
          unit: newProduct.unit,
          stock: parseInt(newProduct.stock),
          inventory: productInventory.filter(inv => inv.stock > 0),
        }),
      });

      if (response.ok) {
        const savedProduct = await response.json();
        const productId = isEditing ? editingProductId : savedProduct.id;
        
        // Save price tiers
        if (productPriceTiers.length > 0) {
          const validTiers = productPriceTiers
            .filter(t => t.minQuantity && t.price)
            .map(t => ({
              minQuantity: parseInt(t.minQuantity),
              maxQuantity: t.maxQuantity ? parseInt(t.maxQuantity) : null,
              price: t.price,
              discountPercent: t.discountPercent || null,
            }));
          
          if (validTiers.length > 0) {
            await fetch(`/api/products/${productId}/price-tiers`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tiers: validTiers }),
            });
          }
        } else if (isEditing) {
          // Clear existing tiers if none specified during edit
          await fetch(`/api/products/${productId}/price-tiers`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tiers: [] }),
          });
        }
        
        toast({ title: isEditing ? 'تم تحديث المنتج بنجاح' : 'تم إضافة المنتج بنجاح', className: 'bg-green-600 text-white' });
        setIsAddProductOpen(false);
        setEditingProductId(null);
        setNewProduct({ name: '', categoryId: '', brandId: '', price: '', originalPrice: '', image: '', minOrder: '1', unit: 'كرتون', stock: '100', priceCurrency: 'SYP' });
        setProductInventory([]);
        setProductPriceTiers([]);
        refetchProducts();
      }
    } catch (error) {
      toast({ title: 'حدث خطأ', variant: 'destructive' });
    }
  };

  const handleAddCategory = async () => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      });

      if (response.ok) {
        toast({ title: 'تم إضافة القسم بنجاح', className: 'bg-green-600 text-white' });
        setIsAddCategoryOpen(false);
        setNewCategory({ name: '', icon: '📦', color: 'from-blue-400 to-blue-500' });
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      }
    } catch (error) {
      toast({ title: 'حدث خطأ', variant: 'destructive' });
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا القسم؟')) return;
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      toast({ title: 'تم حذف القسم', className: 'bg-green-600 text-white' });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch (error) {
      toast({ title: 'حدث خطأ', variant: 'destructive' });
    }
  };

  const handleAddBrand = async () => {
    try {
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBrand),
      });

      if (response.ok) {
        toast({ title: 'تم إضافة العلامة التجارية بنجاح', className: 'bg-green-600 text-white' });
        setIsAddBrandOpen(false);
        setNewBrand({ name: '', logo: '🏷️' });
        queryClient.invalidateQueries({ queryKey: ['brands'] });
      }
    } catch (error) {
      toast({ title: 'حدث خطأ', variant: 'destructive' });
    }
  };

  const handleDeleteBrand = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه العلامة التجارية؟')) return;
    try {
      await fetch(`/api/brands/${id}`, { method: 'DELETE' });
      toast({ title: 'تم حذف العلامة التجارية', className: 'bg-green-600 text-white' });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    } catch (error) {
      toast({ title: 'حدث خطأ', variant: 'destructive' });
    }
  };

  const handleAddCity = async () => {
    try {
      const response = await fetch('/api/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCity.name, region: newCity.region, isActive: true }),
      });
      if (response.ok) {
        toast({ title: 'تم إضافة المدينة بنجاح', className: 'bg-green-600 text-white' });
        setIsAddCityOpen(false);
        setNewCity({ name: '', region: '' });
        refetchCities();
      }
    } catch (error) {
      toast({ title: 'حدث خطأ', variant: 'destructive' });
    }
  };

  const handleDeleteCity = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه المدينة؟ سيتم حذف المستودع المرتبط بها.')) return;
    try {
      const response = await fetch(`/api/cities/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast({ title: 'تم حذف المدينة', className: 'bg-green-600 text-white' });
        refetchCities();
        refetchWarehouses();
      } else {
        const data = await response.json();
        toast({ title: data.error || 'فشل في حذف المدينة', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'حدث خطأ في الاتصال', variant: 'destructive' });
    }
  };

  // Coupon handlers
  const handleAddCoupon = async () => {
    try {
      const response = await couponsAPI.create({
        code: newCoupon.code,
        type: newCoupon.type,
        value: parseFloat(newCoupon.value),
        minOrder: parseFloat(newCoupon.minOrder) || 0,
        maxDiscount: newCoupon.maxDiscount ? parseFloat(newCoupon.maxDiscount) : null,
        usageLimit: parseInt(newCoupon.usageLimit) || 100,
        endDate: newCoupon.endDate || null,
        isActive: true,
        usageCount: 0
      });
      toast({ title: 'تم إنشاء الكوبون بنجاح', className: 'bg-green-600 text-white' });
      setIsAddCouponOpen(false);
      setNewCoupon({ code: '', type: 'percentage', value: '', minOrder: '', maxDiscount: '', usageLimit: '', endDate: '' });
      refetchCoupons();
    } catch (error) {
      toast({ title: 'حدث خطأ في إنشاء الكوبون', variant: 'destructive' });
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكوبون؟')) return;
    try {
      await couponsAPI.delete(id);
      toast({ title: 'تم حذف الكوبون', className: 'bg-green-600 text-white' });
      refetchCoupons();
    } catch (error) {
      toast({ title: 'حدث خطأ في حذف الكوبون', variant: 'destructive' });
    }
  };

  const handleToggleCoupon = async (id: number, isActive: boolean) => {
    try {
      await couponsAPI.update(id, { isActive: !isActive });
      toast({ title: isActive ? 'تم إيقاف الكوبون' : 'تم تنشيط الكوبون', className: 'bg-green-600 text-white' });
      refetchCoupons();
    } catch (error) {
      toast({ title: 'حدث خطأ', variant: 'destructive' });
    }
  };

  const handleEditCoupon = (coupon: any) => {
    setEditingCouponId(coupon.id);
    setNewCoupon({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value?.toString() || '',
      minOrder: coupon.minOrder?.toString() || '',
      maxDiscount: coupon.maxDiscount?.toString() || '',
      usageLimit: coupon.usageLimit?.toString() || '',
      endDate: coupon.endDate || ''
    });
    setIsAddCouponOpen(true);
  };

  const handleUpdateCoupon = async () => {
    if (!editingCouponId) return;
    try {
      await couponsAPI.update(editingCouponId, {
        code: newCoupon.code,
        type: newCoupon.type,
        value: parseFloat(newCoupon.value),
        minOrder: parseFloat(newCoupon.minOrder) || 0,
        maxDiscount: newCoupon.maxDiscount ? parseFloat(newCoupon.maxDiscount) : null,
        usageLimit: parseInt(newCoupon.usageLimit) || 100,
        endDate: newCoupon.endDate || null
      });
      toast({ title: 'تم تحديث الكوبون بنجاح', className: 'bg-green-600 text-white' });
      setIsAddCouponOpen(false);
      setEditingCouponId(null);
      setNewCoupon({ code: '', type: 'percentage', value: '', minOrder: '', maxDiscount: '', usageLimit: '', endDate: '' });
      refetchCoupons();
    } catch (error) {
      toast({ title: 'حدث خطأ في تحديث الكوبون', variant: 'destructive' });
    }
  };

  const handleAddWarehouse = async () => {
    try {
      const response = await fetch('/api/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newWarehouse.name,
          code: newWarehouse.code,
          cityId: parseInt(newWarehouse.cityId),
          address: newWarehouse.address || null,
          phone: newWarehouse.phone || null,
          capacity: parseInt(newWarehouse.capacity),
          isActive: true,
        }),
      });
      if (response.ok) {
        toast({ title: 'تم إضافة المستودع بنجاح', className: 'bg-green-600 text-white' });
        setIsAddWarehouseOpen(false);
        setNewWarehouse({ name: '', code: '', cityId: '', address: '', phone: '', capacity: '1000' });
        refetchWarehouses();
      }
    } catch (error) {
      toast({ title: 'حدث خطأ', variant: 'destructive' });
    }
  };

  const handleDeleteWarehouse = async (id: number) => {
    const warehouse = warehouses.find((w: WarehouseData) => w.id === id);
    const warehouseName = warehouse?.name || `المستودع #${id}`;
    
    // If there's already a pending delete, cancel it first
    if (pendingWarehouseDelete) {
      clearTimeout(pendingWarehouseDelete.timer);
      setPendingWarehouseDelete(null);
    }
    
    // Start a 15-second timer
    const timer = setTimeout(async () => {
      try {
        await fetch(`/api/warehouses/${id}`, { method: 'DELETE' });
        toast({ title: 'تم حذف المستودع بنجاح', className: 'bg-green-600 text-white' });
        refetchWarehouses();
      } catch (error) {
        toast({ title: 'حدث خطأ في حذف المستودع', variant: 'destructive' });
      }
      setPendingWarehouseDelete(null);
    }, 15000);
    
    setPendingWarehouseDelete({ id, name: warehouseName, timer });
    
    // Show sonner toast with undo button
    sonnerToast(`سيتم حذف "${warehouseName}" خلال 15 ثانية`, {
      duration: 15000,
      action: {
        label: 'تراجع',
        onClick: () => {
          clearTimeout(timer);
          setPendingWarehouseDelete(null);
          toast({ title: 'تم إلغاء حذف المستودع', className: 'bg-blue-600 text-white' });
        },
      },
    });
  };

  // Driver handlers
  const handleAddDriver = async () => {
    if (!newDriver.name || !newDriver.phone) {
      toast({ title: 'يرجى ملء الحقول المطلوبة', variant: 'destructive' });
      return;
    }
    try {
      await driversAPI.create({
        ...newDriver,
        cityId: newDriver.cityId ? parseInt(newDriver.cityId) : null,
        warehouseId: newDriver.warehouseId ? parseInt(newDriver.warehouseId) : null,
      });
      toast({ title: 'تم إضافة السائق بنجاح', className: 'bg-green-600 text-white' });
      setIsAddDriverOpen(false);
      setNewDriver({ name: '', phone: '', licenseNumber: '', vehiclePlate: '', vehicleType: 'فان توصيل', cityId: '', warehouseId: '', status: 'available', notes: '' });
      refetchDrivers();
    } catch (error: any) {
      toast({ title: error.message || 'حدث خطأ', variant: 'destructive' });
    }
  };

  const handleEditDriver = async () => {
    if (!editingDriver || !newDriver.name || !newDriver.phone) {
      toast({ title: 'يرجى ملء الحقول المطلوبة', variant: 'destructive' });
      return;
    }
    try {
      await driversAPI.update(editingDriver.id, {
        ...newDriver,
        cityId: newDriver.cityId ? parseInt(newDriver.cityId) : null,
        warehouseId: newDriver.warehouseId ? parseInt(newDriver.warehouseId) : null,
      });
      toast({ title: 'تم تحديث بيانات السائق', className: 'bg-green-600 text-white' });
      setIsAddDriverOpen(false);
      setEditingDriver(null);
      setNewDriver({ name: '', phone: '', licenseNumber: '', vehiclePlate: '', vehicleType: 'فان توصيل', cityId: '', warehouseId: '', status: 'available', notes: '' });
      refetchDrivers();
    } catch (error: any) {
      toast({ title: error.message || 'حدث خطأ', variant: 'destructive' });
    }
  };

  const handleDeleteDriver = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا السائق؟')) return;
    try {
      await driversAPI.delete(id);
      toast({ title: 'تم حذف السائق', className: 'bg-green-600 text-white' });
      refetchDrivers();
    } catch (error) {
      toast({ title: 'حدث خطأ', variant: 'destructive' });
    }
  };

  const openEditDriver = (driver: Driver) => {
    setEditingDriver(driver);
    setNewDriver({
      name: driver.name,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber || '',
      vehiclePlate: driver.vehiclePlate || '',
      vehicleType: driver.vehicleType || 'فان توصيل',
      cityId: driver.cityId?.toString() || '',
      warehouseId: driver.warehouseId?.toString() || '',
      status: driver.status,
      notes: driver.notes || '',
    });
    setIsAddDriverOpen(true);
  };

  const getDriverStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700';
      case 'on_delivery': return 'bg-blue-100 text-blue-700';
      case 'offline': return 'bg-gray-100 text-gray-700';
      case 'on_break': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDriverStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'متاح';
      case 'on_delivery': return 'في مهمة';
      case 'offline': return 'غير متصل';
      case 'on_break': return 'استراحة';
      default: return status;
    }
  };

  // Vehicle handlers
  const handleAddVehicle = async () => {
    if (!newVehicle.plateNumber || !newVehicle.type) {
      toast({ title: 'يرجى ملء الحقول المطلوبة', variant: 'destructive' });
      return;
    }
    try {
      await vehiclesAPI.create({
        ...newVehicle,
        year: newVehicle.year ? parseInt(newVehicle.year) : null,
        mileage: parseInt(newVehicle.mileage) || 0,
        driverId: newVehicle.driverId ? parseInt(newVehicle.driverId) : null,
        warehouseId: newVehicle.warehouseId ? parseInt(newVehicle.warehouseId) : null,
      });
      toast({ title: 'تم إضافة المركبة بنجاح', className: 'bg-green-600 text-white' });
      setIsAddVehicleOpen(false);
      setNewVehicle({ plateNumber: '', type: 'فان توصيل', brand: '', model: '', year: '', color: '', capacity: '', fuelType: 'ديزل', driverId: '', warehouseId: '', status: 'available', mileage: '0', notes: '' });
      refetchVehicles();
    } catch (error: any) {
      toast({ title: error.message || 'حدث خطأ', variant: 'destructive' });
    }
  };

  const handleEditVehicle = async () => {
    if (!editingVehicle || !newVehicle.plateNumber || !newVehicle.type) {
      toast({ title: 'يرجى ملء الحقول المطلوبة', variant: 'destructive' });
      return;
    }
    try {
      await vehiclesAPI.update(editingVehicle.id, {
        ...newVehicle,
        year: newVehicle.year ? parseInt(newVehicle.year) : null,
        mileage: parseInt(newVehicle.mileage) || 0,
        driverId: newVehicle.driverId ? parseInt(newVehicle.driverId) : null,
        warehouseId: newVehicle.warehouseId ? parseInt(newVehicle.warehouseId) : null,
      });
      toast({ title: 'تم تحديث بيانات المركبة', className: 'bg-green-600 text-white' });
      setIsAddVehicleOpen(false);
      setEditingVehicle(null);
      setNewVehicle({ plateNumber: '', type: 'فان توصيل', brand: '', model: '', year: '', color: '', capacity: '', fuelType: 'ديزل', driverId: '', warehouseId: '', status: 'available', mileage: '0', notes: '' });
      refetchVehicles();
    } catch (error: any) {
      toast({ title: error.message || 'حدث خطأ', variant: 'destructive' });
    }
  };

  const handleDeleteVehicle = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه المركبة؟')) return;
    try {
      await vehiclesAPI.delete(id);
      toast({ title: 'تم حذف المركبة', className: 'bg-green-600 text-white' });
      refetchVehicles();
    } catch (error) {
      toast({ title: 'حدث خطأ', variant: 'destructive' });
    }
  };

  const openEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setNewVehicle({
      plateNumber: vehicle.plateNumber,
      type: vehicle.type,
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      year: vehicle.year?.toString() || '',
      color: vehicle.color || '',
      capacity: vehicle.capacity || '',
      fuelType: vehicle.fuelType || 'ديزل',
      driverId: vehicle.driverId?.toString() || '',
      warehouseId: vehicle.warehouseId?.toString() || '',
      status: vehicle.status,
      mileage: vehicle.mileage?.toString() || '0',
      notes: vehicle.notes || '',
    });
    setIsAddVehicleOpen(true);
  };

  const getVehicleStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700';
      case 'in_use': return 'bg-blue-100 text-blue-700';
      case 'maintenance': return 'bg-yellow-100 text-yellow-700';
      case 'out_of_service': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getVehicleStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'متاحة';
      case 'in_use': return 'قيد الاستخدام';
      case 'maintenance': return 'صيانة';
      case 'out_of_service': return 'خارج الخدمة';
      default: return status;
    }
  };

  // Returns handlers
  const handleApproveReturn = async (id: number) => {
    try {
      await returnsAPI.approve(id, 'wallet', 'تمت الموافقة على الاسترجاع');
      toast({ title: 'تمت الموافقة على طلب الاسترجاع', className: 'bg-green-600 text-white' });
      refetchReturns();
    } catch (error: any) {
      toast({ title: error.message || 'حدث خطأ', variant: 'destructive' });
    }
  };

  const handleRejectReturn = async (id: number) => {
    const reason = prompt('سبب الرفض:');
    if (!reason) return;
    try {
      await returnsAPI.reject(id, reason);
      toast({ title: 'تم رفض طلب الاسترجاع', className: 'bg-red-600 text-white' });
      refetchReturns();
    } catch (error: any) {
      toast({ title: error.message || 'حدث خطأ', variant: 'destructive' });
    }
  };

  const getReturnStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'approved': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'refunded': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getReturnStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد المراجعة';
      case 'approved': return 'تمت الموافقة';
      case 'rejected': return 'مرفوض';
      case 'refunded': return 'تم الاسترداد';
      default: return status;
    }
  };

  const getReturnReasonText = (reason: string) => {
    switch (reason) {
      case 'defective': return 'منتج معيب';
      case 'wrong_item': return 'منتج خاطئ';
      case 'damaged': return 'تالف';
      case 'not_as_described': return 'لا يطابق الوصف';
      case 'other': return 'أخرى';
      default: return reason;
    }
  };

  const returnsStats = {
    total: returnsList.length,
    pending: returnsList.filter(r => r.status === 'pending').length,
    approved: returnsList.filter(r => r.status === 'approved').length,
    rejected: returnsList.filter(r => r.status === 'rejected').length,
    refunded: returnsList.filter(r => r.status === 'refunded').length,
    totalRefundAmount: returnsList.filter(r => r.status === 'refunded').reduce((sum, r) => sum + parseFloat(r.refundAmount || '0'), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-primary via-purple-600 to-indigo-700 text-white p-6 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                <LayoutDashboard className="w-7 h-7" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold">لوحة التحكم المتقدمة</h1>
                <p className="text-purple-200 text-sm">إدارة +10,000 عميل • منصة مزود للجملة • الإصدار 2.0</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 relative" onClick={() => setShowNotifications(!showNotifications)}>
                  <Bell className="w-5 h-5" />
                  {unreadCount.count > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold animate-pulse">{unreadCount.count}</span>
                  )}
                </Button>
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute left-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border z-50">
                      <div className="p-4 border-b bg-gray-50 rounded-t-2xl flex items-center justify-between">
                        <h4 className="font-bold text-gray-800">الإشعارات</h4>
                        {unreadCount.count > 0 && <Badge>{unreadCount.count} جديد</Badge>}
                      </div>
                      <ScrollArea className="h-80">
                        {notifications.length > 0 ? notifications.map((notification: any) => (
                          <div key={notification.id} className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}>
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-xl ${notification.type === 'order' ? 'bg-blue-100 text-blue-600' : notification.type === 'stock' ? 'bg-yellow-100 text-yellow-600' : 'bg-purple-100 text-purple-600'} flex items-center justify-center`}>
                                {notification.type === 'order' ? <ShoppingCart className="w-5 h-5" /> : notification.type === 'stock' ? <AlertTriangle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-bold text-gray-800">{notification.title}</p>
                                <p className="text-sm text-gray-600">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{new Date(notification.createdAt).toLocaleDateString('ar-SY')}</p>
                              </div>
                            </div>
                          </div>
                        )) : (
                          <div className="p-8 text-center text-gray-500">
                            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>لا توجد إشعارات</p>
                          </div>
                        )}
                      </ScrollArea>
                      <div className="p-3 bg-gray-50 rounded-b-2xl text-center">
                        <Button variant="link" className="text-primary text-sm">عرض جميع الإشعارات</Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Button size="icon" variant="ghost" className="text-white hover:bg-white/10" onClick={() => refetchProducts()}>
                <RefreshCw className="w-5 h-5" />
              </Button>
              <Link href="/">
                <Button variant="ghost" className="text-white hover:bg-white/10 gap-2">
                  <ArrowRight className="w-5 h-5" />
                  العودة للمتجر
                </Button>
              </Link>
              <Button variant="ghost" className="text-white hover:bg-white/10 gap-2 border border-white/20" onClick={handleLogout} data-testid="button-admin-logout">
                <LogOut className="w-5 h-5" />
                تسجيل الخروج
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-1 w-fit">
            {['today', 'week', 'month', 'year'].map((range) => (
              <Button key={range} size="sm" variant={dateRange === range ? 'secondary' : 'ghost'} className={`rounded-lg text-xs ${dateRange === range ? 'bg-white text-primary' : 'text-white hover:bg-white/10'}`} onClick={() => setDateRange(range)}>
                {range === 'today' ? 'اليوم' : range === 'week' ? 'الأسبوع' : range === 'month' ? 'الشهر' : 'السنة'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className="p-5 border-none shadow-xl bg-white rounded-2xl hover:shadow-2xl transition-all group">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-500 text-xs mb-2">{stat.title}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{stat.value}</span>
                      <span className="text-sm text-gray-400">{stat.suffix}</span>
                    </div>
                    <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${stat.changeType === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.changeType === 'up' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      <span>{stat.change}</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto pb-2 -mx-4 px-4" style={{ WebkitOverflowScrolling: 'touch' }}>
            <TabsList className="bg-white shadow-lg rounded-2xl p-2 mb-6 flex gap-1 h-auto w-max min-w-full">
              <TabsTrigger value="dashboard" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5">
                <LayoutDashboard className="w-4 h-4 ml-2" />الرئيسية
              </TabsTrigger>
              <TabsTrigger value="kpi" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5">
                <Gauge className="w-4 h-4 ml-2" />KPIs
              </TabsTrigger>
              <TabsTrigger value="products" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5">
                <Package className="w-4 h-4 ml-2" />المنتجات
              </TabsTrigger>
              <TabsTrigger value="orders" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5">
                <ClipboardList className="w-4 h-4 ml-2" />الطلبات
              </TabsTrigger>
              <TabsTrigger value="shipments" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5">
                <TruckIcon className="w-4 h-4 ml-2" />الشحنات
              </TabsTrigger>
              <TabsTrigger value="returns" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5">
                <RotateCcw className="w-4 h-4 ml-2" />المرتجعات
              </TabsTrigger>
              <TabsTrigger value="customers" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5">
                <Users className="w-4 h-4 ml-2" />العملاء
              </TabsTrigger>
              <TabsTrigger value="banners" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5">
                <Layers className="w-4 h-4 ml-2" />الشرائح
              </TabsTrigger>
              <TabsTrigger value="segments" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5">
                <Split className="w-4 h-4 ml-2" />شرائح العملاء
              </TabsTrigger>
              <TabsTrigger value="suppliers" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5">
                <Handshake className="w-4 h-4 ml-2" />الموردين
              </TabsTrigger>
              <TabsTrigger value="promotions" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5">
                <Megaphone className="w-4 h-4 ml-2" />العروض
              </TabsTrigger>
              <TabsTrigger value="staff" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5">
                <UserCog className="w-4 h-4 ml-2" />الموظفين
              </TabsTrigger>
              <TabsTrigger value="support" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5">
                <Headphones className="w-4 h-4 ml-2" />الدعم
              </TabsTrigger>
              <TabsTrigger value="loyalty" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5">
                <Gift className="w-4 h-4 ml-2" />الولاء
              </TabsTrigger>
              <TabsTrigger value="coupons" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5">
                <Percent className="w-4 h-4 ml-2" />الكوبونات
              </TabsTrigger>
              <TabsTrigger value="warehouses" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5">
                <Warehouse className="w-4 h-4 ml-2" />المستودعات
              </TabsTrigger>
              <TabsTrigger value="reports" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5">
                <FileText className="w-4 h-4 ml-2" />التقارير
              </TabsTrigger>
              <TabsTrigger value="expenses" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5">
                <Receipt className="w-4 h-4 ml-2" />المصاريف
              </TabsTrigger>
              <TabsTrigger value="analytics" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5">
                <BarChart3 className="w-4 h-4 ml-2" />التحليلات
              </TabsTrigger>
              <TabsTrigger value="credits" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5">
                <CreditCard className="w-4 h-4 ml-2" />الديون
              </TabsTrigger>
              <TabsTrigger value="deposits" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5">
                <Wallet className="w-4 h-4 ml-2" />طلبات الشحن
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5">
                <Settings className="w-4 h-4 ml-2" />الإعدادات
              </TabsTrigger>
              <TabsTrigger value="erp" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5">
                <Network className="w-4 h-4 ml-2" />ERP
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 p-6 border-none shadow-lg rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" />إحصائيات المبيعات</h3>
                  <div className="flex gap-2">
                    <Badge variant="outline"><div className="w-2 h-2 rounded-full bg-primary mr-1"></div>المبيعات</Badge>
                    <Badge variant="outline"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></div>الطلبات</Badge>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={salesData}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                      <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} />
                      <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={12} />
                      <Tooltip contentStyle={{ background: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                      <Legend />
                      <Area yAxisId="left" type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" name="المبيعات (ل.س)" />
                      <Bar yAxisId="right" dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} name="الطلبات" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-blue-500" />النشاط الأخير</h3>
                <div className="space-y-4">
                  {activityLogs.length > 0 ? activityLogs.slice(0, 6).map((log: any) => {
                    const getActivityColor = (entity: string) => {
                      switch(entity) {
                        case 'order': return 'bg-blue-100 text-blue-600';
                        case 'product': return 'bg-green-100 text-green-600';
                        case 'user': return 'bg-purple-100 text-purple-600';
                        default: return 'bg-gray-100 text-gray-600';
                      }
                    };
                    const getActivityIcon = (entity: string) => {
                      switch(entity) {
                        case 'order': return <ShoppingCart className="w-5 h-5" />;
                        case 'product': return <Package className="w-5 h-5" />;
                        case 'user': return <Users className="w-5 h-5" />;
                        default: return <Activity className="w-5 h-5" />;
                      }
                    };
                    return (
                      <motion.div key={log.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
                        <div className={`w-10 h-10 rounded-xl ${getActivityColor(log.entity)} flex items-center justify-center`}>
                          {getActivityIcon(log.entity)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800">{log.action}</p>
                          <p className="text-sm text-gray-600 line-clamp-2">{log.details}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(log.createdAt).toLocaleDateString('ar-SY')}</p>
                        </div>
                      </motion.div>
                    );
                  }) : recentActivities.map((activity) => (
                    <motion.div key={activity.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
                      <div className={`w-10 h-10 rounded-xl ${activity.color} flex items-center justify-center`}>
                        <activity.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 line-clamp-2">{activity.message}</p>
                        <p className="text-xs text-gray-400 mt-1">منذ {activity.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><PieChart className="w-5 h-5 text-purple-500" />التوزيع بالأقسام</h3>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie data={categoryPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                        {categoryPieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {categoryPieData.map((cat) => (
                    <div key={cat.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                      <span className="text-gray-600">{cat.name}</span>
                      <span className="text-gray-400 font-bold mr-auto">{cat.value}%</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="lg:col-span-2 p-6 border-none shadow-lg rounded-2xl">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Timer className="w-5 h-5 text-green-500" />النشاط بالساعة (اليوم)</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyData.slice(8, 22)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="hour" stroke="#9ca3af" fontSize={10} />
                      <YAxis stroke="#9ca3af" fontSize={10} />
                      <Tooltip />
                      <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* KPI Dashboard Tab */}
          <TabsContent value="kpi">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-3 p-6 border-none shadow-lg rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-xl flex items-center gap-2"><Gauge className="w-6 h-6 text-primary" />مؤشرات الأداء الرئيسية (KPIs)</h3>
                  <Button variant="outline" className="rounded-xl gap-2"><Download className="w-4 h-4" />تصدير التقرير</Button>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  {kpiData.map((kpi, index) => (
                    <div key={index} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600">{kpi.name}</span>
                        <div className={`flex items-center gap-1 text-xs font-bold ${kpi.trend === 'up' ? 'text-green-500' : kpi.trend === 'down' && kpi.name.includes('الإلغاء') ? 'text-green-500' : 'text-red-500'}`}>
                          {kpi.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          {kpi.change > 0 ? '+' : ''}{kpi.change}
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">{kpi.value}</span>
                        <span className="text-sm text-gray-400">{kpi.unit}</span>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>الهدف: {kpi.target}{kpi.unit}</span>
                          <span>{Math.round((kpi.value / kpi.target) * 100)}%</span>
                        </div>
                        <Progress value={(kpi.value / kpi.target) * 100} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="lg:col-span-2 p-6 border-none shadow-lg rounded-2xl">
                <h3 className="font-bold text-lg mb-4">قمع التحويل</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={funnelData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                        {funnelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <h3 className="font-bold text-lg mb-4">ملخص الأداء</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-center gap-2 mb-1">
                      <ThumbsUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-bold text-green-700">أداء ممتاز</span>
                    </div>
                    <p className="text-xs text-green-600">معدل رضا العملاء فوق الهدف</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-bold text-yellow-700">يحتاج تحسين</span>
                    </div>
                    <p className="text-xs text-yellow-600">وقت التوصيل أعلى من الهدف</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Info className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-bold text-blue-700">توصية</span>
                    </div>
                    <p className="text-xs text-blue-600">زيادة حملات إعادة الاستهداف</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Shipments Tab - World-Class Shipping Management */}
          <TabsContent value="shipments">
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card className="p-4 border-none shadow-md rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-xs">إجمالي الشحنات</p>
                      <p className="text-2xl font-bold">{adminOrders.length}</p>
                    </div>
                    <TruckIcon className="w-8 h-8 text-blue-200" />
                  </div>
                </Card>
                <Card className="p-4 border-none shadow-md rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-xs">تم التوصيل</p>
                      <p className="text-2xl font-bold">{adminOrders.filter((o: any) => o.status === 'delivered').length}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-200" />
                  </div>
                </Card>
                <Card className="p-4 border-none shadow-md rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-xs">في الطريق</p>
                      <p className="text-2xl font-bold">{adminOrders.filter((o: any) => o.status === 'shipped').length}</p>
                    </div>
                    <Navigation className="w-8 h-8 text-purple-200" />
                  </div>
                </Card>
                <Card className="p-4 border-none shadow-md rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-xs">معدل التوصيل</p>
                      <p className="text-2xl font-bold">{adminOrders.length > 0 ? Math.round((adminOrders.filter((o: any) => o.status === 'delivered').length / adminOrders.length) * 100) : 0}%</p>
                    </div>
                    <Target className="w-8 h-8 text-orange-200" />
                  </div>
                </Card>
                <Card className="p-4 border-none shadow-md rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-cyan-100 text-xs">متوسط وقت التوصيل</p>
                      <p className="text-2xl font-bold">2.4 س</p>
                    </div>
                    <Clock className="w-8 h-8 text-cyan-200" />
                  </div>
                </Card>
                <Card className="p-4 border-none shadow-md rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-pink-100 text-xs">رضا العملاء</p>
                      <p className="text-2xl font-bold">4.8/5</p>
                    </div>
                    <Star className="w-8 h-8 text-pink-200" />
                  </div>
                </Card>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Driver Management */}
                <Card className="p-6 border-none shadow-lg rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      فريق التوصيل ({driversList.length})
                    </h3>
                    <Dialog open={isAddDriverOpen} onOpenChange={(open) => {
                      setIsAddDriverOpen(open);
                      if (!open) {
                        setEditingDriver(null);
                        setNewDriver({ name: '', phone: '', licenseNumber: '', vehiclePlate: '', vehicleType: 'فان توصيل', cityId: '', warehouseId: '', status: 'available', notes: '' });
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="rounded-xl gap-1" data-testid="button-add-driver">
                          <Plus className="w-4 h-4" />إضافة
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader><DialogTitle>{editingDriver ? 'تعديل بيانات السائق' : 'إضافة سائق جديد'}</DialogTitle></DialogHeader>
                        <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>اسم السائق *</Label>
                              <Input placeholder="مثال: أحمد محمد" value={newDriver.name} onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })} data-testid="input-driver-name" />
                            </div>
                            <div>
                              <Label>رقم الهاتف *</Label>
                              <Input placeholder="مثال: 0912345678" value={newDriver.phone} onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })} data-testid="input-driver-phone" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>رقم الرخصة</Label>
                              <Input placeholder="رقم رخصة القيادة" value={newDriver.licenseNumber} onChange={(e) => setNewDriver({ ...newDriver, licenseNumber: e.target.value })} />
                            </div>
                            <div>
                              <Label>رقم لوحة المركبة</Label>
                              <Input placeholder="مثال: دمشق 123456" value={newDriver.vehiclePlate} onChange={(e) => setNewDriver({ ...newDriver, vehiclePlate: e.target.value })} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>نوع المركبة</Label>
                              <Select value={newDriver.vehicleType} onValueChange={(v) => setNewDriver({ ...newDriver, vehicleType: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="فان توصيل">فان توصيل</SelectItem>
                                  <SelectItem value="شاحنة صغيرة">شاحنة صغيرة</SelectItem>
                                  <SelectItem value="شاحنة كبيرة">شاحنة كبيرة</SelectItem>
                                  <SelectItem value="دراجة نارية">دراجة نارية</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>الحالة</Label>
                              <Select value={newDriver.status} onValueChange={(v) => setNewDriver({ ...newDriver, status: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="available">متاح</SelectItem>
                                  <SelectItem value="on_delivery">في مهمة</SelectItem>
                                  <SelectItem value="offline">غير متصل</SelectItem>
                                  <SelectItem value="on_break">استراحة</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>المدينة</Label>
                              <Select value={newDriver.cityId} onValueChange={(v) => setNewDriver({ ...newDriver, cityId: v })}>
                                <SelectTrigger><SelectValue placeholder="اختر المدينة" /></SelectTrigger>
                                <SelectContent>
                                  {cities.map((city) => (<SelectItem key={city.id} value={city.id.toString()}>{city.name}</SelectItem>))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>المستودع</Label>
                              <Select value={newDriver.warehouseId} onValueChange={(v) => setNewDriver({ ...newDriver, warehouseId: v })}>
                                <SelectTrigger><SelectValue placeholder="اختر المستودع" /></SelectTrigger>
                                <SelectContent>
                                  {warehousesList.map((wh) => (<SelectItem key={wh.id} value={wh.id.toString()}>{wh.name}</SelectItem>))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label>ملاحظات</Label>
                            <Textarea placeholder="ملاحظات إضافية..." value={newDriver.notes} onChange={(e) => setNewDriver({ ...newDriver, notes: e.target.value })} rows={2} />
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button className="flex-1 rounded-xl" onClick={editingDriver ? handleEditDriver : handleAddDriver} data-testid="button-save-driver">
                            {editingDriver ? 'حفظ التعديلات' : 'إضافة السائق'}
                          </Button>
                          <Button variant="outline" className="rounded-xl" onClick={() => setIsAddDriverOpen(false)}>إلغاء</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="space-y-3 max-h-[350px] overflow-y-auto">
                    {driversList.length > 0 ? driversList.map((driver) => (
                      <div key={driver.id} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer" data-testid={`driver-card-${driver.id}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                            👨‍✈️
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-sm">{driver.name}</p>
                              <Badge className={`text-xs ${getDriverStatusColor(driver.status)}`}>{getDriverStatusText(driver.status)}</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{driver.phone}</span>
                              <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" />{driver.rating || '5.0'}</span>
                              <span className="flex items-center gap-1"><Package className="w-3 h-3" />{driver.completedDeliveries} توصيل</span>
                            </div>
                            {driver.vehiclePlate && (
                              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                <span className="flex items-center gap-1"><Truck className="w-3 h-3" />{driver.vehiclePlate}</span>
                                {driver.vehicleType && <span>({driver.vehicleType})</span>}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg hover:bg-blue-50 hover:text-blue-600" onClick={() => openEditDriver(driver)}>
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg hover:bg-red-50 hover:text-red-600" onClick={() => handleDeleteDriver(driver.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">لا يوجد سائقين</p>
                        <p className="text-xs">أضف سائقين لإدارة التوصيل</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-700">إجمالي السائقين</span>
                      <span className="font-bold text-blue-700">{driversList.length} سائق</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-blue-700">متاحين الآن</span>
                      <span className="font-bold text-blue-700">{driversList.filter(d => d.status === 'available').length} سائق</span>
                    </div>
                  </div>
                </Card>

                {/* Vehicles Management Card */}
                <Card className="p-6 border-none shadow-lg rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Truck className="w-5 h-5 text-orange-500" />
                      أسطول المركبات ({vehiclesList.length})
                    </h3>
                    <Dialog open={isAddVehicleOpen} onOpenChange={(open) => {
                      setIsAddVehicleOpen(open);
                      if (!open) {
                        setEditingVehicle(null);
                        setNewVehicle({ plateNumber: '', type: 'فان توصيل', brand: '', model: '', year: '', color: '', capacity: '', fuelType: 'ديزل', driverId: '', warehouseId: '', status: 'available', mileage: '0', notes: '' });
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="rounded-xl gap-1" data-testid="button-add-vehicle">
                          <Plus className="w-4 h-4" />إضافة مركبة
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader><DialogTitle>{editingVehicle ? 'تعديل بيانات المركبة' : 'إضافة مركبة جديدة'}</DialogTitle></DialogHeader>
                        <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>رقم اللوحة *</Label>
                              <Input placeholder="مثال: دمشق 123456" value={newVehicle.plateNumber} onChange={(e) => setNewVehicle({ ...newVehicle, plateNumber: e.target.value })} data-testid="input-vehicle-plate" />
                            </div>
                            <div>
                              <Label>نوع المركبة *</Label>
                              <Select value={newVehicle.type} onValueChange={(v) => setNewVehicle({ ...newVehicle, type: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="فان توصيل">فان توصيل</SelectItem>
                                  <SelectItem value="شاحنة صغيرة">شاحنة صغيرة</SelectItem>
                                  <SelectItem value="شاحنة كبيرة">شاحنة كبيرة</SelectItem>
                                  <SelectItem value="دراجة نارية">دراجة نارية</SelectItem>
                                  <SelectItem value="سيارة">سيارة</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label>الماركة</Label>
                              <Input placeholder="مثال: تويوتا" value={newVehicle.brand} onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })} />
                            </div>
                            <div>
                              <Label>الموديل</Label>
                              <Input placeholder="مثال: هايلكس" value={newVehicle.model} onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })} />
                            </div>
                            <div>
                              <Label>سنة الصنع</Label>
                              <Input type="number" placeholder="2020" value={newVehicle.year} onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })} />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label>اللون</Label>
                              <Input placeholder="أبيض" value={newVehicle.color} onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })} />
                            </div>
                            <div>
                              <Label>السعة (طن)</Label>
                              <Input placeholder="2.5" value={newVehicle.capacity} onChange={(e) => setNewVehicle({ ...newVehicle, capacity: e.target.value })} />
                            </div>
                            <div>
                              <Label>نوع الوقود</Label>
                              <Select value={newVehicle.fuelType} onValueChange={(v) => setNewVehicle({ ...newVehicle, fuelType: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="بنزين">بنزين</SelectItem>
                                  <SelectItem value="ديزل">ديزل</SelectItem>
                                  <SelectItem value="كهرباء">كهرباء</SelectItem>
                                  <SelectItem value="هجين">هجين</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>الحالة</Label>
                              <Select value={newVehicle.status} onValueChange={(v) => setNewVehicle({ ...newVehicle, status: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="available">متاحة</SelectItem>
                                  <SelectItem value="in_use">قيد الاستخدام</SelectItem>
                                  <SelectItem value="maintenance">صيانة</SelectItem>
                                  <SelectItem value="out_of_service">خارج الخدمة</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>عداد الكيلومترات</Label>
                              <Input type="number" placeholder="0" value={newVehicle.mileage} onChange={(e) => setNewVehicle({ ...newVehicle, mileage: e.target.value })} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>السائق المسؤول</Label>
                              <Select value={newVehicle.driverId || "none"} onValueChange={(v) => setNewVehicle({ ...newVehicle, driverId: v === "none" ? "" : v })}>
                                <SelectTrigger><SelectValue placeholder="اختر السائق" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">بدون سائق</SelectItem>
                                  {driversList.map((driver) => (<SelectItem key={driver.id} value={driver.id.toString()}>{driver.name}</SelectItem>))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>المستودع</Label>
                              <Select value={newVehicle.warehouseId} onValueChange={(v) => setNewVehicle({ ...newVehicle, warehouseId: v })}>
                                <SelectTrigger><SelectValue placeholder="اختر المستودع" /></SelectTrigger>
                                <SelectContent>
                                  {warehousesList.map((wh) => (<SelectItem key={wh.id} value={wh.id.toString()}>{wh.name}</SelectItem>))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label>ملاحظات</Label>
                            <Textarea placeholder="ملاحظات إضافية..." value={newVehicle.notes} onChange={(e) => setNewVehicle({ ...newVehicle, notes: e.target.value })} rows={2} />
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button className="flex-1 rounded-xl" onClick={editingVehicle ? handleEditVehicle : handleAddVehicle} data-testid="button-save-vehicle">
                            {editingVehicle ? 'حفظ التعديلات' : 'إضافة المركبة'}
                          </Button>
                          <Button variant="outline" className="rounded-xl" onClick={() => setIsAddVehicleOpen(false)}>إلغاء</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="space-y-3 max-h-[350px] overflow-y-auto">
                    {vehiclesList.length > 0 ? vehiclesList.map((vehicle) => (
                      <div key={vehicle.id} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer" data-testid={`vehicle-card-${vehicle.id}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-xl">
                            🚛
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-sm">{vehicle.plateNumber}</p>
                              <Badge className={`text-xs ${getVehicleStatusColor(vehicle.status)}`}>{getVehicleStatusText(vehicle.status)}</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <span className="flex items-center gap-1"><Truck className="w-3 h-3" />{vehicle.type}</span>
                              {vehicle.brand && <span>• {vehicle.brand} {vehicle.model}</span>}
                              {vehicle.capacity && <span>• {vehicle.capacity} طن</span>}
                            </div>
                            {vehicle.driverId && (
                              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" />
                                  {driversList.find(d => d.id === vehicle.driverId)?.name || 'سائق غير معروف'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg hover:bg-blue-50 hover:text-blue-600" onClick={() => openEditVehicle(vehicle)}>
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg hover:bg-red-50 hover:text-red-600" onClick={() => handleDeleteVehicle(vehicle.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-gray-500">
                        <Truck className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">لا توجد مركبات</p>
                        <p className="text-xs">أضف مركبات لإدارة الأسطول</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 p-3 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-orange-700">إجمالي المركبات</span>
                      <span className="font-bold text-orange-700">{vehiclesList.length} مركبة</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-orange-700">متاحة الآن</span>
                      <span className="font-bold text-orange-700">{vehiclesList.filter(v => v.status === 'available').length} مركبة</span>
                    </div>
                  </div>
                </Card>

                {/* Active Shipments with Timeline */}
                <Card className="lg:col-span-2 p-6 border-none shadow-lg rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-xl flex items-center gap-2">
                        <TruckIcon className="w-5 h-5 text-blue-500" />
                        الشحنات النشطة
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">{adminOrders.filter((o: any) => ['processing', 'shipped', 'confirmed'].includes(o.status)).length} شحنة قيد التنفيذ</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="rounded-xl gap-1">
                        <Filter className="w-4 h-4" />تصفية
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-xl gap-1">
                        <Download className="w-4 h-4" />تصدير
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {adminOrders.length > 0 ? adminOrders.filter((o: any) => o.status !== 'delivered' && o.status !== 'cancelled').map((order: any) => (
                      <div key={order.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:border-primary/30 hover:shadow-md transition-all" data-testid={`shipment-order-${order.id}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${order.status === 'shipped' ? 'bg-purple-100 text-purple-600' : order.status === 'processing' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                              {order.status === 'shipped' ? <Truck className="w-6 h-6" /> : order.status === 'processing' ? <Package className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                            </div>
                            <div>
                              <p className="font-bold">طلب #{order.id}</p>
                              <p className="text-sm text-gray-500">{order.user?.facilityName || 'عميل'}</p>
                              <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('ar-SY')}</p>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-primary">{order.total} ل.س</p>
                            {getStatusBadge(order.status)}
                          </div>
                        </div>
                        
                        {/* Shipment Timeline */}
                        <div className="my-4 p-3 bg-white rounded-xl">
                          <div className="flex items-center justify-between">
                            {['استلام', 'تجهيز', 'شحن', 'توصيل'].map((step, idx) => {
                              const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
                              const currentIdx = statusOrder.indexOf(order.status);
                              const isCompleted = idx <= Math.min(currentIdx, 3);
                              const isCurrent = idx === Math.min(currentIdx, 3);
                              return (
                                <div key={step} className="flex flex-col items-center flex-1">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'} ${isCurrent ? 'ring-4 ring-green-200' : ''}`}>
                                    {isCompleted ? <CheckCircle className="w-4 h-4" /> : <span className="text-xs">{idx + 1}</span>}
                                  </div>
                                  <span className={`text-xs mt-1 ${isCompleted ? 'text-green-600 font-medium' : 'text-gray-400'}`}>{step}</span>
                                  {idx < 3 && <div className={`h-0.5 w-full mt-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                          <span className="text-sm text-gray-600">تغيير الحالة:</span>
                          <Select defaultValue={order.status} onValueChange={async (value) => {
                            try {
                              await fetch(`/api/orders/${order.id}/status`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: value }),
                              });
                              toast({ title: 'تم تحديث حالة الطلب', className: 'bg-green-600 text-white' });
                              queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
                            } catch (error) {
                              toast({ title: 'حدث خطأ', variant: 'destructive' });
                            }
                          }}>
                            <SelectTrigger className="w-40 rounded-lg text-sm" data-testid={`shipment-status-${order.id}`}><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">قيد الانتظار</SelectItem>
                              <SelectItem value="confirmed">مؤكد</SelectItem>
                              <SelectItem value="processing">قيد التجهيز</SelectItem>
                              <SelectItem value="shipped">قيد التوصيل</SelectItem>
                              <SelectItem value="delivered">تم التوصيل</SelectItem>
                              <SelectItem value="cancelled">ملغي</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" variant="outline" className="rounded-lg mr-auto gap-1">
                            <Phone className="w-4 h-4" />اتصال
                          </Button>
                          <Button size="sm" variant="outline" className="rounded-lg gap-1">
                            <MapPin className="w-4 h-4" />تتبع
                          </Button>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-12 text-gray-500">
                        <Truck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p>لا توجد شحنات نشطة</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Analytics Row */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Delivery by Region */}
                <Card className="p-6 border-none shadow-lg rounded-2xl">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-red-500" />
                    التوزيع الجغرافي للشحنات
                  </h3>
                  <div className="space-y-3">
                    {[
                      { city: 'دمشق', orders: 156, percentage: 35, color: 'bg-blue-500' },
                      { city: 'حلب', orders: 98, percentage: 22, color: 'bg-green-500' },
                      { city: 'حمص', orders: 67, percentage: 15, color: 'bg-purple-500' },
                      { city: 'اللاذقية', orders: 54, percentage: 12, color: 'bg-orange-500' },
                      { city: 'طرطوس', orders: 38, percentage: 9, color: 'bg-pink-500' },
                      { city: 'محافظات أخرى', orders: 31, percentage: 7, color: 'bg-gray-500' },
                    ].map((region, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-24 text-sm font-medium">{region.city}</span>
                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${region.color} rounded-full flex items-center justify-end pr-2`} style={{ width: `${region.percentage}%` }}>
                            <span className="text-xs text-white font-bold">{region.orders}</span>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500 w-12">{region.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Delivery Performance */}
                <Card className="p-6 border-none shadow-lg rounded-2xl">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    أداء التوصيل
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-700 font-medium">في الوقت</span>
                      </div>
                      <p className="text-3xl font-bold text-green-700">87%</p>
                      <p className="text-xs text-green-600 mt-1">+5% عن الشهر الماضي</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <span className="text-sm text-yellow-700 font-medium">متأخر قليلاً</span>
                      </div>
                      <p className="text-3xl font-bold text-yellow-700">10%</p>
                      <p className="text-xs text-yellow-600 mt-1">-2% عن الشهر الماضي</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="text-sm text-red-700 font-medium">فشل التوصيل</span>
                      </div>
                      <p className="text-3xl font-bold text-red-700">3%</p>
                      <p className="text-xs text-red-600 mt-1">-1% عن الشهر الماضي</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <RotateCcw className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-blue-700 font-medium">إعادة جدولة</span>
                      </div>
                      <p className="text-3xl font-bold text-blue-700">0%</p>
                      <p className="text-xs text-blue-600 mt-1">مستقر</p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-blue-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">معدل OTIF (في الوقت وكامل)</p>
                        <p className="text-xs text-gray-500">On-Time In-Full Delivery Rate</p>
                      </div>
                      <div className="text-left">
                        <p className="text-2xl font-bold text-primary">94.5%</p>
                        <p className="text-xs text-green-600">+3.2% هذا الأسبوع</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Carrier & Fleet Management */}
              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Truck className="w-5 h-5 text-indigo-500" />
                    إدارة الأسطول والناقلين
                  </h3>
                  <Button size="sm" className="rounded-xl gap-1">
                    <Plus className="w-4 h-4" />إضافة مركبة
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { plate: 'دمشق 123456', type: 'شاحنة صغيرة', driver: 'أحمد محمد', status: 'نشط', capacity: '1.5 طن', trips: 12, fuel: 75 },
                    { plate: 'حلب 789012', type: 'فان توصيل', driver: 'سعيد العلي', status: 'في مهمة', capacity: '800 كغ', trips: 8, fuel: 45 },
                    { plate: 'حمص 345678', type: 'شاحنة كبيرة', driver: 'خالد السالم', status: 'نشط', capacity: '5 طن', trips: 5, fuel: 90 },
                    { plate: 'اللاذقية 901234', type: 'فان توصيل', driver: 'ياسر الحسين', status: 'صيانة', capacity: '800 كغ', trips: 0, fuel: 30 },
                  ].map((vehicle, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/30 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={`${vehicle.status === 'نشط' ? 'bg-green-100 text-green-700' : vehicle.status === 'في مهمة' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {vehicle.status}
                        </Badge>
                        <span className="text-xs text-gray-500">{vehicle.type}</span>
                      </div>
                      <p className="font-bold text-lg mb-1 font-mono">{vehicle.plate}</p>
                      <p className="text-sm text-gray-600 mb-3">{vehicle.driver}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">السعة</span>
                          <span className="font-medium">{vehicle.capacity}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">الرحلات اليوم</span>
                          <span className="font-medium">{vehicle.trips}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-500">الوقود</span>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${vehicle.fuel > 50 ? 'bg-green-500' : vehicle.fuel > 25 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${vehicle.fuel}%` }} />
                          </div>
                          <span className="font-medium">{vehicle.fuel}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Status Summary */}
              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <h3 className="font-bold text-lg mb-4">ملخص حالات الشحن</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-center">
                    <Clock className="w-8 h-8 mx-auto text-yellow-600 mb-2" />
                    <p className="text-2xl font-bold text-yellow-700">{adminOrders.filter((o: any) => o.status === 'pending').length}</p>
                    <p className="text-xs text-yellow-600">قيد الانتظار</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 text-center">
                    <CheckCircle className="w-8 h-8 mx-auto text-orange-600 mb-2" />
                    <p className="text-2xl font-bold text-orange-700">{adminOrders.filter((o: any) => o.status === 'confirmed').length}</p>
                    <p className="text-xs text-orange-600">مؤكد</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
                    <Package className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                    <p className="text-2xl font-bold text-blue-700">{adminOrders.filter((o: any) => o.status === 'processing').length}</p>
                    <p className="text-xs text-blue-600">قيد التجهيز</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 text-center">
                    <Truck className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                    <p className="text-2xl font-bold text-purple-700">{adminOrders.filter((o: any) => o.status === 'shipped').length}</p>
                    <p className="text-xs text-purple-600">قيد التوصيل</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100 text-center">
                    <CheckCircle className="w-8 h-8 mx-auto text-green-600 mb-2" />
                    <p className="text-2xl font-bold text-green-700">{adminOrders.filter((o: any) => o.status === 'delivered').length}</p>
                    <p className="text-xs text-green-600">تم التوصيل</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-center">
                    <XCircle className="w-8 h-8 mx-auto text-red-600 mb-2" />
                    <p className="text-2xl font-bold text-red-700">{adminOrders.filter((o: any) => o.status === 'cancelled').length}</p>
                    <p className="text-xs text-red-600">ملغي</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Returns Tab - World Class */}
          <TabsContent value="returns">
            <div className="space-y-6">
              {/* Returns KPIs Dashboard */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card className="p-4 border-none shadow-lg rounded-2xl bg-gradient-to-br from-gray-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                      <RotateCcw className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{returnsStats.total}</p>
                      <p className="text-xs text-gray-500">إجمالي الطلبات</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border-none shadow-lg rounded-2xl bg-gradient-to-br from-yellow-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-yellow-700">{returnsStats.pending}</p>
                      <p className="text-xs text-yellow-600">قيد المراجعة</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border-none shadow-lg rounded-2xl bg-gradient-to-br from-blue-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-700">{returnsStats.approved}</p>
                      <p className="text-xs text-blue-600">موافق عليها</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border-none shadow-lg rounded-2xl bg-gradient-to-br from-red-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-700">{returnsStats.rejected}</p>
                      <p className="text-xs text-red-600">مرفوضة</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border-none shadow-lg rounded-2xl bg-gradient-to-br from-green-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-700">{returnsStats.refunded}</p>
                      <p className="text-xs text-green-600">تم الاسترداد</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border-none shadow-lg rounded-2xl bg-gradient-to-br from-purple-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Banknote className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-purple-700">{returnsStats.totalRefundAmount.toLocaleString('ar-SY')}</p>
                      <p className="text-xs text-purple-600">إجمالي المسترد</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Returns Analytics Charts */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Returns Status Distribution */}
                <Card className="p-6 border-none shadow-lg rounded-2xl">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-primary" />
                    توزيع حالات المرتجعات
                  </h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={[
                            { name: 'قيد المراجعة', value: returnsStats.pending, fill: '#fbbf24' },
                            { name: 'موافق عليها', value: returnsStats.approved, fill: '#3b82f6' },
                            { name: 'مرفوضة', value: returnsStats.rejected, fill: '#ef4444' },
                            { name: 'مستردة', value: returnsStats.refunded, fill: '#22c55e' },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Returns by Reason */}
                <Card className="p-6 border-none shadow-lg rounded-2xl">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-orange-500" />
                    أسباب الاسترجاع
                  </h3>
                  <div className="space-y-3">
                    {[
                      { reason: 'منتج معيب', count: returnsList.filter(r => r.reason === 'defective').length, color: 'bg-red-500' },
                      { reason: 'منتج خاطئ', count: returnsList.filter(r => r.reason === 'wrong_item').length, color: 'bg-orange-500' },
                      { reason: 'تالف', count: returnsList.filter(r => r.reason === 'damaged').length, color: 'bg-yellow-500' },
                      { reason: 'لا يطابق الوصف', count: returnsList.filter(r => r.reason === 'not_as_described').length, color: 'bg-blue-500' },
                      { reason: 'أخرى', count: returnsList.filter(r => r.reason === 'other').length, color: 'bg-gray-500' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        <span className="flex-1 text-sm">{item.reason}</span>
                        <span className="font-bold">{item.count}</span>
                        <div className="w-20">
                          <Progress value={returnsStats.total > 0 ? (item.count / returnsStats.total) * 100 : 0} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Quick Actions */}
                <Card className="p-6 border-none shadow-lg rounded-2xl">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    إجراءات سريعة
                  </h3>
                  <div className="space-y-3">
                    <Button className="w-full rounded-xl justify-start gap-3 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200" variant="outline">
                      <Clock className="w-5 h-5" />
                      مراجعة الطلبات المعلقة ({returnsStats.pending})
                    </Button>
                    <Button className="w-full rounded-xl justify-start gap-3 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200" variant="outline">
                      <Wallet className="w-5 h-5" />
                      معالجة عمليات الاسترداد ({returnsStats.approved})
                    </Button>
                    <Button className="w-full rounded-xl justify-start gap-3 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200" variant="outline">
                      <Download className="w-5 h-5" />
                      تصدير تقرير المرتجعات
                    </Button>
                    <Button className="w-full rounded-xl justify-start gap-3 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200" variant="outline">
                      <BarChart3 className="w-5 h-5" />
                      تحليل أنماط الاسترجاع
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Returns Table */}
              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-xl flex items-center gap-2">
                      <RotateCcw className="w-5 h-5 text-red-500" />
                      قائمة طلبات الاسترجاع
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">{returnsList.length} طلب استرجاع</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input placeholder="بحث..." className="pr-10 rounded-xl w-48" />
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-36 rounded-xl">
                        <SelectValue placeholder="الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع الحالات</SelectItem>
                        <SelectItem value="pending">قيد المراجعة</SelectItem>
                        <SelectItem value="approved">موافق عليها</SelectItem>
                        <SelectItem value="rejected">مرفوضة</SelectItem>
                        <SelectItem value="refunded">مستردة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {returnsList.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-right border-b border-gray-100">
                          <th className="pb-4 font-bold text-gray-600">رقم الطلب</th>
                          <th className="pb-4 font-bold text-gray-600">الطلب الأصلي</th>
                          <th className="pb-4 font-bold text-gray-600">السبب</th>
                          <th className="pb-4 font-bold text-gray-600">المبلغ</th>
                          <th className="pb-4 font-bold text-gray-600">التاريخ</th>
                          <th className="pb-4 font-bold text-gray-600">الحالة</th>
                          <th className="pb-4 font-bold text-gray-600">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {returnsList.map((ret) => (
                          <tr key={ret.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors" data-testid={`return-row-${ret.id}`}>
                            <td className="py-4">
                              <div>
                                <p className="font-bold font-mono text-primary">{ret.returnNumber}</p>
                                <p className="text-xs text-gray-400">#{ret.id}</p>
                              </div>
                            </td>
                            <td className="py-4">
                              <Badge variant="outline" className="font-mono">طلب #{ret.orderId}</Badge>
                            </td>
                            <td className="py-4">
                              <Badge variant="outline" className="bg-gray-50">{getReturnReasonText(ret.reason)}</Badge>
                            </td>
                            <td className="py-4">
                              <span className="font-bold text-lg">{parseFloat(ret.refundAmount || '0').toLocaleString('ar-SY')}</span>
                              <span className="text-xs text-gray-500 mr-1">ل.س</span>
                            </td>
                            <td className="py-4 text-gray-500 text-sm">
                              {new Date(ret.createdAt).toLocaleDateString('ar-SY')}
                            </td>
                            <td className="py-4">
                              <Badge className={`${getReturnStatusColor(ret.status)} border`}>
                                {getReturnStatusText(ret.status)}
                              </Badge>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center gap-1">
                                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg hover:bg-blue-50 hover:text-blue-600">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {ret.status === 'pending' && (
                                  <>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-9 w-9 rounded-lg hover:bg-green-50 hover:text-green-600"
                                      onClick={() => handleApproveReturn(ret.id)}
                                      data-testid={`approve-return-${ret.id}`}
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-9 w-9 rounded-lg hover:bg-red-50 hover:text-red-600"
                                      onClick={() => handleRejectReturn(ret.id)}
                                      data-testid={`reject-return-${ret.id}`}
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <RotateCcw className="w-10 h-10 text-gray-300" />
                    </div>
                    <h4 className="font-bold text-lg text-gray-600 mb-2">لا توجد طلبات استرجاع</h4>
                    <p className="text-gray-500 text-sm">ستظهر طلبات الاسترجاع هنا عند وجودها</p>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Banners/Slides Tab */}
          <TabsContent value="banners">
            <div className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <Card className="p-4 border-none shadow-lg rounded-2xl bg-gradient-to-br from-purple-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Layers className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-700">{bannersList.length}</p>
                      <p className="text-xs text-purple-600">إجمالي الشرائح</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border-none shadow-lg rounded-2xl bg-gradient-to-br from-green-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-700">{bannersList.filter((b: any) => b.isActive).length}</p>
                      <p className="text-xs text-green-600">نشط</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border-none shadow-lg rounded-2xl bg-gradient-to-br from-gray-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-700">{bannersList.filter((b: any) => !b.isActive).length}</p>
                      <p className="text-xs text-gray-600">معطل</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border-none shadow-lg rounded-2xl bg-gradient-to-br from-blue-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Eye className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-700">{bannerStats?.totalViews?.toLocaleString() || 0}</p>
                      <p className="text-xs text-blue-600">المشاهدات</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border-none shadow-lg rounded-2xl bg-gradient-to-br from-orange-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                      <MousePointer className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-700">{bannerStats?.totalClicks?.toLocaleString() || 0}</p>
                      <p className="text-xs text-orange-600">النقرات</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border-none shadow-lg rounded-2xl bg-gradient-to-br from-teal-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-teal-700">{(bannerStats?.avgCtr || 0).toFixed(1)}%</p>
                      <p className="text-xs text-teal-600">معدل النقر</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Banners Management Card */}
              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-bold text-xl flex items-center gap-2">
                      <Layers className="w-5 h-5 text-purple-500" />
                      إدارة الشرائح الإعلانية
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">تحكم في البانرات التي تظهر في الصفحة الرئيسية</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedBannerIds.length > 0 && (
                      <Button 
                        variant="outline" 
                        className="rounded-xl gap-2 text-red-600 hover:bg-red-50"
                        onClick={async () => {
                          if (!confirm(`هل أنت متأكد من حذف ${selectedBannerIds.length} شريحة؟`)) return;
                          try {
                            await bannersAPI.bulkDelete(selectedBannerIds);
                            toast({ title: `تم حذف ${selectedBannerIds.length} شريحة`, className: 'bg-green-600 text-white' });
                            setSelectedBannerIds([]);
                            refetchBanners();
                          } catch (error) {
                            toast({ title: 'حدث خطأ', variant: 'destructive' });
                          }
                        }}
                        data-testid="bulk-delete-banners-btn"
                      >
                        <Trash2 className="w-4 h-4" />
                        حذف ({selectedBannerIds.length})
                      </Button>
                    )}
                    <Button className="rounded-xl gap-2" onClick={() => { setEditingBanner(null); setNewBanner({ title: '', subtitle: '', image: '', buttonText: 'اطلب الآن', buttonLink: '', colorClass: 'from-primary to-purple-800', position: bannersList.length, isActive: true, startDate: '', endDate: '', targetAudience: 'all', targetCityId: null }); setShowAddBannerDialog(true); }} data-testid="add-banner-btn">
                      <Plus className="w-4 h-4" />
                      إضافة شريحة
                    </Button>
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      placeholder="بحث في الشرائح..." 
                      className="pr-10 rounded-xl"
                      value={bannerSearch}
                      onChange={(e) => setBannerSearch(e.target.value)}
                      data-testid="banner-search-input"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant={bannerStatusFilter === 'all' ? 'default' : 'outline'} 
                      size="sm" 
                      className="rounded-xl"
                      onClick={() => setBannerStatusFilter('all')}
                    >
                      الكل
                    </Button>
                    <Button 
                      variant={bannerStatusFilter === 'active' ? 'default' : 'outline'} 
                      size="sm" 
                      className="rounded-xl"
                      onClick={() => setBannerStatusFilter('active')}
                    >
                      نشط
                    </Button>
                    <Button 
                      variant={bannerStatusFilter === 'inactive' ? 'default' : 'outline'} 
                      size="sm" 
                      className="rounded-xl"
                      onClick={() => setBannerStatusFilter('inactive')}
                    >
                      معطل
                    </Button>
                  </div>
                </div>

                {filteredBanners.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBanners.map((banner: any, index: number) => (
                      <div key={banner.id} className={`relative group overflow-hidden rounded-2xl shadow-md border ${selectedBannerIds.includes(banner.id) ? 'border-primary ring-2 ring-primary/20' : 'border-gray-100'} hover:shadow-lg transition-all`} data-testid={`banner-card-${banner.id}`}>
                        {/* Selection Checkbox */}
                        <div className="absolute top-2 right-2 z-20">
                          <Checkbox 
                            checked={selectedBannerIds.includes(banner.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedBannerIds([...selectedBannerIds, banner.id]);
                              } else {
                                setSelectedBannerIds(selectedBannerIds.filter(id => id !== banner.id));
                              }
                            }}
                            className="bg-white/90"
                          />
                        </div>
                        
                        {/* Banner Preview */}
                        <div className={`h-32 bg-gradient-to-l ${banner.colorClass || 'from-primary to-purple-800'} p-4 flex flex-col justify-center text-white relative overflow-hidden`}>
                          {banner.image && (
                            <img src={banner.image} alt={banner.title} className="absolute right-0 top-0 h-full w-2/3 object-cover opacity-20" />
                          )}
                          <div className="relative z-10">
                            <h4 className="font-bold text-lg line-clamp-1">{banner.title}</h4>
                            <p className="text-white/80 text-xs line-clamp-1">{banner.subtitle}</p>
                          </div>
                          {/* Status Badge */}
                          <div className="absolute top-2 left-2 flex gap-1">
                            <Badge className={banner.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}>
                              {banner.isActive ? 'نشط' : 'معطل'}
                            </Badge>
                            {banner.startDate && new Date(banner.startDate) > new Date() && (
                              <Badge className="bg-yellow-500 text-white">مجدول</Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Banner Info */}
                        <div className="p-4 bg-white">
                          {/* Stats Row - Enhanced Analytics */}
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 mb-3 border border-blue-100">
                            <div className="grid grid-cols-4 gap-2 text-center">
                              <div>
                                <div className="flex items-center justify-center gap-1 text-blue-600">
                                  <Eye className="w-4 h-4" />
                                  <span className="font-bold text-lg">{banner.viewCount || 0}</span>
                                </div>
                                <p className="text-xs text-gray-500">مشاهدة</p>
                              </div>
                              <div>
                                <div className="flex items-center justify-center gap-1 text-green-600">
                                  <MousePointer className="w-4 h-4" />
                                  <span className="font-bold text-lg">{banner.clickCount || 0}</span>
                                </div>
                                <p className="text-xs text-gray-500">نقرة</p>
                              </div>
                              <div>
                                <div className="flex items-center justify-center gap-1 text-orange-600">
                                  <ShoppingCart className="w-4 h-4" />
                                  <span className="font-bold text-lg">{banner.purchaseCount || 0}</span>
                                </div>
                                <p className="text-xs text-gray-500">مشتري</p>
                              </div>
                              <div>
                                <div className="flex items-center justify-center gap-1 text-purple-600">
                                  <TrendingUp className="w-4 h-4" />
                                  <span className="font-bold text-lg">
                                    {banner.viewCount > 0 ? Math.round((banner.clickCount / banner.viewCount) * 100) : 0}%
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500">معدل النقر</p>
                              </div>
                            </div>
                            {/* Purchase Total */}
                            {(banner.purchaseCount > 0) && (
                              <div className="mt-2 pt-2 border-t border-blue-100 text-center">
                                <span className="text-sm text-gray-600">إجمالي المبيعات: </span>
                                <span className="font-bold text-green-600">{parseFloat(banner.purchaseTotal || 0).toLocaleString('ar-SY')} ل.س</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500">الترتيب: {banner.position + 1}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${banner.targetCityId ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              <MapPin className="w-3 h-3 inline ml-1" />
                              {banner.targetCityId 
                                ? cities.find((c: any) => c.id === banner.targetCityId)?.name || 'غير معروف'
                                : 'جميع المحافظات'}
                            </span>
                          </div>
                          
                          {/* Reorder Buttons - Large for Mobile */}
                          <div className="flex items-center justify-center gap-2 mb-3 bg-gray-50 rounded-xl p-2">
                            <Button 
                              size="lg" 
                              variant="outline" 
                              className="rounded-xl h-12 w-12 p-0 bg-white border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-400 active:scale-95 transition-all touch-manipulation"
                              disabled={index === 0}
                              onClick={async () => {
                                const newOrder = filteredBanners.map((b: any) => b.id);
                                [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                                try {
                                  await bannersAPI.reorder(newOrder);
                                  refetchBanners();
                                  toast({ title: 'تم تغيير الترتيب', className: 'bg-blue-600 text-white' });
                                } catch (error) {
                                  toast({ title: 'حدث خطأ', variant: 'destructive' });
                                }
                              }}
                              data-testid={`move-up-banner-${banner.id}`}
                            >
                              <ChevronUp className="w-6 h-6 text-blue-600" />
                            </Button>
                            <span className="text-sm font-bold text-gray-600 min-w-[3rem] text-center">{index + 1} / {filteredBanners.length}</span>
                            <Button 
                              size="lg" 
                              variant="outline" 
                              className="rounded-xl h-12 w-12 p-0 bg-white border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-400 active:scale-95 transition-all touch-manipulation"
                              disabled={index === filteredBanners.length - 1}
                              onClick={async () => {
                                const newOrder = filteredBanners.map((b: any) => b.id);
                                [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                                try {
                                  await bannersAPI.reorder(newOrder);
                                  refetchBanners();
                                  toast({ title: 'تم تغيير الترتيب', className: 'bg-blue-600 text-white' });
                                } catch (error) {
                                  toast({ title: 'حدث خطأ', variant: 'destructive' });
                                }
                              }}
                              data-testid={`move-down-banner-${banner.id}`}
                            >
                              <ChevronDown className="w-6 h-6 text-blue-600" />
                            </Button>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 rounded-lg text-xs"
                              onClick={() => { setEditingBanner(banner); setNewBanner({ title: banner.title, subtitle: banner.subtitle || '', image: banner.image || '', buttonText: banner.buttonText || 'اطلب الآن', buttonLink: banner.buttonLink || '', colorClass: banner.colorClass || 'from-primary to-purple-800', position: banner.position, isActive: banner.isActive, startDate: banner.startDate ? new Date(banner.startDate).toISOString().slice(0, 16) : '', endDate: banner.endDate ? new Date(banner.endDate).toISOString().slice(0, 16) : '', targetAudience: banner.targetAudience || 'all', targetCityId: banner.targetCityId || null }); setShowAddBannerDialog(true); }}
                              data-testid={`edit-banner-${banner.id}`}
                            >
                              <Edit className="w-3 h-3 ml-1" />
                              تعديل
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="rounded-lg text-xs bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                              title="إدارة منتجات الباقة"
                              onClick={() => handleManageBannerProducts(banner)}
                              data-testid={`manage-products-banner-${banner.id}`}
                            >
                              <Package className="w-3 h-3 ml-1" />
                              المنتجات
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="rounded-lg text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                              title="عرض المشاهدين"
                              onClick={() => handleViewBannerViewers(banner)}
                              data-testid={`view-viewers-banner-${banner.id}`}
                            >
                              <Eye className="w-3 h-3 ml-1" />
                              المشاهدين
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="rounded-lg text-xs"
                              title="نسخ الشريحة"
                              onClick={async () => {
                                try {
                                  await bannersAPI.duplicate(banner.id);
                                  toast({ title: 'تم نسخ الشريحة', className: 'bg-blue-600 text-white' });
                                  refetchBanners();
                                } catch (error) {
                                  toast({ title: 'حدث خطأ', variant: 'destructive' });
                                }
                              }}
                              data-testid={`duplicate-banner-${banner.id}`}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="rounded-lg text-xs"
                              onClick={async () => {
                                try {
                                  await bannersAPI.update(banner.id, { isActive: !banner.isActive });
                                  toast({ title: banner.isActive ? 'تم تعطيل الشريحة' : 'تم تفعيل الشريحة', className: 'bg-blue-600 text-white' });
                                  refetchBanners();
                                } catch (error) {
                                  toast({ title: 'حدث خطأ', variant: 'destructive' });
                                }
                              }}
                              data-testid={`toggle-banner-${banner.id}`}
                            >
                              {banner.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="rounded-lg text-xs text-red-600 hover:bg-red-50"
                              onClick={async () => {
                                if (!confirm('هل أنت متأكد من حذف هذه الشريحة؟')) return;
                                try {
                                  await bannersAPI.delete(banner.id);
                                  toast({ title: 'تم حذف الشريحة', className: 'bg-green-600 text-white' });
                                  refetchBanners();
                                } catch (error) {
                                  toast({ title: 'حدث خطأ', variant: 'destructive' });
                                }
                              }}
                              data-testid={`delete-banner-${banner.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-purple-50 flex items-center justify-center">
                      <Layers className="w-12 h-12 text-purple-300" />
                    </div>
                    <h4 className="font-bold text-xl text-gray-600 mb-2">{bannerSearch || bannerStatusFilter !== 'all' ? 'لا توجد نتائج' : 'لا توجد شرائح إعلانية'}</h4>
                    <p className="text-gray-500 mb-4">{bannerSearch || bannerStatusFilter !== 'all' ? 'جرب تغيير معايير البحث' : 'ابدأ بإضافة شرائح لعرضها في الصفحة الرئيسية'}</p>
                    {!bannerSearch && bannerStatusFilter === 'all' && (
                      <Button className="rounded-xl gap-2" onClick={() => setShowAddBannerDialog(true)}>
                        <Plus className="w-4 h-4" />
                        إضافة أول شريحة
                      </Button>
                    )}
                  </div>
                )}
              </Card>

              {/* Banner Templates */}
              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  قوالب جاهزة
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { title: 'عروض رمضان', subtitle: 'خصومات تصل إلى 50%', color: 'from-emerald-600 to-teal-700', buttonText: 'تسوق الآن' },
                    { title: 'منتجات جديدة', subtitle: 'اكتشف أحدث المنتجات', color: 'from-blue-600 to-indigo-700', buttonText: 'اكتشف' },
                    { title: 'تخفيضات نهاية الأسبوع', subtitle: 'لفترة محدودة', color: 'from-red-600 to-rose-700', buttonText: 'احصل عليها' },
                    { title: 'شحن مجاني', subtitle: 'للطلبات فوق 500,000 ل.س', color: 'from-purple-600 to-violet-700', buttonText: 'اطلب الآن' },
                  ].map((template, i) => (
                    <div 
                      key={i}
                      className={`h-24 bg-gradient-to-l ${template.color} rounded-xl p-3 text-white cursor-pointer hover:scale-105 transition-transform`}
                      onClick={() => {
                        setEditingBanner(null);
                        setNewBanner({
                          title: template.title,
                          subtitle: template.subtitle,
                          image: '',
                          buttonText: template.buttonText,
                          buttonLink: '',
                          colorClass: template.color,
                          position: bannersList.length,
                          isActive: true,
                          startDate: '',
                          endDate: '',
                          targetAudience: 'all',
                          targetCityId: null,
                        });
                        setShowAddBannerDialog(true);
                      }}
                      data-testid={`banner-template-${i}`}
                    >
                      <h4 className="font-bold text-sm">{template.title}</h4>
                      <p className="text-white/80 text-xs">{template.subtitle}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Add/Edit Banner Dialog */}
              <Dialog open={showAddBannerDialog} onOpenChange={setShowAddBannerDialog}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-purple-500" />
                      {editingBanner ? 'تعديل الشريحة' : 'إضافة شريحة جديدة'}
                    </DialogTitle>
                    <DialogDescription>
                      أضف شريحة إعلانية جديدة مع إمكانية ربطها بمنتجات ترويجية
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>العنوان الرئيسي *</Label>
                      <Input 
                        value={newBanner.title} 
                        onChange={(e) => setNewBanner({...newBanner, title: e.target.value})}
                        placeholder="مثال: عروض نهاية الشهر"
                        data-testid="input-banner-title"
                      />
                    </div>
                    <div>
                      <Label>العنوان الفرعي</Label>
                      <Input 
                        value={newBanner.subtitle} 
                        onChange={(e) => setNewBanner({...newBanner, subtitle: e.target.value})}
                        placeholder="مثال: خصومات تصل إلى 50%"
                        data-testid="input-banner-subtitle"
                      />
                    </div>
                    <div>
                      <Label>صورة الشريحة</Label>
                      <ImageUploader 
                        value={newBanner.image} 
                        onChange={(url) => setNewBanner({...newBanner, image: url})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>نص الزر</Label>
                        <Input 
                          value={newBanner.buttonText} 
                          onChange={(e) => setNewBanner({...newBanner, buttonText: e.target.value})}
                          placeholder="اطلب الآن"
                        />
                      </div>
                      <div>
                        <Label>رابط الزر</Label>
                        <Input 
                          value={newBanner.buttonLink} 
                          onChange={(e) => setNewBanner({...newBanner, buttonLink: e.target.value})}
                          placeholder="/offers"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>لون التدرج</Label>
                      <Select value={newBanner.colorClass} onValueChange={(v) => setNewBanner({...newBanner, colorClass: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="from-primary to-purple-800">بنفسجي</SelectItem>
                          <SelectItem value="from-red-600 to-orange-600">أحمر-برتقالي</SelectItem>
                          <SelectItem value="from-green-600 to-emerald-800">أخضر</SelectItem>
                          <SelectItem value="from-blue-500 to-cyan-600">أزرق</SelectItem>
                          <SelectItem value="from-pink-500 to-rose-600">وردي</SelectItem>
                          <SelectItem value="from-yellow-500 to-amber-600">أصفر</SelectItem>
                          <SelectItem value="from-indigo-600 to-violet-700">نيلي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>الترتيب</Label>
                        <Input 
                          type="number"
                          value={newBanner.position} 
                          onChange={(e) => setNewBanner({...newBanner, position: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <Switch 
                          checked={newBanner.isActive} 
                          onCheckedChange={(v) => setNewBanner({...newBanner, isActive: v})}
                        />
                        <Label>نشط</Label>
                      </div>
                    </div>

                    {/* Scheduling */}
                    <div className="p-3 bg-gray-50 rounded-xl space-y-3">
                      <Label className="flex items-center gap-2"><Calendar className="w-4 h-4" /> جدولة العرض (اختياري)</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-500">تاريخ البدء</Label>
                          <Input 
                            type="datetime-local"
                            value={newBanner.startDate} 
                            onChange={(e) => setNewBanner({...newBanner, startDate: e.target.value})}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">تاريخ الانتهاء</Label>
                          <Input 
                            type="datetime-local"
                            value={newBanner.endDate} 
                            onChange={(e) => setNewBanner({...newBanner, endDate: e.target.value})}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Target Audience */}
                    <div>
                      <Label className="flex items-center gap-2"><Users className="w-4 h-4" /> الجمهور المستهدف</Label>
                      <Select value={newBanner.targetAudience} onValueChange={(v) => setNewBanner({...newBanner, targetAudience: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع العملاء</SelectItem>
                          <SelectItem value="vip">عملاء VIP</SelectItem>
                          <SelectItem value="new">العملاء الجدد</SelectItem>
                          <SelectItem value="returning">العملاء العائدون</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Target City/Governorate */}
                    <div>
                      <Label className="flex items-center gap-2"><MapPin className="w-4 h-4" /> المحافظة المستهدفة</Label>
                      <Select 
                        value={newBanner.targetCityId?.toString() || 'all'} 
                        onValueChange={(v) => setNewBanner({...newBanner, targetCityId: v === 'all' ? null : parseInt(v)})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المحافظة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع المحافظات</SelectItem>
                          {cities.map((city: any) => (
                            <SelectItem key={city.id} value={city.id.toString()}>
                              {city.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">اختر محافظة معينة أو "جميع المحافظات" لعرض الشريحة للجميع</p>
                    </div>

                    {/* Preview */}
                    {newBanner.title && (
                      <div className={`h-24 bg-gradient-to-l ${newBanner.colorClass} rounded-xl p-4 text-white relative overflow-hidden`}>
                        {newBanner.image && <img src={newBanner.image} alt="" className="absolute right-0 top-0 h-full w-2/3 object-cover opacity-20" />}
                        <div className="relative z-10">
                          <h4 className="font-bold">{newBanner.title}</h4>
                          <p className="text-white/80 text-xs">{newBanner.subtitle}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4 sticky bottom-0 bg-white py-4 border-t border-gray-100 mt-4">
                      <Button 
                        className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white h-12 text-base font-bold"
                        onClick={async () => {
                          if (!newBanner.title) {
                            toast({ title: 'يرجى إدخال العنوان', variant: 'destructive' });
                            return;
                          }
                          try {
                            if (editingBanner) {
                              await bannersAPI.update(editingBanner.id, newBanner);
                              toast({ title: 'تم تحديث الشريحة بنجاح', className: 'bg-green-600 text-white' });
                            } else {
                              await bannersAPI.create(newBanner);
                              toast({ title: 'تم إضافة الشريحة بنجاح', className: 'bg-green-600 text-white' });
                            }
                            setShowAddBannerDialog(false);
                            refetchBanners();
                          } catch (error: any) {
                            toast({ title: error.message || 'حدث خطأ', variant: 'destructive' });
                          }
                        }}
                        data-testid="save-banner-btn"
                      >
                        {editingBanner ? 'تحديث الشريحة' : 'حفظ الشريحة'}
                      </Button>
                      <Button variant="outline" className="rounded-xl h-12" onClick={() => setShowAddBannerDialog(false)}>
                        إلغاء
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Banner Products Management Dialog */}
              <Dialog open={showBannerProductsDialog} onOpenChange={setShowBannerProductsDialog}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl">إدارة منتجات الباقة</DialogTitle>
                    <DialogDescription>
                      {managingBanner?.title} - أضف منتجات العرض مع سعر العرض الخاص
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    {/* Add Product Section */}
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-purple-600" />
                        إضافة منتج للباقة
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Select
                          value={selectedProductForBanner?.toString() || ''}
                          onValueChange={(val) => setSelectedProductForBanner(parseInt(val))}
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="اختر المنتج" />
                          </SelectTrigger>
                          <SelectContent>
                            {products?.filter((p: any) => !bannerProducts.some(bp => bp.productId === p.id)).map((product: any) => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.name} - {parseFloat(product.price).toLocaleString('ar-SY')} ل.س
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          placeholder="سعر العرض"
                          value={productPromoPrice}
                          onChange={(e) => setProductPromoPrice(e.target.value)}
                          className="rounded-xl"
                        />
                        <Input
                          type="number"
                          placeholder="الكمية"
                          value={productQuantity}
                          onChange={(e) => setProductQuantity(e.target.value)}
                          className="rounded-xl"
                          min="1"
                        />
                      </div>
                      <Button 
                        className="mt-3 rounded-xl w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold text-base"
                        onClick={handleAddProductToBanner}
                        disabled={!selectedProductForBanner || !productPromoPrice}
                        data-testid="add-product-to-banner-btn"
                      >
                        <Plus className="w-5 h-5 ml-2" />
                        إضافة للباقة
                      </Button>
                    </div>

                    {/* Products List */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-600" />
                        منتجات الباقة الحالية ({bannerProducts.length})
                      </h4>

                      {loadingBannerProducts ? (
                        <div className="text-center py-8">
                          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                        </div>
                      ) : bannerProducts.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">لا توجد منتجات في هذه الباقة بعد</p>
                          <p className="text-gray-400 text-sm">أضف منتجات لعرضها على العملاء</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {bannerProducts.map((bp: any) => {
                            const originalPrice = parseFloat(bp.product.originalPrice || bp.product.price);
                            const promoPrice = parseFloat(bp.promoPrice);
                            const discount = Math.round(((originalPrice - promoPrice) / originalPrice) * 100);
                            
                            return (
                              <div key={bp.id} className="flex items-center gap-4 bg-white border rounded-xl p-3">
                                <img 
                                  src={bp.product.image} 
                                  alt={bp.product.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-semibold truncate">{bp.product.name}</h5>
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="text-primary font-bold">{promoPrice.toLocaleString('ar-SY')} ل.س</span>
                                    <span className="text-gray-400 line-through text-xs">{originalPrice.toLocaleString('ar-SY')}</span>
                                    {discount > 0 && (
                                      <Badge className="bg-red-500 text-white text-xs">-{discount}%</Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500">الكمية: {bp.quantity}</p>
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-red-600 hover:bg-red-50 rounded-lg"
                                  onClick={() => handleRemoveProductFromBanner(bp.id)}
                                  data-testid={`remove-banner-product-${bp.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Summary */}
                    {bannerProducts.length > 0 && (
                      <div className="bg-gradient-to-r from-primary/10 to-purple-100 rounded-xl p-4">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">إجمالي الباقة:</span>
                          <span className="text-xl font-bold text-primary">
                            {bannerProducts.reduce((sum: number, bp: any) => sum + (parseFloat(bp.promoPrice) * bp.quantity), 0).toLocaleString('ar-SY')} ل.س
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          رابط العرض: <code className="bg-white px-2 py-0.5 rounded">/promo/{managingBanner?.id}</code>
                        </p>
                      </div>
                    )}

                    <Button 
                      variant="outline" 
                      className="w-full rounded-xl"
                      onClick={() => setShowBannerProductsDialog(false)}
                    >
                      إغلاق
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Banner Viewers Dialog */}
              <Dialog open={showBannerViewersDialog} onOpenChange={setShowBannerViewersDialog}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                      <Eye className="w-5 h-5 text-blue-600" />
                      مشاهدو الشريحة
                    </DialogTitle>
                    <DialogDescription>
                      {viewingBanner?.title} - قائمة المستخدمين الذين شاهدوا هذه الشريحة
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    {loadingBannerViewers ? (
                      <div className="text-center py-8">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                      </div>
                    ) : bannerViewers.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <Eye className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">لا توجد مشاهدات مسجلة بعد</p>
                        <p className="text-gray-400 text-sm">سيتم تسجيل المشاهدات عندما يشاهد العملاء الشريحة</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between bg-blue-50 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                              {bannerViewers.length}
                            </div>
                            <span className="font-semibold">إجمالي المشاهدات</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                              {bannerViewers.filter((v: any) => v.clicked).length}
                            </div>
                            <span className="font-semibold">نقرات</span>
                          </div>
                        </div>

                        <div className="border rounded-xl overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="text-right p-3 text-sm font-semibold">المستخدم</th>
                                <th className="text-right p-3 text-sm font-semibold">وقت المشاهدة</th>
                                <th className="text-center p-3 text-sm font-semibold">نقر</th>
                              </tr>
                            </thead>
                            <tbody>
                              {bannerViewers.slice(0, 50).map((view: any, idx: number) => (
                                <tr key={view.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="p-3">
                                    {view.user ? (
                                      <div className="flex items-center gap-2">
                                        <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                                          {view.user.facilityName?.charAt(0) || view.user.phone?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                          <p className="font-semibold text-sm">{view.user.facilityName || 'غير محدد'}</p>
                                          <p className="text-xs text-gray-500">{view.user.phone}</p>
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400 text-sm">زائر غير مسجل</span>
                                    )}
                                  </td>
                                  <td className="p-3 text-sm text-gray-600">
                                    {new Date(view.viewedAt).toLocaleString('ar-SY', { 
                                      dateStyle: 'short', 
                                      timeStyle: 'short' 
                                    })}
                                  </td>
                                  <td className="p-3 text-center">
                                    {view.clicked ? (
                                      <Badge className="bg-green-100 text-green-700">نعم</Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-gray-400">لا</Badge>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {bannerViewers.length > 50 && (
                            <div className="bg-gray-50 p-3 text-center text-sm text-gray-500">
                              عرض أول 50 من أصل {bannerViewers.length} مشاهدة
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    <Button 
                      variant="outline" 
                      className="w-full rounded-xl"
                      onClick={() => setShowBannerViewersDialog(false)}
                    >
                      إغلاق
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>

          {/* Customer Segments Tab */}
          <TabsContent value="segments">
            <Card className="p-6 border-none shadow-lg rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-xl flex items-center gap-2"><Split className="w-5 h-5 text-indigo-500" />شرائح العملاء والتحليلات</h3>
                  <p className="text-gray-500 text-sm mt-1">{segmentsList.length} شريحة</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="rounded-xl gap-2"
                    onClick={async () => {
                      try {
                        await segmentsAPI.recalculate();
                        toast({ title: 'تم تحديث أعداد العملاء' });
                        refetchSegments();
                      } catch (error) {
                        toast({ title: 'خطأ في التحديث', variant: 'destructive' });
                      }
                    }}
                  >
                    <RefreshCw className="w-4 h-4" />تحديث الأعداد
                  </Button>
                  <Button 
                    className="rounded-xl gap-2"
                    onClick={() => {
                      setEditingSegment(null);
                      setNewSegment({ name: '', description: '', criteria: '', isActive: true });
                      setShowAddSegmentDialog(true);
                    }}
                    data-testid="add-segment-btn"
                  >
                    <Plus className="w-4 h-4" />إنشاء شريحة
                  </Button>
                </div>
              </div>

              {segmentsList.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <Split className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-bold text-gray-600 mb-2">لا توجد شرائح عملاء</h4>
                  <p className="text-gray-500 mb-4">أنشئ شرائح لتقسيم عملائك واستهدافهم بشكل أفضل</p>
                  <Button 
                    className="rounded-xl gap-2"
                    onClick={() => {
                      setEditingSegment(null);
                      setNewSegment({ name: '', description: '', criteria: '', isActive: true });
                      setShowAddSegmentDialog(true);
                    }}
                  >
                    <Plus className="w-4 h-4" />إنشاء أول شريحة
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {segmentsList.map((segment: any) => (
                    <div key={segment.id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all" data-testid={`segment-card-${segment.id}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-lg">{segment.name}</h4>
                        <Badge className={segment.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                          {segment.isActive ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </div>
                      {segment.description && (
                        <p className="text-sm text-gray-500 mb-4">{segment.description}</p>
                      )}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">عدد العملاء</p>
                          <p className="text-xl font-bold">{(segment.customerCount || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">تاريخ الإنشاء</p>
                          <p className="text-sm font-medium">{new Date(segment.createdAt).toLocaleDateString('ar-SY')}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1 rounded-xl text-sm"
                          onClick={() => {
                            setEditingSegment(segment);
                            setNewSegment({
                              name: segment.name,
                              description: segment.description || '',
                              criteria: segment.criteria || '',
                              isActive: segment.isActive,
                            });
                            setShowAddSegmentDialog(true);
                          }}
                          data-testid={`edit-segment-${segment.id}`}
                        >
                          <Edit className="w-4 h-4 ml-2" />تعديل
                        </Button>
                        <Button 
                          variant="outline" 
                          className="rounded-xl text-sm text-red-500 hover:bg-red-50"
                          onClick={async () => {
                            if (confirm('هل أنت متأكد من حذف هذه الشريحة؟')) {
                              try {
                                await segmentsAPI.delete(segment.id);
                                toast({ title: 'تم حذف الشريحة بنجاح' });
                                refetchSegments();
                              } catch (error) {
                                toast({ title: 'خطأ في الحذف', variant: 'destructive' });
                              }
                            }
                          }}
                          data-testid={`delete-segment-${segment.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add/Edit Segment Dialog */}
              <Dialog open={showAddSegmentDialog} onOpenChange={setShowAddSegmentDialog}>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{editingSegment ? 'تعديل الشريحة' : 'إنشاء شريحة جديدة'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>اسم الشريحة *</Label>
                      <Input 
                        className="rounded-xl mt-1" 
                        placeholder="مثال: عملاء VIP"
                        value={newSegment.name}
                        onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
                        data-testid="input-segment-name"
                      />
                    </div>
                    <div>
                      <Label>الوصف</Label>
                      <Input 
                        className="rounded-xl mt-1" 
                        placeholder="وصف الشريحة..."
                        value={newSegment.description}
                        onChange={(e) => setNewSegment({ ...newSegment, description: e.target.value })}
                        data-testid="input-segment-description"
                      />
                    </div>
                    <div>
                      <Label>معايير التصنيف (JSON)</Label>
                      <Input 
                        className="rounded-xl mt-1" 
                        placeholder='{"isVip": true}'
                        value={newSegment.criteria}
                        onChange={(e) => setNewSegment({ ...newSegment, criteria: e.target.value })}
                        data-testid="input-segment-criteria"
                      />
                      <p className="text-xs text-gray-500 mt-1">المعايير المدعومة: isVip, cityId, minOrders</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={newSegment.isActive}
                        onCheckedChange={(checked) => setNewSegment({ ...newSegment, isActive: checked })}
                        data-testid="switch-segment-active"
                      />
                      <Label>شريحة نشطة</Label>
                    </div>
                    <Button 
                      className="w-full rounded-xl"
                      onClick={async () => {
                        if (!newSegment.name.trim()) {
                          toast({ title: 'يرجى إدخال اسم الشريحة', variant: 'destructive' });
                          return;
                        }
                        try {
                          if (editingSegment) {
                            await segmentsAPI.update(editingSegment.id, newSegment);
                            toast({ title: 'تم تحديث الشريحة بنجاح' });
                          } else {
                            await segmentsAPI.create(newSegment);
                            toast({ title: 'تم إنشاء الشريحة بنجاح' });
                          }
                          setShowAddSegmentDialog(false);
                          refetchSegments();
                        } catch (error) {
                          toast({ title: 'حدث خطأ', variant: 'destructive' });
                        }
                      }}
                      data-testid="btn-save-segment"
                    >
                      {editingSegment ? 'حفظ التغييرات' : 'إنشاء الشريحة'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </Card>
          </TabsContent>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers">
            <Card className="p-6 border-none shadow-lg rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-xl flex items-center gap-2"><Handshake className="w-5 h-5 text-green-500" />إدارة الموردين</h3>
                  <p className="text-gray-500 text-sm mt-1">{suppliersList.length} مورد</p>
                </div>
                <Dialog open={isAddSupplierOpen} onOpenChange={(open) => {
                  setIsAddSupplierOpen(open);
                  if (!open) {
                    setEditingSupplier(null);
                    setNewSupplier({ name: '', code: '', contactPerson: '', phone: '', email: '', city: '', rating: 5, isActive: true });
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="rounded-xl gap-2" data-testid="btn-add-supplier"><Plus className="w-4 h-4" />إضافة مورد</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>{editingSupplier ? 'تعديل المورد' : 'إضافة مورد جديد'}</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label>اسم الشركة</Label><Input className="rounded-xl mt-1" placeholder="شركة..." value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} data-testid="input-supplier-name" /></div>
                        <div><Label>الكود</Label><Input className="rounded-xl mt-1" placeholder="SUP-XXX" value={newSupplier.code} onChange={e => setNewSupplier({...newSupplier, code: e.target.value})} data-testid="input-supplier-code" /></div>
                        <div><Label>جهة الاتصال</Label><Input className="rounded-xl mt-1" placeholder="الاسم" value={newSupplier.contactPerson} onChange={e => setNewSupplier({...newSupplier, contactPerson: e.target.value})} data-testid="input-supplier-contact" /></div>
                        <div><Label>رقم الهاتف</Label><Input className="rounded-xl mt-1" placeholder="05XXXXXXXX" value={newSupplier.phone} onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})} data-testid="input-supplier-phone" /></div>
                        <div><Label>البريد الإلكتروني</Label><Input className="rounded-xl mt-1" placeholder="email@company.com" value={newSupplier.email} onChange={e => setNewSupplier({...newSupplier, email: e.target.value})} data-testid="input-supplier-email" /></div>
                        <div><Label>المدينة</Label><Input className="rounded-xl mt-1" placeholder="دمشق" value={newSupplier.city} onChange={e => setNewSupplier({...newSupplier, city: e.target.value})} data-testid="input-supplier-city" /></div>
                      </div>
                      <Button className="w-full rounded-xl" onClick={handleSaveSupplier} data-testid="btn-save-supplier">{editingSupplier ? 'حفظ التغييرات' : 'إضافة المورد'}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-right border-b border-gray-100">
                      <th className="pb-4 font-bold text-gray-600">المورد</th>
                      <th className="pb-4 font-bold text-gray-600">جهة الاتصال</th>
                      <th className="pb-4 font-bold text-gray-600">المدينة</th>
                      <th className="pb-4 font-bold text-gray-600">التقييم</th>
                      <th className="pb-4 font-bold text-gray-600">الحالة</th>
                      <th className="pb-4 font-bold text-gray-600">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliersList.length === 0 ? (
                      <tr><td colSpan={6} className="py-8 text-center text-gray-500">لا يوجد موردون حتى الآن</td></tr>
                    ) : (
                      suppliersList.map((supplier: any) => (
                        <tr key={supplier.id} className="border-b border-gray-50 hover:bg-gray-50" data-testid={`row-supplier-${supplier.id}`}>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold">{supplier.name?.charAt(0) || 'م'}</div>
                              <div>
                                <p className="font-bold">{supplier.name}</p>
                                <p className="text-xs text-gray-500">{supplier.code}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <div>
                              <p className="font-medium">{supplier.contactPerson}</p>
                              <p className="text-xs text-gray-500">{supplier.phone}</p>
                            </div>
                          </td>
                          <td className="py-4">{supplier.city}</td>
                          <td className="py-4">
                            <div className="flex items-center gap-1">
                              {Array.from({ length: supplier.rating || 5 }).map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </td>
                          <td className="py-4">
                            <Badge className={supplier.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                              {supplier.isActive ? 'نشط' : 'غير نشط'}
                            </Badge>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-1">
                              <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg hover:bg-blue-50 hover:text-blue-600" onClick={() => handleViewSupplierDashboard(supplier)} data-testid={`btn-view-supplier-${supplier.id}`}><Eye className="w-4 h-4" /></Button>
                              <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg hover:bg-purple-50 hover:text-purple-600" onClick={() => { setEditingSupplier(supplier); setNewSupplier(supplier); setIsAddSupplierOpen(true); }} data-testid={`btn-edit-supplier-${supplier.id}`}><Edit className="w-4 h-4" /></Button>
                              <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg hover:bg-red-50 hover:text-red-600" onClick={() => handleDeleteSupplier(supplier.id)} data-testid={`btn-delete-supplier-${supplier.id}`}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Supplier Detail Dialog */}
            <Dialog open={showSupplierDetailDialog} onOpenChange={setShowSupplierDetailDialog}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Handshake className="w-5 h-5 text-green-600" />
                    تفاصيل المورد: {selectedSupplier?.name}
                  </DialogTitle>
                </DialogHeader>
                {loadingSupplierDashboard ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : supplierDashboard && (
                  <div className="space-y-6 mt-4">
                    {/* Balance Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500">إجمالي الواردات</p>
                        <p className="text-xl font-bold text-blue-700">{Number(supplierDashboard.balance?.totalImports || 0).toLocaleString()} ل.س</p>
                      </div>
                      <div className="bg-orange-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500">إجمالي الصادرات</p>
                        <p className="text-xl font-bold text-orange-700">{Number(supplierDashboard.balance?.totalExports || 0).toLocaleString()} ل.س</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500">إجمالي المدفوعات</p>
                        <p className="text-xl font-bold text-green-700">{Number(supplierDashboard.balance?.totalPayments || 0).toLocaleString()} ل.س</p>
                      </div>
                      <div className={`rounded-xl p-4 ${Number(supplierDashboard.balance?.balance || 0) >= 0 ? 'bg-red-50' : 'bg-purple-50'}`}>
                        <p className="text-xs text-gray-500">الرصيد المستحق</p>
                        <p className={`text-xl font-bold ${Number(supplierDashboard.balance?.balance || 0) >= 0 ? 'text-red-700' : 'text-purple-700'}`}>{Number(supplierDashboard.balance?.balance || 0).toLocaleString()} ل.س</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-wrap">
                      <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setShowImportDialog(true)} data-testid="btn-record-import">
                        <ArrowDownRight className="w-4 h-4" />تسجيل وارد
                      </Button>
                      <Button variant="outline" className="gap-2 border-orange-500 text-orange-600 hover:bg-orange-50" onClick={() => setShowExportDialog(true)} data-testid="btn-record-export">
                        <ArrowUpRight className="w-4 h-4" />تسجيل صادر
                      </Button>
                      <Button variant="outline" className="gap-2 border-green-500 text-green-600 hover:bg-green-50" onClick={() => setShowPaymentDialog(true)} data-testid="btn-record-payment">
                        <DollarSign className="w-4 h-4" />تسجيل دفعة
                      </Button>
                    </div>

                    {/* Stock Positions */}
                    <div>
                      <h4 className="font-bold mb-3 flex items-center gap-2"><Package className="w-4 h-4" />مخزون المورد في المستودعات</h4>
                      {supplierDashboard.stockPositions?.length > 0 ? (
                        <div className="bg-gray-50 rounded-xl overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="p-3 text-right">المنتج</th>
                                <th className="p-3 text-right">المستودع</th>
                                <th className="p-3 text-right">الكمية</th>
                                <th className="p-3 text-right">متوسط التكلفة</th>
                                <th className="p-3 text-right">القيمة الإجمالية</th>
                              </tr>
                            </thead>
                            <tbody>
                              {supplierDashboard.stockPositions.map((pos: any) => {
                                const prod = products.find((p: any) => p.id === pos.productId);
                                const wh = warehousesList.find((w: any) => w.id === pos.warehouseId);
                                return (
                                  <tr key={pos.id} className="border-b border-gray-100">
                                    <td className="p-3 font-medium">{prod?.name || `#${pos.productId}`}</td>
                                    <td className="p-3">{wh?.name || `#${pos.warehouseId}`}</td>
                                    <td className="p-3 font-bold">{pos.quantity}</td>
                                    <td className="p-3">{Number(pos.avgCost || 0).toLocaleString()} ل.س</td>
                                    <td className="p-3 font-bold text-green-600">{(pos.quantity * Number(pos.avgCost || 0)).toLocaleString()} ل.س</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">لا يوجد مخزون مسجل لهذا المورد</p>
                      )}
                    </div>

                    {/* Recent Transactions */}
                    <div>
                      <h4 className="font-bold mb-3 flex items-center gap-2"><FileText className="w-4 h-4" />آخر المعاملات</h4>
                      {supplierDashboard.recentTransactions?.length > 0 ? (
                        <div className="bg-gray-50 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-100 sticky top-0">
                              <tr>
                                <th className="p-3 text-right">النوع</th>
                                <th className="p-3 text-right">المنتج</th>
                                <th className="p-3 text-right">الكمية</th>
                                <th className="p-3 text-right">المبلغ</th>
                                <th className="p-3 text-right">التاريخ</th>
                              </tr>
                            </thead>
                            <tbody>
                              {supplierDashboard.recentTransactions.map((tx: any) => {
                                const prod = products.find((p: any) => p.id === tx.productId);
                                return (
                                  <tr key={tx.id} className="border-b border-gray-100">
                                    <td className="p-3">
                                      <Badge className={
                                        tx.type === 'import' ? 'bg-blue-100 text-blue-700' :
                                        tx.type === 'export' ? 'bg-orange-100 text-orange-700' :
                                        tx.type === 'payment' ? 'bg-green-100 text-green-700' :
                                        'bg-gray-100 text-gray-700'
                                      }>
                                        {tx.type === 'import' ? 'وارد' : tx.type === 'export' ? 'صادر' : tx.type === 'payment' ? 'دفعة' : tx.type}
                                      </Badge>
                                    </td>
                                    <td className="p-3">{prod?.name || (tx.productId ? `#${tx.productId}` : '-')}</td>
                                    <td className="p-3 font-bold">{tx.quantity || '-'}</td>
                                    <td className="p-3 font-bold">{Number(tx.totalAmount || 0).toLocaleString()} ل.س</td>
                                    <td className="p-3 text-gray-500">{new Date(tx.createdAt).toLocaleDateString('ar-SY')}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">لا يوجد معاملات مسجلة</p>
                      )}
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Import Dialog */}
            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle className="flex items-center gap-2"><ArrowDownRight className="w-5 h-5 text-blue-600" />تسجيل وارد من المورد</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>المستودع</Label>
                    <Select value={String(supplierTransaction.warehouseId)} onValueChange={v => setSupplierTransaction({...supplierTransaction, warehouseId: Number(v)})}>
                      <SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder="اختر المستودع" /></SelectTrigger>
                      <SelectContent>
                        {warehousesList.map((wh: any) => (
                          <SelectItem key={wh.id} value={String(wh.id)}>{wh.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>المنتج</Label>
                    <Select value={String(supplierTransaction.productId)} onValueChange={v => setSupplierTransaction({...supplierTransaction, productId: Number(v)})}>
                      <SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder="اختر المنتج" /></SelectTrigger>
                      <SelectContent>
                        {products.map((p: any) => (
                          <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>الكمية</Label><Input type="number" className="rounded-xl mt-1" value={supplierTransaction.quantity} onChange={e => setSupplierTransaction({...supplierTransaction, quantity: Number(e.target.value)})} /></div>
                    <div><Label>سعر الوحدة</Label><Input className="rounded-xl mt-1" value={supplierTransaction.unitPrice} onChange={e => setSupplierTransaction({...supplierTransaction, unitPrice: e.target.value})} /></div>
                  </div>
                  <div><Label>ملاحظات</Label><Input className="rounded-xl mt-1" value={supplierTransaction.notes} onChange={e => setSupplierTransaction({...supplierTransaction, notes: e.target.value})} /></div>
                  <Button className="w-full rounded-xl bg-blue-600 hover:bg-blue-700" onClick={handleRecordImport}>تسجيل الوارد</Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Export Dialog */}
            <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle className="flex items-center gap-2"><ArrowUpRight className="w-5 h-5 text-orange-600" />تسجيل صادر للمورد</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>المستودع</Label>
                    <Select value={String(supplierTransaction.warehouseId)} onValueChange={v => setSupplierTransaction({...supplierTransaction, warehouseId: Number(v)})}>
                      <SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder="اختر المستودع" /></SelectTrigger>
                      <SelectContent>
                        {warehousesList.map((wh: any) => (
                          <SelectItem key={wh.id} value={String(wh.id)}>{wh.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>المنتج</Label>
                    <Select value={String(supplierTransaction.productId)} onValueChange={v => setSupplierTransaction({...supplierTransaction, productId: Number(v)})}>
                      <SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder="اختر المنتج" /></SelectTrigger>
                      <SelectContent>
                        {products.map((p: any) => (
                          <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>الكمية</Label><Input type="number" className="rounded-xl mt-1" value={supplierTransaction.quantity} onChange={e => setSupplierTransaction({...supplierTransaction, quantity: Number(e.target.value)})} /></div>
                    <div><Label>سعر الوحدة</Label><Input className="rounded-xl mt-1" value={supplierTransaction.unitPrice} onChange={e => setSupplierTransaction({...supplierTransaction, unitPrice: e.target.value})} /></div>
                  </div>
                  <div><Label>ملاحظات</Label><Input className="rounded-xl mt-1" value={supplierTransaction.notes} onChange={e => setSupplierTransaction({...supplierTransaction, notes: e.target.value})} /></div>
                  <Button className="w-full rounded-xl bg-orange-600 hover:bg-orange-700" onClick={handleRecordExport}>تسجيل الصادر</Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Payment Dialog */}
            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-600" />تسجيل دفعة للمورد</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                  <div><Label>المبلغ</Label><Input className="rounded-xl mt-1" value={supplierTransaction.amount} onChange={e => setSupplierTransaction({...supplierTransaction, amount: e.target.value})} placeholder="0" /></div>
                  <div>
                    <Label>طريقة الدفع</Label>
                    <Select value={supplierTransaction.paymentMethod} onValueChange={v => setSupplierTransaction({...supplierTransaction, paymentMethod: v})}>
                      <SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder="اختر طريقة الدفع" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">نقداً</SelectItem>
                        <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                        <SelectItem value="check">شيك</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>رقم المرجع</Label><Input className="rounded-xl mt-1" value={supplierTransaction.referenceNumber} onChange={e => setSupplierTransaction({...supplierTransaction, referenceNumber: e.target.value})} placeholder="رقم الإيصال أو التحويل" /></div>
                  <div><Label>ملاحظات</Label><Input className="rounded-xl mt-1" value={supplierTransaction.notes} onChange={e => setSupplierTransaction({...supplierTransaction, notes: e.target.value})} /></div>
                  <Button className="w-full rounded-xl bg-green-600 hover:bg-green-700" onClick={handleRecordPayment}>تسجيل الدفعة</Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Promotions Tab */}
          <TabsContent value="promotions">
            <Card className="p-6 border-none shadow-lg rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-xl flex items-center gap-2"><Megaphone className="w-5 h-5 text-orange-500" />العروض والحملات الترويجية</h3>
                  <p className="text-gray-500 text-sm mt-1">{promotionsList.length} عرض</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="rounded-xl gap-2" onClick={() => refetchPromotions()}>
                    <RefreshCw className="w-4 h-4" />تحديث
                  </Button>
                  <Dialog open={isAddPromotionOpen} onOpenChange={setIsAddPromotionOpen}>
                    <DialogTrigger asChild>
                      <Button className="rounded-xl gap-2" data-testid="button-add-promotion"><Plus className="w-4 h-4" />إنشاء عرض</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader><DialogTitle>إنشاء عرض ترويجي</DialogTitle></DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div><Label>اسم العرض</Label><Input className="rounded-xl mt-1" placeholder="تخفيضات الصيف" value={newPromotion.name} onChange={(e) => setNewPromotion({...newPromotion, name: e.target.value})} data-testid="input-promotion-name" /></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>نوع العرض</Label>
                            <Select value={newPromotion.type} onValueChange={(v) => setNewPromotion({...newPromotion, type: v})}>
                              <SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder="اختر" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="flash_sale">تخفيض سريع</SelectItem>
                                <SelectItem value="category">على قسم</SelectItem>
                                <SelectItem value="bundle">باندل</SelectItem>
                                <SelectItem value="free_shipping">شحن مجاني</SelectItem>
                                <SelectItem value="banner">بانر إعلاني</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>نوع الخصم</Label>
                            <Select value={newPromotion.discountType} onValueChange={(v) => setNewPromotion({...newPromotion, discountType: v})}>
                              <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentage">نسبة مئوية %</SelectItem>
                                <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div><Label>قيمة الخصم</Label><Input className="rounded-xl mt-1" type="number" placeholder="25" value={newPromotion.discountValue} onChange={(e) => setNewPromotion({...newPromotion, discountValue: e.target.value})} data-testid="input-promotion-discount" /></div>
                          <div>
                            <Label>الفئة المستهدفة</Label>
                            <Select value={newPromotion.targetType} onValueChange={(v) => setNewPromotion({...newPromotion, targetType: v})}>
                              <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">جميع العملاء</SelectItem>
                                <SelectItem value="category">قسم معين</SelectItem>
                                <SelectItem value="product">منتج معين</SelectItem>
                                <SelectItem value="customer_tier">مستوى العميل</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div><Label>تاريخ البداية</Label><Input className="rounded-xl mt-1" type="datetime-local" value={newPromotion.startDate} onChange={(e) => setNewPromotion({...newPromotion, startDate: e.target.value})} data-testid="input-promotion-start" /></div>
                          <div><Label>تاريخ الانتهاء</Label><Input className="rounded-xl mt-1" type="datetime-local" value={newPromotion.endDate} onChange={(e) => setNewPromotion({...newPromotion, endDate: e.target.value})} data-testid="input-promotion-end" /></div>
                        </div>
                        <div><Label>الوصف</Label><Textarea className="rounded-xl mt-1" placeholder="وصف العرض..." value={newPromotion.description} onChange={(e) => setNewPromotion({...newPromotion, description: e.target.value})} data-testid="input-promotion-description" /></div>
                        <div className="flex items-center gap-2">
                          <Switch checked={newPromotion.isActive} onCheckedChange={(v) => setNewPromotion({...newPromotion, isActive: v})} />
                          <Label>العرض مفعّل</Label>
                        </div>
                        <Button className="w-full rounded-xl" onClick={() => createPromotionMutation.mutate({...newPromotion, discountValue: newPromotion.discountValue ? parseFloat(newPromotion.discountValue) : null, startDate: new Date(newPromotion.startDate), endDate: new Date(newPromotion.endDate)})} disabled={createPromotionMutation.isPending} data-testid="button-submit-promotion">
                          {createPromotionMutation.isPending ? 'جاري الإنشاء...' : 'إنشاء العرض'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {promotionsList.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Megaphone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>لا توجد عروض ترويجية حالياً</p>
                  <p className="text-sm mt-1">أنشئ عرضاً جديداً للبدء</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {promotionsList.map((promo: any) => {
                    const now = new Date();
                    const startDate = new Date(promo.startDate);
                    const endDate = new Date(promo.endDate);
                    const status = !promo.isActive ? 'inactive' : now < startDate ? 'scheduled' : now > endDate ? 'ended' : 'active';
                    return (
                      <div key={promo.id} className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-100 hover:shadow-md transition-all relative overflow-hidden" data-testid={`card-promotion-${promo.id}`}>
                        <div className="absolute top-0 left-0 w-20 h-20 bg-orange-200/30 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white">
                            {promo.type === 'flash_sale' ? <Flame className="w-6 h-6" /> : promo.type === 'bundle' ? <Boxes className="w-6 h-6" /> : promo.type === 'free_shipping' ? <Truck className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                          </div>
                          {getStatusBadge(status)}
                        </div>
                        <h4 className="font-bold text-lg mb-1">{promo.name}</h4>
                        <p className="text-sm text-orange-700 mb-3">
                          {promo.discountType === 'percentage' ? `خصم ${promo.discountValue}%` : promo.discountValue ? `خصم ${Number(promo.discountValue).toLocaleString()} ل.س` : promo.type === 'free_shipping' ? 'شحن مجاني' : ''}
                        </p>
                        {promo.description && <p className="text-xs text-gray-600 mb-3 line-clamp-2">{promo.description}</p>}
                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                          <div className="bg-white/60 rounded-lg p-2">
                            <p className="text-xs text-gray-500">نوع الهدف</p>
                            <p className="font-bold text-sm">{promo.targetType === 'all' ? 'الجميع' : promo.targetType === 'category' ? 'قسم' : promo.targetType === 'product' ? 'منتج' : 'مستوى'}</p>
                          </div>
                          <div className="bg-white/60 rounded-lg p-2">
                            <p className="text-xs text-gray-500">الأولوية</p>
                            <p className="font-bold text-sm">{promo.priority}</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mb-4">
                          {new Date(promo.startDate).toLocaleDateString('ar-SY')} - {new Date(promo.endDate).toLocaleDateString('ar-SY')}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1 rounded-xl text-sm bg-white/80" onClick={() => {setEditingPromotion(promo); setIsEditPromotionOpen(true);}} data-testid={`button-edit-promotion-${promo.id}`}>تحرير</Button>
                          <Button variant="outline" className="rounded-xl text-sm bg-white/80 text-red-600 hover:bg-red-50" onClick={() => {setPromotionToDelete(promo); setIsDeletePromotionOpen(true);}} data-testid={`button-delete-promotion-${promo.id}`}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Edit Promotion Dialog */}
            <Dialog open={isEditPromotionOpen} onOpenChange={setIsEditPromotionOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>تعديل العرض الترويجي</DialogTitle></DialogHeader>
                {editingPromotion && (
                  <div className="space-y-4 mt-4">
                    <div><Label>اسم العرض</Label><Input className="rounded-xl mt-1" value={editingPromotion.name} onChange={(e) => setEditingPromotion({...editingPromotion, name: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>نوع العرض</Label>
                        <Select value={editingPromotion.type} onValueChange={(v) => setEditingPromotion({...editingPromotion, type: v})}>
                          <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="flash_sale">تخفيض سريع</SelectItem>
                            <SelectItem value="category">على قسم</SelectItem>
                            <SelectItem value="bundle">باندل</SelectItem>
                            <SelectItem value="free_shipping">شحن مجاني</SelectItem>
                            <SelectItem value="banner">بانر إعلاني</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>نوع الخصم</Label>
                        <Select value={editingPromotion.discountType || 'percentage'} onValueChange={(v) => setEditingPromotion({...editingPromotion, discountType: v})}>
                          <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">نسبة مئوية %</SelectItem>
                            <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label>قيمة الخصم</Label><Input className="rounded-xl mt-1" type="number" value={editingPromotion.discountValue || ''} onChange={(e) => setEditingPromotion({...editingPromotion, discountValue: e.target.value})} /></div>
                      <div><Label>الأولوية</Label><Input className="rounded-xl mt-1" type="number" value={editingPromotion.priority} onChange={(e) => setEditingPromotion({...editingPromotion, priority: parseInt(e.target.value) || 0})} /></div>
                      <div><Label>تاريخ البداية</Label><Input className="rounded-xl mt-1" type="datetime-local" value={editingPromotion.startDate ? new Date(editingPromotion.startDate).toISOString().slice(0, 16) : ''} onChange={(e) => setEditingPromotion({...editingPromotion, startDate: e.target.value})} /></div>
                      <div><Label>تاريخ الانتهاء</Label><Input className="rounded-xl mt-1" type="datetime-local" value={editingPromotion.endDate ? new Date(editingPromotion.endDate).toISOString().slice(0, 16) : ''} onChange={(e) => setEditingPromotion({...editingPromotion, endDate: e.target.value})} /></div>
                    </div>
                    <div><Label>الوصف</Label><Textarea className="rounded-xl mt-1" value={editingPromotion.description || ''} onChange={(e) => setEditingPromotion({...editingPromotion, description: e.target.value})} /></div>
                    <div className="flex items-center gap-2">
                      <Switch checked={editingPromotion.isActive} onCheckedChange={(v) => setEditingPromotion({...editingPromotion, isActive: v})} />
                      <Label>العرض مفعّل</Label>
                    </div>
                    <Button className="w-full rounded-xl" onClick={() => updatePromotionMutation.mutate({id: editingPromotion.id, data: {...editingPromotion, discountValue: editingPromotion.discountValue ? parseFloat(editingPromotion.discountValue) : null, startDate: new Date(editingPromotion.startDate), endDate: new Date(editingPromotion.endDate)}})} disabled={updatePromotionMutation.isPending}>
                      {updatePromotionMutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Delete Promotion Dialog */}
            <AlertDialog open={isDeletePromotionOpen} onOpenChange={setIsDeletePromotionOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>حذف العرض الترويجي</AlertDialogTitle>
                  <AlertDialogDescription>
                    هل أنت متأكد من حذف العرض "{promotionToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                  <AlertDialogCancel className="rounded-xl">إلغاء</AlertDialogCancel>
                  <AlertDialogAction className="rounded-xl bg-red-600 hover:bg-red-700" onClick={() => promotionToDelete && deletePromotionMutation.mutate(promotionToDelete.id)}>
                    {deletePromotionMutation.isPending ? 'جاري الحذف...' : 'حذف'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="space-y-6">
              {/* Header with Profit Report Title */}
              <Card className="p-6 border-none shadow-lg rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-2xl flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      تقرير الأرباح والخسائر
                    </h3>
                    <p className="text-purple-200 mt-2">تحليل شامل لأرباح المنتجات بناءً على بيانات المبيعات وتكلفة الموردين</p>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="rounded-xl gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20"
                      onClick={() => refetchProfitReport()}
                      data-testid="button-refresh-profit-report"
                    >
                      <RefreshCw className={`w-4 h-4 ${profitReportLoading ? 'animate-spin' : ''}`} />
                      تحديث
                    </Button>
                    <Button className="rounded-xl gap-2 bg-white text-purple-600 hover:bg-purple-50" data-testid="button-export-profit-report">
                      <Download className="w-4 h-4" />تصدير التقرير
                    </Button>
                  </div>
                </div>
              </Card>

              {/* KPI Summary Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-4">
                <Card className="p-5 border-none shadow-lg rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-l-green-500">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">إجمالي الإيرادات</p>
                      <p className="text-2xl font-bold text-green-700" data-testid="text-total-revenue">
                        {profitReport?.summary.totalRevenue.toLocaleString('ar-SY') || 0} ل.س
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-5 border-none shadow-lg rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 border-l-4 border-l-red-500">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                      <TrendingDown className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">إجمالي التكلفة</p>
                      <p className="text-2xl font-bold text-red-700" data-testid="text-total-cost">
                        {profitReport?.summary.totalCost.toLocaleString('ar-SY') || 0} ل.س
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className={`p-5 border-none shadow-lg rounded-2xl border-l-4 ${(profitReport?.summary.totalProfit || 0) >= 0 ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-l-emerald-500' : 'bg-gradient-to-br from-orange-50 to-amber-50 border-l-orange-500'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${(profitReport?.summary.totalProfit || 0) >= 0 ? 'bg-emerald-100' : 'bg-orange-100'}`}>
                      {(profitReport?.summary.totalProfit || 0) >= 0 ? 
                        <TrendingUp className="w-6 h-6 text-emerald-600" /> : 
                        <TrendingDown className="w-6 h-6 text-orange-600" />
                      }
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">صافي الربح</p>
                      <p className={`text-2xl font-bold ${(profitReport?.summary.totalProfit || 0) >= 0 ? 'text-emerald-700' : 'text-orange-700'}`} data-testid="text-total-profit">
                        {profitReport?.summary.totalProfit.toLocaleString('ar-SY') || 0} ل.س
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-5 border-none shadow-lg rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 border-l-4 border-l-purple-500">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Percent className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">هامش الربح</p>
                      <p className="text-2xl font-bold text-purple-700" data-testid="text-avg-margin">
                        {(profitReport?.summary.avgMargin || 0).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-5 border-none shadow-lg rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-l-4 border-l-blue-500">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">الكمية المباعة</p>
                      <p className="text-2xl font-bold text-blue-700" data-testid="text-sold-qty">
                        {profitReport?.summary.totalSoldQty.toLocaleString('ar-SY') || 0}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-5 border-none shadow-lg rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border-l-4 border-l-amber-500">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Package className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">المخزون الحالي</p>
                      <p className="text-2xl font-bold text-amber-700" data-testid="text-stock-qty">
                        {profitReport?.summary.totalStockQty.toLocaleString('ar-SY') || 0}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Profit Charts */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="p-6 border-none shadow-lg rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold flex items-center gap-2"><BarChart3 className="w-5 h-5 text-purple-500" />أفضل 10 منتجات ربحاً</h4>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={profitReport?.breakdown.slice(0, 10).map(p => ({
                        name: p.productName.length > 15 ? p.productName.substring(0, 15) + '...' : p.productName,
                        profit: p.profit,
                        revenue: p.revenue,
                        cost: p.cost
                      })) || []} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis type="number" stroke="#888" fontSize={10} />
                        <YAxis dataKey="name" type="category" width={100} stroke="#888" fontSize={10} />
                        <Tooltip 
                          contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          formatter={(value: number) => `${value.toLocaleString('ar-SY')} ل.س`}
                        />
                        <Legend />
                        <Bar dataKey="profit" name="الربح" fill="#10b981" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-6 border-none shadow-lg rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold flex items-center gap-2"><PieChart className="w-5 h-5 text-blue-500" />الإيرادات مقابل التكلفة</h4>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie 
                          data={[
                            { name: 'الإيرادات', value: profitReport?.summary.totalRevenue || 0, color: '#10b981' },
                            { name: 'التكلفة', value: profitReport?.summary.totalCost || 0, color: '#ef4444' },
                          ]} 
                          cx="50%" 
                          cy="50%" 
                          innerRadius={60} 
                          outerRadius={100} 
                          paddingAngle={5} 
                          dataKey="value" 
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill="#10b981" />
                          <Cell fill="#ef4444" />
                        </Pie>
                        <Tooltip formatter={(value: number) => `${value.toLocaleString('ar-SY')} ل.س`} />
                        <Legend />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              {/* Product Profit Breakdown Table */}
              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="font-bold text-xl flex items-center gap-2">
                      <Package className="w-5 h-5 text-blue-500" />
                      تفاصيل أرباح المنتجات
                    </h4>
                    <p className="text-gray-500 text-sm mt-1">{profitReport?.breakdown.length || 0} منتج</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input className="pr-10 w-64 bg-gray-50 border-none rounded-xl" placeholder="بحث عن منتج..." data-testid="input-search-profit" />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-right border-b border-gray-200 bg-gray-50">
                        <th className="p-4 font-bold text-gray-600 rounded-tr-xl">المنتج</th>
                        <th className="p-4 font-bold text-gray-600">الفئة</th>
                        <th className="p-4 font-bold text-gray-600">المخزون</th>
                        <th className="p-4 font-bold text-gray-600">المباع</th>
                        <th className="p-4 font-bold text-gray-600">سعر البيع</th>
                        <th className="p-4 font-bold text-gray-600">سعر التكلفة</th>
                        <th className="p-4 font-bold text-gray-600">الإيرادات</th>
                        <th className="p-4 font-bold text-gray-600">التكلفة</th>
                        <th className="p-4 font-bold text-gray-600">الربح</th>
                        <th className="p-4 font-bold text-gray-600 rounded-tl-xl">الهامش</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profitReportLoading ? (
                        <tr>
                          <td colSpan={10} className="p-8 text-center">
                            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-500" />
                            <p className="text-gray-500 mt-2">جاري تحميل البيانات...</p>
                          </td>
                        </tr>
                      ) : profitReport?.breakdown.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="p-8 text-center text-gray-500">
                            لا توجد بيانات مبيعات حتى الآن
                          </td>
                        </tr>
                      ) : (
                        profitReport?.breakdown.map((product, index) => (
                          <tr key={product.productId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors" data-testid={`row-product-profit-${product.productId}`}>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                {product.productImage ? (
                                  <img src={product.productImage} alt={product.productName} className="w-10 h-10 rounded-lg object-cover" />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <Package className="w-5 h-5 text-gray-400" />
                                  </div>
                                )}
                                <span className="font-medium">{product.productName}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant="outline" className="rounded-lg">{product.categoryName || '-'}</Badge>
                            </td>
                            <td className="p-4 font-medium">{product.stockQty.toLocaleString('ar-SY')}</td>
                            <td className="p-4">
                              <span className={`font-medium ${product.soldQty > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                                {product.soldQty.toLocaleString('ar-SY')}
                              </span>
                            </td>
                            <td className="p-4 font-medium">{parseFloat(product.salePrice).toLocaleString('ar-SY')} ل.س</td>
                            <td className="p-4 font-medium text-red-600">{product.avgCostPrice.toLocaleString('ar-SY')} ل.س</td>
                            <td className="p-4 font-medium text-green-600">{product.revenue.toLocaleString('ar-SY')} ل.س</td>
                            <td className="p-4 font-medium text-red-600">{product.cost.toLocaleString('ar-SY')} ل.س</td>
                            <td className="p-4">
                              <span className={`font-bold ${product.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {product.profit >= 0 ? '+' : ''}{product.profit.toLocaleString('ar-SY')} ل.س
                              </span>
                            </td>
                            <td className="p-4">
                              <Badge className={`rounded-lg ${product.margin >= 20 ? 'bg-green-100 text-green-700' : product.margin >= 10 ? 'bg-yellow-100 text-yellow-700' : product.margin > 0 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                                {product.margin.toFixed(1)}%
                              </Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Staff Management Tab */}
          <TabsContent value="staff">
            <div className="space-y-6">
              {/* World-Class Header with Gradient */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white"
              >
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-3">
                        <UserCog className="w-8 h-8" />
                        إدارة الموظفين والصلاحيات
                      </h2>
                      <p className="text-white/80 mt-1">إدارة فريق العمل وتحديد صلاحيات الوصول</p>
                    </div>
                    <Button 
                      onClick={() => refetchStaff()}
                      variant="secondary" 
                      className="rounded-xl gap-2 bg-white/20 hover:bg-white/30 text-white border-none"
                      data-testid="refresh-staff"
                    >
                      <RefreshCw className="w-4 h-4" />
                      تحديث
                    </Button>
                  </div>
                </div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              </motion.div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
                  <Card className="p-4 border-none shadow-lg rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-700">{staffList.length}</p>
                        <p className="text-xs text-blue-600">إجمالي الموظفين</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}>
                  <Card className="p-4 border-none shadow-lg rounded-2xl bg-gradient-to-br from-green-50 to-green-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-700">{staffList.filter(s => s.status === 'active').length}</p>
                        <p className="text-xs text-green-600">نشط</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                  <Card className="p-4 border-none shadow-lg rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-500 flex items-center justify-center text-white">
                        <XCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-700">{staffList.filter(s => s.status === 'inactive').length}</p>
                        <p className="text-xs text-gray-600">غير نشط</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }}>
                  <Card className="p-4 border-none shadow-lg rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center text-white">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-700">{staffList.filter(s => s.role === 'admin').length}</p>
                        <p className="text-xs text-purple-600">مدراء النظام</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
                  <Card className="p-4 border-none shadow-lg rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-white">
                        <Warehouse className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-orange-700">{staffList.filter(s => s.role === 'warehouse').length}</p>
                        <p className="text-xs text-orange-600">مستودعات</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }}>
                  <Card className="p-4 border-none shadow-lg rounded-2xl bg-gradient-to-br from-cyan-50 to-cyan-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-cyan-500 flex items-center justify-center text-white">
                        <Headphones className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-cyan-700">{staffList.filter(s => s.role === 'support').length}</p>
                        <p className="text-xs text-cyan-600">دعم فني</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>

              {/* Filters and Actions */}
              <Card className="p-4 border-none shadow-lg rounded-2xl">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      className="pr-10 bg-gray-50 border-none rounded-xl" 
                      placeholder="بحث بالاسم أو البريد أو الهاتف..." 
                      value={staffSearch}
                      onChange={(e) => setStaffSearch(e.target.value)}
                      data-testid="staff-search"
                    />
                  </div>
                  <Select value={staffRoleFilter} onValueChange={setStaffRoleFilter}>
                    <SelectTrigger className="w-40 rounded-xl border-none bg-gray-50" data-testid="staff-role-filter">
                      <SelectValue placeholder="الدور" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">كل الأدوار</SelectItem>
                      <SelectItem value="admin">مدير النظام</SelectItem>
                      <SelectItem value="manager">مدير</SelectItem>
                      <SelectItem value="sales">مبيعات</SelectItem>
                      <SelectItem value="support">دعم فني</SelectItem>
                      <SelectItem value="warehouse">مستودعات</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={staffStatusFilter} onValueChange={setStaffStatusFilter}>
                    <SelectTrigger className="w-32 rounded-xl border-none bg-gray-50" data-testid="staff-status-filter">
                      <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="inactive">غير نشط</SelectItem>
                    </SelectContent>
                  </Select>
                  <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
                    <DialogTrigger asChild>
                      <Button className="rounded-xl gap-2 bg-gradient-to-r from-primary to-purple-600" data-testid="add-staff-btn">
                        <UserPlus className="w-4 h-4" />إضافة موظف
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <UserPlus className="w-5 h-5 text-primary" />
                          إضافة موظف جديد
                        </DialogTitle>
                        <DialogDescription>أدخل بيانات الموظف الجديد</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>الاسم الكامل *</Label>
                            <Input 
                              className="rounded-xl mt-1" 
                              placeholder="أحمد محمد"
                              value={newStaff.name}
                              onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                              data-testid="new-staff-name"
                            />
                          </div>
                          <div>
                            <Label>البريد الإلكتروني *</Label>
                            <Input 
                              className="rounded-xl mt-1" 
                              placeholder="ahmed@muzwd.com"
                              type="email"
                              value={newStaff.email}
                              onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                              data-testid="new-staff-email"
                            />
                          </div>
                          <div>
                            <Label>رقم الجوال *</Label>
                            <Input 
                              className="rounded-xl mt-1" 
                              placeholder="0501234567"
                              value={newStaff.phone}
                              onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                              data-testid="new-staff-phone"
                            />
                          </div>
                          <div>
                            <Label>كلمة المرور *</Label>
                            <Input 
                              className="rounded-xl mt-1" 
                              placeholder="••••••••"
                              type="password"
                              value={newStaff.password}
                              onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                              data-testid="new-staff-password"
                            />
                          </div>
                          <div>
                            <Label>الدور الوظيفي *</Label>
                            <Select value={newStaff.role} onValueChange={(v) => setNewStaff({ ...newStaff, role: v })}>
                              <SelectTrigger className="rounded-xl mt-1" data-testid="new-staff-role">
                                <SelectValue placeholder="اختر" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">مدير النظام</SelectItem>
                                <SelectItem value="manager">مدير</SelectItem>
                                <SelectItem value="sales">مبيعات</SelectItem>
                                <SelectItem value="support">دعم فني</SelectItem>
                                <SelectItem value="warehouse">مستودعات</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>القسم</Label>
                            <Select value={newStaff.department} onValueChange={(v) => setNewStaff({ ...newStaff, department: v })}>
                              <SelectTrigger className="rounded-xl mt-1" data-testid="new-staff-department">
                                <SelectValue placeholder="اختر" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="الإدارة">الإدارة</SelectItem>
                                <SelectItem value="المبيعات">المبيعات</SelectItem>
                                <SelectItem value="الدعم الفني">الدعم الفني</SelectItem>
                                <SelectItem value="المستودعات">المستودعات</SelectItem>
                                <SelectItem value="المحاسبة">المحاسبة</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        {/* Warehouse selector - required for non-admin roles */}
                        {newStaff.role !== 'admin' && (
                          <div>
                            <Label className="flex items-center gap-2">
                              <Warehouse className="w-4 h-4 text-purple-600" />
                              الفرع/المستودع التابع *
                            </Label>
                            <Select 
                              value={newStaff.warehouseId?.toString() || ''} 
                              onValueChange={(v) => setNewStaff({ ...newStaff, warehouseId: v ? parseInt(v) : null })}
                            >
                              <SelectTrigger className="rounded-xl mt-1" data-testid="new-staff-warehouse">
                                <SelectValue placeholder="اختر الفرع" />
                              </SelectTrigger>
                              <SelectContent>
                                {warehousesList.filter((w: any) => w.isActive).map((warehouse: any) => (
                                  <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                    {warehouse.name} - {cities.find((c: any) => c.id === warehouse.cityId)?.name || ''}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-1">صلاحيات الموظف ستكون محدودة بهذا الفرع فقط</p>
                          </div>
                        )}
                        {newStaff.role === 'admin' && (
                          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                            <div className="flex items-center gap-2 text-purple-700">
                              <Shield className="w-4 h-4" />
                              <span className="text-sm font-medium">مدير النظام لديه صلاحيات كاملة على جميع الفروع</span>
                            </div>
                          </div>
                        )}
                        <div>
                          <Label className="mb-2 block">الصلاحيات</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {['orders', 'products', 'customers', 'reports', 'support', 'inventory'].map((perm) => (
                              <div key={perm} className="flex items-center gap-2">
                                <Checkbox 
                                  id={`perm-${perm}`}
                                  checked={newStaff.permissions.includes(perm)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setNewStaff({ ...newStaff, permissions: [...newStaff.permissions, perm] });
                                    } else {
                                      setNewStaff({ ...newStaff, permissions: newStaff.permissions.filter(p => p !== perm) });
                                    }
                                  }}
                                />
                                <Label htmlFor={`perm-${perm}`} className="text-sm">
                                  {perm === 'orders' ? 'الطلبات' : perm === 'products' ? 'المنتجات' : perm === 'customers' ? 'العملاء' : perm === 'reports' ? 'التقارير' : perm === 'support' ? 'الدعم' : 'المخزون'}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <Button 
                          className="w-full rounded-xl bg-gradient-to-r from-primary to-purple-600"
                          onClick={() => createStaffMutation.mutate(newStaff)}
                          disabled={createStaffMutation.isPending || !newStaff.name || !newStaff.email || !newStaff.phone || !newStaff.password || (newStaff.role !== 'admin' && !newStaff.warehouseId)}
                          data-testid="submit-new-staff"
                        >
                          {createStaffMutation.isPending ? 'جاري الإضافة...' : 'إضافة الموظف'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </Card>

              {/* Staff Table */}
              <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="text-right font-bold">الموظف</TableHead>
                      <TableHead className="text-right font-bold">الدور</TableHead>
                      <TableHead className="text-right font-bold">القسم</TableHead>
                      <TableHead className="text-right font-bold">الهاتف</TableHead>
                      <TableHead className="text-right font-bold">الحالة</TableHead>
                      <TableHead className="text-right font-bold">تاريخ الإنضمام</TableHead>
                      <TableHead className="text-right font-bold">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <div className="flex items-center justify-center gap-2">
                            <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                            <span>جاري التحميل...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : staffList
                        .filter(member => {
                          const matchesSearch = staffSearch === '' || 
                            member.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
                            member.email.toLowerCase().includes(staffSearch.toLowerCase()) ||
                            member.phone.includes(staffSearch);
                          const matchesRole = staffRoleFilter === 'all' || member.role === staffRoleFilter;
                          const matchesStatus = staffStatusFilter === 'all' || member.status === staffStatusFilter;
                          return matchesSearch && matchesRole && matchesStatus;
                        })
                        .length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2 text-gray-500">
                            <Users className="w-12 h-12 text-gray-300" />
                            <p>لا يوجد موظفين</p>
                            <Button 
                              variant="outline" 
                              className="rounded-xl mt-2"
                              onClick={() => setIsAddStaffOpen(true)}
                            >
                              <UserPlus className="w-4 h-4 ml-2" />
                              إضافة موظف جديد
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      staffList
                        .filter(member => {
                          const matchesSearch = staffSearch === '' || 
                            member.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
                            member.email.toLowerCase().includes(staffSearch.toLowerCase()) ||
                            member.phone.includes(staffSearch);
                          const matchesRole = staffRoleFilter === 'all' || member.role === staffRoleFilter;
                          const matchesStatus = staffStatusFilter === 'all' || member.status === staffStatusFilter;
                          return matchesSearch && matchesRole && matchesStatus;
                        })
                        .map((member) => (
                          <TableRow key={member.id} className="hover:bg-gray-50/50" data-testid={`staff-row-${member.id}`}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                                  member.role === 'admin' ? 'from-purple-500 to-pink-500' :
                                  member.role === 'manager' ? 'from-blue-500 to-cyan-500' :
                                  member.role === 'support' ? 'from-green-500 to-emerald-500' :
                                  member.role === 'warehouse' ? 'from-orange-500 to-amber-500' :
                                  'from-gray-500 to-slate-500'
                                } flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                                  {member.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold">{member.name}</p>
                                  <p className="text-xs text-gray-500">{member.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`rounded-lg ${
                                member.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                member.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                                member.role === 'support' ? 'bg-green-100 text-green-700' :
                                member.role === 'warehouse' ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {member.role === 'admin' ? 'مدير النظام' : 
                                 member.role === 'manager' ? 'مدير' : 
                                 member.role === 'support' ? 'دعم فني' : 
                                 member.role === 'warehouse' ? 'مستودعات' : 'مبيعات'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{member.department || '-'}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-mono">{member.phone}</span>
                            </TableCell>
                            <TableCell>
                              <Badge className={`rounded-lg ${member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                {member.status === 'active' ? 'نشط' : 'غير نشط'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-500">
                                {new Date(member.createdAt).toLocaleDateString('ar-SY')}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-9 w-9 rounded-lg hover:bg-blue-50 hover:text-blue-600"
                                  onClick={() => {
                                    setEditingStaff(member);
                                    setIsEditStaffOpen(true);
                                  }}
                                  data-testid={`edit-staff-${member.id}`}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-9 w-9 rounded-lg hover:bg-purple-50 hover:text-purple-600"
                                  onClick={() => {
                                    setPermissionsStaff(member);
                                    setIsPermissionsOpen(true);
                                  }}
                                  data-testid={`permissions-staff-${member.id}`}
                                >
                                  <Key className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-9 w-9 rounded-lg hover:bg-red-50 hover:text-red-600"
                                  onClick={() => {
                                    setStaffToDelete(member);
                                    setIsDeleteStaffOpen(true);
                                  }}
                                  data-testid={`delete-staff-${member.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </Card>

              {/* Edit Staff Dialog */}
              <Dialog open={isEditStaffOpen} onOpenChange={setIsEditStaffOpen}>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Edit className="w-5 h-5 text-primary" />
                      تعديل بيانات الموظف
                    </DialogTitle>
                  </DialogHeader>
                  {editingStaff && (
                    <div className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>الاسم الكامل</Label>
                          <Input 
                            className="rounded-xl mt-1" 
                            value={editingStaff.name}
                            onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>البريد الإلكتروني</Label>
                          <Input 
                            className="rounded-xl mt-1" 
                            value={editingStaff.email}
                            onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>رقم الجوال</Label>
                          <Input 
                            className="rounded-xl mt-1" 
                            value={editingStaff.phone}
                            onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>الدور الوظيفي</Label>
                          <Select value={editingStaff.role} onValueChange={(v) => setEditingStaff({ ...editingStaff, role: v })}>
                            <SelectTrigger className="rounded-xl mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">مدير النظام</SelectItem>
                              <SelectItem value="manager">مدير</SelectItem>
                              <SelectItem value="sales">مبيعات</SelectItem>
                              <SelectItem value="support">دعم فني</SelectItem>
                              <SelectItem value="warehouse">مستودعات</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>القسم</Label>
                          <Select value={editingStaff.department || ''} onValueChange={(v) => setEditingStaff({ ...editingStaff, department: v })}>
                            <SelectTrigger className="rounded-xl mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="الإدارة">الإدارة</SelectItem>
                              <SelectItem value="المبيعات">المبيعات</SelectItem>
                              <SelectItem value="الدعم الفني">الدعم الفني</SelectItem>
                              <SelectItem value="المستودعات">المستودعات</SelectItem>
                              <SelectItem value="المحاسبة">المحاسبة</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>الحالة</Label>
                          <Select value={editingStaff.status} onValueChange={(v) => setEditingStaff({ ...editingStaff, status: v })}>
                            <SelectTrigger className="rounded-xl mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">نشط</SelectItem>
                              <SelectItem value="inactive">غير نشط</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button 
                        className="w-full rounded-xl"
                        onClick={() => updateStaffMutation.mutate({ id: editingStaff.id, data: editingStaff })}
                        disabled={updateStaffMutation.isPending}
                      >
                        {updateStaffMutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* Permissions Dialog */}
              <Dialog open={isPermissionsOpen} onOpenChange={setIsPermissionsOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Key className="w-5 h-5 text-purple-600" />
                      إدارة الصلاحيات
                    </DialogTitle>
                    <DialogDescription>
                      {permissionsStaff?.name}
                    </DialogDescription>
                  </DialogHeader>
                  {permissionsStaff && (
                    <div className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { key: 'orders', label: 'الطلبات', icon: ShoppingCart },
                          { key: 'products', label: 'المنتجات', icon: Package },
                          { key: 'customers', label: 'العملاء', icon: Users },
                          { key: 'reports', label: 'التقارير', icon: BarChart3 },
                          { key: 'support', label: 'الدعم الفني', icon: Headphones },
                          { key: 'inventory', label: 'المخزون', icon: Warehouse },
                          { key: 'finance', label: 'المالية', icon: DollarSign },
                          { key: 'settings', label: 'الإعدادات', icon: Settings },
                        ].map(({ key, label, icon: Icon }) => (
                          <div 
                            key={key} 
                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                              (permissionsStaff.permissions || []).includes(key) 
                                ? 'border-purple-500 bg-purple-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => {
                              const currentPerms = permissionsStaff.permissions || [];
                              const newPerms = currentPerms.includes(key) 
                                ? currentPerms.filter(p => p !== key)
                                : [...currentPerms, key];
                              setPermissionsStaff({ ...permissionsStaff, permissions: newPerms });
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className={`w-5 h-5 ${(permissionsStaff.permissions || []).includes(key) ? 'text-purple-600' : 'text-gray-400'}`} />
                              <span className={`font-medium ${(permissionsStaff.permissions || []).includes(key) ? 'text-purple-700' : 'text-gray-600'}`}>{label}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button 
                        className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600"
                        onClick={() => updateStaffMutation.mutate({ id: permissionsStaff.id, data: { permissions: permissionsStaff.permissions } })}
                        disabled={updateStaffMutation.isPending}
                      >
                        {updateStaffMutation.isPending ? 'جاري الحفظ...' : 'حفظ الصلاحيات'}
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* Delete Confirmation Dialog */}
              <Dialog open={isDeleteStaffOpen} onOpenChange={setIsDeleteStaffOpen}>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                      <Trash2 className="w-5 h-5" />
                      تأكيد الحذف
                    </DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-gray-600">
                      هل أنت متأكد من حذف الموظف <span className="font-bold">{staffToDelete?.name}</span>؟
                    </p>
                    <p className="text-sm text-gray-500 mt-2">لا يمكن التراجع عن هذا الإجراء.</p>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1 rounded-xl"
                      onClick={() => setIsDeleteStaffOpen(false)}
                    >
                      إلغاء
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="flex-1 rounded-xl"
                      onClick={() => staffToDelete && deleteStaffMutation.mutate(staffToDelete.id)}
                      disabled={deleteStaffMutation.isPending}
                    >
                      {deleteStaffMutation.isPending ? 'جاري الحذف...' : 'حذف'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>

          {/* Support Tickets Tab */}
          <TabsContent value="support">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 p-6 border-none shadow-lg rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-xl">تذاكر الدعم الفني</h3>
                    <p className="text-gray-500 text-sm mt-1">{mockTickets.filter(t => t.status === 'open').length} تذكرة مفتوحة</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {mockTickets.map((ticket) => (
                    <div key={ticket.id} className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedTicket?.id === ticket.id ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`} onClick={() => setSelectedTicket(ticket)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${ticket.priority === 'urgent' ? 'bg-red-100 text-red-600' : ticket.priority === 'high' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                            <TicketIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold">{ticket.ticketNumber}</p>
                              {getStatusBadge(ticket.status)}
                              {getPriorityBadge(ticket.priority)}
                            </div>
                            <p className="text-sm text-gray-700 mt-1">{ticket.subject}</p>
                            <p className="text-xs text-gray-500 mt-1">{ticket.customer} • منذ {ticket.createdAt}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <Badge variant="outline" className="gap-1"><MessageCircle className="w-3 h-3" />{ticket.messages}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 border-none shadow-lg rounded-2xl">
                {selectedTicket ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg">{selectedTicket.ticketNumber}</h3>
                      {getStatusBadge(selectedTicket.status)}
                    </div>
                    <div className="space-y-4">
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500">الموضوع</p>
                        <p className="font-bold text-sm mt-1">{selectedTicket.subject}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500">العميل</p>
                        <p className="font-bold text-sm mt-1">{selectedTicket.customer}</p>
                      </div>
                      <div>
                        <Label className="mb-2 block">الرد</Label>
                        <Textarea className="rounded-xl min-h-20" placeholder="اكتب ردك هنا..." />
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1 rounded-xl gap-2"><Send className="w-4 h-4" />إرسال الرد</Button>
                        <Button variant="outline" className="rounded-xl"><CheckCircle className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <MessageCircle className="w-12 h-12 mb-3" />
                    <p>اختر تذكرة لعرض التفاصيل</p>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Loyalty Program Tab */}
          <TabsContent value="loyalty">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 p-6 border-none shadow-lg rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-xl flex items-center gap-2"><Crown className="w-5 h-5 text-yellow-500" />برنامج نقاط الولاء</h3>
                    <p className="text-gray-500 text-sm mt-1">إدارة مستويات العملاء والمكافآت</p>
                  </div>
                  <Dialog open={isLoyaltySettingsOpen} onOpenChange={setIsLoyaltySettingsOpen}>
                    <DialogTrigger asChild>
                      <Button className="rounded-xl gap-2" data-testid="button-loyalty-settings"><Settings className="w-4 h-4" />إعدادات البرنامج</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Crown className="w-5 h-5 text-yellow-500" />إعدادات برنامج الولاء</DialogTitle>
                        <DialogDescription>تحديد قواعد كسب واستبدال النقاط</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                          <h4 className="font-bold text-sm mb-3 flex items-center gap-2"><Coins className="w-4 h-4 text-yellow-600" />معدل كسب النقاط</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">النقاط المكتسبة</Label>
                              <Input 
                                type="number" 
                                className="rounded-lg mt-1" 
                                value={loyaltySettings.earnRate} 
                                onChange={(e) => setLoyaltySettings({...loyaltySettings, earnRate: e.target.value})}
                                data-testid="input-loyalty-earn-rate"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">لكل مبلغ (ل.س)</Label>
                              <Input 
                                type="number" 
                                className="rounded-lg mt-1" 
                                value={loyaltySettings.earnPerAmount} 
                                onChange={(e) => setLoyaltySettings({...loyaltySettings, earnPerAmount: e.target.value})}
                                data-testid="input-loyalty-earn-per-amount"
                              />
                            </div>
                          </div>
                          <p className="text-xs text-yellow-700 mt-2">العميل يكسب {loyaltySettings.earnRate} نقطة لكل {loyaltySettings.earnPerAmount} ل.س مشتريات</p>
                        </div>
                        
                        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                          <h4 className="font-bold text-sm mb-3 flex items-center gap-2"><Gift className="w-4 h-4 text-green-600" />قيمة الاستبدال</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">عدد النقاط</Label>
                              <Input 
                                type="number" 
                                className="rounded-lg mt-1" 
                                value={loyaltySettings.redeemPoints} 
                                onChange={(e) => setLoyaltySettings({...loyaltySettings, redeemPoints: e.target.value})}
                                data-testid="input-loyalty-redeem-points"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">تساوي خصم (ل.س)</Label>
                              <Input 
                                type="number" 
                                className="rounded-lg mt-1" 
                                value={loyaltySettings.redeemValue} 
                                onChange={(e) => setLoyaltySettings({...loyaltySettings, redeemValue: e.target.value})}
                                data-testid="input-loyalty-redeem-value"
                              />
                            </div>
                          </div>
                          <p className="text-xs text-green-700 mt-2">{loyaltySettings.redeemPoints} نقطة = {loyaltySettings.redeemValue} ل.س خصم</p>
                        </div>
                        
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <h4 className="font-bold text-sm mb-3 flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-600" />صلاحية النقاط</h4>
                          <div>
                            <Label className="text-xs">مدة الصلاحية (شهر)</Label>
                            <Input 
                              type="number" 
                              className="rounded-lg mt-1" 
                              value={loyaltySettings.validityMonths} 
                              onChange={(e) => setLoyaltySettings({...loyaltySettings, validityMonths: e.target.value})}
                              data-testid="input-loyalty-validity"
                            />
                          </div>
                          <p className="text-xs text-blue-700 mt-2">النقاط تنتهي صلاحيتها بعد {loyaltySettings.validityMonths} شهر من تاريخ الكسب</p>
                        </div>
                        
                        <Button 
                          className="w-full rounded-xl" 
                          onClick={() => {
                            toast({ title: 'تم حفظ إعدادات برنامج الولاء', className: 'bg-green-600 text-white' });
                            setIsLoyaltySettingsOpen(false);
                          }}
                          data-testid="button-save-loyalty-settings"
                        >
                          <CheckCircle className="w-4 h-4 ml-2" />حفظ الإعدادات
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  {mockLoyaltyTiers.map((tier) => (
                    <div key={tier.tier} className="relative overflow-hidden rounded-2xl p-4 text-white" style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}>
                      <div className={`absolute inset-0 bg-gradient-to-br ${tier.color}`}></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                          <tier.icon className="w-5 h-5" />
                          <span className="font-bold">{tier.name}</span>
                        </div>
                        <p className="text-3xl font-bold">{tier.customers.toLocaleString()}</p>
                        <p className="text-xs opacity-80">عميل</p>
                        <div className="mt-3 pt-3 border-t border-white/20 flex justify-between text-xs">
                          <span>{tier.minPoints.toLocaleString()}+ نقطة</span>
                          <span>خصم {tier.discount}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 rounded-2xl p-4">
                  <h4 className="font-bold mb-4">إعدادات النقاط</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Coins className="w-5 h-5 text-yellow-500" />
                        <span className="font-bold text-sm">معدل الكسب</span>
                      </div>
                      <p className="text-2xl font-bold">1 نقطة</p>
                      <p className="text-xs text-gray-500">لكل 10 ل.س مشتريات</p>
                    </div>
                    <div className="bg-white rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Gift className="w-5 h-5 text-green-500" />
                        <span className="font-bold text-sm">قيمة الاستبدال</span>
                      </div>
                      <p className="text-2xl font-bold">100 نقطة</p>
                      <p className="text-xs text-gray-500">= 10 ل.س خصم</p>
                    </div>
                    <div className="bg-white rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        <span className="font-bold text-sm">صلاحية النقاط</span>
                      </div>
                      <p className="text-2xl font-bold">12 شهر</p>
                      <p className="text-xs text-gray-500">من تاريخ الكسب</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <h3 className="font-bold text-lg mb-4">إحصائيات البرنامج</h3>
                <div className="space-y-4">
                  <div className="bg-gradient-to-l from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-100">
                    <p className="text-sm text-yellow-700">إجمالي النقاط الموزعة</p>
                    <p className="text-2xl font-bold text-yellow-800 mt-1">2,450,000</p>
                  </div>
                  <div className="bg-gradient-to-l from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                    <p className="text-sm text-green-700">النقاط المستبدلة</p>
                    <p className="text-2xl font-bold text-green-800 mt-1">850,000</p>
                  </div>
                  <div className="bg-gradient-to-l from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
                    <p className="text-sm text-purple-700">معدل المشاركة</p>
                    <p className="text-2xl font-bold text-purple-800 mt-1">78%</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons">
            <Card className="p-6 border-none shadow-lg rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-xl">إدارة الكوبونات والأكواد الترويجية</h3>
                  <p className="text-gray-500 text-sm mt-1">{couponsList.length} كوبون</p>
                </div>
                <Dialog open={isAddCouponOpen} onOpenChange={(open) => {
                  setIsAddCouponOpen(open);
                  if (!open) {
                    setEditingCouponId(null);
                    setNewCoupon({ code: '', type: 'percentage', value: '', minOrder: '', maxDiscount: '', usageLimit: '', endDate: '' });
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="rounded-xl gap-2" data-testid="button-add-coupon"><Plus className="w-4 h-4" />إنشاء كوبون</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>{editingCouponId ? 'تعديل الكوبون' : 'إنشاء كوبون جديد'}</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>كود الكوبون</Label>
                          <Input className="rounded-xl mt-1" placeholder="SUMMER2024" value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })} data-testid="input-coupon-code" />
                        </div>
                        <div>
                          <Label>نوع الخصم</Label>
                          <Select value={newCoupon.type} onValueChange={(v) => setNewCoupon({ ...newCoupon, type: v })}>
                            <SelectTrigger className="rounded-xl mt-1" data-testid="select-coupon-type"><SelectValue placeholder="اختر" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">نسبة مئوية %</SelectItem>
                              <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>قيمة الخصم</Label>
                          <Input className="rounded-xl mt-1" type="number" placeholder="15" value={newCoupon.value} onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })} data-testid="input-coupon-value" />
                        </div>
                        <div>
                          <Label>الحد الأدنى للطلب</Label>
                          <Input className="rounded-xl mt-1" type="number" placeholder="200" value={newCoupon.minOrder} onChange={(e) => setNewCoupon({ ...newCoupon, minOrder: e.target.value })} data-testid="input-coupon-min-order" />
                        </div>
                        <div>
                          <Label>الحد الأقصى للخصم</Label>
                          <Input className="rounded-xl mt-1" type="number" placeholder="100" value={newCoupon.maxDiscount} onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: e.target.value })} data-testid="input-coupon-max-discount" />
                        </div>
                        <div>
                          <Label>عدد الاستخدامات</Label>
                          <Input className="rounded-xl mt-1" type="number" placeholder="100" value={newCoupon.usageLimit} onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: e.target.value })} data-testid="input-coupon-usage-limit" />
                        </div>
                        <div className="col-span-2">
                          <Label>تاريخ الانتهاء</Label>
                          <Input className="rounded-xl mt-1" type="date" value={newCoupon.endDate} onChange={(e) => setNewCoupon({ ...newCoupon, endDate: e.target.value })} data-testid="input-coupon-end-date" />
                        </div>
                      </div>
                      <Button className="w-full rounded-xl" onClick={editingCouponId ? handleUpdateCoupon : handleAddCoupon} disabled={!newCoupon.code || !newCoupon.value} data-testid="button-submit-coupon">
                        {editingCouponId ? 'تحديث الكوبون' : 'إنشاء الكوبون'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {couponsList.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Percent className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>لا توجد كوبونات حالياً</p>
                    <p className="text-sm">أنشئ كوبون جديد للبدء</p>
                  </div>
                ) : (
                  couponsList.map((coupon: any) => (
                    <div key={coupon.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary/20 transition-all" data-testid={`coupon-row-${coupon.id}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg ${coupon.isActive ? 'bg-gradient-to-br from-primary to-purple-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            <Percent className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-lg font-mono">{coupon.code}</p>
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { navigator.clipboard.writeText(coupon.code); toast({ title: 'تم نسخ الكود' }); }} data-testid={`copy-coupon-${coupon.id}`}><Copy className="w-3 h-3" /></Button>
                              <Badge className={coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{coupon.isActive ? 'نشط' : 'منتهي'}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{coupon.type === 'percentage' ? `خصم ${coupon.value}%` : `خصم ${coupon.value} ل.س`} • الحد الأدنى {coupon.minOrder || 0} ل.س</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="text-sm text-gray-600 mb-2">{coupon.usageCount || 0} / {coupon.usageLimit || 100} استخدام</div>
                          <Progress value={((coupon.usageCount || 0) / (coupon.usageLimit || 100)) * 100} className="h-2 w-32" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={coupon.isActive} onCheckedChange={() => handleToggleCoupon(coupon.id, coupon.isActive)} data-testid={`toggle-coupon-${coupon.id}`} />
                          <Button size="icon" variant="ghost" className="rounded-lg" onClick={() => handleEditCoupon(coupon)} data-testid={`edit-coupon-${coupon.id}`}><Edit className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" className="rounded-lg hover:bg-red-50 hover:text-red-600" onClick={() => handleDeleteCoupon(coupon.id)} data-testid={`delete-coupon-${coupon.id}`}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Warehouses Tab - World Class */}
          <TabsContent value="warehouses">
            {/* Enhanced Stats Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
              <Card className="p-4 border-none shadow-md rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs">إجمالي المستودعات</p>
                    <p className="text-2xl font-bold">{warehousesList.length}</p>
                  </div>
                  <Warehouse className="w-8 h-8 text-blue-200" />
                </div>
              </Card>
              <Card className="p-4 border-none shadow-md rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs">مستودعات نشطة</p>
                    <p className="text-2xl font-bold">{warehousesList.filter(w => w.isActive).length}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-200" />
                </div>
              </Card>
              <Card className="p-4 border-none shadow-md rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs">المدن المغطاة</p>
                    <p className="text-2xl font-bold">{cities.length}</p>
                  </div>
                  <MapPin className="w-8 h-8 text-purple-200" />
                </div>
              </Card>
              <Card className="p-4 border-none shadow-md rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-xs">إجمالي السعة</p>
                    <p className="text-2xl font-bold">{warehousesList.reduce((sum, w) => sum + (w.capacity || 0), 0).toLocaleString('ar-SY')}</p>
                  </div>
                  <Boxes className="w-8 h-8 text-orange-200" />
                </div>
              </Card>
              <Card className="p-4 border-none shadow-md rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-100 text-xs">المنتجات المخزنة</p>
                    <p className="text-2xl font-bold">{products.length}</p>
                  </div>
                  <Package className="w-8 h-8 text-cyan-200" />
                </div>
              </Card>
              <Card className="p-4 border-none shadow-md rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-xs">نقص في المخزون</p>
                    <p className="text-2xl font-bold">{products.filter(p => p.stock < 30).length}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-200" />
                </div>
              </Card>
            </div>

            {/* Warehouse Performance Charts */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  توزيع السعة حسب المستودع
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={warehousesList.map(w => ({ name: w.name.slice(0, 15), capacity: w.capacity || 0, city: cities.find(c => c.id === w.cityId)?.name || '' }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={10} />
                    <YAxis />
                    <Tooltip content={({ active, payload }) => active && payload?.[0] ? (
                      <div className="bg-white p-3 rounded-lg shadow-lg border">
                        <p className="font-bold">{payload[0].payload.name}</p>
                        <p className="text-sm text-gray-600">{payload[0].payload.city}</p>
                        <p className="text-primary font-bold">{payload[0].value?.toLocaleString('ar-SY')} وحدة</p>
                      </div>
                    ) : null} />
                    <Bar dataKey="capacity" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              
              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  حالة المخزون
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'مخزون كافي', value: products.filter(p => p.stock >= 50).length, fill: '#22c55e' },
                        { name: 'مخزون متوسط', value: products.filter(p => p.stock >= 30 && p.stock < 50).length, fill: '#f59e0b' },
                        { name: 'مخزون منخفض', value: products.filter(p => p.stock < 30).length, fill: '#ef4444' },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Quick Actions Bar */}
            <Card className="p-4 mb-6 border-none shadow-lg rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="font-bold">إجراءات سريعة</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="rounded-xl gap-2" data-testid="button-stock-transfer">
                        <ArrowLeftRight className="w-4 h-4" />نقل مخزون
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader><DialogTitle>نقل المخزون بين المستودعات</DialogTitle></DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>من مستودع</Label>
                            <Select>
                              <SelectTrigger><SelectValue placeholder="اختر المصدر" /></SelectTrigger>
                              <SelectContent>
                                {warehousesList.map(w => <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>إلى مستودع</Label>
                            <Select>
                              <SelectTrigger><SelectValue placeholder="اختر الوجهة" /></SelectTrigger>
                              <SelectContent>
                                {warehousesList.map(w => <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>المنتج</Label>
                          <Select>
                            <SelectTrigger><SelectValue placeholder="اختر المنتج" /></SelectTrigger>
                            <SelectContent>
                              {products.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>الكمية</Label>
                          <Input type="number" placeholder="أدخل الكمية" />
                        </div>
                        <Button className="w-full rounded-xl">
                          <ArrowLeftRight className="w-4 h-4 ml-2" />تنفيذ النقل
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" className="rounded-xl gap-2" onClick={async () => {
                    // Dynamic import to reduce initial bundle size
                    const ExcelJSModule = await import('exceljs');
                    const ExcelJS = ExcelJSModule.default || ExcelJSModule;
                    
                    const workbook = new ExcelJS.Workbook();
                    const worksheet = workbook.addWorksheet('المستودعات');
                    
                    // Add header row
                    worksheet.addRow(['الكود', 'الاسم', 'المدينة', 'العنوان', 'الهاتف', 'السعة', 'الحالة']);
                    
                    // Add data rows
                    warehousesList.forEach(w => {
                      worksheet.addRow([
                        w.code,
                        w.name,
                        cities.find(c => c.id === w.cityId)?.name || '-',
                        w.address || '-',
                        w.phone || '-',
                        w.capacity || 0,
                        w.isActive ? 'نشط' : 'غير نشط'
                      ]);
                    });
                    
                    const buffer = await workbook.xlsx.writeBuffer();
                    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `warehouses_${new Date().toISOString().split('T')[0]}.xlsx`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    
                    toast({ title: 'تم تصدير تقرير المستودعات بنجاح', className: 'bg-green-600 text-white' });
                  }} data-testid="button-export-warehouses">
                    <FileDown className="w-4 h-4" />تصدير التقرير
                  </Button>
                  <Button variant="outline" className="rounded-xl gap-2" onClick={() => {
                    refetchWarehouses();
                    refetchCities();
                    toast({ title: 'تم تحديث بيانات المستودعات', className: 'bg-green-600 text-white' });
                  }} data-testid="button-refresh-warehouses">
                    <RefreshCw className="w-4 h-4" />تحديث البيانات
                  </Button>
                </div>
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Cities Management */}
              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-xl flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      إدارة المدن
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">{cities.length} مدينة</p>
                  </div>
                  <Dialog open={isAddCityOpen} onOpenChange={setIsAddCityOpen}>
                    <DialogTrigger asChild>
                      <Button className="rounded-xl gap-2" data-testid="button-add-city"><Plus className="w-4 h-4" />إضافة مدينة</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader><DialogTitle>إضافة مدينة جديدة</DialogTitle></DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label>اسم المدينة *</Label>
                          <Input placeholder="مثال: الرياض" value={newCity.name} onChange={(e) => setNewCity({ ...newCity, name: e.target.value })} data-testid="input-city-name" />
                        </div>
                        <div>
                          <Label>المنطقة</Label>
                          <Select value={newCity.region} onValueChange={(v) => setNewCity({ ...newCity, region: v })}>
                            <SelectTrigger data-testid="select-region"><SelectValue placeholder="اختر المنطقة" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="دمشق">محافظة دمشق</SelectItem>
                              <SelectItem value="ريف دمشق">محافظة ريف دمشق</SelectItem>
                              <SelectItem value="حلب">محافظة حلب</SelectItem>
                              <SelectItem value="حمص">محافظة حمص</SelectItem>
                              <SelectItem value="حماة">محافظة حماة</SelectItem>
                              <SelectItem value="اللاذقية">محافظة اللاذقية</SelectItem>
                              <SelectItem value="طرطوس">محافظة طرطوس</SelectItem>
                              <SelectItem value="إدلب">محافظة إدلب</SelectItem>
                              <SelectItem value="درعا">محافظة درعا</SelectItem>
                              <SelectItem value="السويداء">محافظة السويداء</SelectItem>
                              <SelectItem value="القنيطرة">محافظة القنيطرة</SelectItem>
                              <SelectItem value="دير الزور">محافظة دير الزور</SelectItem>
                              <SelectItem value="الرقة">محافظة الرقة</SelectItem>
                              <SelectItem value="الحسكة">محافظة الحسكة</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button className="w-full rounded-xl" onClick={handleAddCity} disabled={!newCity.name} data-testid="button-submit-city">
                          <Plus className="w-4 h-4 ml-2" />إضافة المدينة
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {cities.map((city) => {
                      const cityWarehouse = warehousesList.find(w => w.cityId === city.id);
                      return (
                        <div key={city.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/20 transition-all" data-testid={`card-city-${city.id}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                                <MapPin className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-bold">{city.name}</p>
                                <p className="text-xs text-gray-500">{city.region || 'بدون منطقة'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {cityWarehouse ? (
                                <Badge className="bg-green-100 text-green-700">مستودع متوفر</Badge>
                              ) : (
                                <Badge className="bg-yellow-100 text-yellow-700">بدون مستودع</Badge>
                              )}
                              <Badge className={city.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                                {city.isActive ? 'نشطة' : 'غير نشطة'}
                              </Badge>
                              <Button size="icon" variant="ghost" className="rounded-lg hover:bg-red-50 hover:text-red-600" onClick={() => handleDeleteCity(city.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {cities.length === 0 && (
                      <div className="text-center py-10 text-gray-500">
                        <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>لا توجد مدن مسجلة</p>
                        <p className="text-sm">أضف مدينة جديدة للبدء</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </Card>

              {/* Warehouses Management */}
              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-xl flex items-center gap-2">
                      <Warehouse className="w-5 h-5 text-primary" />
                      إدارة المستودعات
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">{warehousesList.length} مستودع</p>
                  </div>
                  <Dialog open={isAddWarehouseOpen} onOpenChange={setIsAddWarehouseOpen}>
                    <DialogTrigger asChild>
                      <Button className="rounded-xl gap-2" data-testid="button-add-warehouse"><Plus className="w-4 h-4" />إضافة مستودع</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader><DialogTitle>إضافة مستودع جديد</DialogTitle></DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label>اسم المستودع *</Label>
                          <Input placeholder="مثال: مستودع الرياض الرئيسي" value={newWarehouse.name} onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })} data-testid="input-warehouse-name" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>الكود *</Label>
                            <Input placeholder="WH-RYD-001" value={newWarehouse.code} onChange={(e) => setNewWarehouse({ ...newWarehouse, code: e.target.value })} data-testid="input-warehouse-code" />
                          </div>
                          <div>
                            <Label>المدينة *</Label>
                            <Select value={newWarehouse.cityId} onValueChange={(v) => setNewWarehouse({ ...newWarehouse, cityId: v })}>
                              <SelectTrigger data-testid="select-warehouse-city"><SelectValue placeholder="اختر المدينة" /></SelectTrigger>
                              <SelectContent>
                                {cities.filter(c => c.isActive && !warehousesList.some(w => w.cityId === c.id)).map((city) => (
                                  <SelectItem key={city.id} value={city.id.toString()}>{city.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>العنوان</Label>
                          <Input placeholder="العنوان التفصيلي" value={newWarehouse.address} onChange={(e) => setNewWarehouse({ ...newWarehouse, address: e.target.value })} data-testid="input-warehouse-address" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>رقم الهاتف</Label>
                            <Input placeholder="0500000000" value={newWarehouse.phone} onChange={(e) => setNewWarehouse({ ...newWarehouse, phone: e.target.value })} data-testid="input-warehouse-phone" />
                          </div>
                          <div>
                            <Label>السعة</Label>
                            <Input type="number" placeholder="1000" value={newWarehouse.capacity} onChange={(e) => setNewWarehouse({ ...newWarehouse, capacity: e.target.value })} data-testid="input-warehouse-capacity" />
                          </div>
                        </div>
                        <Button className="w-full rounded-xl" onClick={handleAddWarehouse} disabled={!newWarehouse.name || !newWarehouse.code || !newWarehouse.cityId} data-testid="button-submit-warehouse">
                          <Plus className="w-4 h-4 ml-2" />إضافة المستودع
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {warehousesList.map((warehouse) => {
                      const city = cities.find(c => c.id === warehouse.cityId);
                      return (
                        <div key={warehouse.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/20 transition-all" data-testid={`card-warehouse-${warehouse.id}`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white">
                                <Warehouse className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-bold">{warehouse.name}</p>
                                <p className="text-xs text-gray-500">#{warehouse.id} • {city?.name || 'غير محدد'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={warehouse.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                                {warehouse.isActive ? 'نشط' : 'متوقف'}
                              </Badge>
                              <Button size="icon" variant="ghost" className="rounded-lg"><Edit className="w-4 h-4" /></Button>
                              <Button size="icon" variant="ghost" className="rounded-lg hover:bg-red-50 hover:text-red-600" onClick={() => handleDeleteWarehouse(warehouse.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-white rounded-lg p-2 text-center">
                              <p className="text-xs text-gray-500">العنوان</p>
                              <p className="font-bold text-xs">{warehouse.address || 'غير محدد'}</p>
                            </div>
                            <div className="bg-white rounded-lg p-2 text-center">
                              <p className="text-xs text-gray-500">الهاتف</p>
                              <p className="font-bold text-xs">{warehouse.phone || 'غير محدد'}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {warehousesList.length === 0 && (
                      <div className="text-center py-10 text-gray-500">
                        <Warehouse className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>لا توجد مستودعات مسجلة</p>
                        <p className="text-sm">أضف مستودع جديد للبدء</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab - World Class */}
          <TabsContent value="products">
            {/* Product Stats */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
              <Card className="p-4 border-none shadow-md rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs">إجمالي المنتجات</p>
                    <p className="text-2xl font-bold">{products.length}</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-200" />
                </div>
              </Card>
              <Card className="p-4 border-none shadow-md rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs">مخزون متوفر</p>
                    <p className="text-2xl font-bold">{products.filter(p => p.stock >= 30).length}</p>
                  </div>
                  <PackageCheck className="w-8 h-8 text-green-200" />
                </div>
              </Card>
              <Card className="p-4 border-none shadow-md rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-xs">مخزون منخفض</p>
                    <p className="text-2xl font-bold">{products.filter(p => p.stock < 30).length}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-200" />
                </div>
              </Card>
              <Card className="p-4 border-none shadow-md rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs">الأقسام</p>
                    <p className="text-2xl font-bold">{categories.length}</p>
                  </div>
                  <Layers className="w-8 h-8 text-purple-200" />
                </div>
              </Card>
              <Card className="p-4 border-none shadow-md rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-xs">العلامات التجارية</p>
                    <p className="text-2xl font-bold">{brands.length}</p>
                  </div>
                  <Award className="w-8 h-8 text-orange-200" />
                </div>
              </Card>
              <Card className="p-4 border-none shadow-md rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-xs">قيمة المخزون</p>
                    <p className="text-lg font-bold">{products.reduce((sum, p) => sum + (parseFloat(p.price) * p.stock), 0).toLocaleString('ar-SY').slice(0, 8)} ل.س</p>
                  </div>
                  <Coins className="w-8 h-8 text-emerald-200" />
                </div>
              </Card>
            </div>

            <Card className="p-6 border-none shadow-lg rounded-2xl">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <Box className="w-6 h-6 text-primary" />
                  إدارة المنتجات ({products.length})
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    id="import-excel-file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      try {
                        const arrayBuffer = await file.arrayBuffer();
                        const base64 = btoa(
                          new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
                        );
                        
                        const res = await fetch('/api/products/import/excel', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ data: base64 }),
                        });
                        const data = await res.json();
                        if (res.ok) {
                          toast({ title: data.message, className: 'bg-green-600 text-white' });
                          refetchProducts();
                        } else {
                          toast({ title: data.error || 'خطأ في الاستيراد', variant: 'destructive' });
                        }
                      } catch (error) {
                        toast({ title: 'خطأ في الاستيراد', variant: 'destructive' });
                      }
                      e.target.value = '';
                    }}
                  />
                  <Button variant="outline" className="rounded-xl gap-2" onClick={() => document.getElementById('import-excel-file')?.click()}>
                    <Upload className="w-4 h-4" />استيراد Excel
                  </Button>
                  <Button variant="outline" className="rounded-xl gap-2" onClick={async () => {
                    try {
                      const res = await fetch('/api/products/export/excel');
                      const blob = await res.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `products_${new Date().toISOString().split('T')[0]}.xlsx`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      window.URL.revokeObjectURL(url);
                      toast({ title: 'تم تصدير المنتجات بنجاح', className: 'bg-green-600 text-white' });
                    } catch (error) {
                      toast({ title: 'خطأ في التصدير', variant: 'destructive' });
                    }
                  }}>
                    <Download className="w-4 h-4" />تصدير Excel
                  </Button>
                  <Button variant="outline" className="rounded-xl gap-2" onClick={() => window.print()}>
                    <Printer className="w-4 h-4" />طباعة
                  </Button>
                  <Dialog open={isAddProductOpen} onOpenChange={(open) => {
                    setIsAddProductOpen(open);
                    if (!open) {
                      setEditingProductId(null);
                      setNewProduct({ name: '', categoryId: '', brandId: '', price: '', originalPrice: '', image: '', minOrder: '1', unit: 'كرتون', stock: '100', priceCurrency: 'SYP' });
                      setProductPriceTiers([]);
                    }
                  }}>
                  <DialogTrigger asChild>
                    <Button className="rounded-xl gap-2" data-testid="button-add-product"><Plus className="w-4 h-4" />إضافة</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{editingProductId ? 'تعديل المنتج' : 'إضافة منتج جديد'}</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label>اسم المنتج *</Label>
                        <Input placeholder="مثال: حليب المراعي" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} data-testid="input-product-name" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>القسم *</Label>
                          <Select value={newProduct.categoryId} onValueChange={(v) => setNewProduct({ ...newProduct, categoryId: v })}>
                            <SelectTrigger data-testid="select-category"><SelectValue placeholder="اختر القسم" /></SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (<SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>العلامة التجارية</Label>
                          <Select value={newProduct.brandId} onValueChange={(v) => setNewProduct({ ...newProduct, brandId: v })}>
                            <SelectTrigger data-testid="select-brand"><SelectValue placeholder="اختر العلامة" /></SelectTrigger>
                            <SelectContent>
                              {brands.map((brand) => (<SelectItem key={brand.id} value={brand.id.toString()}>{brand.name}</SelectItem>))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>السعر *</Label>
                          <Input type="number" placeholder="0.00" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} data-testid="input-price" />
                        </div>
                        <div>
                          <Label>العملة *</Label>
                          <Select value={newProduct.priceCurrency} onValueChange={(v) => setNewProduct({ ...newProduct, priceCurrency: v })}>
                            <SelectTrigger data-testid="select-currency"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SYP">ل.س (سوري)</SelectItem>
                              <SelectItem value="USD">$ (دولار)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>السعر الأصلي</Label>
                          <Input type="number" placeholder="0.00" value={newProduct.originalPrice} onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })} data-testid="input-original-price" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>الحد الأدنى</Label>
                          <Input type="number" value={newProduct.minOrder} onChange={(e) => setNewProduct({ ...newProduct, minOrder: e.target.value })} data-testid="input-min-order" />
                        </div>
                        <div>
                          <Label>الوحدة</Label>
                          <Select value={newProduct.unit} onValueChange={(v) => setNewProduct({ ...newProduct, unit: v })}>
                            <SelectTrigger data-testid="select-unit"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="كرتون">كرتون</SelectItem>
                              <SelectItem value="كيس">كيس</SelectItem>
                              <SelectItem value="علبة">علبة</SelectItem>
                              <SelectItem value="قطعة">قطعة</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>المخزون</Label>
                          <Input type="number" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} data-testid="input-stock" />
                        </div>
                      </div>
                      <div>
                        <Label>صورة المنتج</Label>
                        <ImageUploader 
                          value={newProduct.image} 
                          onChange={(url) => setNewProduct({ ...newProduct, image: url })} 
                        />
                      </div>
                      
                      {/* Warehouse Inventory Section */}
                      <div className="border rounded-xl p-4 bg-gray-50">
                        <Label className="text-base font-bold flex items-center gap-2 mb-3">
                          <Warehouse className="w-4 h-4" />
                          توزيع المخزون على المستودعات
                        </Label>
                        <p className="text-xs text-gray-500 mb-3">حدد الكمية المتوفرة في كل مستودع</p>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {warehousesList.map((wh) => {
                            const city = cities.find((c: any) => c.id === wh.cityId);
                            const existingInv = productInventory.find(inv => inv.warehouseId === wh.id);
                            return (
                              <div key={wh.id} className="flex items-center justify-between gap-3 p-2 bg-white rounded-lg border">
                                <div className="flex items-center gap-2 flex-1">
                                  <Checkbox
                                    checked={!!existingInv}
                                    onCheckedChange={(checked: boolean) => {
                                      if (checked) {
                                        setProductInventory([...productInventory, { warehouseId: wh.id, stock: 0 }]);
                                      } else {
                                        setProductInventory(productInventory.filter(inv => inv.warehouseId !== wh.id));
                                      }
                                    }}
                                    data-testid={`checkbox-warehouse-${wh.id}`}
                                  />
                                  <span className="text-sm font-medium">{wh.name}</span>
                                  <span className="text-xs text-gray-500">({city?.name})</span>
                                </div>
                                {existingInv && (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      className="w-20 h-8 text-center"
                                      placeholder="0"
                                      value={existingInv.stock || ''}
                                      onChange={(e) => {
                                        setProductInventory(productInventory.map(inv =>
                                          inv.warehouseId === wh.id ? { ...inv, stock: parseInt(e.target.value) || 0 } : inv
                                        ));
                                      }}
                                      data-testid={`input-warehouse-stock-${wh.id}`}
                                    />
                                    <span className="text-xs text-gray-500">وحدة</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {warehousesList.length === 0 && (
                          <p className="text-center text-gray-400 text-sm py-4">لا توجد مستودعات. أضف مستودعات أولاً.</p>
                        )}
                      </div>
                      
                      {/* Price Tiers Section - أسعار الجملة المتدرجة */}
                      <div className="border rounded-xl p-4 bg-gradient-to-br from-purple-50 to-blue-50">
                        <Label className="text-base font-bold flex items-center gap-2 mb-3">
                          <TrendingDown className="w-4 h-4 text-purple-600" />
                          أسعار الجملة المتدرجة
                        </Label>
                        <p className="text-xs text-gray-500 mb-3">حدد أسعار خاصة حسب الكمية المشتراة (مثال: اشتري 10+ بسعر أقل)</p>
                        
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {productPriceTiers.map((tier, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-white rounded-lg border">
                              <div className="flex-1 grid grid-cols-4 gap-2">
                                <div>
                                  <Label className="text-xs text-gray-500">من (كمية)</Label>
                                  <Input
                                    type="number"
                                    className="h-8 text-sm"
                                    placeholder="10"
                                    value={tier.minQuantity}
                                    onChange={(e) => {
                                      const updated = [...productPriceTiers];
                                      updated[index].minQuantity = e.target.value;
                                      setProductPriceTiers(updated);
                                    }}
                                    data-testid={`input-tier-min-${index}`}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-gray-500">إلى (كمية)</Label>
                                  <Input
                                    type="number"
                                    className="h-8 text-sm"
                                    placeholder="غير محدود"
                                    value={tier.maxQuantity}
                                    onChange={(e) => {
                                      const updated = [...productPriceTiers];
                                      updated[index].maxQuantity = e.target.value;
                                      setProductPriceTiers(updated);
                                    }}
                                    data-testid={`input-tier-max-${index}`}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-gray-500">السعر</Label>
                                  <Input
                                    type="number"
                                    className="h-8 text-sm"
                                    placeholder="0.00"
                                    value={tier.price}
                                    onChange={(e) => {
                                      const updated = [...productPriceTiers];
                                      updated[index].price = e.target.value;
                                      // Calculate discount percent
                                      if (newProduct.price && e.target.value) {
                                        const discount = ((parseFloat(newProduct.price) - parseFloat(e.target.value)) / parseFloat(newProduct.price) * 100).toFixed(1);
                                        updated[index].discountPercent = discount;
                                      }
                                      setProductPriceTiers(updated);
                                    }}
                                    data-testid={`input-tier-price-${index}`}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-gray-500">الخصم %</Label>
                                  <div className="h-8 flex items-center text-sm text-green-600 font-bold">
                                    {tier.discountPercent ? `-${tier.discountPercent}%` : '-'}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                                onClick={() => setProductPriceTiers(productPriceTiers.filter((_, i) => i !== index))}
                                data-testid={`button-remove-tier-${index}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3 rounded-lg border-dashed"
                          onClick={() => setProductPriceTiers([...productPriceTiers, { minQuantity: '', maxQuantity: '', price: '', discountPercent: '' }])}
                          data-testid="button-add-tier"
                        >
                          <Plus className="w-4 h-4 ml-1" />
                          إضافة شريحة سعر
                        </Button>
                      </div>
                      
                      <Button className="w-full rounded-xl" onClick={handleAddProduct} disabled={!newProduct.name || !newProduct.categoryId || !newProduct.price} data-testid="button-submit-product">
                        {editingProductId ? <><Edit className="w-4 h-4 ml-2" />حفظ التعديلات</> : <><Plus className="w-4 h-4 ml-2" />إضافة المنتج</>}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Product Details Dialog */}
                <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl">تفاصيل المنتج</DialogTitle>
                    </DialogHeader>
                    {selectedProduct && (() => {
                      const category = categories.find(c => c.id === selectedProduct.categoryId);
                      const brand = brands.find(b => b.id === selectedProduct.brandId);
                      const stockValue = parseFloat(selectedProduct.price) * selectedProduct.stock;
                      return (
                        <div className="space-y-6 mt-4">
                          <div className="flex gap-6">
                            <img src={selectedProduct.image} alt={selectedProduct.name} className="w-40 h-40 rounded-2xl object-cover bg-gray-100 border" />
                            <div className="flex-1 space-y-3">
                              <h3 className="text-xl font-bold">{selectedProduct.name}</h3>
                              <div className="flex flex-wrap gap-2">
                                <Badge className={`${category?.color || 'bg-gray-100'} text-white`}>{category?.icon} {category?.name}</Badge>
                                <Badge variant="outline">{brand?.name}</Badge>
                                <Badge className={selectedProduct.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                  {selectedProduct.stock > 0 ? 'متوفر' : 'نفذ المخزون'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4">
                                <div>
                                  <span className="text-3xl font-bold text-primary">{parseFloat(selectedProduct.price).toLocaleString('ar-SY')}</span>
                                  <span className="text-lg text-gray-500 mr-1">ل.س</span>
                                </div>
                                {selectedProduct.originalPrice && (
                                  <div>
                                    <span className="text-lg text-gray-400 line-through">{selectedProduct.originalPrice} ل.س</span>
                                    <Badge className="mr-2 bg-red-500 text-white">
                                      -{Math.round((1 - parseFloat(selectedProduct.price) / parseFloat(selectedProduct.originalPrice)) * 100)}%
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-blue-50 rounded-xl text-center">
                              <Package className="w-6 h-6 mx-auto text-blue-600 mb-2" />
                              <p className="text-2xl font-bold text-blue-600">{selectedProduct.stock}</p>
                              <p className="text-xs text-gray-600">المخزون الحالي</p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-xl text-center">
                              <DollarSign className="w-6 h-6 mx-auto text-green-600 mb-2" />
                              <p className="text-xl font-bold text-green-600">{stockValue.toLocaleString('ar-SY')}</p>
                              <p className="text-xs text-gray-600">قيمة المخزون</p>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-xl text-center">
                              <ShoppingCart className="w-6 h-6 mx-auto text-purple-600 mb-2" />
                              <p className="text-2xl font-bold text-purple-600">{selectedProduct.minOrder}</p>
                              <p className="text-xs text-gray-600">الحد الأدنى للطلب</p>
                            </div>
                            <div className="p-4 bg-orange-50 rounded-xl text-center">
                              <Box className="w-6 h-6 mx-auto text-orange-600 mb-2" />
                              <p className="text-lg font-bold text-orange-600">{selectedProduct.unit}</p>
                              <p className="text-xs text-gray-600">وحدة البيع</p>
                            </div>
                          </div>

                          <div className="p-4 bg-gray-50 rounded-xl">
                            <h4 className="font-bold mb-3 flex items-center gap-2"><BarChart3 className="w-4 h-4" />معلومات إضافية</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex justify-between"><span className="text-gray-500">رقم المنتج:</span><span className="font-bold">#{selectedProduct.id}</span></div>
                              <div className="flex justify-between"><span className="text-gray-500">القسم:</span><span className="font-bold">{category?.name}</span></div>
                              <div className="flex justify-between"><span className="text-gray-500">العلامة التجارية:</span><span className="font-bold">{brand?.name || '-'}</span></div>
                              <div className="flex justify-between"><span className="text-gray-500">حالة المخزون:</span>
                                <span className={`font-bold ${selectedProduct.stock === 0 ? 'text-red-600' : selectedProduct.stock < 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                                  {selectedProduct.stock === 0 ? 'نفذ' : selectedProduct.stock < 30 ? 'منخفض' : 'جيد'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3 pt-4 border-t">
                            <Button className="flex-1 rounded-xl gap-2"><Edit className="w-4 h-4" />تعديل المنتج</Button>
                            <Button variant="outline" className="rounded-xl gap-2"><Copy className="w-4 h-4" />نسخ</Button>
                            <Button variant="outline" className="rounded-xl gap-2 text-red-600 border-red-200 hover:bg-red-50"
                              onClick={async () => {
                                if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
                                  await fetch(`/api/products/${selectedProduct.id}`, { method: 'DELETE' });
                                  toast({ title: 'تم حذف المنتج بنجاح', className: 'bg-green-600 text-white' });
                                  setSelectedProduct(null);
                                  refetchProducts();
                                }
                              }}>
                              <Trash2 className="w-4 h-4" />حذف
                            </Button>
                          </div>
                        </div>
                      );
                    })()}
                  </DialogContent>
                </Dialog>
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="p-4 bg-gray-50 rounded-xl mb-6 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-48">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input className="w-full bg-white border-gray-200 rounded-lg pr-10" placeholder="بحث بالاسم أو الكود..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} data-testid="input-search-products" />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-40 bg-white rounded-lg" data-testid="filter-category"><SelectValue placeholder="القسم" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأقسام</SelectItem>
                      {categories.map((cat) => (<SelectItem key={cat.id} value={cat.id.toString()}>{cat.icon} {cat.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <Select value={filterBrand} onValueChange={setFilterBrand}>
                    <SelectTrigger className="w-40 bg-white rounded-lg" data-testid="filter-brand"><SelectValue placeholder="العلامة" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع العلامات</SelectItem>
                      {brands.map((brand) => (<SelectItem key={brand.id} value={brand.id.toString()}>{brand.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStock} onValueChange={setFilterStock}>
                    <SelectTrigger className="w-40 bg-white rounded-lg" data-testid="filter-stock"><SelectValue placeholder="المخزون" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="out">نفذ المخزون</SelectItem>
                      <SelectItem value="low">مخزون منخفض (&lt;30)</SelectItem>
                      <SelectItem value="normal">مخزون طبيعي (30-100)</SelectItem>
                      <SelectItem value="high">مخزون عالي (&gt;100)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={productSort} onValueChange={setProductSort}>
                    <SelectTrigger className="w-40 bg-white rounded-lg"><SelectValue placeholder="الترتيب" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">الاسم (أ-ي)</SelectItem>
                      <SelectItem value="name-desc">الاسم (ي-أ)</SelectItem>
                      <SelectItem value="price">السعر (الأقل)</SelectItem>
                      <SelectItem value="price-desc">السعر (الأعلى)</SelectItem>
                      <SelectItem value="stock">المخزون (الأقل)</SelectItem>
                      <SelectItem value="stock-desc">المخزون (الأعلى)</SelectItem>
                      <SelectItem value="id-desc">الأحدث</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">السعر:</span>
                      <Input type="number" placeholder="من" className="w-24 bg-white rounded-lg" value={priceRange.min} onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })} />
                      <span className="text-gray-400">-</span>
                      <Input type="number" placeholder="إلى" className="w-24 bg-white rounded-lg" value={priceRange.max} onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })} />
                    </div>
                    {(filterCategory !== 'all' || filterBrand !== 'all' || filterStock !== 'all' || searchQuery || priceRange.min || priceRange.max) && (
                      <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => { setFilterCategory('all'); setFilterBrand('all'); setFilterStock('all'); setSearchQuery(''); setPriceRange({ min: '', max: '' }); }}>
                        <XCircle className="w-4 h-4 ml-1" />مسح الفلاتر
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant={productViewMode === 'table' ? 'default' : 'outline'} size="sm" className="rounded-lg" onClick={() => setProductViewMode('table')}>
                      <ClipboardList className="w-4 h-4" />
                    </Button>
                    <Button variant={productViewMode === 'grid' ? 'default' : 'outline'} size="sm" className="rounded-lg" onClick={() => setProductViewMode('grid')}>
                      <Boxes className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {/* Bulk Actions */}
                {selectedProducts.length > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-xl border border-primary/20">
                    <Badge className="bg-primary text-white">{selectedProducts.length} منتج محدد</Badge>
                    <Button size="sm" variant="outline" className="rounded-lg gap-1">
                      <Edit className="w-3 h-3" />تعديل جماعي
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-lg gap-1 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={async () => {
                        if (confirm(`هل أنت متأكد من حذف ${selectedProducts.length} منتج؟`)) {
                          for (const id of selectedProducts) {
                            await fetch(`/api/products/${id}`, { method: 'DELETE' });
                          }
                          toast({ title: `تم حذف ${selectedProducts.length} منتج`, className: 'bg-green-600 text-white' });
                          setSelectedProducts([]);
                          refetchProducts();
                        }
                      }}>
                      <Trash2 className="w-3 h-3" />حذف المحدد
                    </Button>
                    <Button size="sm" variant="ghost" className="rounded-lg" onClick={() => setSelectedProducts([])}>إلغاء التحديد</Button>
                  </div>
                )}
              </div>

              {productViewMode === 'table' ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-3 text-center">
                        <input type="checkbox" className="w-4 h-4 rounded" 
                          checked={selectedProducts.length === products.length && products.length > 0}
                          onChange={(e) => setSelectedProducts(e.target.checked ? products.map(p => p.id) : [])} />
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-600">#</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-600">المنتج</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-600">القسم</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-600">العلامة</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-600">السعر</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-600">المخزون</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-600">قيمة المخزون</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-600">الحالة</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-600">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products
                      .filter(p => searchQuery ? p.name.includes(searchQuery) : true)
                      .filter(p => filterCategory !== 'all' ? p.categoryId === parseInt(filterCategory) : true)
                      .filter(p => filterBrand !== 'all' ? p.brandId === parseInt(filterBrand) : true)
                      .filter(p => {
                        if (filterStock === 'out') return p.stock === 0;
                        if (filterStock === 'low') return p.stock > 0 && p.stock < 30;
                        if (filterStock === 'normal') return p.stock >= 30 && p.stock < 100;
                        if (filterStock === 'high') return p.stock >= 100;
                        return true;
                      })
                      .filter(p => {
                        if (priceRange.min && parseFloat(p.price) < parseFloat(priceRange.min)) return false;
                        if (priceRange.max && parseFloat(p.price) > parseFloat(priceRange.max)) return false;
                        return true;
                      })
                      .sort((a, b) => {
                        switch (productSort) {
                          case 'name': return a.name.localeCompare(b.name, 'ar');
                          case 'name-desc': return b.name.localeCompare(a.name, 'ar');
                          case 'price': return parseFloat(a.price) - parseFloat(b.price);
                          case 'price-desc': return parseFloat(b.price) - parseFloat(a.price);
                          case 'stock': return a.stock - b.stock;
                          case 'stock-desc': return b.stock - a.stock;
                          case 'id-desc': return b.id - a.id;
                          default: return 0;
                        }
                      })
                      .slice(0, 50).map((product, index) => {
                      const category = categories.find(c => c.id === product.categoryId);
                      const brand = brands.find(b => b.id === product.brandId);
                      const stockValue = parseFloat(product.price) * product.stock;
                      return (
                        <tr key={product.id} className={`hover:bg-gray-50 ${selectedProducts.includes(product.id) ? 'bg-primary/5' : ''}`} data-testid={`product-row-${product.id}`}>
                          <td className="px-2 py-3 text-center">
                            <input type="checkbox" className="w-4 h-4 rounded" 
                              checked={selectedProducts.includes(product.id)}
                              onChange={(e) => setSelectedProducts(e.target.checked ? [...selectedProducts, product.id] : selectedProducts.filter(id => id !== product.id))} />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400">{index + 1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={product.image} alt={product.name} className="w-14 h-14 rounded-xl object-cover bg-gray-100 border" />
                              <div>
                                <p className="font-bold text-sm">{product.name}</p>
                                <p className="text-xs text-gray-500">الحد الأدنى: {product.minOrder} {product.unit}</p>
                                <p className="text-xs text-gray-400">ID: {product.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={`${category?.color || 'bg-gray-100'} text-white text-xs`}>
                              {category?.icon} {category?.name || 'غير محدد'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm">{brand?.name || '-'}</td>
                          <td className="px-4 py-3">
                            <div>
                              <span className="font-bold text-lg text-primary">{parseFloat(product.price).toLocaleString('ar-SY')} ل.س</span>
                              {product.originalPrice && (
                                <div>
                                  <span className="text-xs text-gray-400 line-through">{product.originalPrice} ل.س</span>
                                  <Badge className="mr-2 bg-red-100 text-red-600 text-xs">
                                    -{Math.round((1 - parseFloat(product.price) / parseFloat(product.originalPrice)) * 100)}%
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${product.stock < 10 ? 'bg-red-500' : product.stock < 30 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                              <span className={`font-bold ${product.stock < 30 ? 'text-red-600' : 'text-gray-700'}`}>{product.stock}</span>
                              <span className="text-xs text-gray-400">{product.unit}</span>
                            </div>
                            {product.stock < 30 && (
                              <Badge className="bg-red-100 text-red-700 text-xs mt-1">تنبيه مخزون</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-emerald-600">{stockValue.toLocaleString('ar-SY')} ل.س</span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                              {product.stock > 0 ? 'متوفر' : 'نفذ'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="rounded-lg text-blue-600 hover:bg-blue-50" title="عرض التفاصيل" onClick={() => setSelectedProduct(product)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="rounded-lg" title="تعديل" data-testid={`edit-product-${product.id}`}
                                onClick={() => handleEditProduct(product)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="rounded-lg text-purple-600 hover:bg-purple-50" title="نسخ">
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50" title="حذف"
                                onClick={async () => {
                                  if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
                                    try {
                                      await fetch(`/api/products/${product.id}`, { method: 'DELETE' });
                                      toast({ title: 'تم حذف المنتج بنجاح', className: 'bg-green-600 text-white' });
                                      refetchProducts();
                                    } catch (error) {
                                      toast({ title: 'حدث خطأ', variant: 'destructive' });
                                    }
                                  }
                                }}
                                data-testid={`delete-product-${product.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              ) : (
              /* Grid View */
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {products
                  .filter(p => searchQuery ? p.name.includes(searchQuery) : true)
                  .filter(p => filterCategory !== 'all' ? p.categoryId === parseInt(filterCategory) : true)
                  .filter(p => filterBrand !== 'all' ? p.brandId === parseInt(filterBrand) : true)
                  .filter(p => {
                    if (filterStock === 'out') return p.stock === 0;
                    if (filterStock === 'low') return p.stock > 0 && p.stock < 30;
                    if (filterStock === 'normal') return p.stock >= 30 && p.stock < 100;
                    if (filterStock === 'high') return p.stock >= 100;
                    return true;
                  })
                  .filter(p => {
                    if (priceRange.min && parseFloat(p.price) < parseFloat(priceRange.min)) return false;
                    if (priceRange.max && parseFloat(p.price) > parseFloat(priceRange.max)) return false;
                    return true;
                  })
                  .sort((a, b) => {
                    switch (productSort) {
                      case 'name': return a.name.localeCompare(b.name, 'ar');
                      case 'name-desc': return b.name.localeCompare(a.name, 'ar');
                      case 'price': return parseFloat(a.price) - parseFloat(b.price);
                      case 'price-desc': return parseFloat(b.price) - parseFloat(a.price);
                      case 'stock': return a.stock - b.stock;
                      case 'stock-desc': return b.stock - a.stock;
                      case 'id-desc': return b.id - a.id;
                      default: return 0;
                    }
                  })
                  .slice(0, 50).map((product) => {
                  const category = categories.find(c => c.id === product.categoryId);
                  const brand = brands.find(b => b.id === product.brandId);
                  return (
                    <div key={product.id} className={`relative bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all cursor-pointer ${selectedProducts.includes(product.id) ? 'ring-2 ring-primary' : ''}`}>
                      <div className="absolute top-2 right-2 z-10">
                        <input type="checkbox" className="w-4 h-4 rounded"
                          checked={selectedProducts.includes(product.id)}
                          onChange={(e) => setSelectedProducts(e.target.checked ? [...selectedProducts, product.id] : selectedProducts.filter(id => id !== product.id))} />
                      </div>
                      {product.originalPrice && (
                        <div className="absolute top-2 left-2 z-10">
                          <Badge className="bg-red-500 text-white text-xs">
                            -{Math.round((1 - parseFloat(product.price) / parseFloat(product.originalPrice)) * 100)}%
                          </Badge>
                        </div>
                      )}
                      <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded-t-2xl bg-gray-100" />
                      <div className="p-3">
                        <Badge className={`${category?.color || 'bg-gray-100'} text-white text-xs mb-2`}>
                          {category?.icon} {category?.name}
                        </Badge>
                        <h4 className="font-bold text-sm line-clamp-2 mb-1">{product.name}</h4>
                        <p className="text-xs text-gray-500 mb-2">{brand?.name}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-primary">{parseFloat(product.price).toLocaleString('ar-SY')} ل.س</span>
                          <div className={`flex items-center gap-1 text-xs ${product.stock < 30 ? 'text-red-500' : 'text-green-600'}`}>
                            <div className={`w-2 h-2 rounded-full ${product.stock === 0 ? 'bg-red-500' : product.stock < 30 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                            {product.stock}
                          </div>
                        </div>
                      </div>
                      <div className="border-t flex">
                        <Button size="sm" variant="ghost" className="flex-1 rounded-none text-blue-600" onClick={() => setSelectedProduct(product)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="flex-1 rounded-none border-r border-l">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="flex-1 rounded-none text-red-500"
                          onClick={async () => {
                            if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
                              await fetch(`/api/products/${product.id}`, { method: 'DELETE' });
                              refetchProducts();
                            }
                          }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              )}
              
              {/* Pagination */}
              {products.length > 0 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <p className="text-sm text-gray-500">عرض {Math.min(products.length, 50)} من {products.length} منتج</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-lg" disabled>السابق</Button>
                    <Button variant="outline" size="sm" className="rounded-lg bg-primary text-white">1</Button>
                    <Button variant="outline" size="sm" className="rounded-lg" disabled>التالي</Button>
                  </div>
                </div>
              )}
              {products.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>لا توجد منتجات</p>
                </div>
              )}
            </Card>

            {/* Categories Management */}
            <Card className="p-6 border-none shadow-lg rounded-2xl mt-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl">إدارة الأقسام ({categories.length})</h3>
                <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                  <DialogTrigger asChild>
                    <Button className="rounded-xl gap-2" data-testid="button-add-category"><Plus className="w-4 h-4" />إضافة قسم</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>إضافة قسم جديد</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label>اسم القسم *</Label>
                        <Input placeholder="مثال: مشروبات" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} data-testid="input-category-name" />
                      </div>
                      <div>
                        <Label>الأيقونة (إيموجي)</Label>
                        <Input placeholder="📦" value={newCategory.icon} onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })} data-testid="input-category-icon" />
                      </div>
                      <div>
                        <Label>اللون</Label>
                        <Select value={newCategory.color} onValueChange={(v) => setNewCategory({ ...newCategory, color: v })}>
                          <SelectTrigger data-testid="select-category-color"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="from-blue-400 to-blue-500">أزرق</SelectItem>
                            <SelectItem value="from-green-400 to-green-500">أخضر</SelectItem>
                            <SelectItem value="from-red-400 to-red-500">أحمر</SelectItem>
                            <SelectItem value="from-purple-400 to-purple-500">بنفسجي</SelectItem>
                            <SelectItem value="from-orange-400 to-orange-500">برتقالي</SelectItem>
                            <SelectItem value="from-pink-400 to-pink-500">وردي</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="w-full rounded-xl" onClick={handleAddCategory} disabled={!newCategory.name} data-testid="button-submit-category">
                        <Plus className="w-4 h-4 ml-2" />إضافة القسم
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categories.map((cat) => (
                  <div key={cat.id} className={`p-4 rounded-2xl bg-gradient-to-br ${cat.color} text-white relative group`} data-testid={`category-card-${cat.id}`}>
                    <div className="text-3xl mb-2">{cat.icon}</div>
                    <p className="font-bold text-sm">{cat.name}</p>
                    <Button size="icon" variant="ghost" className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 hover:bg-white/40 text-white w-7 h-7" 
                      onClick={() => handleDeleteCategory(cat.id)} data-testid={`delete-category-${cat.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Brands Management */}
            <Card className="p-6 border-none shadow-lg rounded-2xl mt-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl">إدارة العلامات التجارية ({brands.length})</h3>
                <Dialog open={isAddBrandOpen} onOpenChange={setIsAddBrandOpen}>
                  <DialogTrigger asChild>
                    <Button className="rounded-xl gap-2" data-testid="button-add-brand"><Plus className="w-4 h-4" />إضافة علامة</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>إضافة علامة تجارية جديدة</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label>اسم العلامة *</Label>
                        <Input placeholder="مثال: المراعي" value={newBrand.name} onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })} data-testid="input-brand-name" />
                      </div>
                      <div>
                        <Label>الشعار (إيموجي)</Label>
                        <Input placeholder="🏷️" value={newBrand.logo} onChange={(e) => setNewBrand({ ...newBrand, logo: e.target.value })} data-testid="input-brand-logo" />
                      </div>
                      <Button className="w-full rounded-xl" onClick={handleAddBrand} disabled={!newBrand.name} data-testid="button-submit-brand">
                        <Plus className="w-4 h-4 ml-2" />إضافة العلامة
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {brands.map((brand) => (
                  <div key={brand.id} className="p-4 rounded-2xl bg-gray-100 relative group hover:bg-gray-200 transition-colors" data-testid={`brand-card-${brand.id}`}>
                    <div className="text-3xl mb-2">{brand.logo}</div>
                    <p className="font-bold text-sm text-gray-800">{brand.name}</p>
                    <Button size="icon" variant="ghost" className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-100 hover:bg-red-200 text-red-600 w-7 h-7" 
                      onClick={() => handleDeleteBrand(brand.id)} data-testid={`delete-brand-${brand.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Orders Tab - Enhanced */}
          <TabsContent value="orders">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
              <Card className="p-4 border-none shadow-md rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs">إجمالي الطلبات</p>
                    <p className="text-2xl font-bold">{adminOrders.length}</p>
                  </div>
                  <ShoppingCart className="w-8 h-8 text-blue-200" />
                </div>
              </Card>
              <Card className="p-4 border-none shadow-md rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-xs">قيد الانتظار</p>
                    <p className="text-2xl font-bold">{adminOrders.filter((o: any) => o.status === 'pending').length}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-200" />
                </div>
              </Card>
              <Card className="p-4 border-none shadow-md rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-xs">قيد التجهيز</p>
                    <p className="text-2xl font-bold">{adminOrders.filter((o: any) => o.status === 'processing').length}</p>
                  </div>
                  <Package className="w-8 h-8 text-orange-200" />
                </div>
              </Card>
              <Card className="p-4 border-none shadow-md rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs">قيد التوصيل</p>
                    <p className="text-2xl font-bold">{adminOrders.filter((o: any) => o.status === 'shipped').length}</p>
                  </div>
                  <Truck className="w-8 h-8 text-purple-200" />
                </div>
              </Card>
              <Card className="p-4 border-none shadow-md rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs">تم التوصيل</p>
                    <p className="text-2xl font-bold">{adminOrders.filter((o: any) => o.status === 'delivered').length}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-200" />
                </div>
              </Card>
              <Card className="p-4 border-none shadow-md rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-xs">ملغي</p>
                    <p className="text-2xl font-bold">{adminOrders.filter((o: any) => o.status === 'cancelled').length}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-200" />
                </div>
              </Card>
            </div>

            {/* Revenue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="p-4 border-none shadow-md rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                <p className="text-emerald-100 text-xs">إجمالي المبيعات</p>
                <p className="text-2xl font-bold">{adminOrders.reduce((sum: number, o: any) => sum + parseFloat(o.total || 0), 0).toLocaleString('ar-SY')} ل.س</p>
              </Card>
              <Card className="p-4 border-none shadow-md rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 text-white">
                <p className="text-teal-100 text-xs">مبيعات المكتملة</p>
                <p className="text-2xl font-bold">{adminOrders.filter((o: any) => o.status === 'delivered').reduce((sum: number, o: any) => sum + parseFloat(o.total || 0), 0).toLocaleString('ar-SY')} ل.س</p>
              </Card>
              <Card className="p-4 border-none shadow-md rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
                <p className="text-cyan-100 text-xs">متوسط قيمة الطلب</p>
                <p className="text-2xl font-bold">{adminOrders.length > 0 ? (adminOrders.reduce((sum: number, o: any) => sum + parseFloat(o.total || 0), 0) / adminOrders.length).toFixed(0) : 0} ل.س</p>
              </Card>
              <Card className="p-4 border-none shadow-md rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                <p className="text-indigo-100 text-xs">معدل الإكمال</p>
                <p className="text-2xl font-bold">{adminOrders.length > 0 ? ((adminOrders.filter((o: any) => o.status === 'delivered').length / adminOrders.length) * 100).toFixed(1) : 0}%</p>
              </Card>
            </div>

            <Card className="p-6 border-none shadow-lg rounded-2xl">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <ClipboardList className="w-6 h-6 text-primary" />
                  إدارة الطلبات
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input className="w-48 bg-gray-50 border-none rounded-xl pr-10" placeholder="بحث برقم الطلب..." 
                      value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} data-testid="search-orders" />
                  </div>
                  <Select value={orderFilterStatus} onValueChange={setOrderFilterStatus}>
                    <SelectTrigger className="w-36 rounded-xl bg-gray-50 border-none"><SelectValue placeholder="الحالة" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      <SelectItem value="pending">قيد الانتظار</SelectItem>
                      <SelectItem value="confirmed">مؤكد</SelectItem>
                      <SelectItem value="processing">قيد التجهيز</SelectItem>
                      <SelectItem value="shipped">قيد التوصيل</SelectItem>
                      <SelectItem value="delivered">تم التوصيل</SelectItem>
                      <SelectItem value="cancelled">ملغي</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={orderDateFilter} onValueChange={setOrderDateFilter}>
                    <SelectTrigger className="w-32 rounded-xl bg-gray-50 border-none"><SelectValue placeholder="التاريخ" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="today">اليوم</SelectItem>
                      <SelectItem value="week">هذا الأسبوع</SelectItem>
                      <SelectItem value="month">هذا الشهر</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={orderWarehouseFilter} onValueChange={setOrderWarehouseFilter}>
                    <SelectTrigger className="w-40 rounded-xl bg-gray-50 border-none"><SelectValue placeholder="المستودع" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المستودعات</SelectItem>
                      {warehousesList.map((w: any) => (
                        <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="rounded-xl gap-2" onClick={() => window.print()}>
                    <Printer className="w-4 h-4" />طباعة
                  </Button>
                  <Button variant="outline" className="rounded-xl gap-2">
                    <Download className="w-4 h-4" />تصدير Excel
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-600">رقم الطلب</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-600">العميل</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-600">المستودع</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-600">التاريخ</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-600">المبلغ</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-600">طريقة الدفع</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-600">الحالة</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-600">تغيير الحالة</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-600">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(() => {
                      const filteredOrders = adminOrders.filter((order: any) => {
                        const matchesStatus = orderFilterStatus === 'all' || order.status === orderFilterStatus;
                        const matchesSearch = orderSearch === '' || order.id.toString().includes(orderSearch);
                        const matchesWarehouse = orderWarehouseFilter === 'all' || order.warehouseId?.toString() === orderWarehouseFilter;
                        let matchesDate = true;
                        if (orderDateFilter !== 'all') {
                          const orderDate = new Date(order.createdAt);
                          const now = new Date();
                          if (orderDateFilter === 'today') {
                            matchesDate = orderDate.toDateString() === now.toDateString();
                          } else if (orderDateFilter === 'week') {
                            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                            matchesDate = orderDate >= weekAgo;
                          } else if (orderDateFilter === 'month') {
                            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                            matchesDate = orderDate >= monthAgo;
                          }
                        }
                        return matchesStatus && matchesSearch && matchesDate && matchesWarehouse;
                      });
                      return filteredOrders.length > 0 ? filteredOrders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-gray-50" data-testid={`order-row-${order.id}`}>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                              order.status === 'shipped' ? 'bg-purple-100 text-purple-600' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-600' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                              'bg-yellow-100 text-yellow-600'
                            }`}>
                              <Package className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-primary">#{order.id}</p>
                              <p className="text-xs text-gray-400">{order.items?.length || 0} منتج</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-bold text-sm">{order.user?.facilityName || 'عميل'}</p>
                            <p className="text-xs text-gray-500">{order.user?.phone || ''}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {order.warehouse ? (
                            <Badge className="bg-indigo-100 text-indigo-700">
                              {order.warehouse.name}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">غير محدد</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm">{new Date(order.createdAt).toLocaleDateString('ar-SY')}</p>
                            <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-bold text-lg text-primary">{parseFloat(order.total).toLocaleString('ar-SY')} ل.س</p>
                        </td>
                        <td className="px-4 py-4">
                          <Badge className={order.paymentMethod === 'wallet' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}>
                            {order.paymentMethod === 'wallet' ? 'محفظة' : order.paymentMethod === 'cash' ? 'كاش عند التسليم' : order.paymentMethod || 'كاش'}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">{getStatusBadge(order.status)}</td>
                        <td className="px-4 py-4">
                          <Select defaultValue={order.status} onValueChange={async (value) => {
                            try {
                              await fetch(`/api/orders/${order.id}/status`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: value }),
                              });
                              toast({ title: 'تم تحديث حالة الطلب', className: 'bg-green-600 text-white' });
                              queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
                            } catch (error) {
                              toast({ title: 'حدث خطأ', variant: 'destructive' });
                            }
                          }}>
                            <SelectTrigger className="w-36 rounded-lg text-sm" data-testid={`order-status-${order.id}`}><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">قيد الانتظار</SelectItem>
                              <SelectItem value="confirmed">مؤكد</SelectItem>
                              <SelectItem value="processing">قيد التجهيز</SelectItem>
                              <SelectItem value="shipped">قيد التوصيل</SelectItem>
                              <SelectItem value="delivered">تم التوصيل</SelectItem>
                              <SelectItem value="cancelled">ملغي</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="عرض التفاصيل" 
                              onClick={() => setSelectedOrder(order)} data-testid={`view-order-${order.id}`}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="rounded-lg" title="طباعة الفاتورة">
                              <Printer className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="rounded-lg text-green-600 hover:text-green-700 hover:bg-green-50" title="تأكيد الطلب"
                              onClick={async () => {
                                try {
                                  await fetch(`/api/orders/${order.id}/status`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: 'confirmed' }),
                                  });
                                  toast({ title: 'تم تأكيد الطلب', className: 'bg-green-600 text-white' });
                                  queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
                                } catch (error) {
                                  toast({ title: 'حدث خطأ', variant: 'destructive' });
                                }
                              }}
                              data-testid={`confirm-order-${order.id}`}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50" title="إلغاء الطلب"
                              onClick={async () => {
                                if (confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) {
                                  try {
                                    await fetch(`/api/orders/${order.id}/status`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ status: 'cancelled' }),
                                    });
                                    toast({ title: 'تم إلغاء الطلب', className: 'bg-red-600 text-white' });
                                    queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
                                  } catch (error) {
                                    toast({ title: 'حدث خطأ', variant: 'destructive' });
                                  }
                                }
                              }}
                              data-testid={`cancel-order-${order.id}`}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={8} className="text-center py-16 text-gray-500">
                          <ShoppingCart className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-bold mb-2">لا توجد طلبات</p>
                          <p className="text-sm">ستظهر الطلبات هنا عند إنشائها من قبل العملاء</p>
                        </td>
                      </tr>
                    );
                    })()}
                  </tbody>
                </table>
              </div>

              {adminOrders.length > 0 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <p className="text-sm text-gray-500">عرض {Math.min(adminOrders.length, 50)} من {adminOrders.length} طلب</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-lg" disabled>السابق</Button>
                    <Button variant="outline" size="sm" className="rounded-lg bg-primary text-white">1</Button>
                    <Button variant="outline" size="sm" className="rounded-lg" disabled>التالي</Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Order Details Dialog */}
            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xl">تفاصيل الطلب #{selectedOrder?.id}</p>
                      <p className="text-sm text-gray-500 font-normal">{selectedOrder && new Date(selectedOrder.createdAt).toLocaleString('ar-SY')}</p>
                    </div>
                  </DialogTitle>
                </DialogHeader>

                {selectedOrder && (
                  <div className="mt-4 space-y-6">
                    {/* Order Status Timeline */}
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <h4 className="font-bold mb-4 flex items-center gap-2"><Clock className="w-4 h-4" />مسار الطلب</h4>
                      <div className="flex items-center justify-between relative">
                        <div className="absolute top-4 right-8 left-8 h-1 bg-gray-200"></div>
                        {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((status, index) => {
                          const statusLabels: Record<string, string> = { pending: 'قيد الانتظار', confirmed: 'مؤكد', processing: 'قيد التجهيز', shipped: 'قيد التوصيل', delivered: 'تم التوصيل' };
                          const currentIndex = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'].indexOf(selectedOrder.status);
                          const isCompleted = index <= currentIndex && selectedOrder.status !== 'cancelled';
                          return (
                            <div key={status} className="flex flex-col items-center z-10">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}>
                                {isCompleted ? <CheckCircle className="w-4 h-4" /> : <span className="text-xs">{index + 1}</span>}
                              </div>
                              <span className={`text-xs mt-2 ${isCompleted ? 'font-bold text-primary' : 'text-gray-400'}`}>{statusLabels[status]}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Customer Info */}
                      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <h4 className="font-bold mb-3 flex items-center gap-2 text-blue-700"><Users className="w-4 h-4" />بيانات العميل</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-gray-600">اسم المنشأة:</span><span className="font-bold">{selectedOrder.user?.facilityName || 'غير محدد'}</span></div>
                          <div className="flex justify-between"><span className="text-gray-600">الهاتف:</span><span className="font-bold font-mono">{selectedOrder.user?.phone || '-'}</span></div>
                          <div className="flex justify-between"><span className="text-gray-600">السجل التجاري:</span><span className="font-bold">{selectedOrder.user?.commercialRegister || '-'}</span></div>
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                        <h4 className="font-bold mb-3 flex items-center gap-2 text-green-700"><Receipt className="w-4 h-4" />ملخص الطلب</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-gray-600">المجموع الفرعي:</span><span className="font-bold">{parseFloat(selectedOrder.subtotal || selectedOrder.total).toLocaleString('ar-SY')} ل.س</span></div>
                          <div className="flex justify-between"><span className="text-gray-600">رسوم التوصيل:</span><span className="font-bold">{parseFloat(selectedOrder.deliveryFee || 0).toLocaleString('ar-SY')} ل.س</span></div>
                          <div className="flex justify-between"><span className="text-gray-600">الخصم:</span><span className="font-bold text-red-600">-{parseFloat(selectedOrder.discount || 0).toLocaleString('ar-SY')} ل.س</span></div>
                          <div className="flex justify-between pt-2 border-t border-green-200"><span className="font-bold">الإجمالي:</span><span className="font-bold text-xl text-green-700">{parseFloat(selectedOrder.total).toLocaleString('ar-SY')} ل.س</span></div>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <h4 className="font-bold mb-4 flex items-center gap-2"><ShoppingCart className="w-4 h-4" />المنتجات ({selectedOrder.items?.length || 0})</h4>
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        <div className="space-y-3">
                          {selectedOrder.items.map((item: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-xl border">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                                  <Package className="w-6 h-6 text-gray-400" />
                                </div>
                                <div>
                                  <p className="font-bold text-sm">{item.product?.name || item.productName || 'منتج'}</p>
                                  <p className="text-xs text-gray-500">الكمية: {item.quantity}</p>
                                </div>
                              </div>
                              <p className="font-bold text-primary">{parseFloat(item.price || 0).toLocaleString('ar-SY')} ل.س</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">لا توجد منتجات</p>
                      )}
                    </div>

                    {/* Delivery Address with Map */}
                    {selectedOrder.address && (
                      <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                        <h4 className="font-bold mb-3 flex items-center gap-2 text-purple-700"><MapPin className="w-4 h-4" />عنوان التوصيل</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-gray-600">العنوان:</span><span className="font-bold">{selectedOrder.address?.label || selectedOrder.address?.street || 'غير محدد'}</span></div>
                          {selectedOrder.address?.details && (
                            <div className="flex justify-between"><span className="text-gray-600">تفاصيل:</span><span className="font-bold">{selectedOrder.address.details}</span></div>
                          )}
                          {selectedOrder.address?.phone && (
                            <div className="flex justify-between"><span className="text-gray-600">هاتف:</span><span className="font-bold font-mono">{selectedOrder.address.phone}</span></div>
                          )}
                        </div>
                        {selectedOrder.address?.latitude && selectedOrder.address?.longitude && (
                          <Button 
                            className="w-full mt-3 rounded-xl gap-2 bg-purple-600 hover:bg-purple-700" 
                            onClick={() => {
                              setMapOrderAddress({
                                lat: parseFloat(selectedOrder.address.latitude),
                                lng: parseFloat(selectedOrder.address.longitude),
                                label: selectedOrder.address?.label || 'موقع التوصيل'
                              });
                              setShowDeliveryMap(true);
                            }}
                            data-testid="button-view-map"
                          >
                            <MapPinned className="w-4 h-4" />عرض الخريطة للسائق
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t">
                      <Button className="rounded-xl gap-2" onClick={() => window.print()}>
                        <Printer className="w-4 h-4" />طباعة الفاتورة
                      </Button>
                      <Select defaultValue={selectedOrder.status} onValueChange={async (value) => {
                        try {
                          await fetch(`/api/orders/${selectedOrder.id}/status`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: value }),
                          });
                          toast({ title: 'تم تحديث حالة الطلب', className: 'bg-green-600 text-white' });
                          queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
                          setSelectedOrder({ ...selectedOrder, status: value });
                        } catch (error) {
                          toast({ title: 'حدث خطأ', variant: 'destructive' });
                        }
                      }}>
                        <SelectTrigger className="w-44 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">قيد الانتظار</SelectItem>
                          <SelectItem value="confirmed">مؤكد</SelectItem>
                          <SelectItem value="processing">قيد التجهيز</SelectItem>
                          <SelectItem value="shipped">قيد التوصيل</SelectItem>
                          <SelectItem value="delivered">تم التوصيل</SelectItem>
                          <SelectItem value="cancelled">ملغي</SelectItem>
                        </SelectContent>
                      </Select>
                      {selectedOrder.status !== 'cancelled' && (
                        <Button variant="outline" className="rounded-xl gap-2 text-red-600 hover:bg-red-50" onClick={async () => {
                          if (confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) {
                            try {
                              await fetch(`/api/orders/${selectedOrder.id}/status`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'cancelled' }),
                              });
                              toast({ title: 'تم إلغاء الطلب', className: 'bg-red-600 text-white' });
                              queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
                              setSelectedOrder(null);
                            } catch (error) {
                              toast({ title: 'حدث خطأ', variant: 'destructive' });
                            }
                          }
                        }}>
                          <XCircle className="w-4 h-4" />إلغاء الطلب
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
            
            {/* Delivery Map Dialog */}
            <Dialog open={showDeliveryMap} onOpenChange={setShowDeliveryMap}>
              <DialogContent className="max-w-lg rounded-3xl p-0 overflow-hidden">
                <DialogHeader className="p-4 bg-gradient-to-l from-purple-600 to-purple-500 text-white">
                  <DialogTitle className="flex items-center gap-2">
                    <MapPinned className="w-5 h-5" />
                    خريطة التوصيل
                  </DialogTitle>
                  <DialogDescription className="text-purple-100">
                    {mapOrderAddress?.label || 'موقع العميل'}
                  </DialogDescription>
                </DialogHeader>
                <div className="p-4 space-y-4">
                  {mapOrderAddress && (
                    <>
                      <DeliveryMapView lat={mapOrderAddress.lat} lng={mapOrderAddress.lng} label={mapOrderAddress.label} />
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 rounded-xl gap-2 bg-blue-600 hover:bg-blue-700"
                          onClick={() => {
                            window.open(`https://www.google.com/maps/dir/?api=1&destination=${mapOrderAddress.lat},${mapOrderAddress.lng}`, '_blank');
                          }}
                          data-testid="button-google-maps"
                        >
                          <Navigation className="w-4 h-4" />فتح في خرائط Google
                        </Button>
                        <Button 
                          variant="outline"
                          className="rounded-xl gap-2"
                          onClick={() => {
                            navigator.clipboard.writeText(`${mapOrderAddress.lat}, ${mapOrderAddress.lng}`);
                            toast({ title: 'تم نسخ الإحداثيات', className: 'bg-green-600 text-white' });
                          }}
                          data-testid="button-copy-coords"
                        >
                          <Copy className="w-4 h-4" />نسخ
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Customers Tab */}
          {/* Customers Tab - World Class */}
          <TabsContent value="customers">
            <div className="space-y-6">
              {/* Customer KPIs Dashboard */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card className="p-4 border-none shadow-lg rounded-2xl bg-gradient-to-br from-blue-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-700">{customerStats?.total || adminUsers.length}</p>
                      <p className="text-xs text-blue-600">إجمالي العملاء</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border-none shadow-lg rounded-2xl bg-gradient-to-br from-green-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                      <UserPlus className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-700">{customerStats?.newThisMonth || 0}</p>
                      <p className="text-xs text-green-600">جدد هذا الشهر</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border-none shadow-lg rounded-2xl bg-gradient-to-br from-purple-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Crown className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-700">{customerStats?.vipCount || 0}</p>
                      <p className="text-xs text-purple-600">عملاء VIP</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border-none shadow-lg rounded-2xl bg-gradient-to-br from-orange-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-700">{customerStats?.activeCount || 0}</p>
                      <p className="text-xs text-orange-600">نشط</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border-none shadow-lg rounded-2xl bg-gradient-to-br from-red-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                      <UserMinus className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-700">{customerStats?.inactiveCount || 0}</p>
                      <p className="text-xs text-red-600">غير نشط</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border-none shadow-lg rounded-2xl bg-gradient-to-br from-teal-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-teal-700">
                        {(customerStats?.avgCustomerValue || 0).toLocaleString('ar-SY')}
                      </p>
                      <p className="text-xs text-teal-600">متوسط قيمة العميل</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Customer Analytics Row */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Customer Growth Chart */}
                <Card className="p-6 border-none shadow-lg rounded-2xl">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    نمو العملاء
                  </h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={customerGrowthData}>
                        <defs>
                          <linearGradient id="customerGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" stroke="#9ca3af" fontSize={10} />
                        <YAxis stroke="#9ca3af" fontSize={10} />
                        <Tooltip />
                        <Area type="monotone" dataKey="count" stroke="#8b5cf6" fill="url(#customerGradient)" strokeWidth={2} name="عدد العملاء" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Customer Segments */}
                <Card className="p-6 border-none shadow-lg rounded-2xl">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-primary" />
                    شرائح العملاء
                  </h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={[
                            { name: 'VIP', value: customerStats?.vipCount || 0, fill: '#8b5cf6' },
                            { name: 'نشط', value: customerStats?.activeCount || 0, fill: '#22c55e' },
                            { name: 'غير نشط', value: customerStats?.inactiveCount || 0, fill: '#ef4444' },
                            { name: 'جديد', value: customerStats?.newThisMonth || 0, fill: '#f59e0b' },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        />
                        <Tooltip />
                        <Legend />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Quick Actions & Stats */}
                <Card className="p-6 border-none shadow-lg rounded-2xl">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    إجراءات سريعة
                  </h3>
                  <div className="space-y-3">
                    <Button 
                      className="w-full rounded-xl justify-start gap-3 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200" 
                      variant="outline"
                      onClick={() => setShowAddCustomerDialog(true)}
                      data-testid="button-add-customer"
                    >
                      <UserPlus className="w-5 h-5" />
                      إضافة عميل جديد
                    </Button>
                    <Button className="w-full rounded-xl justify-start gap-3 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200" variant="outline">
                      <Mail className="w-5 h-5" />
                      إرسال حملة تسويقية
                    </Button>
                    <Button 
                      className="w-full rounded-xl justify-start gap-3 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200" 
                      variant="outline"
                      onClick={() => {
                        const csv = adminUsers.map((u: any) => `${u.facilityName},${u.phone},${u.commercialRegister || ''},${new Date(u.createdAt).toLocaleDateString('ar-SY')}`).join('\n');
                        const blob = new Blob([`الاسم,الهاتف,السجل التجاري,تاريخ التسجيل\n${csv}`], { type: 'text/csv;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = 'customers.csv';
                        link.click();
                        toast({ title: 'تم تصدير قائمة العملاء بنجاح', className: 'bg-green-600 text-white' });
                      }}
                      data-testid="button-export-customers"
                    >
                      <Download className="w-5 h-5" />
                      تصدير قائمة العملاء
                    </Button>
                    <Button 
                      className="w-full rounded-xl justify-start gap-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200" 
                      variant="outline"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.xlsx,.xls';
                        input.onchange = async (e: any) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          toast({ title: 'جاري استيراد العملاء...', className: 'bg-blue-600 text-white' });
                          
                          const reader = new FileReader();
                          reader.onload = async (event) => {
                            const base64 = (event.target?.result as string).split(',')[1];
                            try {
                              const res = await fetch('/api/admin/customers/import/excel', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ data: base64 })
                              });
                              const result = await res.json();
                              if (res.ok) {
                                toast({ title: result.message, className: 'bg-green-600 text-white' });
                                refetchAdminUsers();
                              } else {
                                toast({ title: result.error, variant: 'destructive' });
                              }
                            } catch (err) {
                              toast({ title: 'خطأ في الاستيراد', variant: 'destructive' });
                            }
                          };
                          reader.readAsDataURL(file);
                        };
                        input.click();
                      }}
                      data-testid="button-import-customers"
                    >
                      <Upload className="w-5 h-5" />
                      استيراد من Excel
                    </Button>
                    <Button className="w-full rounded-xl justify-start gap-3 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200" variant="outline">
                      <BarChart3 className="w-5 h-5" />
                      تقرير تحليلي
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Customer Metrics Row */}
              <div className="grid lg:grid-cols-4 gap-4">
                <Card className="p-5 border-none shadow-lg rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">معدل الاحتفاظ</span>
                    <Badge className="bg-green-100 text-green-700">حقيقي</Badge>
                  </div>
                  <p className="text-3xl font-bold mb-2">{customerStats?.retentionRate || 0}%</p>
                  <Progress value={customerStats?.retentionRate || 0} className="h-2" />
                </Card>
                <Card className="p-5 border-none shadow-lg rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">معدل إعادة الطلب</span>
                    <Badge className="bg-blue-100 text-blue-700">حقيقي</Badge>
                  </div>
                  <p className="text-3xl font-bold mb-2">{customerStats?.reorderRate || 0}%</p>
                  <Progress value={customerStats?.reorderRate || 0} className="h-2" />
                </Card>
                <Card className="p-5 border-none shadow-lg rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">رضا العملاء</span>
                    <Badge className="bg-purple-100 text-purple-700">4.8/5</Badge>
                  </div>
                  <p className="text-3xl font-bold mb-2">{customerStats?.satisfactionRate || 0}%</p>
                  <Progress value={customerStats?.satisfactionRate || 0} className="h-2" />
                </Card>
                <Card className="p-5 border-none shadow-lg rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">معدل التحويل</span>
                    <Badge className="bg-orange-100 text-orange-700">حقيقي</Badge>
                  </div>
                  <p className="text-3xl font-bold mb-2">{customerStats?.conversionRate || 0}%</p>
                  <Progress value={customerStats?.conversionRate || 0} className="h-2" />
                </Card>
              </div>

              {/* Customers Table */}
              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-bold text-xl flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      قائمة العملاء
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">{adminUsers.length} عميل مسجل</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        placeholder="بحث بالاسم أو الهاتف..." 
                        className="pr-10 rounded-xl w-56" 
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        data-testid="input-customer-search"
                      />
                    </div>
                    <Select value={customerStatusFilter} onValueChange={setCustomerStatusFilter}>
                      <SelectTrigger className="w-32 rounded-xl">
                        <SelectValue placeholder="الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        <SelectItem value="active">نشط</SelectItem>
                        <SelectItem value="inactive">غير نشط</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={customerCityFilter} onValueChange={setCustomerCityFilter}>
                      <SelectTrigger className="w-32 rounded-xl">
                        <SelectValue placeholder="المدينة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل المدن</SelectItem>
                        {cities.map((city: any) => (
                          <SelectItem key={city.id} value={city.id.toString()}>{city.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      className="rounded-xl gap-2 bg-primary"
                      onClick={() => setShowAddCustomerDialog(true)}
                      data-testid="button-add-customer-header"
                    >
                      <UserPlus className="w-4 h-4" />
                      إضافة عميل
                    </Button>
                  </div>
                </div>

                {adminUsers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-right border-b border-gray-100 bg-gray-50/50">
                          <th className="px-4 py-3 text-sm font-bold text-gray-600 rounded-tr-xl">العميل</th>
                          <th className="px-4 py-3 text-sm font-bold text-gray-600">الهاتف</th>
                          <th className="px-4 py-3 text-sm font-bold text-gray-600">السجل التجاري</th>
                          <th className="px-4 py-3 text-sm font-bold text-gray-600">المدينة</th>
                          <th className="px-4 py-3 text-sm font-bold text-gray-600">الطلبات</th>
                          <th className="px-4 py-3 text-sm font-bold text-gray-600">إجمالي المشتريات</th>
                          <th className="px-4 py-3 text-sm font-bold text-gray-600">الحالة</th>
                          <th className="px-4 py-3 text-sm font-bold text-gray-600">تاريخ التسجيل</th>
                          <th className="px-4 py-3 text-sm font-bold text-gray-600 rounded-tl-xl">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {adminUsers
                          .filter((user: any) => {
                            const matchesSearch = !customerSearch || 
                              user.facilityName?.toLowerCase().includes(customerSearch.toLowerCase()) ||
                              user.phone?.includes(customerSearch);
                            const matchesCity = customerCityFilter === 'all' || user.cityId?.toString() === customerCityFilter;
                            
                            // Status filter logic
                            const tc = topCustomers.find((tc: any) => tc.user?.id === user.id);
                            const userIsVip = tc ? tc.totalSpent >= 500000 : false;
                            const userIsActive = tc ? tc.orderCount > 0 : false;
                            
                            let matchesStatus = true;
                            if (customerStatusFilter === 'vip') {
                              matchesStatus = userIsVip;
                            } else if (customerStatusFilter === 'active') {
                              matchesStatus = userIsActive && !userIsVip;
                            } else if (customerStatusFilter === 'inactive') {
                              matchesStatus = !userIsActive;
                            }
                            
                            return matchesSearch && matchesCity && matchesStatus;
                          })
                          .slice((customersPage - 1) * customersPerPage, customersPage * customersPerPage).map((user: any, index: number) => {
                          const topCustomer = topCustomers.find((tc: any) => tc.user?.id === user.id);
                          const isVip = topCustomer ? topCustomer.totalSpent >= 500000 : false;
                          const isActive = topCustomer ? topCustomer.orderCount > 0 : false;
                          const orderCount = topCustomer?.orderCount || 0;
                          const totalSpent = topCustomer?.totalSpent || 0;
                          const userCity = cities.find((c: any) => c.id === user.cityId);
                          
                          return (
                            <tr key={user.id} className="hover:bg-gray-50/80 transition-colors" data-testid={`customer-row-${user.id}`}>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold shadow-sm ${isVip ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-primary to-blue-600'}`}>
                                    {user.facilityName?.charAt(0) || 'ع'}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="font-bold text-sm">{user.facilityName || 'عميل'}</p>
                                      {isVip && <Crown className="w-4 h-4 text-yellow-500" />}
                                    </div>
                                    <p className="text-xs text-gray-400">#{user.id}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded-lg">{user.phone}</span>
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-600">
                                {user.commercialRegister || <span className="text-gray-400">غير محدد</span>}
                              </td>
                              <td className="px-4 py-4">
                                {userCity ? (
                                  <Badge variant="outline" className="bg-gray-50">{userCity.name}</Badge>
                                ) : (
                                  <span className="text-gray-400 text-sm">غير محدد</span>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                <span className="font-bold text-primary">{orderCount}</span>
                                <span className="text-gray-400 text-xs mr-1">طلب</span>
                              </td>
                              <td className="px-4 py-4">
                                <span className="font-bold">{totalSpent.toLocaleString('ar-SY')}</span>
                                <span className="text-gray-400 text-xs mr-1">ل.س</span>
                              </td>
                              <td className="px-4 py-4">
                                {isVip ? (
                                  <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0">VIP</Badge>
                                ) : isActive ? (
                                  <Badge className="bg-green-100 text-green-700 border-green-200">نشط</Badge>
                                ) : (
                                  <Badge className="bg-gray-100 text-gray-600 border-gray-200">غير نشط</Badge>
                                )}
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-500">
                                {new Date(user.createdAt).toLocaleDateString('ar-SY')}
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-1">
                                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-blue-50 hover:text-blue-600"
                                    onClick={() => { setSelectedCustomerId(user.id); setShowCustomerDetails(true); }}
                                    data-testid={`view-customer-${user.id}`}>
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-green-50 hover:text-green-600"
                                    onClick={() => window.open(`tel:${user.phone}`)}
                                    data-testid={`call-customer-${user.id}`}>
                                    <Phone className="w-4 h-4" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-purple-50 hover:text-purple-600"
                                    onClick={() => toast({ title: 'لم يتم تحديد البريد الإلكتروني' })}
                                    data-testid={`email-customer-${user.id}`}>
                                    <Mail className="w-4 h-4" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-orange-50 hover:text-orange-600"
                                    onClick={() => {
                                      setEditingCustomer({
                                        id: user.id,
                                        phone: user.phone || '',
                                        facilityName: user.facilityName || '',
                                        commercialRegister: user.commercialRegister || '',
                                        taxNumber: user.taxNumber || '',
                                        cityId: user.cityId || 0,
                                      });
                                      setShowEditCustomerDialog(true);
                                    }}
                                    data-testid={`edit-customer-${user.id}`}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <Users className="w-12 h-12 text-gray-300" />
                    </div>
                    <h4 className="font-bold text-xl text-gray-600 mb-2">لا يوجد عملاء مسجلين</h4>
                    <p className="text-gray-500 mb-4">ابدأ بإضافة عملاء جدد لمتجرك</p>
                    <Button className="rounded-xl gap-2">
                      <UserPlus className="w-4 h-4" />
                      إضافة أول عميل
                    </Button>
                  </div>
                )}

                {/* Pagination */}
                {adminUsers.length > customersPerPage && (() => {
                  const totalPages = Math.ceil(adminUsers.length / customersPerPage);
                  const startItem = (customersPage - 1) * customersPerPage + 1;
                  const endItem = Math.min(customersPage * customersPerPage, adminUsers.length);
                  return (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500">عرض {startItem}-{endItem} من {adminUsers.length} عميل</p>
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="rounded-lg"
                          disabled={customersPage === 1}
                          onClick={() => setCustomersPage(p => Math.max(1, p - 1))}
                        >
                          السابق
                        </Button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (customersPage <= 3) {
                            pageNum = i + 1;
                          } else if (customersPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = customersPage - 2 + i;
                          }
                          return (
                            <Button 
                              key={pageNum}
                              variant="outline" 
                              size="sm" 
                              className={`rounded-lg ${customersPage === pageNum ? 'bg-primary text-white' : ''}`}
                              onClick={() => setCustomersPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="rounded-lg"
                          disabled={customersPage === totalPages}
                          onClick={() => setCustomersPage(p => Math.min(totalPages, p + 1))}
                        >
                          التالي
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </Card>

              {/* Top Customers Section */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="p-6 border-none shadow-lg rounded-2xl">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    أفضل العملاء (حسب المشتريات)
                  </h3>
                  <div className="space-y-3">
                    {topCustomers.length > 0 ? topCustomers.map((tc: any, index: number) => (
                      <div key={tc.user?.id || index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => { setSelectedCustomerId(tc.user?.id); setShowCustomerDetails(true); }}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-300'}`}>
                          {index + 1}
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold">
                          {tc.user?.facilityName?.charAt(0) || 'ع'}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm">{tc.user?.facilityName || 'عميل'}</p>
                          <p className="text-xs text-gray-500">{tc.user?.phone}</p>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-primary">{tc.totalSpent.toLocaleString('ar-SY')}</p>
                          <p className="text-xs text-gray-400">ل.س</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-center text-gray-400 py-4">لا توجد بيانات مشتريات بعد</p>
                    )}
                  </div>
                </Card>

                <Card className="p-6 border-none shadow-lg rounded-2xl">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    أحدث العملاء المسجلين
                  </h3>
                  <div className="space-y-3">
                    {adminUsers.slice(-5).reverse().map((user: any) => (
                      <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                          {user.facilityName?.charAt(0) || 'ع'}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm">{user.facilityName || 'عميل'}</p>
                          <p className="text-xs text-gray-500">{user.phone}</p>
                        </div>
                        <div className="text-left">
                          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">جديد</Badge>
                          <p className="text-xs text-gray-400 mt-1">{new Date(user.createdAt).toLocaleDateString('ar-SY')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Add Customer Dialog */}
              <Dialog open={showAddCustomerDialog} onOpenChange={setShowAddCustomerDialog}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-primary" />
                      إضافة عميل جديد
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>اسم المنشأة *</Label>
                      <Input 
                        value={newCustomer.facilityName} 
                        onChange={(e) => setNewCustomer({...newCustomer, facilityName: e.target.value})}
                        placeholder="أدخل اسم المنشأة"
                        data-testid="input-new-customer-name"
                      />
                    </div>
                    <div>
                      <Label>رقم الهاتف *</Label>
                      <div className="flex items-center gap-2" dir="ltr">
                        <span className="bg-gray-100 px-3 py-2 rounded-lg text-sm font-bold text-gray-600 whitespace-nowrap">+963</span>
                        <Input 
                          value={newCustomer.phone.replace('+963', '').replace(/^0+/, '')} 
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '').replace(/^0+/, '');
                            if (value.length > 9) value = value.slice(0, 9);
                            setNewCustomer({...newCustomer, phone: value ? `+963${value}` : ''});
                          }}
                          placeholder="9XXXXXXXX"
                          className="text-left font-sans flex-1"
                          maxLength={9}
                          data-testid="input-new-customer-phone"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">أدخل 9 أرقام بدون الصفر (مثال: 912345678)</p>
                    </div>
                    <div>
                      <Label>كلمة المرور *</Label>
                      <Input 
                        type="password"
                        value={newCustomer.password} 
                        onChange={(e) => setNewCustomer({...newCustomer, password: e.target.value})}
                        placeholder="أدخل كلمة المرور"
                        data-testid="input-new-customer-password"
                      />
                    </div>
                    <div>
                      <Label>السجل التجاري</Label>
                      <Input 
                        value={newCustomer.commercialRegister} 
                        onChange={(e) => setNewCustomer({...newCustomer, commercialRegister: e.target.value})}
                        placeholder="رقم السجل التجاري (اختياري)"
                      />
                    </div>
                    <div>
                      <Label>الرقم الضريبي</Label>
                      <Input 
                        value={newCustomer.taxNumber} 
                        onChange={(e) => setNewCustomer({...newCustomer, taxNumber: e.target.value})}
                        placeholder="الرقم الضريبي (اختياري)"
                      />
                    </div>
                    <div>
                      <Label>المدينة</Label>
                      <Select value={newCustomer.cityId?.toString() || ''} onValueChange={(v) => setNewCustomer({...newCustomer, cityId: parseInt(v)})}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المدينة" />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city: any) => (
                            <SelectItem key={city.id} value={city.id.toString()}>{city.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button 
                        className="flex-1 rounded-xl"
                        onClick={async () => {
                          if (!newCustomer.phone || !newCustomer.password || !newCustomer.facilityName) {
                            toast({ title: 'يرجى ملء الحقول المطلوبة', variant: 'destructive' });
                            return;
                          }
                          try {
                            await customersAPI.create(newCustomer);
                            toast({ title: 'تم إضافة العميل بنجاح', className: 'bg-green-600 text-white' });
                            setShowAddCustomerDialog(false);
                            setNewCustomer({ phone: '', password: '', facilityName: '', commercialRegister: '', taxNumber: '', cityId: 0 });
                            // Refetch users
                            window.location.reload();
                          } catch (error: any) {
                            toast({ title: error.message || 'حدث خطأ', variant: 'destructive' });
                          }
                        }}
                        data-testid="button-save-new-customer"
                      >
                        حفظ العميل
                      </Button>
                      <Button variant="outline" className="rounded-xl" onClick={() => setShowAddCustomerDialog(false)}>
                        إلغاء
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Edit Customer Dialog */}
              <Dialog open={showEditCustomerDialog} onOpenChange={setShowEditCustomerDialog}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Edit className="w-5 h-5 text-orange-500" />
                      تعديل بيانات العميل
                    </DialogTitle>
                  </DialogHeader>
                  {editingCustomer && (
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label>اسم المنشأة</Label>
                        <Input 
                          value={editingCustomer.facilityName} 
                          onChange={(e) => setEditingCustomer({...editingCustomer, facilityName: e.target.value})}
                          data-testid="input-edit-customer-name"
                        />
                      </div>
                      <div>
                        <Label>رقم الهاتف</Label>
                        <div className="flex items-center gap-2" dir="ltr">
                          <span className="bg-gray-100 px-3 py-2 rounded-lg text-sm font-bold text-gray-600 whitespace-nowrap">+963</span>
                          <Input 
                            value={editingCustomer.phone.replace('+963', '').replace(/^0+/, '')} 
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, '').replace(/^0+/, '');
                              if (value.length > 9) value = value.slice(0, 9);
                              setEditingCustomer({...editingCustomer, phone: value ? `+963${value}` : ''});
                            }}
                            placeholder="9XXXXXXXX"
                            className="text-left font-sans flex-1"
                            maxLength={9}
                            data-testid="input-edit-customer-phone"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>السجل التجاري</Label>
                        <Input 
                          value={editingCustomer.commercialRegister} 
                          onChange={(e) => setEditingCustomer({...editingCustomer, commercialRegister: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>الرقم الضريبي</Label>
                        <Input 
                          value={editingCustomer.taxNumber} 
                          onChange={(e) => setEditingCustomer({...editingCustomer, taxNumber: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>المدينة</Label>
                        <Select value={editingCustomer.cityId?.toString() || ''} onValueChange={(v) => setEditingCustomer({...editingCustomer, cityId: parseInt(v)})}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المدينة" />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.map((city: any) => (
                              <SelectItem key={city.id} value={city.id.toString()}>{city.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="flex items-center gap-2">
                          <Key className="w-4 h-4 text-orange-500" />
                          كلمة السر الجديدة (اختياري)
                        </Label>
                        <Input 
                          type="password"
                          placeholder="اترك فارغاً إذا لم ترد التغيير"
                          value={editingCustomer.newPassword || ''} 
                          onChange={(e) => setEditingCustomer({...editingCustomer, newPassword: e.target.value})}
                          data-testid="input-edit-customer-password"
                        />
                        <p className="text-xs text-gray-500 mt-1">يجب أن تكون 6 أحرف على الأقل</p>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button 
                          className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-600"
                          onClick={async () => {
                            try {
                              await adminAPI.updateUser(editingCustomer.id, {
                                phone: editingCustomer.phone,
                                facilityName: editingCustomer.facilityName,
                                commercialRegister: editingCustomer.commercialRegister,
                                taxNumber: editingCustomer.taxNumber,
                                cityId: editingCustomer.cityId || null,
                              });
                              
                              // Reset password if provided
                              if (editingCustomer.newPassword && editingCustomer.newPassword.length >= 6) {
                                const pwRes = await fetch(`/api/admin/users/${editingCustomer.id}/reset-password`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ newPassword: editingCustomer.newPassword })
                                });
                                if (!pwRes.ok) {
                                  const err = await pwRes.json();
                                  throw new Error(err.error || 'فشل في تغيير كلمة السر');
                                }
                              }
                              
                              toast({ title: 'تم تحديث بيانات العميل بنجاح', className: 'bg-green-600 text-white' });
                              setShowEditCustomerDialog(false);
                              setEditingCustomer(null);
                              window.location.reload();
                            } catch (error: any) {
                              toast({ title: error.message || 'حدث خطأ', variant: 'destructive' });
                            }
                          }}
                          data-testid="button-save-edit-customer"
                        >
                          حفظ التعديلات
                        </Button>
                        <Button variant="outline" className="rounded-xl" onClick={() => { setShowEditCustomerDialog(false); setEditingCustomer(null); }}>
                          إلغاء
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* Customer Details Dialog */}
              <Dialog open={showCustomerDetails} onOpenChange={setShowCustomerDetails}>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-primary" />
                      تفاصيل العميل
                    </DialogTitle>
                  </DialogHeader>
                  {customerDetails ? (
                    <div className="space-y-4 mt-4">
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl ${customerDetails.isVip ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-primary to-blue-600'}`}>
                          {customerDetails.user?.facilityName?.charAt(0) || 'ع'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-lg">{customerDetails.user?.facilityName || 'عميل'}</h4>
                            {customerDetails.isVip && <Crown className="w-5 h-5 text-yellow-500" />}
                          </div>
                          <p className="text-gray-500">{customerDetails.user?.phone}</p>
                          <Badge className={customerDetails.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                            {customerDetails.isActive ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-xl text-center">
                          <p className="text-2xl font-bold text-blue-700">{customerDetails.totalOrders}</p>
                          <p className="text-xs text-blue-600">إجمالي الطلبات</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-xl text-center">
                          <p className="text-xl font-bold text-green-700">{customerDetails.totalSpent.toLocaleString('ar-SY')}</p>
                          <p className="text-xs text-green-600">إجمالي المشتريات (ل.س)</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-500">السجل التجاري</span>
                          <span className="font-bold">{customerDetails.user?.commercialRegister || 'غير محدد'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-500">الرقم الضريبي</span>
                          <span className="font-bold">{customerDetails.user?.taxNumber || 'غير محدد'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-500">آخر طلب</span>
                          <span className="font-bold">{customerDetails.lastOrderDate ? new Date(customerDetails.lastOrderDate).toLocaleDateString('ar-SY') : 'لا يوجد'}</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-gray-500">تاريخ التسجيل</span>
                          <span className="font-bold">{new Date(customerDetails.user?.createdAt).toLocaleDateString('ar-SY')}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button variant="outline" className="flex-1 rounded-xl gap-2">
                          <Phone className="w-4 h-4" />
                          اتصال
                        </Button>
                        <Button variant="outline" className="flex-1 rounded-xl gap-2">
                          <Mail className="w-4 h-4" />
                          رسالة
                        </Button>
                        <Button className="flex-1 rounded-xl gap-2">
                          <Edit className="w-4 h-4" />
                          تعديل
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                      <p className="text-gray-500 mt-2">جاري التحميل...</p>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses">
            <div className="space-y-6">
              {/* Header */}
              <Card className="p-6 border-none shadow-lg rounded-2xl bg-gradient-to-br from-orange-600 via-red-500 to-pink-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-2xl flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                        <Receipt className="w-6 h-6" />
                      </div>
                      إدارة المصاريف
                    </h3>
                    <p className="text-orange-200 mt-2">تسجيل ومتابعة جميع المصاريف التشغيلية</p>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="rounded-xl gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20"
                      onClick={() => {
                        refetchExpenses();
                        refetchExpenseCategories();
                        refetchExpenseSummary();
                      }}
                      data-testid="button-refresh-expenses"
                    >
                      <RefreshCw className="w-4 h-4" />
                      تحديث
                    </Button>
                    <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
                      <DialogTrigger asChild>
                        <Button className="rounded-xl gap-2 bg-white text-orange-600 hover:bg-orange-50" data-testid="button-add-expense">
                          <Plus className="w-4 h-4" />إضافة مصروف
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle className="text-xl">
                            {editingExpense ? 'تعديل المصروف' : 'إضافة مصروف جديد'}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div>
                            <Label>فئة المصروف</Label>
                            <Select value={expenseForm.categoryId?.toString() || ''} onValueChange={(val) => setExpenseForm({ ...expenseForm, categoryId: parseInt(val) })}>
                              <SelectTrigger className="rounded-xl mt-1" data-testid="select-expense-category">
                                <SelectValue placeholder="اختر الفئة" />
                              </SelectTrigger>
                              <SelectContent>
                                {expenseCategoriesList?.map((cat: any) => (
                                  <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>المبلغ (ل.س)</Label>
                            <Input 
                              type="number" 
                              className="rounded-xl mt-1" 
                              placeholder="أدخل المبلغ"
                              value={expenseForm.amount}
                              onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                              data-testid="input-expense-amount"
                            />
                          </div>
                          <div>
                            <Label>الوصف</Label>
                            <Input 
                              className="rounded-xl mt-1" 
                              placeholder="وصف المصروف"
                              value={expenseForm.description}
                              onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                              data-testid="input-expense-description"
                            />
                          </div>
                          <div>
                            <Label>المستودع (اختياري)</Label>
                            <Select value={expenseForm.warehouseId?.toString() || 'none'} onValueChange={(val) => setExpenseForm({ ...expenseForm, warehouseId: val === 'none' ? undefined : parseInt(val) })}>
                              <SelectTrigger className="rounded-xl mt-1" data-testid="select-expense-warehouse">
                                <SelectValue placeholder="اختر المستودع" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">بدون مستودع</SelectItem>
                                {warehousesList?.map((wh: any) => (
                                  <SelectItem key={wh.id} value={wh.id.toString()}>{wh.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>طريقة الدفع</Label>
                            <Select value={expenseForm.paymentMethod || 'cash'} onValueChange={(val) => setExpenseForm({ ...expenseForm, paymentMethod: val })}>
                              <SelectTrigger className="rounded-xl mt-1" data-testid="select-expense-payment">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cash">نقداً</SelectItem>
                                <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                                <SelectItem value="check">شيك</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>رقم مرجعي (اختياري)</Label>
                            <Input 
                              className="rounded-xl mt-1" 
                              placeholder="رقم الشيك أو الحوالة"
                              value={expenseForm.reference || ''}
                              onChange={(e) => setExpenseForm({ ...expenseForm, reference: e.target.value })}
                              data-testid="input-expense-reference"
                            />
                          </div>
                          <div>
                            <Label>ملاحظات (اختياري)</Label>
                            <Input 
                              className="rounded-xl mt-1" 
                              placeholder="ملاحظات إضافية"
                              value={expenseForm.notes || ''}
                              onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                              data-testid="input-expense-notes"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                          <Button 
                            className="flex-1 rounded-xl" 
                            onClick={handleSaveExpense}
                            disabled={!expenseForm.categoryId || !expenseForm.amount || !expenseForm.description}
                            data-testid="button-save-expense"
                          >
                            حفظ
                          </Button>
                          <Button variant="outline" className="flex-1 rounded-xl" onClick={() => {
                            setShowExpenseDialog(false);
                            setEditingExpense(null);
                            setExpenseForm({ categoryId: undefined, amount: '', description: '', warehouseId: undefined, paymentMethod: 'cash', reference: '', notes: '' });
                          }}>
                            إلغاء
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </Card>

              {/* KPI Summary */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-5 border-none shadow-lg rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border-l-4 border-l-red-500">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">إجمالي المصاريف</p>
                      <p className="text-2xl font-bold text-red-700" data-testid="text-total-expenses">
                        {expenseSummary?.totalExpenses?.toLocaleString('ar-SY') || 0} ل.س
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-5 border-none shadow-lg rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-l-4 border-l-blue-500">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Tag className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">عدد الفئات</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {expenseCategoriesList?.length || 0}
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-5 border-none shadow-lg rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 border-l-4 border-l-purple-500">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">عدد المصاريف</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {expensesList?.length || 0}
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-5 border-none shadow-lg rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-l-green-500">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">هذا الشهر</p>
                      <p className="text-2xl font-bold text-green-700">
                        {expenseSummary?.byMonth?.slice(-1)[0]?.total?.toLocaleString('ar-SY') || 0} ل.س
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Expense Categories Management */}
              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <Tag className="w-5 h-5 text-orange-500" />
                    فئات المصاريف
                  </h4>
                  <Dialog open={showExpenseCategoryDialog} onOpenChange={setShowExpenseCategoryDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="rounded-xl gap-2" data-testid="button-add-expense-category">
                        <Plus className="w-4 h-4" />إضافة فئة
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingExpenseCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label>اسم الفئة</Label>
                          <Input 
                            className="rounded-xl mt-1" 
                            placeholder="مثال: إيجارات"
                            value={expenseCategoryForm.name}
                            onChange={(e) => setExpenseCategoryForm({ ...expenseCategoryForm, name: e.target.value })}
                            data-testid="input-expense-category-name"
                          />
                        </div>
                        <div>
                          <Label>الوصف (اختياري)</Label>
                          <Input 
                            className="rounded-xl mt-1" 
                            placeholder="وصف الفئة"
                            value={expenseCategoryForm.description || ''}
                            onChange={(e) => setExpenseCategoryForm({ ...expenseCategoryForm, description: e.target.value })}
                            data-testid="input-expense-category-description"
                          />
                        </div>
                        <div>
                          <Label>اللون</Label>
                          <Input 
                            type="color" 
                            className="rounded-xl mt-1 h-12 w-full"
                            value={expenseCategoryForm.color || '#6366f1'}
                            onChange={(e) => setExpenseCategoryForm({ ...expenseCategoryForm, color: e.target.value })}
                            data-testid="input-expense-category-color"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 mt-6">
                        <Button 
                          className="flex-1 rounded-xl" 
                          onClick={handleSaveExpenseCategory}
                          disabled={!expenseCategoryForm.name}
                          data-testid="button-save-expense-category"
                        >
                          حفظ
                        </Button>
                        <Button variant="outline" className="flex-1 rounded-xl" onClick={() => {
                          setShowExpenseCategoryDialog(false);
                          setEditingExpenseCategory(null);
                          setExpenseCategoryForm({ name: '', description: '', color: '#6366f1' });
                        }}>
                          إلغاء
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex flex-wrap gap-3">
                  {expenseCategoriesList?.map((cat: any) => (
                    <div 
                      key={cat.id} 
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors group"
                      data-testid={`expense-category-${cat.id}`}
                    >
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color || '#6366f1' }}></div>
                      <span className="font-medium">{cat.name}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            setEditingExpenseCategory(cat);
                            setExpenseCategoryForm({ name: cat.name, description: cat.description || '', color: cat.color || '#6366f1' });
                            setShowExpenseCategoryDialog(true);
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 text-red-500"
                          onClick={() => handleDeleteExpenseCategory(cat.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(!expenseCategoriesList || expenseCategoriesList.length === 0) && (
                    <p className="text-gray-500 text-sm">لا توجد فئات بعد. أضف فئة لبدء تسجيل المصاريف.</p>
                  )}
                </div>
              </Card>

              {/* Expenses Table */}
              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="font-bold text-xl flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-orange-500" />
                      سجل المصاريف
                    </h4>
                    <p className="text-gray-500 text-sm mt-1">{expensesList?.length || 0} مصروف</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input className="pr-10 w-64 bg-gray-50 border-none rounded-xl" placeholder="بحث..." data-testid="input-search-expenses" />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-right border-b border-gray-200 bg-gray-50">
                        <th className="p-4 font-bold text-gray-600 rounded-tr-xl">التاريخ</th>
                        <th className="p-4 font-bold text-gray-600">الفئة</th>
                        <th className="p-4 font-bold text-gray-600">الوصف</th>
                        <th className="p-4 font-bold text-gray-600">المستودع</th>
                        <th className="p-4 font-bold text-gray-600">طريقة الدفع</th>
                        <th className="p-4 font-bold text-gray-600">المبلغ</th>
                        <th className="p-4 font-bold text-gray-600 rounded-tl-xl">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expensesLoading ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center">
                            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-orange-500" />
                            <p className="text-gray-500 mt-2">جاري تحميل البيانات...</p>
                          </td>
                        </tr>
                      ) : expensesList?.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-gray-500">
                            لا توجد مصاريف مسجلة بعد
                          </td>
                        </tr>
                      ) : (
                        expensesList?.map((expense: any) => (
                          <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors" data-testid={`row-expense-${expense.id}`}>
                            <td className="p-4 font-medium">
                              {new Date(expense.expenseDate).toLocaleDateString('ar-SY')}
                            </td>
                            <td className="p-4">
                              <Badge 
                                className="rounded-lg" 
                                style={{ backgroundColor: expense.category?.color || '#6366f1', color: 'white' }}
                              >
                                {expense.category?.name || '-'}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <span className="font-medium">{expense.description}</span>
                              {expense.notes && <p className="text-sm text-gray-500">{expense.notes}</p>}
                            </td>
                            <td className="p-4">
                              {expense.warehouse?.name || '-'}
                            </td>
                            <td className="p-4">
                              <Badge variant="outline" className="rounded-lg">
                                {expense.paymentMethod === 'cash' ? 'نقداً' : expense.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : 'شيك'}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <span className="font-bold text-red-600">
                                {parseFloat(expense.amount).toLocaleString('ar-SY')} ل.س
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="rounded-lg"
                                  onClick={() => {
                                    setEditingExpense(expense);
                                    setExpenseForm({
                                      categoryId: expense.categoryId,
                                      amount: expense.amount,
                                      description: expense.description,
                                      warehouseId: expense.warehouseId,
                                      paymentMethod: expense.paymentMethod || 'cash',
                                      reference: expense.reference || '',
                                      notes: expense.notes || '',
                                    });
                                    setShowExpenseDialog(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="rounded-lg text-red-500"
                                  onClick={() => handleDeleteExpense(expense.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Expense Charts */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="p-6 border-none shadow-lg rounded-2xl">
                  <h4 className="font-bold flex items-center gap-2 mb-4"><PieChart className="w-5 h-5 text-orange-500" />المصاريف حسب الفئة</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie 
                          data={expenseSummary?.byCategory?.map((cat: any) => ({
                            name: cat.categoryName,
                            value: cat.total,
                          })) || []} 
                          cx="50%" 
                          cy="50%" 
                          innerRadius={60} 
                          outerRadius={100} 
                          paddingAngle={5} 
                          dataKey="value" 
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {expenseSummary?.byCategory?.map((cat: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'][index % 7]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${value.toLocaleString('ar-SY')} ل.س`} />
                        <Legend />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-6 border-none shadow-lg rounded-2xl">
                  <h4 className="font-bold flex items-center gap-2 mb-4"><BarChart3 className="w-5 h-5 text-orange-500" />المصاريف الشهرية</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={expenseSummary?.byMonth || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" stroke="#888" fontSize={10} />
                        <YAxis stroke="#888" fontSize={10} />
                        <Tooltip 
                          contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          formatter={(value: number) => `${value.toLocaleString('ar-SY')} ل.س`}
                        />
                        <Bar dataKey="total" name="المصاريف" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <h3 className="font-bold text-lg mb-4">نمو العملاء</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip />
                      <Line type="monotone" dataKey="customers" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} name="العملاء" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <h3 className="font-bold text-lg mb-4">مؤشرات الأداء</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-2xl p-4 text-center">
                    <p className="text-3xl font-bold text-blue-600">72%</p>
                    <p className="text-sm text-blue-500">معدل إعادة الطلب</p>
                  </div>
                  <div className="bg-green-50 rounded-2xl p-4 text-center">
                    <p className="text-3xl font-bold text-green-600">4.8</p>
                    <p className="text-sm text-green-500">تقييم الخدمة</p>
                  </div>
                  <div className="bg-purple-50 rounded-2xl p-4 text-center">
                    <p className="text-3xl font-bold text-purple-600">2.4h</p>
                    <p className="text-sm text-purple-500">متوسط التوصيل</p>
                  </div>
                  <div className="bg-orange-50 rounded-2xl p-4 text-center">
                    <p className="text-3xl font-bold text-orange-600">3.2%</p>
                    <p className="text-sm text-orange-500">معدل الإلغاء</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Credits/Receivables Tab */}
          <TabsContent value="credits">
            <div className="space-y-6">
              {/* Header */}
              <Card className="p-6 border-none shadow-lg rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-2xl flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      الديون والمستحقات
                    </h3>
                    <p className="text-emerald-200 mt-2">إدارة ديون العملاء ومتابعة تواريخ الاستحقاق</p>
                  </div>
                  <Button variant="outline" className="rounded-xl gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20" onClick={() => refetchCredits()}>
                    <RefreshCw className="w-4 h-4" />تحديث
                  </Button>
                </div>
              </Card>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 border-none shadow-lg rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600">عملاء بديون</p>
                      <p className="text-2xl font-bold text-blue-800">{creditsList.filter((c: any) => parseFloat(c.currentBalance || 0) > 0).length}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border-none shadow-lg rounded-2xl bg-gradient-to-br from-red-50 to-red-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center text-white">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-red-600">إجمالي الديون</p>
                      <p className="text-2xl font-bold text-red-800">{creditsList.reduce((sum: number, c: any) => sum + parseFloat(c.currentBalance || 0), 0).toLocaleString()} ل.س</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border-none shadow-lg rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-white">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-orange-600">ديون متأخرة</p>
                      <p className="text-2xl font-bold text-orange-800">{creditsList.filter((c: any) => c.hasOverdue).length}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border-none shadow-lg rounded-2xl bg-gradient-to-br from-green-50 to-green-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-green-600">إجمالي السداد</p>
                      <p className="text-2xl font-bold text-green-800">{creditsList.reduce((sum: number, c: any) => sum + parseFloat(c.totalPaid || 0), 0).toLocaleString()} ل.س</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Credits Table */}
              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-teal-600" />قائمة ديون العملاء</h3>
                {creditsList.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>لا توجد ديون مسجلة حالياً</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">العميل</TableHead>
                          <TableHead className="text-right">المستوى</TableHead>
                          <TableHead className="text-right">الحد الأقصى</TableHead>
                          <TableHead className="text-right">الرصيد الحالي</TableHead>
                          <TableHead className="text-right">مدة السداد</TableHead>
                          <TableHead className="text-right">الحالة</TableHead>
                          <TableHead className="text-right">إجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {creditsList.map((credit: any) => {
                          const loyaltyLabels: Record<string, string> = { bronze: 'برونزي', silver: 'فضي', gold: 'ذهبي', diamond: 'ماسي' };
                          const loyaltyColors: Record<string, string> = { bronze: 'bg-orange-100 text-orange-700', silver: 'bg-gray-100 text-gray-700', gold: 'bg-yellow-100 text-yellow-700', diamond: 'bg-cyan-100 text-cyan-700' };
                          return (
                            <TableRow key={credit.id} data-testid={`row-credit-${credit.id}`}>
                              <TableCell className="font-medium">{credit.user?.facilityName || credit.user?.phone || `عميل #${credit.userId}`}</TableCell>
                              <TableCell>
                                <Badge className={`rounded-full ${loyaltyColors[credit.loyaltyLevel] || 'bg-gray-100'}`}>
                                  {loyaltyLabels[credit.loyaltyLevel] || credit.loyaltyLevel}
                                </Badge>
                              </TableCell>
                              <TableCell>{parseFloat(credit.creditLimit || 0).toLocaleString()} ل.س</TableCell>
                              <TableCell className={parseFloat(credit.currentBalance || 0) > 0 ? 'text-red-600 font-bold' : 'text-green-600'}>
                                {parseFloat(credit.currentBalance || 0).toLocaleString()} ل.س
                              </TableCell>
                              <TableCell>{credit.creditPeriodDays} يوم</TableCell>
                              <TableCell>
                                {credit.hasOverdue ? (
                                  <Badge className="bg-red-100 text-red-700 rounded-full gap-1"><AlertTriangle className="w-3 h-3" />متأخر</Badge>
                                ) : parseFloat(credit.currentBalance || 0) > 0 ? (
                                  <Badge className="bg-yellow-100 text-yellow-700 rounded-full">مستحق</Badge>
                                ) : (
                                  <Badge className="bg-green-100 text-green-700 rounded-full">مسدد</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={async () => {
                                    setSelectedCreditUser(credit);
                                    const transactions = await creditsAPI.getTransactions(credit.userId);
                                    setCreditTransactions(transactions as any[]);
                                  }} data-testid={`button-view-transactions-${credit.id}`}>
                                    <Eye className="w-3 h-3 ml-1" />المعاملات
                                  </Button>
                                  {parseFloat(credit.currentBalance || 0) > 0 && (
                                    <Button size="sm" className="rounded-lg text-xs bg-green-600 hover:bg-green-700" onClick={() => {
                                      setSelectedCreditUser(credit);
                                      setIsPaymentDialogOpen(true);
                                    }} data-testid={`button-record-payment-${credit.id}`}>
                                      <DollarSign className="w-3 h-3 ml-1" />تسجيل دفعة
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </Card>

              {/* Pending Credits Table - sorted by due date */}
              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    الديون المستحقة (مرتبة حسب تاريخ السداد)
                  </h3>
                  <Button variant="outline" size="sm" className="rounded-lg" onClick={() => refetchPendingCredits()}>
                    <RefreshCw className="w-4 h-4 ml-1" />تحديث
                  </Button>
                </div>
                {pendingCreditsList.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-300" />
                    <p>لا توجد ديون مستحقة حالياً</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">العميل</TableHead>
                          <TableHead className="text-right">المبلغ</TableHead>
                          <TableHead className="text-right">تاريخ الطلب</TableHead>
                          <TableHead className="text-right">موعد السداد</TableHead>
                          <TableHead className="text-right">الأيام المتبقية</TableHead>
                          <TableHead className="text-right">الحالة</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingCreditsList.map((item: any) => {
                          const dueDate = item.transaction?.dueDate ? new Date(item.transaction.dueDate) : null;
                          const now = new Date();
                          const daysRemaining = dueDate ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;
                          const isOverdue = daysRemaining < 0;
                          const isNearDue = daysRemaining >= 0 && daysRemaining <= 3;
                          
                          return (
                            <TableRow key={item.transaction?.id} data-testid={`row-pending-credit-${item.transaction?.id}`} className={isOverdue ? 'bg-red-50' : isNearDue ? 'bg-orange-50' : ''}>
                              <TableCell>
                                <div className="font-medium">{item.user?.facilityName || item.user?.phone || `عميل #${item.transaction?.userId}`}</div>
                                <div className="text-xs text-gray-500">{item.user?.phone}</div>
                              </TableCell>
                              <TableCell className="font-bold text-red-600">
                                {parseFloat(item.transaction?.amount || 0).toLocaleString()} ل.س
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {item.transaction?.createdAt ? new Date(item.transaction.createdAt).toLocaleDateString('ar-SY') : '-'}
                              </TableCell>
                              <TableCell className="text-sm">
                                {dueDate ? dueDate.toLocaleDateString('ar-SY') : '-'}
                              </TableCell>
                              <TableCell>
                                {isOverdue ? (
                                  <span className="font-bold text-red-600">متأخر {Math.abs(daysRemaining)} يوم</span>
                                ) : (
                                  <span className={`font-bold ${isNearDue ? 'text-orange-600' : 'text-green-600'}`}>
                                    {daysRemaining} يوم
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                {isOverdue ? (
                                  <Badge className="bg-red-100 text-red-700 rounded-full gap-1">
                                    <AlertTriangle className="w-3 h-3" />متأخر
                                  </Badge>
                                ) : isNearDue ? (
                                  <Badge className="bg-orange-100 text-orange-700 rounded-full gap-1">
                                    <Clock className="w-3 h-3" />قريب
                                  </Badge>
                                ) : (
                                  <Badge className="bg-green-100 text-green-700 rounded-full">
                                    في الموعد
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </Card>

              {/* Transactions Detail Dialog */}
              <Dialog open={!!selectedCreditUser && !isPaymentDialogOpen} onOpenChange={(open) => { if (!open) { setSelectedCreditUser(null); setCreditTransactions([]); } }}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-teal-600" />
                      معاملات العميل: {selectedCreditUser?.user?.facilityName || `عميل #${selectedCreditUser?.userId}`}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-blue-600">الحد الأقصى</p>
                        <p className="font-bold text-blue-800">{parseFloat(selectedCreditUser?.creditLimit || 0).toLocaleString()} ل.س</p>
                      </div>
                      <div className="bg-red-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-red-600">الرصيد المستحق</p>
                        <p className="font-bold text-red-800">{parseFloat(selectedCreditUser?.currentBalance || 0).toLocaleString()} ل.س</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-green-600">إجمالي السداد</p>
                        <p className="font-bold text-green-800">{parseFloat(selectedCreditUser?.totalPaid || 0).toLocaleString()} ل.س</p>
                      </div>
                    </div>
                    {creditTransactions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Receipt className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                        <p>لا توجد معاملات</p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[300px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-right">التاريخ</TableHead>
                              <TableHead className="text-right">النوع</TableHead>
                              <TableHead className="text-right">المبلغ</TableHead>
                              <TableHead className="text-right">تاريخ الاستحقاق</TableHead>
                              <TableHead className="text-right">الحالة</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {creditTransactions.map((tx: any) => (
                              <TableRow key={tx.id}>
                                <TableCell className="text-sm">{new Date(tx.createdAt).toLocaleDateString('ar-SY')}</TableCell>
                                <TableCell>
                                  <Badge className={tx.type === 'purchase' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                                    {tx.type === 'purchase' ? 'شراء آجل' : 'سداد'}
                                  </Badge>
                                </TableCell>
                                <TableCell className={`font-bold ${tx.type === 'purchase' ? 'text-red-600' : 'text-green-600'}`}>
                                  {tx.type === 'purchase' ? '+' : '-'}{parseFloat(tx.amount).toLocaleString()} ل.س
                                </TableCell>
                                <TableCell className="text-sm">
                                  {tx.dueDate ? (
                                    <span className={new Date(tx.dueDate) < new Date() && tx.status === 'pending' ? 'text-red-600 font-bold' : ''}>
                                      {new Date(tx.dueDate).toLocaleDateString('ar-SY')}
                                    </span>
                                  ) : '-'}
                                </TableCell>
                                <TableCell>
                                  {tx.status === 'paid' ? (
                                    <Badge className="bg-green-100 text-green-700 rounded-full">مسدد</Badge>
                                  ) : tx.dueDate && new Date(tx.dueDate) < new Date() ? (
                                    <Badge className="bg-red-100 text-red-700 rounded-full">متأخر</Badge>
                                  ) : (
                                    <Badge className="bg-yellow-100 text-yellow-700 rounded-full">معلق</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Payment Dialog */}
              <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      تسجيل دفعة للعميل
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600">العميل: <span className="font-bold">{selectedCreditUser?.user?.facilityName || `عميل #${selectedCreditUser?.userId}`}</span></p>
                      <p className="text-sm text-gray-600 mt-1">الرصيد المستحق: <span className="font-bold text-red-600">{parseFloat(selectedCreditUser?.currentBalance || 0).toLocaleString()} ل.س</span></p>
                    </div>
                    <div>
                      <Label>مبلغ الدفعة</Label>
                      <Input className="rounded-xl mt-1" type="number" placeholder="0" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} data-testid="input-payment-amount" />
                    </div>
                    <div>
                      <Label>ملاحظات (اختياري)</Label>
                      <Textarea className="rounded-xl mt-1" placeholder="ملاحظات عن الدفعة..." value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} />
                    </div>
                    <Button className="w-full rounded-xl bg-green-600 hover:bg-green-700" onClick={async () => {
                      if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
                        toast({ title: 'خطأ', description: 'يرجى إدخال مبلغ صحيح', variant: 'destructive' });
                        return;
                      }
                      try {
                        await creditsAPI.createPayment(selectedCreditUser.userId, parseFloat(paymentAmount), paymentNotes);
                        toast({ title: 'تم تسجيل الدفعة بنجاح' });
                        setIsPaymentDialogOpen(false);
                        setSelectedCreditUser(null);
                        setPaymentAmount('');
                        setPaymentNotes('');
                        refetchCredits();
                      } catch (error: any) {
                        toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
                      }
                    }} data-testid="button-submit-payment">
                      تسجيل الدفعة
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>

          {/* Deposits Tab */}
          <TabsContent value="deposits">
            <DepositsManagementSection />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <DeliverySettingsSection warehouses={warehousesList} />
            <SiteSettingsSection />
          </TabsContent>

          {/* ERP Tab */}
          <TabsContent value="erp">
            <ErpSettingsSection warehouses={warehousesList} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
