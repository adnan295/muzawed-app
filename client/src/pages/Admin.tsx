import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Settings
} from 'lucide-react';
import { Link } from 'wouter';
import { productsAPI, categoriesAPI } from '@/lib/api';

interface Product {
  id: number;
  name: string;
  categoryId: number;
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

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => productsAPI.getAll() as Promise<Product[]>,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll() as Promise<Category[]>,
  });

  const stats = [
    { 
      title: 'إجمالي المنتجات', 
      value: products.length, 
      icon: Package, 
      color: 'from-blue-500 to-blue-600',
      change: '+12%'
    },
    { 
      title: 'الأقسام', 
      value: categories.length, 
      icon: Box, 
      color: 'from-green-500 to-green-600',
      change: '+3%'
    },
    { 
      title: 'الطلبات اليوم', 
      value: '24', 
      icon: ShoppingCart, 
      color: 'from-purple-500 to-purple-600',
      change: '+18%'
    },
    { 
      title: 'إجمالي المبيعات', 
      value: '١٢,٥٠٠ ر.س', 
      icon: TrendingUp, 
      color: 'from-orange-500 to-orange-600',
      change: '+25%'
    },
  ];

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
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <ArrowRight className="w-5 h-5 ml-2" />
                العودة للمتجر
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-6xl mx-auto px-4 -mt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="p-4 border-none shadow-lg bg-white rounded-2xl" data-testid={`stat-card-${index}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-xs mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <span className="text-green-500 text-xs font-bold">{stat.change}</span>
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
          <TabsList className="bg-white shadow-sm rounded-xl p-1 mb-6">
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
            <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
              <Settings className="w-4 h-4 ml-2" />
              الإعدادات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  آخر الطلبات
                </h3>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">طلب #{1000 + i}</p>
                          <p className="text-xs text-gray-500">منذ {i * 10} دقيقة</p>
                        </div>
                      </div>
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-bold">
                        قيد التوصيل
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Top Products */}
              <Card className="p-6 border-none shadow-lg rounded-2xl">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  الأكثر مبيعاً
                </h3>
                <div className="space-y-3">
                  {products.slice(0, 4).map((product: any, i: number) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.price} ر.س</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {100 - i * 20} مبيع
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <Card className="p-6 border-none shadow-lg rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">إدارة المنتجات</h3>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      className="pr-10 w-64 bg-gray-50 border-none rounded-xl" 
                      placeholder="بحث عن منتج..."
                      data-testid="input-search-products"
                    />
                  </div>
                  <Button className="rounded-xl" data-testid="button-add-product">
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة منتج
                  </Button>
                </div>
              </div>

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
                    {products.map((product: any) => {
                      const category = categories.find((c: any) => c.id === product.categoryId);
                      return (
                        <tr key={product.id} className="border-b border-gray-50" data-testid={`row-product-${product.id}`}>
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
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="p-6 border-none shadow-lg rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">إدارة الطلبات</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="rounded-xl">الكل</Button>
                  <Button variant="outline" className="rounded-xl">قيد الانتظار</Button>
                  <Button variant="outline" className="rounded-xl">قيد التوصيل</Button>
                  <Button variant="outline" className="rounded-xl">مكتملة</Button>
                </div>
              </div>

              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl" data-testid={`order-row-${i}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold">طلب #{1000 + i}</p>
                        <p className="text-sm text-gray-500">سوبر ماركت السعادة • ٣ منتجات</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-bold">{(Math.random() * 1000 + 100).toFixed(2)} ر.س</p>
                      <p className="text-xs text-gray-500">منذ {i * 15} دقيقة</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        i === 1 ? 'bg-yellow-100 text-yellow-600' :
                        i === 2 ? 'bg-blue-100 text-blue-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {i === 1 ? 'قيد الانتظار' : i === 2 ? 'قيد التوصيل' : 'مكتمل'}
                      </span>
                      <Button size="sm" variant="outline" className="rounded-lg">
                        التفاصيل
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-6 border-none shadow-lg rounded-2xl">
              <h3 className="font-bold text-lg mb-6">إعدادات المتجر</h3>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">اسم المتجر</label>
                    <Input className="rounded-xl bg-gray-50 border-none" defaultValue="ساري" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">البريد الإلكتروني</label>
                    <Input className="rounded-xl bg-gray-50 border-none" defaultValue="admin@sary.sa" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">رقم الجوال</label>
                    <Input className="rounded-xl bg-gray-50 border-none" defaultValue="+966500000000" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">نسبة الضريبة (%)</label>
                    <Input className="rounded-xl bg-gray-50 border-none" defaultValue="15" />
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
