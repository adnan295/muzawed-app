import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { ArrowRight, ShoppingCart, Package, Percent, Sparkles, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/AuthContext";
import { motion } from "framer-motion";

interface BannerProduct {
  id: number;
  bannerId: number;
  productId: number;
  promoPrice: string;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: string;
    originalPrice: string | null;
    image: string;
    unit: string;
    minOrder: number;
  };
}

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  colorClass: string;
}

export default function Promo() {
  const [, params] = useRoute("/promo/:bannerId");
  const bannerId = params?.bannerId ? parseInt(params.bannerId) : null;
  
  const [banner, setBanner] = useState<Banner | null>(null);
  const [products, setProducts] = useState<BannerProduct[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (bannerId) {
      fetchData();
    }
  }, [bannerId]);

  const fetchData = async () => {
    try {
      const [bannerRes, productsRes] = await Promise.all([
        fetch(`/api/banners/${bannerId}`),
        fetch(`/api/banners/${bannerId}/products`)
      ]);
      
      if (bannerRes.ok) {
        const bannerData = await bannerRes.json();
        setBanner(bannerData);
      }
      
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
        const initialQuantities: Record<number, number> = {};
        productsData.forEach((p: BannerProduct) => {
          initialQuantities[p.id] = p.quantity;
        });
        setQuantities(initialQuantities);
      }
    } catch (error) {
      console.error("Error fetching promo data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (productId: number, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta)
    }));
  };

  const calculateTotal = () => {
    return products.reduce((sum, p) => {
      const qty = quantities[p.id] || p.quantity;
      return sum + (parseFloat(p.promoPrice) * qty);
    }, 0);
  };

  const calculateOriginalTotal = () => {
    return products.reduce((sum, p) => {
      const qty = quantities[p.id] || p.quantity;
      const originalPrice = p.product.originalPrice || p.product.price;
      return sum + (parseFloat(originalPrice) * qty);
    }, 0);
  };

  const calculateSavings = () => {
    return calculateOriginalTotal() - calculateTotal();
  };

  const addAllToCart = async () => {
    if (!user) {
      toast({
        title: "يرجى تسجيل الدخول",
        description: "يجب تسجيل الدخول لإضافة المنتجات للسلة",
        variant: "destructive"
      });
      return;
    }

    try {
      for (const product of products) {
        const qty = quantities[product.id] || product.quantity;
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            productId: product.productId,
            quantity: qty
          })
        });
      }
      
      toast({
        title: "تمت الإضافة بنجاح",
        description: "تم إضافة جميع منتجات العرض إلى السلة"
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة المنتجات",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!banner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex flex-col items-center justify-center p-4" dir="rtl">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">العرض غير موجود</h2>
        <p className="text-gray-500 mb-4">هذا العرض غير متاح حالياً</p>
        <Link href="/">
          <Button variant="outline">
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للرئيسية
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white pb-32" dir="rtl">
      {/* Header Banner */}
      <div className={`bg-gradient-to-r ${banner.colorClass || 'from-primary to-purple-800'} text-white p-6`}>
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-white/80 hover:text-white mb-4">
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة
          </Button>
        </Link>
        
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-6 h-6" />
          <Badge variant="secondary" className="bg-white/20 text-white border-0">
            عرض خاص
          </Badge>
        </div>
        
        <h1 className="text-2xl font-bold mb-1">{banner.title}</h1>
        {banner.subtitle && (
          <p className="text-white/80">{banner.subtitle}</p>
        )}
      </div>

      {/* Products List */}
      <div className="p-4 space-y-4">
        {products.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">لا توجد منتجات في هذا العرض</h3>
            <p className="text-gray-500">سيتم إضافة المنتجات قريباً</p>
          </Card>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-primary" />
              <span className="font-semibold">منتجات الباقة ({products.length})</span>
            </div>

            {products.map((item, index) => {
              const originalPrice = parseFloat(item.product.originalPrice || item.product.price);
              const promoPrice = parseFloat(item.promoPrice);
              const discount = Math.round(((originalPrice - promoPrice) / originalPrice) * 100);
              const qty = quantities[item.id] || item.quantity;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden" data-testid={`promo-product-${item.id}`}>
                    <CardContent className="p-0">
                      <div className="flex gap-4 p-4">
                        <div className="relative w-24 h-24 flex-shrink-0">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          {discount > 0 && (
                            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                              -{discount}%
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{item.product.name}</h3>
                          <p className="text-sm text-gray-500">{item.product.unit}</p>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-lg font-bold text-primary">
                              {promoPrice.toLocaleString('ar-SY')} ل.س
                            </span>
                            {discount > 0 && (
                              <span className="text-sm text-gray-400 line-through">
                                {originalPrice.toLocaleString('ar-SY')}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, -1)}
                              data-testid={`btn-decrease-${item.id}`}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center font-semibold">{qty}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, 1)}
                              data-testid={`btn-increase-${item.id}`}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </>
        )}
      </div>

      {/* Fixed Bottom Summary */}
      {products.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-primary/10 p-4 shadow-lg">
          <div className="max-w-lg mx-auto">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600">الإجمالي</span>
              <div className="text-left">
                <span className="text-xl font-bold text-primary">
                  {calculateTotal().toLocaleString('ar-SY')} ل.س
                </span>
                {calculateSavings() > 0 && (
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <Percent className="w-3 h-3" />
                    <span>توفير {calculateSavings().toLocaleString('ar-SY')} ل.س</span>
                  </div>
                )}
              </div>
            </div>
            
            <Button 
              className="w-full h-12 text-lg"
              onClick={addAllToCart}
              data-testid="btn-add-bundle-to-cart"
            >
              <ShoppingCart className="w-5 h-5 ml-2" />
              إضافة الباقة للسلة
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
