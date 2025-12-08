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
  Wallet
} from 'lucide-react';
import { Link } from 'wouter';
import { productsAPI, categoriesAPI, brandsAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, LineChart, Line, Legend } from 'recharts';
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
  { name: 'يناير', sales: 4000, orders: 24, customers: 18 },
  { name: 'فبراير', sales: 3000, orders: 18, customers: 15 },
  { name: 'مارس', sales: 5000, orders: 32, customers: 22 },
  { name: 'أبريل', sales: 4500, orders: 28, customers: 20 },
  { name: 'مايو', sales: 6000, orders: 40, customers: 28 },
  { name: 'يونيو', sales: 5500, orders: 35, customers: 25 },
  { name: 'يوليو', sales: 7000, orders: 45, customers: 32 },
];

const weeklyData = [
  { day: 'الأحد', value: 1200 },
  { day: 'الإثنين', value: 1800 },
  { day: 'الثلاثاء', value: 2200 },
  { day: 'الأربعاء', value: 1500 },
  { day: 'الخميس', value: 2800 },
  { day: 'الجمعة', value: 3200 },
  { day: 'السبت', value: 2500 },
];

const categoryPieData = [
  { name: 'مشروبات', value: 35, color: '#8b5cf6' },
  { name: 'منظفات', value: 25, color: '#06b6d4' },
  { name: 'مواد غذائية', value: 20, color: '#10b981' },
  { name: 'ألبان', value: 12, color: '#f59e0b' },
  { name: 'أخرى', value: 8, color: '#ef4444' },
];

