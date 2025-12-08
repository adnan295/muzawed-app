import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
  Banknote, PiggyBank, Coins, Crown, Medal, Trophy, Repeat, RotateCcw, Navigation, UserX,
  TruckIcon, MapPinned, Factory, ShoppingBag, FileSpreadsheet, File, MailCheck, FileDown,
  Sparkles, Flame, ThumbsUp, ThumbsDown, AlertCircle, Info, HelpCircle, CircleDollarSign,
  BadgePercent, Gauge, ArrowUpRight, ArrowDownRight, Hash, Split, Merge,
  GitBranch, Network, Boxes, Container, Handshake, Building2, Store, Home, ArrowLeftRight, LogOut
} from 'lucide-react';
import { Link } from 'wouter';
import { productsAPI, categoriesAPI, brandsAPI, notificationsAPI, activityLogsAPI, inventoryAPI, adminAPI, citiesAPI, warehousesAPI, productInventoryAPI, driversAPI, vehiclesAPI, returnsAPI, customersAPI } from '@/lib/api';
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

export default function Admin() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', icon: '📦', color: 'from-blue-400 to-blue-500' });
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);
  const [newBrand, setNewBrand] = useState({ name: '', logo: '🏷️' });
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [filterStock, setFilterStock] = useState<string>('all');
  const [isAddPromotionOpen, setIsAddPromotionOpen] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dateRange, setDateRange] = useState('week');
  const [selectedTicket, setSelectedTicket] = useState<typeof mockTickets[0] | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<typeof mockShipments[0] | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderFilterStatus, setOrderFilterStatus] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderDateFilter, setOrderDateFilter] = useState('all');
  const [orderNotes, setOrderNotes] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productSort, setProductSort] = useState('name');
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [productViewMode, setProductViewMode] = useState<'table' | 'grid'>('table');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [newProduct, setNewProduct] = useState({
    name: '', categoryId: '', brandId: '', price: '', originalPrice: '',
    image: '', minOrder: '1', unit: 'كرتون', stock: '100',
  });
  const [productInventory, setProductInventory] = useState<{ warehouseId: number; stock: number }[]>([]);

  // Warehouse management state
  const [isAddWarehouseOpen, setIsAddWarehouseOpen] = useState(false);
  const [isAddCityOpen, setIsAddCityOpen] = useState(false);
  const [newWarehouse, setNewWarehouse] = useState({
    name: '', code: '', cityId: '', address: '', phone: '', capacity: '1000',
  });
  const [newCity, setNewCity] = useState({ name: '', region: '' });

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

  // Customer Stats Queries
  const { data: customerStats } = useQuery({
    queryKey: ['customerStats'],
    queryFn: () => customersAPI.getStats(),
  });

  const { data: topCustomers = [] } = useQuery({
    queryKey: ['topCustomers'],
    queryFn: () => customersAPI.getTopCustomers(5),
  });

  const { data: customerGrowthData = [] } = useQuery({
    queryKey: ['customerGrowth'],
    queryFn: () => customersAPI.getGrowthData(),
  });

  // Customer search and filter state
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerStatusFilter, setCustomerStatusFilter] = useState('all');
  const [customerCityFilter, setCustomerCityFilter] = useState('all');
  const [showAddCustomerDialog, setShowAddCustomerDialog] = useState(false);
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

  const { data: customerDetails } = useQuery({
    queryKey: ['customerDetails', selectedCustomerId],
    queryFn: () => selectedCustomerId ? customersAPI.getDetails(selectedCustomerId) : null,
    enabled: !!selectedCustomerId,
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
    { title: 'إجمالي المبيعات', value: dashboardStats?.totalRevenue?.toLocaleString('ar-SY') || '0', suffix: 'ل.س', icon: DollarSign, color: 'from-emerald-500 to-emerald-600', change: '+18%', changeType: 'up' },
    { title: 'الطلبات النشطة', value: dashboardStats?.totalOrders?.toLocaleString('ar-SY') || '0', suffix: 'طلب', icon: ShoppingCart, color: 'from-blue-500 to-blue-600', change: '+24%', changeType: 'up' },
    { title: 'العملاء المسجلين', value: dashboardStats?.totalCustomers?.toLocaleString('ar-SY') || '0', suffix: 'عميل', icon: Users, color: 'from-purple-500 to-purple-600', change: '+12%', changeType: 'up' },
    { title: 'منتجات منخفضة المخزون', value: dashboardStats?.lowStockProducts?.toString() || lowStockProductsData.length.toString(), suffix: 'منتج', icon: AlertTriangle, color: 'from-orange-500 to-orange-600', change: lowStockProductsData.length > 10 ? 'تنبيه!' : 'طبيعي', changeType: lowStockProductsData.length > 10 ? 'down' : 'up' },
  ];

  const handleEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setNewProduct({
      name: product.name,
      categoryId: product.categoryId.toString(),
      brandId: product.brandId?.toString() || '',
      price: product.price,
      originalPrice: product.originalPrice || '',
      image: product.image,
      minOrder: product.minOrder.toString(),
      unit: product.unit,
      stock: product.stock.toString(),
    });
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
          originalPrice: newProduct.originalPrice || null,
          image: newProduct.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
          minOrder: parseInt(newProduct.minOrder),
          unit: newProduct.unit,
          stock: parseInt(newProduct.stock),
          inventory: productInventory.filter(inv => inv.stock > 0),
        }),
      });

      if (response.ok) {
        toast({ title: isEditing ? 'تم تحديث المنتج بنجاح' : 'تم إضافة المنتج بنجاح', className: 'bg-green-600 text-white' });
        setIsAddProductOpen(false);
        setEditingProductId(null);
        setNewProduct({ name: '', categoryId: '', brandId: '', price: '', originalPrice: '', image: '', minOrder: '1', unit: 'كرتون', stock: '100' });
        setProductInventory([]);
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
      await fetch(`/api/cities/${id}`, { method: 'DELETE' });
      toast({ title: 'تم حذف المدينة', className: 'bg-green-600 text-white' });
      refetchCities();
      refetchWarehouses();
    } catch (error) {
      toast({ title: 'حدث خطأ', variant: 'destructive' });
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
    if (!confirm('هل أنت متأكد من حذف هذا المستودع؟')) return;
    try {
      await fetch(`/api/warehouses/${id}`, { method: 'DELETE' });
      toast({ title: 'تم حذف المستودع', className: 'bg-green-600 text-white' });
      refetchWarehouses();
    } catch (error) {
      toast({ title: 'حدث خطأ', variant: 'destructive' });
    }
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
                        <p className="text-xl font-bold">{segment.avgOrder} ل.س</p>
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
                        <td className="py-4 font-bold text-green-600">{supplier.balance.toLocaleString()} ل.س</td>
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
                          <p className="text-sm text-gray-600 mt-1">{coupon.type === 'percentage' ? `خصم ${coupon.value}%` : `خصم ${coupon.value} ل.س`} • الحد الأدنى {coupon.minOrder} ل.س</p>
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
                  <Button variant="outline" className="rounded-xl gap-2">
                    <FileDown className="w-4 h-4" />تصدير التقرير
                  </Button>
                  <Button variant="outline" className="rounded-xl gap-2">
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
                                <p className="text-xs text-gray-500">{warehouse.code} • {city?.name || 'غير محدد'}</p>
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
                              <p className="text-xs text-gray-500">السعة</p>
                              <p className="font-bold">{warehouse.capacity.toLocaleString('ar-SY')}</p>
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
                    id="import-file"
                    accept=".csv"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      const text = await file.text();
                      const lines = text.split('\n').filter(l => l.trim());
                      if (lines.length < 2) {
                        toast({ title: 'الملف فارغ أو غير صالح', variant: 'destructive' });
                        return;
                      }
                      
                      // Parse CSV (skip header)
                      const importProducts = lines.slice(1).map(line => {
                        const cols = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map(c => c.replace(/^"|"$/g, '').replace(/""/g, '"')) || [];
                        return {
                          name: cols[1] || '',
                          categoryId: categories.find(c => c.name === cols[2])?.id?.toString() || '1',
                          brandId: brands.find(b => b.name === cols[3])?.id?.toString() || '',
                          price: cols[4] || '0',
                          originalPrice: cols[5] || '',
                          minOrder: cols[6] || '1',
                          unit: cols[7] || 'كرتون',
                          stock: cols[8] || '0',
                          image: cols[9] || '',
                        };
                      }).filter(p => p.name);
                      
                      try {
                        const res = await fetch('/api/products/import/csv', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ products: importProducts }),
                        });
                        const data = await res.json();
                        toast({ title: data.message, className: 'bg-green-600 text-white' });
                        refetchProducts();
                      } catch (error) {
                        toast({ title: 'خطأ في الاستيراد', variant: 'destructive' });
                      }
                      e.target.value = '';
                    }}
                  />
                  <Button variant="outline" className="rounded-xl gap-2" onClick={() => document.getElementById('import-file')?.click()}>
                    <Upload className="w-4 h-4" />استيراد
                  </Button>
                  <Button variant="outline" className="rounded-xl gap-2" onClick={async () => {
                    try {
                      const res = await fetch('/api/products/export/csv');
                      const blob = await res.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      window.URL.revokeObjectURL(url);
                      toast({ title: 'تم تصدير المنتجات بنجاح', className: 'bg-green-600 text-white' });
                    } catch (error) {
                      toast({ title: 'خطأ في التصدير', variant: 'destructive' });
                    }
                  }}>
                    <Download className="w-4 h-4" />تصدير CSV
                  </Button>
                  <Button variant="outline" className="rounded-xl gap-2" onClick={() => window.print()}>
                    <Printer className="w-4 h-4" />طباعة
                  </Button>
                  <Dialog open={isAddProductOpen} onOpenChange={(open) => {
                    setIsAddProductOpen(open);
                    if (!open) {
                      setEditingProductId(null);
                      setNewProduct({ name: '', categoryId: '', brandId: '', price: '', originalPrice: '', image: '', minOrder: '1', unit: 'كرتون', stock: '100' });
                    }
                  }}>
                  <DialogTrigger asChild>
                    <Button className="rounded-xl gap-2" data-testid="button-add-product"><Plus className="w-4 h-4" />إضافة</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
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
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>السعر *</Label>
                          <Input type="number" placeholder="0.00" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} data-testid="input-price" />
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
                        <Label>رابط الصورة</Label>
                        <Input placeholder="https://..." value={newProduct.image} onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })} data-testid="input-image" />
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
                        return matchesStatus && matchesSearch && matchesDate;
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
                      <p className="text-2xl font-bold text-blue-700">{adminUsers.length}</p>
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
                      <p className="text-2xl font-bold text-green-700">
                        {adminUsers.filter((u: any) => {
                          const created = new Date(u.createdAt);
                          const now = new Date();
                          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                        }).length}
                      </p>
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
                      <p className="text-2xl font-bold text-purple-700">
                        {Math.floor(adminUsers.length * 0.15)}
                      </p>
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
                      <p className="text-2xl font-bold text-orange-700">
                        {Math.floor(adminUsers.length * 0.65)}
                      </p>
                      <p className="text-xs text-orange-600">نشط</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border-none shadow-lg rounded-2xl bg-gradient-to-br from-red-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                      <UserX className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-700">
                        {Math.floor(adminUsers.length * 0.08)}
                      </p>
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
                        {(adminUsers.length * 125000).toLocaleString('ar-SY')}
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
                      <AreaChart data={salesData}>
                        <defs>
                          <linearGradient id="customerGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} />
                        <YAxis stroke="#9ca3af" fontSize={10} />
                        <Tooltip />
                        <Area type="monotone" dataKey="customers" stroke="#8b5cf6" fill="url(#customerGradient)" strokeWidth={2} />
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
                            { name: 'VIP', value: Math.floor(adminUsers.length * 0.15), fill: '#8b5cf6' },
                            { name: 'مميز', value: Math.floor(adminUsers.length * 0.25), fill: '#3b82f6' },
                            { name: 'عادي', value: Math.floor(adminUsers.length * 0.45), fill: '#22c55e' },
                            { name: 'جديد', value: Math.floor(adminUsers.length * 0.15), fill: '#f59e0b' },
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
                    <Button className="w-full rounded-xl justify-start gap-3 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200" variant="outline">
                      <UserPlus className="w-5 h-5" />
                      إضافة عميل جديد
                    </Button>
                    <Button className="w-full rounded-xl justify-start gap-3 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200" variant="outline">
                      <Mail className="w-5 h-5" />
                      إرسال حملة تسويقية
                    </Button>
                    <Button className="w-full rounded-xl justify-start gap-3 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200" variant="outline">
                      <Download className="w-5 h-5" />
                      تصدير قائمة العملاء
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
                    <Badge className="bg-green-100 text-green-700">+5.2%</Badge>
                  </div>
                  <p className="text-3xl font-bold mb-2">78%</p>
                  <Progress value={78} className="h-2" />
                </Card>
                <Card className="p-5 border-none shadow-lg rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">معدل إعادة الطلب</span>
                    <Badge className="bg-blue-100 text-blue-700">+3.8%</Badge>
                  </div>
                  <p className="text-3xl font-bold mb-2">65%</p>
                  <Progress value={65} className="h-2" />
                </Card>
                <Card className="p-5 border-none shadow-lg rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">رضا العملاء</span>
                    <Badge className="bg-purple-100 text-purple-700">4.8/5</Badge>
                  </div>
                  <p className="text-3xl font-bold mb-2">92%</p>
                  <Progress value={92} className="h-2" />
                </Card>
                <Card className="p-5 border-none shadow-lg rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">معدل التحويل</span>
                    <Badge className="bg-orange-100 text-orange-700">+2.1%</Badge>
                  </div>
                  <p className="text-3xl font-bold mb-2">34%</p>
                  <Progress value={34} className="h-2" />
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
                      <Input placeholder="بحث بالاسم أو الهاتف..." className="pr-10 rounded-xl w-56" />
                    </div>
                    <Select defaultValue="all">
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
                    <Select defaultValue="all">
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
                    <Button className="rounded-xl gap-2 bg-primary">
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
                        {adminUsers.slice(0, 20).map((user: any, index: number) => {
                          const isVip = index < Math.floor(adminUsers.length * 0.15);
                          const isActive = index < Math.floor(adminUsers.length * 0.65);
                          const orderCount = Math.floor(Math.random() * 50) + 1;
                          const totalSpent = orderCount * (Math.floor(Math.random() * 100000) + 50000);
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
                                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-blue-50 hover:text-blue-600">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-green-50 hover:text-green-600">
                                    <Phone className="w-4 h-4" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-purple-50 hover:text-purple-600">
                                    <Mail className="w-4 h-4" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-orange-50 hover:text-orange-600">
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
                {adminUsers.length > 20 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">عرض 1-20 من {adminUsers.length} عميل</p>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" className="rounded-lg">السابق</Button>
                      <Button variant="outline" size="sm" className="rounded-lg bg-primary text-white">1</Button>
                      <Button variant="outline" size="sm" className="rounded-lg">2</Button>
                      <Button variant="outline" size="sm" className="rounded-lg">3</Button>
                      <Button variant="outline" size="sm" className="rounded-lg">التالي</Button>
                    </div>
                  </div>
                )}
              </Card>

              {/* Top Customers Section */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="p-6 border-none shadow-lg rounded-2xl">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    أفضل العملاء (حسب المشتريات)
                  </h3>
                  <div className="space-y-3">
                    {adminUsers.slice(0, 5).map((user: any, index: number) => {
                      const totalSpent = (5 - index) * 850000 + Math.floor(Math.random() * 100000);
                      return (
                        <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-300'}`}>
                            {index + 1}
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold">
                            {user.facilityName?.charAt(0) || 'ع'}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-sm">{user.facilityName || 'عميل'}</p>
                            <p className="text-xs text-gray-500">{user.phone}</p>
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-primary">{totalSpent.toLocaleString('ar-SY')}</p>
                            <p className="text-xs text-gray-400">ل.س</p>
                          </div>
                        </div>
                      );
                    })}
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
