import { Plus, Minus, ShoppingBag, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { cartAPI } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

interface Product {
  id: number;
  name: string;
  categoryId?: number;
  price: string | number;
  originalPrice?: string | number | null;
  image: string;
  minOrder: number;
  unit: string;
  stock?: number;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: (data: { userId: number; productId: number; quantity: number }) => 
      cartAPI.add(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Favorites functionality
  const { data: favoriteStatus } = useQuery({
    queryKey: ['favorite', user?.id, product.id],
    queryFn: async () => {
      if (!user?.id) return { isFavorite: false };
      const res = await fetch(`/api/favorites/${user.id}/${product.id}/check`);
      return res.json();
    },
    enabled: !!user?.id,
  });

  const isFavorite = favoriteStatus?.isFavorite || false;

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      if (isFavorite) {
        await fetch(`/api/favorites/${user.id}/${product.id}`, { method: 'DELETE' });
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, productId: product.id }),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite', user?.id, product.id] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast({
        title: isFavorite ? "تمت الإزالة من المفضلة" : "تمت الإضافة للمفضلة",
        description: product.name,
        className: "glass border-0",
      });
    },
  });

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: "يرجى تسجيل الدخول",
        description: "قم بتسجيل الدخول لإضافة المنتجات للمفضلة",
        variant: "destructive",
      });
      return;
    }
    toggleFavoriteMutation.mutate();
  };

  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const originalPrice = product.originalPrice 
    ? (typeof product.originalPrice === 'string' ? parseFloat(product.originalPrice) : product.originalPrice)
    : null;

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity === 0) {
      setQuantity(product.minOrder);
      if (user) {
        addToCartMutation.mutate({
          userId: user.id,
          productId: product.id,
          quantity: product.minOrder,
        });
      }
      toast({
        title: "تمت الإضافة للسلة",
        description: `تم إضافة ${product.minOrder} ${product.unit} من ${product.name}`,
        className: "gradient-secondary text-white border-none",
      });
    } else {
      setQuantity(q => q + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity > product.minOrder) {
      setQuantity(q => q - 1);
    } else {
      setQuantity(0);
    }
  };

  const discount = originalPrice 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card 
        className="overflow-hidden border-0 shadow-premium hover:shadow-premium-hover transition-all duration-500 group bg-white rounded-[1.75rem] cursor-pointer h-full flex flex-col justify-between relative"
        onClick={() => setLocation(`/product/${product.id}`)}
        data-testid={`product-card-${product.id}`}
      >
        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[1.75rem] pointer-events-none" />

        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100/50 p-5 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-secondary/10 rounded-full blur-xl" />
          </div>

          {/* Product Image */}
          <motion.img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-contain relative z-10 drop-shadow-lg"
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />

          {/* Discount Badge */}
          {discount > 0 && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="absolute top-3 right-3"
            >
              <Badge className="gradient-primary hover:opacity-90 font-bold px-2.5 py-1 text-xs shadow-xl shadow-primary/25 border-0 rounded-xl">
                <Sparkles className="w-3 h-3 ml-1" />
                {discount}% خصم
              </Badge>
            </motion.div>
          )}

          {/* Favorite Button */}
          <motion.button
            onClick={handleToggleFavorite}
            className={cn(
              "absolute top-3 left-3 w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 backdrop-blur-md",
              isFavorite 
                ? "bg-red-500 text-white shadow-lg shadow-red-500/30" 
                : "bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white shadow-lg"
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            data-testid={`button-favorite-${product.id}`}
          >
            <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
          </motion.button>

          {/* Min Order Badge */}
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="glass text-foreground text-[10px] shadow-lg border-0 font-bold px-2.5 py-1 rounded-xl">
              {product.minOrder} {product.unit}
            </Badge>
          </div>
        </div>
        
        <div className="p-4 pt-3 flex flex-col flex-1 relative z-10">
          <h3 className="font-bold text-sm leading-snug text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          <div className="mt-auto space-y-3">
            {/* Price Section */}
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                {originalPrice && (
                  <span className="text-xs text-gray-400 line-through font-medium">
                    {originalPrice.toLocaleString('ar-SY')} ل.س
                  </span>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black bg-gradient-to-l from-primary to-purple-600 bg-clip-text text-transparent">
                    {price.toLocaleString('ar-SY')}
                  </span>
                  <span className="text-[10px] text-gray-500 font-bold">ل.س</span>
                </div>
              </div>
            </div>

            {/* Add to Cart Section */}
            <AnimatePresence mode="wait">
              {quantity === 0 ? (
                <motion.div
                  key="add-button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Button
                    onClick={handleIncrement}
                    className="w-full h-11 rounded-xl gradient-primary text-white font-bold text-sm border-0 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
                  >
                    <ShoppingBag className="w-4 h-4 ml-2" />
                    أضف للسلة
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="quantity-controls"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-between bg-gradient-to-l from-primary/10 to-purple-100/50 rounded-xl p-1"
                >
                  <Button
                    size="icon"
                    onClick={handleDecrement}
                    className="h-9 w-9 rounded-lg bg-white shadow-md border-0 text-primary hover:bg-primary hover:text-white transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <motion.span 
                    key={quantity}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="font-black text-lg text-primary min-w-[2rem] text-center"
                  >
                    {quantity}
                  </motion.span>
                  <Button
                    size="icon"
                    onClick={handleIncrement}
                    className="h-9 w-9 rounded-lg gradient-primary shadow-md border-0 text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