const recentActivities = [
  { id: 1, type: 'order', message: 'طلب جديد #1024 من سوبر ماركت النور', time: '5 دقائق', icon: ShoppingCart, color: 'bg-blue-100 text-blue-600' },
  { id: 2, type: 'user', message: 'عميل جديد: بقالة الأمل', time: '15 دقيقة', icon: Users, color: 'bg-green-100 text-green-600' },
  { id: 3, type: 'stock', message: 'تنبيه: مخزون بيبسي منخفض (15 وحدة)', time: '30 دقيقة', icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-600' },
  { id: 4, type: 'order', message: 'تم توصيل الطلب #1020', time: '1 ساعة', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-600' },
  { id: 5, type: 'payment', message: 'استلام دفعة 2,500 ر.س من مركز السعادة', time: '2 ساعة', icon: CreditCard, color: 'bg-purple-100 text-purple-600' },
];

const topCustomers = [
  { id: 1, name: 'سوبر ماركت الفيصل', orders: 45, total: '25,600', growth: 12 },
  { id: 2, name: 'بقالة النور', orders: 38, total: '18,900', growth: 8 },
  { id: 3, name: 'مركز السعادة', orders: 32, total: '15,200', growth: -3 },
  { id: 4, name: 'ميني ماركت الخير', orders: 28, total: '12,800', growth: 15 },
  { id: 5, name: 'سوبرماركت الريان', orders: 25, total: '11,500', growth: 5 },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddOfferOpen, setIsAddOfferOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dateRange, setDateRange] = useState('week');
  const [newProduct, setNewProduct] = useState({
    name: '',
    categoryId: '',
    brandId: '',
    price: '',
    originalPrice: '',
    image: '',
    minOrder: '1',
    unit: 'كرتون',
    stock: '100',
  });
  const [newOffer, setNewOffer] = useState({
    title: '',
    discount: '',
    products: [] as number[],
    startDate: '',
    endDate: '',
    active: true,
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useQuery<Product[]>({
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
  const totalValue = products.reduce((acc, p) => acc + (parseFloat(p.price) * p.stock), 0);
  const lowStockProducts = products.filter(p => p.stock < 30);
  const discountedProducts = products.filter(p => p.originalPrice);

  const filteredProducts = products.filter(p => 
    p.name.includes(searchQuery) || 
    categories.find(c => c.id === p.categoryId)?.name.includes(searchQuery)
  );

  const mockOrders = [
    { id: 1001, customer: 'سوبر ماركت الفيصل', phone: '0501234567', items: 5, total: '1,250.00', status: 'pending', time: '10 دقائق', address: 'الرياض، حي الملقا' },
    { id: 1002, customer: 'بقالة النور', phone: '0559876543', items: 8, total: '890.50', status: 'processing', time: '25 دقيقة', address: 'جدة، حي الصفا' },
    { id: 1003, customer: 'مركز السعادة', phone: '0543216789', items: 12, total: '2,340.00', status: 'shipped', time: '1 ساعة', address: 'الدمام، حي الفيصلية' },
    { id: 1004, customer: 'ميني ماركت الخير', phone: '0567891234', items: 3, total: '450.00', status: 'delivered', time: '3 ساعات', address: 'مكة، حي العزيزية' },
    { id: 1005, customer: 'سوبرماركت الريان', phone: '0512345678', items: 6, total: '1,100.00', status: 'pending', time: '5 دقائق', address: 'الرياض، حي النسيم' },
  ];

  const mockUsers = [
    { id: 1, name: 'سوبر ماركت الفيصل', phone: '0501234567', facility: 'سجل تجاري: 123456', orders: 45, total: '25,600', status: 'active', joined: '2024-01-15' },
    { id: 2, name: 'بقالة النور', phone: '0559876543', facility: 'سجل تجاري: 789012', orders: 38, total: '18,900', status: 'active', joined: '2024-02-20' },
    { id: 3, name: 'مركز السعادة', phone: '0543216789', facility: 'سجل تجاري: 345678', orders: 32, total: '15,200', status: 'inactive', joined: '2024-03-10' },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: any }> = {
      pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      processing: { label: 'قيد التجهيز', color: 'bg-blue-100 text-blue-700', icon: Package },
      shipped: { label: 'قيد التوصيل', color: 'bg-purple-100 text-purple-700', icon: Truck },
      delivered: { label: 'تم التوصيل', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-700', icon: XCircle },
    };
    const s = statusMap[status] || statusMap.pending;
    return (
      <Badge className={`${s.color} gap-1`}>
        <s.icon className="w-3 h-3" />
        {s.label}
      </Badge>
    );
  };

  const stats = [
    { 
      title: 'إجمالي المبيعات', 
      value: '142,580', 
      suffix: 'ر.س',
      icon: DollarSign, 
      color: 'from-emerald-500 to-emerald-600',
      change: '+18%',
      changeType: 'up'
    },
    { 
      title: 'الطلبات الجديدة', 
      value: '156', 
      suffix: 'طلب',
      icon: ShoppingCart, 
      color: 'from-blue-500 to-blue-600',
      change: '+24%',
      changeType: 'up'
    },
    { 
      title: 'العملاء النشطين', 
      value: '89', 
      suffix: 'عميل',
      icon: Users, 
      color: 'from-purple-500 to-purple-600',
      change: '+12%',
      changeType: 'up'
    },
    { 
      title: 'معدل التحويل', 
      value: '68', 
      suffix: '%',
      icon: Target, 
      color: 'from-orange-500 to-orange-600',
      change: '-3%',
      changeType: 'down'
    },
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
        setNewProduct({
          name: '', categoryId: '', brandId: '', price: '', originalPrice: '',
          image: '', minOrder: '1', unit: 'كرتون', stock: '100',
        });
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
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-400/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20"
              >
                <LayoutDashboard className="w-7 h-7" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold">لوحة التحكم</h1>
                <p className="text-purple-200 text-sm">إدارة منصة ساري للجملة</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="text-white hover:bg-white/10 relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold">
                    5
                  </span>
                </Button>
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <h4 className="font-bold text-gray-800">الإشعارات</h4>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {recentActivities.map((activity) => (
                          <div key={activity.id} className="p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-lg ${activity.color} flex items-center justify-center flex-shrink-0`}>
                                <activity.icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-700">{activity.message}</p>
                                <p className="text-xs text-gray-400 mt-1">منذ {activity.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 bg-gray-50 text-center">
                        <Button variant="link" className="text-primary text-sm">عرض جميع الإشعارات</Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                className="text-white hover:bg-white/10"
                onClick={() => refetchProducts()}
              >
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

          {/* Date Filter */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-1 w-fit">
            {['today', 'week', 'month', 'year'].map((range) => (
              <Button
                key={range}
                size="sm"
                variant={dateRange === range ? 'secondary' : 'ghost'}
                className={`rounded-lg text-xs ${dateRange === range ? 'bg-white text-primary' : 'text-white hover:bg-white/10'}`}
                onClick={() => setDateRange(range)}
              >
                {range === 'today' ? 'اليوم' : range === 'week' ? 'هذا الأسبوع' : range === 'month' ? 'هذا الشهر' : 'هذه السنة'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-5 border-none shadow-xl bg-white rounded-2xl hover:shadow-2xl transition-all duration-300 group" data-testid={`stat-card-${index}`}>
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
                      <span className="text-gray-400 font-normal">من الأسبوع الماضي</span>
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
          <TabsList className="bg-white shadow-lg rounded-2xl p-2 mb-6 flex-wrap gap-1 h-auto">
            <TabsTrigger value="dashboard" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2">
              <LayoutDashboard className="w-4 h-4 ml-2" />
              الرئيسية
            </TabsTrigger>
            <TabsTrigger value="products" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2">
              <Package className="w-4 h-4 ml-2" />
              المنتجات
            </TabsTrigger>
            <TabsTrigger value="orders" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2">
              <ClipboardList className="w-4 h-4 ml-2" />
              الطلبات
            </TabsTrigger>
            <TabsTrigger value="customers" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2">
              <Users className="w-4 h-4 ml-2" />
              العملاء
            </TabsTrigger>
            <TabsTrigger value="offers" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2">
              <Percent className="w-4 h-4 ml-2" />
              العروض
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2">
              <BarChart3 className="w-4 h-4 ml-2" />
              التحليلات
            </TabsTrigger>
            <TabsTrigger value="reports" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2">
              <FileText className="w-4 h-4 ml-2" />
              التقارير
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2">
              <Settings className="w-4 h-4 ml-2" />
              الإعدادات
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Sales Chart */}
              <Card className="lg:col-span-2 p-6 border-none shadow-lg rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    إحصائيات المبيعات
                  </h3>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="gap-1">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      المبيعات
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      الطلبات
                    </Badge>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'white', 
                          border: 'none', 
                          borderRadius: '12px', 
                          boxShadow: '0 10px 40px rgba(0,0,0,0.1)' 
                        }} 
                      />
                      <Area type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                      <Area type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorOrders)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  النشاط الأخير
                </h3>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <motion.div 
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className={`w-10 h-10 rounded-xl ${activity.color} flex items-center justify-center flex-shrink-0`}>
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

              {/* Category Distribution */}
              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-purple-500" />
                  توزيع المبيعات بالأقسام
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={categoryPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {categoryPieData.map((cat) => (
                    <div key={cat.name} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                      <span className="text-gray-600">{cat.name}</span>
                      <span className="text-gray-400 font-bold mr-auto">{cat.value}%</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Weekly Performance */}
              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  أداء الأسبوع
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} />
                      <YAxis stroke="#9ca3af" fontSize={11} />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'white', 
                          border: 'none', 
                          borderRadius: '12px', 
                          boxShadow: '0 10px 40px rgba(0,0,0,0.1)' 
                        }} 
                      />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Top Customers */}
              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    أفضل العملاء
                  </h3>
                  <Button variant="link" className="text-primary text-xs" onClick={() => setActiveTab('customers')}>
                    عرض الكل
                  </Button>
                </div>
                <div className="space-y-3">
                  {topCustomers.slice(0, 4).map((customer, i) => (
                    <div key={customer.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0 ? 'bg-yellow-400 text-white' : 
                        i === 1 ? 'bg-gray-300 text-white' : 
                        i === 2 ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.orders} طلب</p>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm">{customer.total} ر.س</p>
                        <span className={`text-xs ${customer.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {customer.growth >= 0 ? '+' : ''}{customer.growth}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card className="p-6 border-none shadow-lg rounded-2xl">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                  <h3 className="font-bold text-xl">إدارة المنتجات</h3>
                  <p className="text-gray-500 text-sm mt-1">{products.length} منتج في المتجر</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      className="pr-10 w-64 bg-gray-50 border-none rounded-xl" 
                      placeholder="بحث عن منتج..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      data-testid="input-search-products"
                    />
                  </div>
                  <Button variant="outline" className="rounded-xl gap-2">
                    <Filter className="w-4 h-4" />
                    تصفية
                  </Button>
                  <Button variant="outline" className="rounded-xl gap-2">
                    <Download className="w-4 h-4" />
                    تصدير
                  </Button>
                  <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                    <DialogTrigger asChild>
                      <Button className="rounded-xl gap-2" data-testid="button-add-product">
                        <Plus className="w-4 h-4" />
                        إضافة منتج
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>إضافة منتج جديد</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>اسم المنتج</Label>
                            <Input 
                              className="rounded-xl mt-1"
                              value={newProduct.name}
                              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                              placeholder="مثال: حليب المراعي"
                            />
                          </div>
                          <div>
                            <Label>القسم</Label>
                            <Select value={newProduct.categoryId} onValueChange={(v) => setNewProduct({...newProduct, categoryId: v})}>
                              <SelectTrigger className="rounded-xl mt-1">
                                <SelectValue placeholder="اختر القسم" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map(cat => (
                                  <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>السعر (ر.س)</Label>
                            <Input 
                              className="rounded-xl mt-1"
                              type="number"
                              value={newProduct.price}
                              onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                              placeholder="99.99"
                            />
                          </div>
                          <div>
                            <Label>السعر قبل الخصم (اختياري)</Label>
                            <Input 
                              className="rounded-xl mt-1"
                              type="number"
                              value={newProduct.originalPrice}
                              onChange={(e) => setNewProduct({...newProduct, originalPrice: e.target.value})}
                              placeholder="120.00"
                            />
                          </div>
                          <div>
                            <Label>الحد الأدنى للطلب</Label>
                            <Input 
                              className="rounded-xl mt-1"
                              type="number"
                              value={newProduct.minOrder}
                              onChange={(e) => setNewProduct({...newProduct, minOrder: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>الوحدة</Label>
                            <Select value={newProduct.unit} onValueChange={(v) => setNewProduct({...newProduct, unit: v})}>
                              <SelectTrigger className="rounded-xl mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="كرتون">كرتون</SelectItem>
                                <SelectItem value="حبة">حبة</SelectItem>
                                <SelectItem value="كيس">كيس</SelectItem>
                                <SelectItem value="علبة">علبة</SelectItem>
                                <SelectItem value="باكت">باكت</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>المخزون</Label>
                            <Input 
                              className="rounded-xl mt-1"
                              type="number"
                              value={newProduct.stock}
                              onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>العلامة التجارية</Label>
                            <Select value={newProduct.brandId} onValueChange={(v) => setNewProduct({...newProduct, brandId: v})}>
                              <SelectTrigger className="rounded-xl mt-1">
                                <SelectValue placeholder="اختياري" />
                              </SelectTrigger>
                              <SelectContent>
                                {brands.map(brand => (
                                  <SelectItem key={brand.id} value={brand.id.toString()}>{brand.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>رابط الصورة</Label>
                          <Input 
                            className="rounded-xl mt-1"
                            value={newProduct.image}
                            onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                            placeholder="https://..."
                          />
                        </div>
                        <Button 
                          className="w-full rounded-xl h-12 text-lg" 
                          onClick={handleAddProduct}
                          disabled={!newProduct.name || !newProduct.categoryId || !newProduct.price}
                        >
                          إضافة المنتج
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {productsLoading ? (
                <div className="space-y-3">
                  {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-right border-b border-gray-100">
                        <th className="pb-4 font-bold text-gray-600">المنتج</th>
                        <th className="pb-4 font-bold text-gray-600">القسم</th>
                        <th className="pb-4 font-bold text-gray-600">السعر</th>
                        <th className="pb-4 font-bold text-gray-600">المخزون</th>
                        <th className="pb-4 font-bold text-gray-600">الحالة</th>
                        <th className="pb-4 font-bold text-gray-600">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => {
                        const category = categories.find((c) => c.id === product.categoryId);
                        return (
                          <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors" data-testid={`row-product-${product.id}`}>
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100">
                                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <p className="font-bold">{product.name}</p>
                                  <p className="text-xs text-gray-500">الحد الأدنى: {product.minOrder} {product.unit}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4">
                              <Badge variant="outline" className="rounded-lg">
                                {category?.name || 'غير مصنف'}
                              </Badge>
                            </td>
                            <td className="py-4">
                              <div>
                                <span className="font-bold">{product.price} ر.س</span>
                                {product.originalPrice && (
                                  <div>
                                    <span className="text-xs text-gray-400 line-through">{product.originalPrice} ر.س</span>
                                    <Badge className="bg-red-100 text-red-600 text-[10px] mr-2">خصم</Badge>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16">
                                  <Progress value={Math.min(product.stock, 100)} className="h-2" />
                                </div>
                                <span className={`text-sm font-bold ${
                                  product.stock > 50 ? 'text-green-600' : 
                                  product.stock > 20 ? 'text-yellow-600' : 
                                  'text-red-600'
                                }`}>
                                  {product.stock}
                                </span>
                              </div>
                            </td>
                            <td className="py-4">
                              <Badge className={product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                {product.stock > 0 ? 'متوفر' : 'نفذ'}
                              </Badge>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center gap-1">
                                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg hover:bg-blue-50 hover:text-blue-600">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg hover:bg-green-50 hover:text-green-600">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg hover:bg-red-50 hover:text-red-600">
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
              )}
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="p-6 border-none shadow-lg rounded-2xl">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                  <h3 className="font-bold text-xl">إدارة الطلبات</h3>
                  <p className="text-gray-500 text-sm mt-1">{mockOrders.length} طلب نشط</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="outline" className="rounded-xl text-sm">الكل ({mockOrders.length})</Button>
                  <Button variant="outline" className="rounded-xl text-sm bg-yellow-50 border-yellow-200 text-yellow-700">
                    <Clock className="w-4 h-4 ml-1" />
                    قيد الانتظار (2)
                  </Button>
                  <Button variant="outline" className="rounded-xl text-sm bg-blue-50 border-blue-200 text-blue-700">
                    <Package className="w-4 h-4 ml-1" />
                    قيد التجهيز (1)
                  </Button>
                  <Button variant="outline" className="rounded-xl text-sm bg-purple-50 border-purple-200 text-purple-700">
                    <Truck className="w-4 h-4 ml-1" />
                    قيد التوصيل (1)
                  </Button>
                  <Button variant="outline" className="rounded-xl text-sm bg-green-50 border-green-200 text-green-700">
                    <CheckCircle className="w-4 h-4 ml-1" />
                    مكتملة (1)
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {mockOrders.map((order) => (
                  <motion.div 
                    key={order.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors border border-gray-100"
                    data-testid={`order-row-${order.id}`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                          <Package className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-lg">طلب #{order.id}</p>
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{order.customer}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {order.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {order.address}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-xl">{order.total} ر.س</p>
                        <p className="text-xs text-gray-500">{order.items} منتجات • منذ {order.time}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Select defaultValue={order.status}>
                          <SelectTrigger className="w-36 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">قيد الانتظار</SelectItem>
                            <SelectItem value="processing">قيد التجهيز</SelectItem>
                            <SelectItem value="shipped">قيد التوصيل</SelectItem>
                            <SelectItem value="delivered">تم التوصيل</SelectItem>
                            <SelectItem value="cancelled">ملغي</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" className="rounded-xl">
                          <Eye className="w-4 h-4 ml-2" />
                          التفاصيل
                        </Button>
                        <Button size="icon" variant="ghost" className="rounded-xl">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <Card className="p-6 border-none shadow-lg rounded-2xl">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                  <h3 className="font-bold text-xl">إدارة العملاء</h3>
                  <p className="text-gray-500 text-sm mt-1">{mockUsers.length} عميل مسجل</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input className="pr-10 w-64 bg-gray-50 border-none rounded-xl" placeholder="بحث عن عميل..." />
                  </div>
                  <Button variant="outline" className="rounded-xl gap-2">
                    <Download className="w-4 h-4" />
                    تصدير
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-right border-b border-gray-100">
                      <th className="pb-4 font-bold text-gray-600">العميل</th>
                      <th className="pb-4 font-bold text-gray-600">معلومات الاتصال</th>
                      <th className="pb-4 font-bold text-gray-600">المنشأة</th>
                      <th className="pb-4 font-bold text-gray-600">الطلبات</th>
                      <th className="pb-4 font-bold text-gray-600">إجمالي المشتريات</th>
                      <th className="pb-4 font-bold text-gray-600">الحالة</th>
                      <th className="pb-4 font-bold text-gray-600">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold">{user.name}</p>
                              <p className="text-xs text-gray-500">منذ {user.joined}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            {user.phone}
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Building className="w-4 h-4" />
                            {user.facility}
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="font-bold">{user.orders}</span>
                        </td>
                        <td className="py-4">
                          <span className="font-bold">{user.total} ر.س</span>
                        </td>
                        <td className="py-4">
                          <Badge className={user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                            {user.status === 'active' ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg hover:bg-blue-50 hover:text-blue-600">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg hover:bg-green-50 hover:text-green-600">
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg hover:bg-gray-50">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Offers Tab */}
          <TabsContent value="offers">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 p-6 border-none shadow-lg rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-xl">العروض والخصومات</h3>
                    <p className="text-gray-500 text-sm mt-1">إدارة العروض الترويجية</p>
                  </div>
                  <Button className="rounded-xl gap-2">
                    <Plus className="w-4 h-4" />
                    إنشاء عرض
                  </Button>
                </div>

                <div className="space-y-4">
                  {[
                    { id: 1, title: 'عرض رمضان', discount: '15%', products: 12, status: 'active', startDate: '2024-03-10', endDate: '2024-04-10' },
                    { id: 2, title: 'تخفيضات الصيف', discount: '20%', products: 25, status: 'scheduled', startDate: '2024-06-01', endDate: '2024-08-31' },
                    { id: 3, title: 'عرض نهاية الأسبوع', discount: '10%', products: 8, status: 'expired', startDate: '2024-01-01', endDate: '2024-01-07' },
                  ].map((offer) => (
                    <div key={offer.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary/20 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold ${
                            offer.status === 'active' ? 'bg-green-100 text-green-600' : 
                            offer.status === 'scheduled' ? 'bg-blue-100 text-blue-600' : 
                            'bg-gray-100 text-gray-500'
                          }`}>
                            <Percent className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg">{offer.title}</h4>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                              <span>{offer.discount} خصم</span>
                              <span>{offer.products} منتج</span>
                              <span>{offer.startDate} - {offer.endDate}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={
                            offer.status === 'active' ? 'bg-green-100 text-green-700' : 
                            offer.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 
                            'bg-gray-100 text-gray-700'
                          }>
                            {offer.status === 'active' ? 'نشط' : offer.status === 'scheduled' ? 'مجدول' : 'منتهي'}
                          </Badge>
                          <Switch checked={offer.status === 'active'} />
                          <Button size="icon" variant="ghost" className="rounded-lg">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-orange-500" />
                  أداء العروض
                </h3>
                <div className="space-y-4">
                  <div className="bg-gradient-to-l from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                    <p className="text-sm text-gray-600">إجمالي المبيعات من العروض</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">42,580 ر.س</p>
                    <p className="text-xs text-green-500 mt-2">+28% من الشهر الماضي</p>
                  </div>
                  <div className="bg-gradient-to-l from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-sm text-gray-600">الطلبات باستخدام العروض</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">156</p>
                    <p className="text-xs text-blue-500 mt-2">32% من إجمالي الطلبات</p>
                  </div>
                  <div className="bg-gradient-to-l from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
                    <p className="text-sm text-gray-600">متوسط قيمة الخصم</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">45 ر.س</p>
                    <p className="text-xs text-purple-500 mt-2">لكل طلب</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-primary" />
                  نمو العملاء
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="customers" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} name="العملاء الجدد" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-500" />
                  مؤشرات الأداء الرئيسية
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-4">
                    <p className="text-sm text-blue-600">معدل إعادة الطلب</p>
                    <p className="text-3xl font-bold text-blue-700 mt-2">72%</p>
                    <div className="mt-3">
                      <Progress value={72} className="h-2" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-4">
                    <p className="text-sm text-green-600">رضا العملاء</p>
                    <p className="text-3xl font-bold text-green-700 mt-2">4.8</p>
                    <div className="flex items-center gap-1 mt-3">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`w-4 h-4 ${i <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-4">
                    <p className="text-sm text-purple-600">متوسط وقت التوصيل</p>
                    <p className="text-3xl font-bold text-purple-700 mt-2">2.4</p>
                    <p className="text-xs text-purple-500 mt-1">ساعة</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-4">
                    <p className="text-sm text-orange-600">معدل الإلغاء</p>
                    <p className="text-3xl font-bold text-orange-700 mt-2">3.2%</p>
                    <div className="mt-3">
                      <Progress value={3.2} className="h-2" />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="lg:col-span-2 p-6 border-none shadow-lg rounded-2xl">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  التوزيع الجغرافي للعملاء
                </h3>
                <div className="grid md:grid-cols-4 gap-4">
                  {[
                    { city: 'الرياض', customers: 45, orders: 180, revenue: '58,000', color: 'from-blue-500 to-blue-600' },
                    { city: 'جدة', customers: 32, orders: 120, revenue: '38,500', color: 'from-green-500 to-green-600' },
                    { city: 'الدمام', customers: 18, orders: 72, revenue: '22,000', color: 'from-purple-500 to-purple-600' },
                    { city: 'مكة', customers: 12, orders: 48, revenue: '15,500', color: 'from-orange-500 to-orange-600' },
                  ].map((region) => (
                    <div key={region.city} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${region.color} flex items-center justify-center text-white font-bold mb-3`}>
                        <MapPin className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-lg">{region.city}</h4>
                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">العملاء</span>
                          <span className="font-bold">{region.customers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">الطلبات</span>
                          <span className="font-bold">{region.orders}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">الإيرادات</span>
                          <span className="font-bold text-green-600">{region.revenue} ر.س</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 p-6 border-none shadow-lg rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-xl">التقارير المتاحة</h3>
                  <Button variant="outline" className="rounded-xl gap-2">
                    <Calendar className="w-4 h-4" />
                    تحديد الفترة
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { title: 'تقرير المبيعات', desc: 'تفاصيل المبيعات والإيرادات', icon: DollarSign, color: 'bg-green-100 text-green-600' },
                    { title: 'تقرير المخزون', desc: 'حالة المخزون والتنبيهات', icon: Box, color: 'bg-blue-100 text-blue-600' },
                    { title: 'تقرير العملاء', desc: 'تحليل سلوك العملاء', icon: Users, color: 'bg-purple-100 text-purple-600' },
                    { title: 'تقرير الطلبات', desc: 'تفاصيل وحالات الطلبات', icon: ClipboardList, color: 'bg-orange-100 text-orange-600' },
                    { title: 'تقرير المنتجات', desc: 'أداء المنتجات الأكثر مبيعاً', icon: Package, color: 'bg-pink-100 text-pink-600' },
                    { title: 'تقرير مالي', desc: 'ملخص الأرباح والمصروفات', icon: Wallet, color: 'bg-emerald-100 text-emerald-600' },
                  ].map((report, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all cursor-pointer group">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl ${report.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <report.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold">{report.title}</h4>
                          <p className="text-sm text-gray-500 mt-1">{report.desc}</p>
                        </div>
                        <Button size="icon" variant="ghost" className="rounded-lg">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  تقارير سريعة
                </h3>
                <div className="space-y-3">
                  {[
                    { title: 'ملخص اليوم', period: 'آخر 24 ساعة' },
                    { title: 'تقرير أسبوعي', period: 'آخر 7 أيام' },
                    { title: 'ملخص شهري', period: 'آخر 30 يوم' },
                    { title: 'تقرير ربع سنوي', period: 'آخر 3 أشهر' },
                  ].map((quick, i) => (
                    <Button key={i} variant="outline" className="w-full justify-between rounded-xl h-auto py-3">
                      <div className="text-right">
                        <p className="font-bold">{quick.title}</p>
                        <p className="text-xs text-gray-500">{quick.period}</p>
                      </div>
                      <Download className="w-4 h-4" />
                    </Button>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 p-6 border-none shadow-lg rounded-2xl">
                <h3 className="font-bold text-xl mb-6">إعدادات المتجر</h3>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block">اسم المتجر</Label>
                      <Input className="rounded-xl bg-gray-50 border-gray-200" defaultValue="ساري" />
                    </div>
                    <div>
                      <Label className="mb-2 block">البريد الإلكتروني</Label>
                      <Input className="rounded-xl bg-gray-50 border-gray-200" defaultValue="admin@sary.sa" />
                    </div>
                    <div>
                      <Label className="mb-2 block">رقم الجوال</Label>
                      <Input className="rounded-xl bg-gray-50 border-gray-200" defaultValue="+966500000000" />
                    </div>
                    <div>
                      <Label className="mb-2 block">نسبة الضريبة (%)</Label>
                      <Input className="rounded-xl bg-gray-50 border-gray-200" defaultValue="15" type="number" />
                    </div>
                    <div>
                      <Label className="mb-2 block">الحد الأدنى للطلب (ر.س)</Label>
                      <Input className="rounded-xl bg-gray-50 border-gray-200" defaultValue="200" type="number" />
                    </div>
                    <div>
                      <Label className="mb-2 block">رسوم التوصيل (ر.س)</Label>
                      <Input className="rounded-xl bg-gray-50 border-gray-200" defaultValue="0" type="number" />
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">وصف المتجر</Label>
                    <Textarea className="rounded-xl bg-gray-50 border-gray-200 min-h-24" defaultValue="منصة ساري للتجارة الإلكترونية بالجملة - أسعار الجملة لجميع منتجات السوبر ماركت" />
                  </div>
                  <Button className="rounded-xl">
                    حفظ التغييرات
                  </Button>
                </div>
              </Card>

              <div className="space-y-6">
                <Card className="p-6 border-none shadow-lg rounded-2xl">
                  <h3 className="font-bold text-lg mb-4">الإشعارات</h3>
                  <div className="space-y-4">
                    {[
                      { title: 'إشعارات الطلبات الجديدة', enabled: true },
                      { title: 'تنبيهات المخزون المنخفض', enabled: true },
                      { title: 'تقارير يومية', enabled: false },
                      { title: 'رسائل العملاء', enabled: true },
                    ].map((notif, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm">{notif.title}</span>
                        <Switch defaultChecked={notif.enabled} />
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6 border-none shadow-lg rounded-2xl">
                  <h3 className="font-bold text-lg mb-4">مناطق التوصيل</h3>
                  <div className="space-y-3">
                    {['الرياض', 'جدة', 'الدمام', 'مكة', 'المدينة'].map((city, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="font-medium">{city}</span>
                        <Switch defaultChecked />
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4 rounded-xl">
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة منطقة
                  </Button>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
