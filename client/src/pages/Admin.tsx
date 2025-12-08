import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowRight,
  LayoutDashboard,
  Box,
  ClipboardList,
  Settings,
  DollarSign,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw,
  Bell,
  Download,
  Upload,
  Tag,
  Percent,
  Calendar,
  Filter,
  MoreVertical,
  Star,
  MessageSquare,
  Zap,
  Target,
  Award,
  Megaphone,
  Layers,
  Globe,
  FileText,
  TrendingDown,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Building,
  CreditCard,
  Wallet,
  UserCog,
  Headphones,
  Gift,
  Warehouse,
  Receipt,
  Copy,
  ExternalLink,
  Shield,
  Lock,
  Key,
  UserPlus,
  TicketIcon,
  MessageCircle,
  Send,
  Archive,
  Printer,
  QrCode,
  Barcode,
  PackageCheck,
  PackageX,
  Timer,
  Banknote,
  PiggyBank,
  Coins,
  Crown,
  Medal,
  Trophy
} from 'lucide-react';
import { Link } from 'wouter';
import { productsAPI, categoriesAPI, brandsAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, LineChart, Line, Legend, ComposedChart } from 'recharts';
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

const salesData = [
  { name: 'يناير', sales: 45000, orders: 240, customers: 180 },
  { name: 'فبراير', sales: 52000, orders: 280, customers: 210 },
  { name: 'مارس', sales: 61000, orders: 320, customers: 250 },
  { name: 'أبريل', sales: 58000, orders: 290, customers: 230 },
  { name: 'مايو', sales: 72000, orders: 380, customers: 290 },
  { name: 'يونيو', sales: 85000, orders: 420, customers: 340 },
  { name: 'يوليو', sales: 95000, orders: 480, customers: 390 },
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

const mockStaff = [
  { id: 1, name: 'أحمد محمد', email: 'ahmed@sary.sa', phone: '0501234567', role: 'admin', department: 'الإدارة', status: 'active', permissions: ['all'] },
  { id: 2, name: 'سارة علي', email: 'sara@sary.sa', phone: '0559876543', role: 'manager', department: 'المبيعات', status: 'active', permissions: ['orders', 'products'] },
  { id: 3, name: 'محمد خالد', email: 'mohammed@sary.sa', phone: '0543216789', role: 'support', department: 'الدعم الفني', status: 'active', permissions: ['support', 'customers'] },
  { id: 4, name: 'فاطمة أحمد', email: 'fatima@sary.sa', phone: '0567891234', role: 'warehouse', department: 'المستودعات', status: 'active', permissions: ['inventory'] },
  { id: 5, name: 'عبدالله سعود', email: 'abdullah@sary.sa', phone: '0512345678', role: 'sales', department: 'المبيعات', status: 'inactive', permissions: ['orders'] },
];

const mockTickets = [
  { id: 1, ticketNumber: 'TKT-001', customer: 'سوبر ماركت الفيصل', subject: 'مشكلة في الطلب #1024', category: 'order', priority: 'high', status: 'open', assignedTo: 'محمد خالد', createdAt: '10 دقائق' },
  { id: 2, ticketNumber: 'TKT-002', customer: 'بقالة النور', subject: 'استفسار عن المنتجات', category: 'product', priority: 'medium', status: 'in_progress', assignedTo: 'سارة علي', createdAt: '30 دقيقة' },
  { id: 3, ticketNumber: 'TKT-003', customer: 'مركز السعادة', subject: 'طلب استرجاع', category: 'payment', priority: 'urgent', status: 'open', assignedTo: null, createdAt: '1 ساعة' },
  { id: 4, ticketNumber: 'TKT-004', customer: 'ميني ماركت الخير', subject: 'مشكلة تقنية', category: 'technical', priority: 'low', status: 'resolved', assignedTo: 'محمد خالد', createdAt: '2 ساعة' },
];

const mockCoupons = [
  { id: 1, code: 'SUMMER2024', type: 'percentage', value: 15, minOrder: 200, maxDiscount: 100, usageLimit: 1000, usageCount: 456, isActive: true, endDate: '2024-08-31' },
  { id: 2, code: 'WELCOME50', type: 'fixed', value: 50, minOrder: 300, maxDiscount: null, usageLimit: 500, usageCount: 123, isActive: true, endDate: '2024-12-31' },
  { id: 3, code: 'FLASH20', type: 'percentage', value: 20, minOrder: 150, maxDiscount: 75, usageLimit: 200, usageCount: 200, isActive: false, endDate: '2024-06-30' },
];

const mockWarehouses = [
  { id: 1, name: 'المستودع الرئيسي', code: 'WH-RYD-001', city: 'الرياض', capacity: 10000, used: 7500, status: 'active', manager: 'فاطمة أحمد' },
  { id: 2, name: 'مستودع جدة', code: 'WH-JED-001', city: 'جدة', capacity: 8000, used: 5200, status: 'active', manager: 'عبدالرحمن سالم' },
  { id: 3, name: 'مستودع الدمام', code: 'WH-DMM-001', city: 'الدمام', capacity: 5000, used: 3800, status: 'active', manager: 'خالد محمد' },
];

const mockLoyaltyTiers = [
  { tier: 'bronze', name: 'برونزي', minPoints: 0, discount: 0, customers: 4500, color: 'from-orange-600 to-orange-700' },
  { tier: 'silver', name: 'فضي', minPoints: 1000, discount: 5, customers: 3200, color: 'from-gray-400 to-gray-500' },
  { tier: 'gold', name: 'ذهبي', minPoints: 5000, discount: 10, customers: 1800, color: 'from-yellow-500 to-yellow-600' },
  { tier: 'platinum', name: 'بلاتيني', minPoints: 15000, discount: 15, customers: 500, color: 'from-purple-500 to-purple-600' },
];

const recentActivities = [
  { id: 1, type: 'order', message: 'طلب جديد #1024 من سوبر ماركت النور', time: '5 دقائق', icon: ShoppingCart, color: 'bg-blue-100 text-blue-600' },
  { id: 2, type: 'user', message: 'عميل جديد: بقالة الأمل', time: '15 دقيقة', icon: Users, color: 'bg-green-100 text-green-600' },
  { id: 3, type: 'stock', message: 'تنبيه: مخزون بيبسي منخفض (15 وحدة)', time: '30 دقيقة', icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-600' },
  { id: 4, type: 'ticket', message: 'تذكرة دعم جديدة TKT-005', time: '45 دقيقة', icon: Headphones, color: 'bg-purple-100 text-purple-600' },
  { id: 5, type: 'payment', message: 'استلام دفعة 2,500 ر.س', time: '1 ساعة', icon: CreditCard, color: 'bg-emerald-100 text-emerald-600' },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dateRange, setDateRange] = useState('week');
  const [selectedTicket, setSelectedTicket] = useState<typeof mockTickets[0] | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '', categoryId: '', brandId: '', price: '', originalPrice: '',
    image: '', minOrder: '1', unit: 'كرتون', stock: '100',
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

  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const lowStockProducts = products.filter(p => p.stock < 30);

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
    { title: 'إجمالي المبيعات', value: '542,580', suffix: 'ر.س', icon: DollarSign, color: 'from-emerald-500 to-emerald-600', change: '+18%', changeType: 'up' },
    { title: 'الطلبات النشطة', value: '1,256', suffix: 'طلب', icon: ShoppingCart, color: 'from-blue-500 to-blue-600', change: '+24%', changeType: 'up' },
    { title: 'العملاء المسجلين', value: '10,450', suffix: 'عميل', icon: Users, color: 'from-purple-500 to-purple-600', change: '+12%', changeType: 'up' },
    { title: 'تذاكر الدعم', value: '23', suffix: 'مفتوحة', icon: Headphones, color: 'from-orange-500 to-orange-600', change: '-8%', changeType: 'down' },
  ];

  const handleAddProduct = async () => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProduct.name,
          categoryId: parseInt(newProduct.categoryId),
          brandId: newProduct.brandId ? parseInt(newProduct.brandId) : null,
          price: newProduct.price,
          originalPrice: newProduct.originalPrice || null,
          image: newProduct.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
          minOrder: parseInt(newProduct.minOrder),
          unit: newProduct.unit,
          stock: parseInt(newProduct.stock),
        }),
      });

      if (response.ok) {
        toast({ title: 'تم إضافة المنتج بنجاح', className: 'bg-green-600 text-white' });
        setIsAddProductOpen(false);
        setNewProduct({ name: '', categoryId: '', brandId: '', price: '', originalPrice: '', image: '', minOrder: '1', unit: 'كرتون', stock: '100' });
        refetchProducts();
      }
    } catch (error) {
      toast({ title: 'حدث خطأ', variant: 'destructive' });
    }
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
                <p className="text-purple-200 text-sm">إدارة +10,000 عميل • منصة ساري للجملة</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 relative" onClick={() => setShowNotifications(!showNotifications)}>
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold animate-pulse">12</span>
                </Button>
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute left-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border z-50">
                      <div className="p-4 border-b bg-gray-50 rounded-t-2xl flex items-center justify-between">
                        <h4 className="font-bold text-gray-800">الإشعارات</h4>
                        <Badge>12 جديد</Badge>
                      </div>
                      <ScrollArea className="h-80">
                        {recentActivities.map((activity) => (
                          <div key={activity.id} className="p-3 border-b hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-xl ${activity.color} flex items-center justify-center`}>
                                <activity.icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-700">{activity.message}</p>
                                <p className="text-xs text-gray-400 mt-1">منذ {activity.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
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
          <ScrollArea className="w-full">
            <TabsList className="bg-white shadow-lg rounded-2xl p-2 mb-6 flex gap-1 h-auto w-max min-w-full">
              <TabsTrigger value="dashboard" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5">
                <LayoutDashboard className="w-4 h-4 ml-2" />الرئيسية
              </TabsTrigger>
              <TabsTrigger value="products" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5">
                <Package className="w-4 h-4 ml-2" />المنتجات
              </TabsTrigger>
              <TabsTrigger value="orders" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5">
                <ClipboardList className="w-4 h-4 ml-2" />الطلبات
              </TabsTrigger>
              <TabsTrigger value="customers" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5">
                <Users className="w-4 h-4 ml-2" />العملاء
              </TabsTrigger>
              <TabsTrigger value="staff" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5">
                <UserCog className="w-4 h-4 ml-2" />الموظفين
              </TabsTrigger>
              <TabsTrigger value="support" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5">
                <Headphones className="w-4 h-4 ml-2" />الدعم الفني
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
              <TabsTrigger value="invoices" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5">
                <Receipt className="w-4 h-4 ml-2" />الفواتير
              </TabsTrigger>
              <TabsTrigger value="analytics" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5">
                <BarChart3 className="w-4 h-4 ml-2" />التحليلات
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5">
                <Settings className="w-4 h-4 ml-2" />الإعدادات
              </TabsTrigger>
            </TabsList>
          </ScrollArea>

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
                      <Area yAxisId="left" type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" name="المبيعات (ر.س)" />
                      <Bar yAxisId="right" dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} name="الطلبات" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-blue-500" />النشاط الأخير</h3>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
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

          {/* Staff Management Tab */}
          <TabsContent value="staff">
            <Card className="p-6 border-none shadow-lg rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-xl">إدارة الموظفين والصلاحيات</h3>
                  <p className="text-gray-500 text-sm mt-1">{mockStaff.length} موظف مسجل</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input className="pr-10 w-64 bg-gray-50 border-none rounded-xl" placeholder="بحث عن موظف..." />
                  </div>
                  <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
                    <DialogTrigger asChild>
                      <Button className="rounded-xl gap-2"><UserPlus className="w-4 h-4" />إضافة موظف</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader><DialogTitle>إضافة موظف جديد</DialogTitle></DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div><Label>الاسم الكامل</Label><Input className="rounded-xl mt-1" placeholder="أحمد محمد" /></div>
                          <div><Label>البريد الإلكتروني</Label><Input className="rounded-xl mt-1" placeholder="ahmed@sary.sa" /></div>
                          <div><Label>رقم الجوال</Label><Input className="rounded-xl mt-1" placeholder="0501234567" /></div>
                          <div>
                            <Label>الدور الوظيفي</Label>
                            <Select>
                              <SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder="اختر" /></SelectTrigger>
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
                            <Select>
                              <SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder="اختر" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="management">الإدارة</SelectItem>
                                <SelectItem value="sales">المبيعات</SelectItem>
                                <SelectItem value="support">الدعم الفني</SelectItem>
                                <SelectItem value="warehouse">المستودعات</SelectItem>
                                <SelectItem value="accounting">المحاسبة</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div><Label>كلمة المرور</Label><Input className="rounded-xl mt-1" type="password" placeholder="********" /></div>
                        </div>
                        <div>
                          <Label className="mb-2 block">الصلاحيات</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {['الطلبات', 'المنتجات', 'العملاء', 'التقارير', 'المالية', 'الإعدادات'].map((perm) => (
                              <div key={perm} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                <Switch id={perm} />
                                <Label htmlFor={perm} className="text-sm">{perm}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <Button className="w-full rounded-xl">إضافة الموظف</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-right border-b border-gray-100">
                      <th className="pb-4 font-bold text-gray-600">الموظف</th>
                      <th className="pb-4 font-bold text-gray-600">الدور</th>
                      <th className="pb-4 font-bold text-gray-600">القسم</th>
                      <th className="pb-4 font-bold text-gray-600">الحالة</th>
                      <th className="pb-4 font-bold text-gray-600">الصلاحيات</th>
                      <th className="pb-4 font-bold text-gray-600">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockStaff.map((member) => (
                      <tr key={member.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold">{member.name.charAt(0)}</div>
                            <div>
                              <p className="font-bold">{member.name}</p>
                              <p className="text-xs text-gray-500">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <Badge variant="outline" className="capitalize">
                            {member.role === 'admin' ? 'مدير النظام' : member.role === 'manager' ? 'مدير' : member.role === 'support' ? 'دعم فني' : member.role === 'warehouse' ? 'مستودعات' : 'مبيعات'}
                          </Badge>
                        </td>
                        <td className="py-4"><span className="text-sm">{member.department}</span></td>
                        <td className="py-4">
                          <Badge className={member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{member.status === 'active' ? 'نشط' : 'غير نشط'}</Badge>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1">
                            {member.permissions.slice(0, 2).map((p) => (<Badge key={p} variant="outline" className="text-[10px]">{p}</Badge>))}
                            {member.permissions.length > 2 && <Badge variant="outline" className="text-[10px]">+{member.permissions.length - 2}</Badge>}
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg hover:bg-blue-50 hover:text-blue-600"><Eye className="w-4 h-4" /></Button>
                            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg hover:bg-green-50 hover:text-green-600"><Edit className="w-4 h-4" /></Button>
                            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg hover:bg-purple-50 hover:text-purple-600"><Key className="w-4 h-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
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
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-xl text-sm">الكل ({mockTickets.length})</Button>
                    <Button variant="outline" className="rounded-xl text-sm bg-blue-50 border-blue-200 text-blue-700">مفتوحة ({mockTickets.filter(t => t.status === 'open').length})</Button>
                    <Button variant="outline" className="rounded-xl text-sm bg-yellow-50 border-yellow-200 text-yellow-700">قيد المعالجة ({mockTickets.filter(t => t.status === 'in_progress').length})</Button>
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
                          {ticket.assignedTo ? (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">{ticket.assignedTo.charAt(0)}</div>
                              <span className="text-xs text-gray-500">{ticket.assignedTo}</span>
                            </div>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-600">غير مسند</Badge>
                          )}
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
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500">الأولوية</p>
                          <div className="mt-1">{getPriorityBadge(selectedTicket.priority)}</div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500">التصنيف</p>
                          <p className="font-bold text-sm mt-1 capitalize">{selectedTicket.category}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="mb-2 block">إسناد إلى</Label>
                        <Select defaultValue={selectedTicket.assignedTo || ''}>
                          <SelectTrigger className="rounded-xl"><SelectValue placeholder="اختر موظف" /></SelectTrigger>
                          <SelectContent>
                            {mockStaff.filter(s => s.role === 'support' || s.role === 'manager').map(s => (
                              <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                  <Button className="rounded-xl gap-2"><Settings className="w-4 h-4" />إعدادات البرنامج</Button>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  {mockLoyaltyTiers.map((tier) => (
                    <div key={tier.tier} className="relative overflow-hidden rounded-2xl p-4 text-white" style={{ background: `linear-gradient(135deg, ${tier.color.replace('from-', '').replace(' to-', ', ')})` }}>
                      <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-sm"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                          {tier.tier === 'platinum' ? <Crown className="w-5 h-5" /> : tier.tier === 'gold' ? <Trophy className="w-5 h-5" /> : tier.tier === 'silver' ? <Medal className="w-5 h-5" /> : <Star className="w-5 h-5" />}
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
                      <p className="text-xs text-gray-500">لكل 10 ر.س مشتريات</p>
                    </div>
                    <div className="bg-white rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Gift className="w-5 h-5 text-green-500" />
                        <span className="font-bold text-sm">قيمة الاستبدال</span>
                      </div>
                      <p className="text-2xl font-bold">100 نقطة</p>
                      <p className="text-xs text-gray-500">= 10 ر.س خصم</p>
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
                  <div className="bg-gradient-to-l from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-sm text-blue-700">النقاط النشطة</p>
                    <p className="text-2xl font-bold text-blue-800 mt-1">1,600,000</p>
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
                  <p className="text-gray-500 text-sm mt-1">{mockCoupons.length} كوبون</p>
                </div>
                <Dialog open={isAddCouponOpen} onOpenChange={setIsAddCouponOpen}>
                  <DialogTrigger asChild>
                    <Button className="rounded-xl gap-2"><Plus className="w-4 h-4" />إنشاء كوبون</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>إنشاء كوبون جديد</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label>كود الكوبون</Label><Input className="rounded-xl mt-1" placeholder="SUMMER2024" /></div>
                        <div>
                          <Label>نوع الخصم</Label>
                          <Select>
                            <SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder="اختر" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">نسبة مئوية %</SelectItem>
                              <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div><Label>قيمة الخصم</Label><Input className="rounded-xl mt-1" type="number" placeholder="15" /></div>
                        <div><Label>الحد الأدنى للطلب</Label><Input className="rounded-xl mt-1" type="number" placeholder="200" /></div>
                        <div><Label>الحد الأقصى للخصم</Label><Input className="rounded-xl mt-1" type="number" placeholder="100" /></div>
                        <div><Label>عدد مرات الاستخدام</Label><Input className="rounded-xl mt-1" type="number" placeholder="1000" /></div>
                        <div><Label>تاريخ البداية</Label><Input className="rounded-xl mt-1" type="date" /></div>
                        <div><Label>تاريخ الانتهاء</Label><Input className="rounded-xl mt-1" type="date" /></div>
                      </div>
                      <Button className="w-full rounded-xl">إنشاء الكوبون</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {mockCoupons.map((coupon) => (
                  <div key={coupon.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary/20 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg ${coupon.isActive ? 'bg-gradient-to-br from-primary to-purple-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                          <Percent className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-lg font-mono">{coupon.code}</p>
                            <Button size="icon" variant="ghost" className="h-6 w-6"><Copy className="w-3 h-3" /></Button>
                            <Badge className={coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{coupon.isActive ? 'نشط' : 'منتهي'}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{coupon.type === 'percentage' ? `خصم ${coupon.value}%` : `خصم ${coupon.value} ر.س`} • الحد الأدنى {coupon.minOrder} ر.س</p>
                          <p className="text-xs text-gray-400 mt-1">ينتهي في {coupon.endDate}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-sm text-gray-600 mb-2">{coupon.usageCount} / {coupon.usageLimit} استخدام</div>
                        <Progress value={(coupon.usageCount / coupon.usageLimit) * 100} className="h-2 w-32" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={coupon.isActive} />
                        <Button size="icon" variant="ghost" className="rounded-lg"><Edit className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" className="rounded-lg hover:bg-red-50 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Warehouses Tab */}
          <TabsContent value="warehouses">
            <Card className="p-6 border-none shadow-lg rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-xl">إدارة المستودعات والفروع</h3>
                  <p className="text-gray-500 text-sm mt-1">{mockWarehouses.length} مستودع</p>
                </div>
                <Button className="rounded-xl gap-2"><Plus className="w-4 h-4" />إضافة مستودع</Button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {mockWarehouses.map((warehouse) => (
                  <div key={warehouse.id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                        <Warehouse className="w-6 h-6" />
                      </div>
                      <Badge className={warehouse.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{warehouse.status === 'active' ? 'نشط' : 'متوقف'}</Badge>
                    </div>
                    <h4 className="font-bold text-lg">{warehouse.name}</h4>
                    <p className="text-sm text-gray-500 mb-3">{warehouse.code} • {warehouse.city}</p>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500">السعة المستخدمة</span>
                          <span className="font-bold">{((warehouse.used / warehouse.capacity) * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={(warehouse.used / warehouse.capacity) * 100} className="h-2" />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">المدير</span>
                        <span className="font-bold">{warehouse.manager}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">الوحدات</span>
                        <span className="font-bold">{warehouse.used.toLocaleString()} / {warehouse.capacity.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" className="flex-1 rounded-xl text-sm">التفاصيل</Button>
                      <Button size="icon" variant="ghost" className="rounded-xl"><Edit className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <Card className="p-6 border-none shadow-lg rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-xl">الفواتير الضريبية</h3>
                  <p className="text-gray-500 text-sm mt-1">إدارة وتصدير الفواتير</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="rounded-xl gap-2"><Filter className="w-4 h-4" />تصفية</Button>
                  <Button variant="outline" className="rounded-xl gap-2"><Download className="w-4 h-4" />تصدير</Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-right border-b border-gray-100">
                      <th className="pb-4 font-bold text-gray-600">رقم الفاتورة</th>
                      <th className="pb-4 font-bold text-gray-600">العميل</th>
                      <th className="pb-4 font-bold text-gray-600">التاريخ</th>
                      <th className="pb-4 font-bold text-gray-600">المبلغ</th>
                      <th className="pb-4 font-bold text-gray-600">الضريبة</th>
                      <th className="pb-4 font-bold text-gray-600">الإجمالي</th>
                      <th className="pb-4 font-bold text-gray-600">الحالة</th>
                      <th className="pb-4 font-bold text-gray-600">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: 'INV-2024-001', customer: 'سوبر ماركت الفيصل', date: '2024-05-15', subtotal: 1087, tax: 163, total: 1250, status: 'paid' },
                      { id: 'INV-2024-002', customer: 'بقالة النور', date: '2024-05-14', subtotal: 774, tax: 116, total: 890, status: 'paid' },
                      { id: 'INV-2024-003', customer: 'مركز السعادة', date: '2024-05-13', subtotal: 2035, tax: 305, total: 2340, status: 'unpaid' },
                    ].map((invoice) => (
                      <tr key={invoice.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-4"><span className="font-mono font-bold text-primary">{invoice.id}</span></td>
                        <td className="py-4">{invoice.customer}</td>
                        <td className="py-4 text-gray-500">{invoice.date}</td>
                        <td className="py-4">{invoice.subtotal.toLocaleString()} ر.س</td>
                        <td className="py-4 text-gray-500">{invoice.tax.toLocaleString()} ر.س</td>
                        <td className="py-4 font-bold">{invoice.total.toLocaleString()} ر.س</td>
                        <td className="py-4">
                          <Badge className={invoice.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>{invoice.status === 'paid' ? 'مدفوعة' : 'غير مدفوعة'}</Badge>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg hover:bg-blue-50 hover:text-blue-600"><Eye className="w-4 h-4" /></Button>
                            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg hover:bg-green-50 hover:text-green-600"><Printer className="w-4 h-4" /></Button>
                            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg hover:bg-purple-50 hover:text-purple-600"><Download className="w-4 h-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card className="p-6 border-none shadow-lg rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl">إدارة المنتجات ({products.length})</h3>
                <div className="flex items-center gap-3">
                  <Input className="w-64 bg-gray-50 border-none rounded-xl" placeholder="بحث..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  <Button className="rounded-xl gap-2" onClick={() => setIsAddProductOpen(true)}><Plus className="w-4 h-4" />إضافة</Button>
                </div>
              </div>
              <div className="text-center py-8 text-gray-500">جدول المنتجات متاح - انتقل لتبويب المنتجات الكامل</div>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="p-6 border-none shadow-lg rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl">إدارة الطلبات</h3>
              </div>
              <div className="space-y-4">
                {mockOrders.map((order) => (
                  <div key={order.id} className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center"><Package className="w-6 h-6 text-primary" /></div>
                      <div>
                        <p className="font-bold">طلب #{order.id}</p>
                        <p className="text-sm text-gray-500">{order.customer}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold">{order.total} ر.س</span>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <Card className="p-6 border-none shadow-lg rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl">إدارة العملاء (10,450+ عميل)</h3>
              </div>
              <div className="text-center py-8 text-gray-500">جدول العملاء الكامل متاح هنا</div>
            </Card>
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

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="p-6 border-none shadow-lg rounded-2xl">
              <h3 className="font-bold text-xl mb-6">إعدادات النظام</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div><Label>اسم المتجر</Label><Input className="rounded-xl mt-1" defaultValue="ساري" /></div>
                  <div><Label>البريد الإلكتروني</Label><Input className="rounded-xl mt-1" defaultValue="admin@sary.sa" /></div>
                  <div><Label>نسبة الضريبة (%)</Label><Input className="rounded-xl mt-1" type="number" defaultValue="15" /></div>
                </div>
                <div className="space-y-4">
                  <div><Label>الحد الأدنى للطلب</Label><Input className="rounded-xl mt-1" type="number" defaultValue="200" /></div>
                  <div><Label>رسوم التوصيل</Label><Input className="rounded-xl mt-1" type="number" defaultValue="0" /></div>
                </div>
              </div>
              <Button className="mt-6 rounded-xl">حفظ التغييرات</Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
