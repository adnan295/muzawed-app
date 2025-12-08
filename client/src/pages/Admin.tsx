import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
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
  Package, ShoppingCart, Users, TrendingUp, Plus, Search, Edit, Trash2, ArrowRight,
  LayoutDashboard, Box, ClipboardList, Settings, DollarSign, Eye, CheckCircle, Clock,
  XCircle, Truck, BarChart3, PieChart, Activity, RefreshCw, Bell, Download, Upload,
  Tag, Percent, Calendar, Filter, MoreVertical, Star, MessageSquare, Zap, Target,
  Award, Megaphone, Layers, Globe, FileText, TrendingDown, AlertTriangle, ChevronUp,
  ChevronDown, Mail, Phone, MapPin, Building, CreditCard, Wallet, UserCog, Headphones,
  Gift, Warehouse, Receipt, Copy, ExternalLink, Shield, Lock, Key, UserPlus, TicketIcon,
  MessageCircle, Send, Archive, Printer, QrCode, Barcode, PackageCheck, PackageX, Timer,
  Banknote, PiggyBank, Coins, Crown, Medal, Trophy, Repeat, RotateCcw, Navigation,
  TruckIcon, MapPinned, Factory, ShoppingBag, FileSpreadsheet, File, MailCheck,
  Sparkles, Flame, ThumbsUp, ThumbsDown, AlertCircle, Info, HelpCircle, CircleDollarSign,
  BadgePercent, Gauge, ArrowUpRight, ArrowDownRight, Hash, Split, Merge,
  GitBranch, Network, Boxes, Container, Handshake, Building2, Store, Home, ArrowLeftRight, LogOut
} from 'lucide-react';
import { Link } from 'wouter';
import { productsAPI, categoriesAPI, brandsAPI, notificationsAPI, activityLogsAPI, inventoryAPI, adminAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
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

const mockStaff = [
  { id: 1, name: 'أحمد محمد', email: 'ahmed@sary.sa', phone: '0501234567', role: 'admin', department: 'الإدارة', status: 'active', permissions: ['all'], lastActive: 'الآن' },
  { id: 2, name: 'سارة علي', email: 'sara@sary.sa', phone: '0559876543', role: 'manager', department: 'المبيعات', status: 'active', permissions: ['orders', 'products'], lastActive: '5 دقائق' },
  { id: 3, name: 'محمد خالد', email: 'mohammed@sary.sa', phone: '0543216789', role: 'support', department: 'الدعم الفني', status: 'active', permissions: ['support', 'customers'], lastActive: '15 دقيقة' },
  { id: 4, name: 'فاطمة أحمد', email: 'fatima@sary.sa', phone: '0567891234', role: 'warehouse', department: 'المستودعات', status: 'active', permissions: ['inventory'], lastActive: '1 ساعة' },
  { id: 5, name: 'عبدالله سعود', email: 'abdullah@sary.sa', phone: '0512345678', role: 'sales', department: 'المبيعات', status: 'inactive', permissions: ['orders'], lastActive: '3 أيام' },
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

const mockWarehouses = [
  { id: 1, name: 'المستودع الرئيسي', code: 'WH-RYD-001', city: 'الرياض', capacity: 10000, used: 7500, status: 'active', manager: 'فاطمة أحمد', products: 1250, orders: 45 },
  { id: 2, name: 'مستودع جدة', code: 'WH-JED-001', city: 'جدة', capacity: 8000, used: 5200, status: 'active', manager: 'عبدالرحمن سالم', products: 980, orders: 32 },
  { id: 3, name: 'مستودع الدمام', code: 'WH-DMM-001', city: 'الدمام', capacity: 5000, used: 3800, status: 'active', manager: 'خالد محمد', products: 650, orders: 28 },
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

const mockPromotions = [
  { id: 1, name: 'تخفيضات الصيف', type: 'flash_sale', discount: 25, startDate: '2024-06-01', endDate: '2024-08-31', status: 'active', views: 15420, conversions: 2340 },
  { id: 2, name: 'عرض المشروبات', type: 'category', discount: 15, startDate: '2024-05-15', endDate: '2024-06-15', status: 'active', views: 8750, conversions: 1120 },
  { id: 3, name: 'باندل التنظيف', type: 'bundle', discount: 30, startDate: '2024-04-01', endDate: '2024-04-30', status: 'ended', views: 6200, conversions: 890 },
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

const mockCustomerSegments = [
  { id: 1, name: 'عملاء VIP', count: 500, avgOrder: 2500, retention: 95, growth: 12 },
  { id: 2, name: 'عملاء نشطين', count: 3500, avgOrder: 850, retention: 78, growth: 8 },
  { id: 3, name: 'عملاء جدد (30 يوم)', count: 1200, avgOrder: 450, retention: 45, growth: 25 },
  { id: 4, name: 'عملاء خاملين', count: 2800, avgOrder: 320, retention: 15, growth: -5 },
  { id: 5, name: 'عملاء مهددين بالمغادرة', count: 450, avgOrder: 280, retention: 25, growth: -12 },
];

const recentActivities = [
  { id: 1, type: 'order', message: 'طلب جديد #1024 من سوبر ماركت النور', time: '5 دقائق', icon: ShoppingCart, color: 'bg-blue-100 text-blue-600' },
  { id: 2, type: 'user', message: 'عميل جديد: بقالة الأمل', time: '15 دقيقة', icon: Users, color: 'bg-green-100 text-green-600' },
  { id: 3, type: 'stock', message: 'تنبيه: مخزون بيبسي منخفض (15 وحدة)', time: '30 دقيقة', icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-600' },
  { id: 4, type: 'ticket', message: 'تذكرة دعم جديدة TKT-005', time: '45 دقيقة', icon: Headphones, color: 'bg-purple-100 text-purple-600' },
  { id: 5, type: 'payment', message: 'استلام دفعة 2,500 ر.س', time: '1 ساعة', icon: CreditCard, color: 'bg-emerald-100 text-emerald-600' },
  { id: 6, type: 'return', message: 'طلب استرجاع RET-004', time: '2 ساعة', icon: RotateCcw, color: 'bg-red-100 text-red-600' },
];

const kpiData = [
  { name: 'معدل التحويل', value: 12.5, target: 15, unit: '%', trend: 'up', change: 2.3 },
  { name: 'متوسط قيمة الطلب', value: 850, target: 1000, unit: 'ر.س', trend: 'up', change: 45 },
  { name: 'معدل إعادة الطلب', value: 68, target: 75, unit: '%', trend: 'up', change: 5 },
  { name: 'وقت التوصيل', value: 2.4, target: 2, unit: 'ساعة', trend: 'down', change: -0.3 },
  { name: 'رضا العملاء', value: 4.6, target: 4.8, unit: '/5', trend: 'up', change: 0.2 },
  { name: 'معدل الإلغاء', value: 3.2, target: 2, unit: '%', trend: 'down', change: -0.5 },
];

export default function Admin() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [isAddPromotionOpen, setIsAddPromotionOpen] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dateRange, setDateRange] = useState('week');
  const [selectedTicket, setSelectedTicket] = useState<typeof mockTickets[0] | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<typeof mockShipments[0] | null>(null);
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

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth) {
      try {
        const auth = JSON.parse(adminAuth);
        if (auth.loggedIn) {
          setIsAuthenticated(true);
        } else {
          setLocation('/admin/login');
        }
      } catch {
        setLocation('/admin/login');
      }
    } else {
      setLocation('/admin/login');
    }
    setIsLoading(false);
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
    { title: 'إجمالي المبيعات', value: dashboardStats?.totalRevenue?.toLocaleString('ar-SA') || '0', suffix: 'ر.س', icon: DollarSign, color: 'from-emerald-500 to-emerald-600', change: '+18%', changeType: 'up' },
    { title: 'الطلبات النشطة', value: dashboardStats?.totalOrders?.toLocaleString('ar-SA') || '0', suffix: 'طلب', icon: ShoppingCart, color: 'from-blue-500 to-blue-600', change: '+24%', changeType: 'up' },
    { title: 'العملاء المسجلين', value: dashboardStats?.totalCustomers?.toLocaleString('ar-SA') || '0', suffix: 'عميل', icon: Users, color: 'from-purple-500 to-purple-600', change: '+12%', changeType: 'up' },
    { title: 'منتجات منخفضة المخزون', value: dashboardStats?.lowStockProducts?.toString() || lowStockProductsData.length.toString(), suffix: 'منتج', icon: AlertTriangle, color: 'from-orange-500 to-orange-600', change: lowStockProductsData.length > 10 ? 'تنبيه!' : 'طبيعي', changeType: lowStockProductsData.length > 10 ? 'down' : 'up' },
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
                <p className="text-purple-200 text-sm">إدارة +10,000 عميل • منصة ساري للجملة • الإصدار 2.0</p>
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
                                <p className="text-xs text-gray-400 mt-1">{new Date(notification.createdAt).toLocaleDateString('ar-SA')}</p>
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
          <ScrollArea className="w-full">
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
              <TabsTrigger value="segments" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5">
                <Split className="w-4 h-4 ml-2" />الشرائح
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
                          <p className="text-xs text-gray-400 mt-1">{new Date(log.createdAt).toLocaleDateString('ar-SA')}</p>
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

          {/* Shipments Tab */}
          <TabsContent value="shipments">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 p-6 border-none shadow-lg rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-xl flex items-center gap-2"><TruckIcon className="w-5 h-5 text-blue-500" />تتبع الشحنات</h3>
                    <p className="text-gray-500 text-sm mt-1">{mockShipments.length} شحنة نشطة</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl text-sm">الكل</Button>
                    <Button variant="outline" className="rounded-xl text-sm bg-blue-50 border-blue-200 text-blue-700">في الطريق</Button>
                    <Button variant="outline" className="rounded-xl text-sm bg-purple-50 border-purple-200 text-purple-700">جاري التوصيل</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {mockShipments.map((shipment) => (
                    <div key={shipment.id} className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedShipment?.id === shipment.id ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200 bg-gray-50'}`} onClick={() => setSelectedShipment(shipment)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${shipment.status === 'in_transit' ? 'bg-blue-100 text-blue-600' : shipment.status === 'out_for_delivery' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
                            {shipment.status === 'in_transit' ? <Truck className="w-6 h-6" /> : shipment.status === 'out_for_delivery' ? <Navigation className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold font-mono">{shipment.trackingNumber}</p>
                              {getStatusBadge(shipment.status)}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">طلب #{shipment.orderId} • {shipment.carrier}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-primary">{shipment.eta}</p>
                          <p className="text-xs text-gray-500">{shipment.location}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 border-none shadow-lg rounded-2xl">
                {selectedShipment ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg">تفاصيل الشحنة</h3>
                      {getStatusBadge(selectedShipment.status)}
                    </div>
                    <div className="space-y-4">
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500">رقم التتبع</p>
                        <p className="font-bold text-sm mt-1 font-mono">{selectedShipment.trackingNumber}</p>
                      </div>
                      {selectedShipment.driver && (
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500">السائق</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="font-bold text-sm">{selectedShipment.driver}</p>
                            <Button size="sm" variant="outline" className="rounded-lg gap-1">
                              <Phone className="w-3 h-3" />
                              اتصال
                            </Button>
                          </div>
                        </div>
                      )}
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500">الموقع الحالي</p>
                        <p className="font-bold text-sm mt-1 flex items-center gap-2"><MapPinned className="w-4 h-4 text-primary" />{selectedShipment.location}</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-xs text-blue-500">الوقت المتوقع للوصول</p>
                        <p className="text-2xl font-bold text-blue-700 mt-1">{selectedShipment.eta}</p>
                      </div>
                      <div className="relative mt-6">
                        <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                        {['تم إنشاء الطلب', 'قيد التجهيز', 'تم التسليم للسائق', 'في الطريق', 'تم التوصيل'].map((step, index) => (
                          <div key={step} className="flex items-center gap-4 mb-4 relative">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${index <= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}>
                              <CheckCircle className="w-4 h-4" />
                            </div>
                            <span className={`text-sm ${index <= 3 ? 'font-bold' : 'text-gray-400'}`}>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <MapPinned className="w-12 h-12 mb-3" />
                    <p>اختر شحنة لعرض التفاصيل</p>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Returns Tab */}
          <TabsContent value="returns">
            <Card className="p-6 border-none shadow-lg rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-xl flex items-center gap-2"><RotateCcw className="w-5 h-5 text-red-500" />إدارة المرتجعات والاستردادات</h3>
                  <p className="text-gray-500 text-sm mt-1">{mockReturns.length} طلب استرجاع</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="rounded-xl text-sm">الكل</Button>
                  <Button variant="outline" className="rounded-xl text-sm bg-yellow-50 border-yellow-200 text-yellow-700">قيد المراجعة</Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-right border-b border-gray-100">
                      <th className="pb-4 font-bold text-gray-600">رقم الطلب</th>
                      <th className="pb-4 font-bold text-gray-600">العميل</th>
                      <th className="pb-4 font-bold text-gray-600">السبب</th>
                      <th className="pb-4 font-bold text-gray-600">المبلغ</th>
                      <th className="pb-4 font-bold text-gray-600">التاريخ</th>
                      <th className="pb-4 font-bold text-gray-600">الحالة</th>
                      <th className="pb-4 font-bold text-gray-600">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockReturns.map((ret) => (
                      <tr key={ret.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-4">
                          <div>
                            <p className="font-bold font-mono text-primary">{ret.returnNumber}</p>
                            <p className="text-xs text-gray-500">طلب #{ret.orderId}</p>
                          </div>
                        </td>
                        <td className="py-4">{ret.customer}</td>
                        <td className="py-4"><Badge variant="outline">{ret.reason}</Badge></td>
                        <td className="py-4 font-bold">{ret.amount} ر.س</td>
                        <td className="py-4 text-gray-500">{ret.date}</td>
                        <td className="py-4">{getStatusBadge(ret.status)}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg hover:bg-blue-50 hover:text-blue-600"><Eye className="w-4 h-4" /></Button>
                            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg hover:bg-green-50 hover:text-green-600"><CheckCircle className="w-4 h-4" /></Button>
                            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg hover:bg-red-50 hover:text-red-600"><XCircle className="w-4 h-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Customer Segments Tab */}
          <TabsContent value="segments">
            <Card className="p-6 border-none shadow-lg rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-xl flex items-center gap-2"><Split className="w-5 h-5 text-indigo-500" />شرائح العملاء والتحليلات</h3>
                  <p className="text-gray-500 text-sm mt-1">تقسيم العملاء لاستهداف أفضل</p>
                </div>
                <Button className="rounded-xl gap-2"><Plus className="w-4 h-4" />إنشاء شريحة</Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockCustomerSegments.map((segment) => (
                  <div key={segment.id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-lg">{segment.name}</h4>
                      <div className={`flex items-center gap-1 text-xs font-bold ${segment.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {segment.growth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {segment.growth}%
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">عدد العملاء</p>
                        <p className="text-xl font-bold">{segment.count.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">متوسط الطلب</p>
                        <p className="text-xl font-bold">{segment.avgOrder} ر.س</p>
                      </div>
                      <div className="col-span-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">معدل الاحتفاظ</span>
                          <span className="font-bold">{segment.retention}%</span>
                        </div>
                        <Progress value={segment.retention} className="h-2" />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" className="flex-1 rounded-xl text-sm">عرض العملاء</Button>
                      <Button variant="outline" className="rounded-xl text-sm"><Megaphone className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers">
            <Card className="p-6 border-none shadow-lg rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-xl flex items-center gap-2"><Handshake className="w-5 h-5 text-green-500" />إدارة الموردين</h3>
                  <p className="text-gray-500 text-sm mt-1">{mockSuppliers.length} مورد</p>
                </div>
                <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
                  <DialogTrigger asChild>
                    <Button className="rounded-xl gap-2"><Plus className="w-4 h-4" />إضافة مورد</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>إضافة مورد جديد</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label>اسم الشركة</Label><Input className="rounded-xl mt-1" placeholder="شركة..." /></div>
                        <div><Label>الكود</Label><Input className="rounded-xl mt-1" placeholder="SUP-XXX" /></div>
                        <div><Label>جهة الاتصال</Label><Input className="rounded-xl mt-1" placeholder="الاسم" /></div>
                        <div><Label>رقم الهاتف</Label><Input className="rounded-xl mt-1" placeholder="05XXXXXXXX" /></div>
                        <div><Label>البريد الإلكتروني</Label><Input className="rounded-xl mt-1" placeholder="email@company.com" /></div>
                        <div><Label>المدينة</Label><Input className="rounded-xl mt-1" placeholder="الرياض" /></div>
                      </div>
                      <Button className="w-full rounded-xl">إضافة المورد</Button>
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
                      <th className="pb-4 font-bold text-gray-600">الطلبات</th>
                      <th className="pb-4 font-bold text-gray-600">الرصيد</th>
                      <th className="pb-4 font-bold text-gray-600">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockSuppliers.map((supplier) => (
                      <tr key={supplier.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold">{supplier.name.charAt(0)}</div>
                            <div>
                              <p className="font-bold">{supplier.name}</p>
                              <p className="text-xs text-gray-500">{supplier.code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <div>
                            <p className="font-medium">{supplier.contact}</p>
                            <p className="text-xs text-gray-500">{supplier.phone}</p>
                          </div>
                        </td>
                        <td className="py-4">{supplier.city}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: supplier.rating }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </td>
                        <td className="py-4 font-bold">{supplier.orders}</td>
                        <td className="py-4 font-bold text-green-600">{supplier.balance.toLocaleString()} ر.س</td>
                        <td className="py-4">
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg hover:bg-blue-50 hover:text-blue-600"><Eye className="w-4 h-4" /></Button>
                            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg hover:bg-green-50 hover:text-green-600"><ShoppingBag className="w-4 h-4" /></Button>
                            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg hover:bg-purple-50 hover:text-purple-600"><Edit className="w-4 h-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Promotions Tab */}
          <TabsContent value="promotions">
            <Card className="p-6 border-none shadow-lg rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-xl flex items-center gap-2"><Megaphone className="w-5 h-5 text-orange-500" />العروض والحملات الترويجية</h3>
                  <p className="text-gray-500 text-sm mt-1">{mockPromotions.length} حملة</p>
                </div>
                <Dialog open={isAddPromotionOpen} onOpenChange={setIsAddPromotionOpen}>
                  <DialogTrigger asChild>
                    <Button className="rounded-xl gap-2"><Plus className="w-4 h-4" />إنشاء عرض</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>إنشاء عرض ترويجي</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div><Label>اسم العرض</Label><Input className="rounded-xl mt-1" placeholder="تخفيضات الصيف" /></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>نوع العرض</Label>
                          <Select>
                            <SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder="اختر" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="flash_sale">تخفيض سريع</SelectItem>
                              <SelectItem value="category">على قسم</SelectItem>
                              <SelectItem value="bundle">باندل</SelectItem>
                              <SelectItem value="free_shipping">شحن مجاني</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div><Label>نسبة الخصم</Label><Input className="rounded-xl mt-1" type="number" placeholder="25" /></div>
                        <div><Label>تاريخ البداية</Label><Input className="rounded-xl mt-1" type="date" /></div>
                        <div><Label>تاريخ الانتهاء</Label><Input className="rounded-xl mt-1" type="date" /></div>
                      </div>
                      <div><Label>الوصف</Label><Textarea className="rounded-xl mt-1" placeholder="وصف العرض..." /></div>
                      <Button className="w-full rounded-xl">إنشاء العرض</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockPromotions.map((promo) => (
                  <div key={promo.id} className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-100 hover:shadow-md transition-all relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-20 h-20 bg-orange-200/30 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white">
                        {promo.type === 'flash_sale' ? <Flame className="w-6 h-6" /> : promo.type === 'bundle' ? <Boxes className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                      </div>
                      {getStatusBadge(promo.status)}
                    </div>
                    <h4 className="font-bold text-lg mb-1">{promo.name}</h4>
                    <p className="text-sm text-orange-700 mb-3">خصم {promo.discount}%</p>
                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                      <div className="bg-white/60 rounded-lg p-2">
                        <p className="text-xs text-gray-500">المشاهدات</p>
                        <p className="font-bold">{promo.views.toLocaleString()}</p>
                      </div>
                      <div className="bg-white/60 rounded-lg p-2">
                        <p className="text-xs text-gray-500">التحويلات</p>
                        <p className="font-bold">{promo.conversions.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">{promo.startDate} - {promo.endDate}</div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" className="flex-1 rounded-xl text-sm bg-white/80">تحرير</Button>
                      <Button variant="outline" className="rounded-xl text-sm bg-white/80"><BarChart3 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="space-y-6">
              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-xl flex items-center gap-2"><FileText className="w-5 h-5 text-blue-500" />التقارير والتصدير</h3>
                    <p className="text-gray-500 text-sm mt-1">إنشاء وتصدير التقارير المتقدمة</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl gap-2"><RefreshCw className="w-4 h-4" />تحديث البيانات</Button>
                    <Button className="rounded-xl gap-2"><Download className="w-4 h-4" />تصدير الكل</Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { title: 'تقرير المبيعات', icon: DollarSign, color: 'from-green-500 to-emerald-600', value: '٢,٤٥٠,٠٠٠', change: '+15%' },
                    { title: 'تقرير المخزون', icon: Package, color: 'from-blue-500 to-cyan-600', value: '٣,٥٤٢ منتج', change: '+8%' },
                    { title: 'تقرير العملاء', icon: Users, color: 'from-purple-500 to-violet-600', value: '٩,٨٧٦ عميل', change: '+22%' },
                    { title: 'تقرير الطلبات', icon: ClipboardList, color: 'from-orange-500 to-amber-600', value: '١٢,٣٤٥ طلب', change: '+18%' },
                  ].map((report, index) => (
                    <div key={index} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all cursor-pointer group">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${report.color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                        <report.icon className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold">{report.title}</h4>
                      <p className="text-2xl font-bold text-gray-900 mt-2">{report.value}</p>
                      <p className="text-sm text-green-600 flex items-center gap-1 mt-1"><TrendingUp className="w-3 h-3" />{report.change} من الشهر السابق</p>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="rounded-lg text-xs gap-1" data-testid={`button-export-pdf-${index}`}><File className="w-3 h-3" />PDF</Button>
                        <Button size="sm" variant="outline" className="rounded-lg text-xs gap-1" data-testid={`button-export-excel-${index}`}><FileSpreadsheet className="w-3 h-3" />Excel</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="p-6 border-none shadow-lg rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-500" />تحليل المبيعات الشهري</h4>
                    <Select defaultValue="2024">
                      <SelectTrigger className="w-32 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                        <SelectItem value="2022">2022</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" stroke="#888" fontSize={12} />
                        <YAxis yAxisId="left" stroke="#888" fontSize={12} />
                        <YAxis yAxisId="right" orientation="right" stroke="#888" fontSize={12} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="sales" name="المبيعات" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="orders" name="الطلبات" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-6 border-none shadow-lg rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold flex items-center gap-2"><PieChart className="w-5 h-5 text-purple-500" />توزيع المبيعات حسب الفئة</h4>
                    <Button variant="outline" size="sm" className="rounded-xl gap-1"><Download className="w-3 h-3" />تصدير</Button>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie data={categoryPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {categoryPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="p-6 border-none shadow-lg rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-green-500" />الأداء اليومي</h4>
                    <Badge className="bg-green-100 text-green-700">مباشر</Badge>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={hourlyData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="hour" stroke="#888" fontSize={10} />
                        <YAxis stroke="#888" fontSize={10} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Area type="monotone" dataKey="revenue" name="الإيرادات" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-6 border-none shadow-lg rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold flex items-center gap-2"><Target className="w-5 h-5 text-orange-500" />قمع التحويل</h4>
                    <Button variant="outline" size="sm" className="rounded-xl gap-1"><Eye className="w-3 h-3" />التفاصيل</Button>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <FunnelChart>
                        <Tooltip />
                        <Funnel dataKey="value" data={funnelData} isAnimationActive>
                          <LabelList position="center" fill="#fff" stroke="none" dataKey="name" />
                        </Funnel>
                      </FunnelChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <h4 className="font-bold mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-gray-500" />تقرير مخصص</h4>
                <div className="grid md:grid-cols-5 gap-4">
                  <div>
                    <Label>نوع التقرير</Label>
                    <Select>
                      <SelectTrigger className="rounded-xl mt-1" data-testid="select-report-type"><SelectValue placeholder="اختر" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">المبيعات</SelectItem>
                        <SelectItem value="inventory">المخزون</SelectItem>
                        <SelectItem value="customers">العملاء</SelectItem>
                        <SelectItem value="financial">المالي</SelectItem>
                        <SelectItem value="orders">الطلبات</SelectItem>
                        <SelectItem value="products">المنتجات</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>من تاريخ</Label>
                    <Input type="date" className="rounded-xl mt-1" data-testid="input-date-from" />
                  </div>
                  <div>
                    <Label>إلى تاريخ</Label>
                    <Input type="date" className="rounded-xl mt-1" data-testid="input-date-to" />
                  </div>
                  <div>
                    <Label>التجميع</Label>
                    <Select>
                      <SelectTrigger className="rounded-xl mt-1" data-testid="select-grouping"><SelectValue placeholder="اختر" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">يومي</SelectItem>
                        <SelectItem value="weekly">أسبوعي</SelectItem>
                        <SelectItem value="monthly">شهري</SelectItem>
                        <SelectItem value="yearly">سنوي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>الصيغة</Label>
                    <Select>
                      <SelectTrigger className="rounded-xl mt-1" data-testid="select-format"><SelectValue placeholder="اختر" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button className="rounded-xl gap-2" data-testid="button-generate-report"><Download className="w-4 h-4" />إنشاء التقرير</Button>
                  <Button variant="outline" className="rounded-xl gap-2" data-testid="button-schedule-report"><Calendar className="w-4 h-4" />جدولة التقرير</Button>
                  <Button variant="outline" className="rounded-xl gap-2" data-testid="button-email-report"><Mail className="w-4 h-4" />إرسال بالبريد</Button>
                </div>
              </Card>

              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <h4 className="font-bold mb-4 flex items-center gap-2"><ClipboardList className="w-5 h-5 text-blue-500" />التقارير المجدولة</h4>
                <div className="space-y-3">
                  {[
                    { name: 'تقرير المبيعات اليومي', schedule: 'يومياً - 9:00 ص', recipients: 'ahmed@sary.sa, sara@sary.sa', status: 'active' },
                    { name: 'تقرير المخزون الأسبوعي', schedule: 'أسبوعياً - الأحد', recipients: 'warehouse@sary.sa', status: 'active' },
                    { name: 'تقرير الأداء الشهري', schedule: 'شهرياً - اليوم الأول', recipients: 'management@sary.sa', status: 'paused' },
                  ].map((report, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold">{report.name}</p>
                          <p className="text-sm text-gray-500">{report.schedule} • {report.recipients}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={report.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                          {report.status === 'active' ? 'نشط' : 'متوقف'}
                        </Badge>
                        <Button variant="outline" size="sm" className="rounded-lg"><Edit className="w-4 h-4" /></Button>
                        <Button variant="outline" size="sm" className="rounded-lg text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
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
                      <th className="pb-4 font-bold text-gray-600">آخر نشاط</th>
                      <th className="pb-4 font-bold text-gray-600">الحالة</th>
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
                        <td className="py-4 text-sm text-gray-500">{member.lastActive}</td>
                        <td className="py-4">
                          <Badge className={member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{member.status === 'active' ? 'نشط' : 'غير نشط'}</Badge>
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
                  <Button className="rounded-xl gap-2"><Settings className="w-4 h-4" />إعدادات البرنامج</Button>
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
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-white rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-500">المنتجات</p>
                          <p className="font-bold">{warehouse.products}</p>
                        </div>
                        <div className="bg-white rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-500">الطلبات</p>
                          <p className="font-bold">{warehouse.orders}</p>
                        </div>
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-600">المنتج</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-600">القسم</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-600">السعر</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-600">المخزون</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-600">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.filter(p => p.name.includes(searchQuery)).slice(0, 20).map((product) => {
                      const category = categories.find(c => c.id === product.categoryId);
                      return (
                        <tr key={product.id} className="hover:bg-gray-50" data-testid={`product-row-${product.id}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                              <div>
                                <p className="font-bold text-sm">{product.name}</p>
                                <p className="text-xs text-gray-500">{product.unit}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{category?.name || 'غير محدد'}</td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-primary">{product.price} ر.س</span>
                            {product.originalPrice && (
                              <span className="text-xs text-gray-400 line-through mr-2">{product.originalPrice}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={product.stock < 30 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                              {product.stock} وحدة
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" className="rounded-lg" data-testid={`edit-product-${product.id}`}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50" 
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
              {products.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>لا توجد منتجات</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="p-6 border-none shadow-lg rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl">إدارة الطلبات ({adminOrders.length})</h3>
                <div className="flex gap-2">
                  <Button variant="outline" className="rounded-xl">الكل</Button>
                  <Button variant="outline" className="rounded-xl bg-yellow-50 border-yellow-200 text-yellow-700">قيد الانتظار</Button>
                  <Button variant="outline" className="rounded-xl bg-blue-50 border-blue-200 text-blue-700">قيد التجهيز</Button>
                </div>
              </div>
              <div className="space-y-4">
                {adminOrders.length > 0 ? adminOrders.slice(0, 10).map((order: any) => (
                  <div key={order.id} className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between hover:bg-gray-100 cursor-pointer transition-colors" data-testid={`order-row-${order.id}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center"><Package className="w-6 h-6 text-primary" /></div>
                      <div>
                        <p className="font-bold">طلب #{order.id}</p>
                        <p className="text-sm text-gray-500">{order.user?.facilityName || 'عميل'}</p>
                        <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('ar-SA')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-primary">{order.total} ر.س</span>
                      {getStatusBadge(order.status)}
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
                        <SelectTrigger className="w-32 rounded-lg text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">قيد الانتظار</SelectItem>
                          <SelectItem value="processing">قيد التجهيز</SelectItem>
                          <SelectItem value="shipped">قيد الشحن</SelectItem>
                          <SelectItem value="delivered">تم التوصيل</SelectItem>
                          <SelectItem value="cancelled">ملغي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12 text-gray-500">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>لا توجد طلبات</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <Card className="p-6 border-none shadow-lg rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl">إدارة العملاء ({adminUsers.length} عميل)</h3>
                <div className="flex gap-2">
                  <Input className="w-64 bg-gray-50 border-none rounded-xl" placeholder="بحث عن عميل..." />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-600">العميل</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-600">الهاتف</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-600">تاريخ التسجيل</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-600">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {adminUsers.length > 0 ? adminUsers.slice(0, 20).map((user: any) => (
                      <tr key={user.id} className="hover:bg-gray-50" data-testid={`customer-row-${user.id}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {user.facilityName?.charAt(0) || 'ع'}
                            </div>
                            <div>
                              <p className="font-bold text-sm">{user.facilityName || 'عميل'}</p>
                              <p className="text-xs text-gray-500">{user.commercialRegister || 'غير محدد'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">{user.phone}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString('ar-SA')}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="rounded-lg">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="rounded-lg">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="text-center py-12 text-gray-500">
                          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                          <p>لا يوجد عملاء مسجلين</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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
