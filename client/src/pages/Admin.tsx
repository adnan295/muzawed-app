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
  RefreshCw
} from 'lucide-react';
import { Link } from 'wouter';
import { productsAPI, categoriesAPI, brandsAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

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

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
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

  // Calculate stats
  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const totalValue = products.reduce((acc, p) => acc + (parseFloat(p.price) * p.stock), 0);
  const lowStockProducts = products.filter(p => p.stock < 30);
  const discountedProducts = products.filter(p => p.originalPrice);

  // Filter products by search
  const filteredProducts = products.filter(p => 
    p.name.includes(searchQuery) || 
    categories.find(c => c.id === p.categoryId)?.name.includes(searchQuery)
  );

  // Mock orders data (would come from API in real app)
  const mockOrders = [
    { id: 1001, customer: 'سوبر ماركت الفيصل', items: 5, total: '1,250.00', status: 'pending', time: '10 دقائق' },
    { id: 1002, customer: 'بقالة النور', items: 8, total: '890.50', status: 'processing', time: '25 دقيقة' },
    { id: 1003, customer: 'مركز السعادة', items: 12, total: '2,340.00', status: 'shipped', time: '1 ساعة' },
    { id: 1004, customer: 'ميني ماركت الخير', items: 3, total: '450.00', status: 'delivered', time: '3 ساعات' },
    { id: 1005, customer: 'سوبرماركت الريان', items: 6, total: '1,100.00', status: 'pending', time: '5 دقائق' },
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
      title: 'إجمالي المنتجات', 
      value: totalProducts, 
      icon: Package, 
      color: 'from-blue-500 to-blue-600',
      subtext: `${lowStockProducts.length} منتج قليل المخزون`
    },
    { 
      title: 'إجمالي المخزون', 
      value: totalStock.toLocaleString('ar-SA'), 
      icon: Box, 
      color: 'from-green-500 to-green-600',
      subtext: 'وحدة متوفرة'
    },
    { 
      title: 'قيمة المخزون', 
      value: `${(totalValue / 1000).toFixed(1)}K`, 
      icon: DollarSign, 
      color: 'from-purple-500 to-purple-600',
      subtext: 'ريال سعودي'
    },
    { 
      title: 'العروض النشطة', 
      value: discountedProducts.length, 
      icon: TrendingUp, 
      color: 'from-orange-500 to-orange-600',
      subtext: 'منتج بخصم'
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
        toast({ title: 'تم إضافة المنتج بنجاح' });
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
      <div className="bg-gradient-to-l from-primary to-purple-700 text-white p-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">لوحة التحكم</h1>
                <p className="text-purple-200 text-sm">إدارة منصة ساري</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                size="icon" 
                variant="ghost" 
                className="text-white hover:bg-white/10"
                onClick={() => refetchProducts()}
              >
                <RefreshCw className="w-5 h-5" />
              </Button>
              <Link href="/">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  <ArrowRight className="w-5 h-5 ml-2" />
                  العودة للمتجر
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-6xl mx-auto px-4 -mt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="p-4 border-none shadow-lg bg-white rounded-2xl hover:shadow-xl transition-shadow" data-testid={`stat-card-${index}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-xs mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <span className="text-gray-400 text-[10px]">{stat.subtext}</span>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white shadow-sm rounded-xl p-1 mb-6 flex-wrap">
            <TabsTrigger value="dashboard" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
              <LayoutDashboard className="w-4 h-4 ml-2" />
              الرئيسية
            </TabsTrigger>
            <TabsTrigger value="products" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
              <Package className="w-4 h-4 ml-2" />
              المنتجات
            </TabsTrigger>
            <TabsTrigger value="orders" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
              <ClipboardList className="w-4 h-4 ml-2" />
              الطلبات
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 ml-2" />
              التحليلات
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
              <Settings className="w-4 h-4 ml-2" />
              الإعدادات
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                    آخر الطلبات
                  </h3>
                  <Button variant="link" className="text-primary text-xs" onClick={() => setActiveTab('orders')}>
                    عرض الكل
                  </Button>
                </div>
                <div className="space-y-3">
                  {mockOrders.slice(0, 4).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">طلب #{order.id}</p>
                          <p className="text-xs text-gray-500">{order.customer}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        {getStatusBadge(order.status)}
                        <p className="text-xs text-gray-400 mt-1">{order.total} ر.س</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Low Stock Alert */}
              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-red-500" />
                  تنبيه المخزون المنخفض
                </h3>
                {lowStockProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
                    <p>جميع المنتجات متوفرة بكميات كافية</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lowStockProducts.slice(0, 5).map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                        <div className="flex items-center gap-3">
                          <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                            <p className="font-bold text-sm">{product.name}</p>
                            <p className="text-xs text-gray-500">{categories.find(c => c.id === product.categoryId)?.name}</p>
                          </div>
                        </div>
                        <Badge className="bg-red-100 text-red-700">
                          {product.stock} متبقي
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Categories Overview */}
              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-green-500" />
                  توزيع المنتجات حسب الأقسام
                </h3>
                <div className="space-y-3">
                  {categories.map((cat) => {
                    const count = products.filter(p => p.categoryId === cat.id).length;
                    const percentage = totalProducts > 0 ? (count / totalProducts * 100).toFixed(0) : 0;
                    return (
                      <div key={cat.id} className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-lg`}>
                          {cat.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-bold">{cat.name}</span>
                            <span className="text-gray-500">{count} منتج</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-l ${cat.color} rounded-full`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Top Products */}
              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  أفضل المنتجات
                </h3>
                <div className="space-y-3">
                  {products.slice(0, 5).map((product, i) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          i === 0 ? 'bg-yellow-400 text-white' : 
                          i === 1 ? 'bg-gray-300 text-white' : 
                          i === 2 ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {i + 1}
                        </span>
                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="font-bold text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.price} ر.س</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {100 - i * 15} مبيع
                      </span>
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
                <h3 className="font-bold text-lg">إدارة المنتجات ({products.length})</h3>
                <div className="flex items-center gap-3">
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
                  <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                    <DialogTrigger asChild>
                      <Button className="rounded-xl" data-testid="button-add-product">
                        <Plus className="w-4 h-4 ml-2" />
                        إضافة منتج
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>إضافة منتج جديد</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>اسم المنتج</Label>
                            <Input 
                              value={newProduct.name}
                              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                              placeholder="مثال: حليب المراعي"
                            />
                          </div>
                          <div>
                            <Label>القسم</Label>
                            <Select value={newProduct.categoryId} onValueChange={(v) => setNewProduct({...newProduct, categoryId: v})}>
                              <SelectTrigger>
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
                              type="number"
                              value={newProduct.price}
                              onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                              placeholder="99.99"
                            />
                          </div>
                          <div>
                            <Label>السعر قبل الخصم (اختياري)</Label>
                            <Input 
                              type="number"
                              value={newProduct.originalPrice}
                              onChange={(e) => setNewProduct({...newProduct, originalPrice: e.target.value})}
                              placeholder="120.00"
                            />
                          </div>
                          <div>
                            <Label>الحد الأدنى للطلب</Label>
                            <Input 
                              type="number"
                              value={newProduct.minOrder}
                              onChange={(e) => setNewProduct({...newProduct, minOrder: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>الوحدة</Label>
                            <Select value={newProduct.unit} onValueChange={(v) => setNewProduct({...newProduct, unit: v})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="كرتون">كرتون</SelectItem>
                                <SelectItem value="حبة">حبة</SelectItem>
                                <SelectItem value="كيس">كيس</SelectItem>
                                <SelectItem value="علبة">علبة</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>المخزون</Label>
                            <Input 
                              type="number"
                              value={newProduct.stock}
                              onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>العلامة التجارية</Label>
                            <Select value={newProduct.brandId} onValueChange={(v) => setNewProduct({...newProduct, brandId: v})}>
                              <SelectTrigger>
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
                            value={newProduct.image}
                            onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                            placeholder="https://..."
                          />
                        </div>
                        <Button 
                          className="w-full rounded-xl" 
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
                  {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
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
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100">
                                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <p className="font-bold">{product.name}</p>
                                  <p className="text-xs text-gray-500">الحد الأدنى: {product.minOrder} {product.unit}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4">
                              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                                {category?.name || 'غير مصنف'}
                              </span>
                            </td>
                            <td className="py-4">
                              <div>
                                <span className="font-bold">{product.price} ر.س</span>
                                {product.originalPrice && (
                                  <span className="text-xs text-gray-400 line-through mr-2">
                                    {product.originalPrice} ر.س
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4">
                              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                product.stock > 50 ? 'bg-green-100 text-green-600' : 
                                product.stock > 20 ? 'bg-yellow-100 text-yellow-600' : 
                                'bg-red-100 text-red-600'
                              }`}>
                                {product.stock}
                              </span>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center gap-2">
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-blue-50 hover:text-blue-600">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-green-50 hover:text-green-600">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-600">
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
                <h3 className="font-bold text-lg">إدارة الطلبات</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="outline" className="rounded-xl text-sm">الكل (5)</Button>
                  <Button variant="outline" className="rounded-xl text-sm bg-yellow-50 border-yellow-200 text-yellow-700">قيد الانتظار (2)</Button>
                  <Button variant="outline" className="rounded-xl text-sm bg-blue-50 border-blue-200 text-blue-700">قيد التجهيز (1)</Button>
                  <Button variant="outline" className="rounded-xl text-sm bg-green-50 border-green-200 text-green-700">مكتملة (1)</Button>
                </div>
              </div>

              <div className="space-y-4">
                {mockOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors" data-testid={`order-row-${order.id}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold">طلب #{order.id}</p>
                        <p className="text-sm text-gray-500">{order.customer} • {order.items} منتجات</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-bold">{order.total} ر.س</p>
                      <p className="text-xs text-gray-500">منذ {order.time}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(order.status)}
                      <Select defaultValue={order.status}>
                        <SelectTrigger className="w-32 h-8 text-xs rounded-lg">
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
                      <Button size="sm" variant="outline" className="rounded-lg text-xs">
                        التفاصيل
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  ملخص المبيعات
                </h3>
                <div className="space-y-4">
                  {['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((day, i) => {
                    const value = Math.floor(Math.random() * 80) + 20;
                    return (
                      <div key={day} className="flex items-center gap-3">
                        <span className="w-16 text-sm text-gray-500">{day}</span>
                        <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-l from-primary to-purple-400 rounded-full transition-all duration-500"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <span className="w-16 text-sm font-bold text-left">{value * 50} ر.س</span>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-500" />
                  إحصائيات العملاء
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-blue-600">156</p>
                    <p className="text-sm text-blue-500">عملاء نشطين</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-green-600">89%</p>
                    <p className="text-sm text-green-500">معدل الرضا</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-purple-600">3.2</p>
                    <p className="text-sm text-purple-500">طلبات/عميل</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-orange-600">850</p>
                    <p className="text-sm text-orange-500">ر.س متوسط الطلب</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="p-6 border-none shadow-lg rounded-2xl">
              <h3 className="font-bold text-lg mb-6">إعدادات المتجر</h3>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block">اسم المتجر</Label>
                    <Input className="rounded-xl bg-gray-50 border-none" defaultValue="ساري" />
                  </div>
                  <div>
                    <Label className="mb-2 block">البريد الإلكتروني</Label>
                    <Input className="rounded-xl bg-gray-50 border-none" defaultValue="admin@sary.sa" />
                  </div>
                  <div>
                    <Label className="mb-2 block">رقم الجوال</Label>
                    <Input className="rounded-xl bg-gray-50 border-none" defaultValue="+966500000000" />
                  </div>
                  <div>
                    <Label className="mb-2 block">نسبة الضريبة (%)</Label>
                    <Input className="rounded-xl bg-gray-50 border-none" defaultValue="15" type="number" />
                  </div>
                  <div>
                    <Label className="mb-2 block">الحد الأدنى للطلب (ر.س)</Label>
                    <Input className="rounded-xl bg-gray-50 border-none" defaultValue="200" type="number" />
                  </div>
                  <div>
                    <Label className="mb-2 block">رسوم التوصيل (ر.س)</Label>
                    <Input className="rounded-xl bg-gray-50 border-none" defaultValue="0" type="number" />
                  </div>
                </div>
                <Button className="rounded-xl">
                  حفظ التغييرات
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
