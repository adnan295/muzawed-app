import { Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
        className: "bg-secondary text-white border-none",
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
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Card 
        className="overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 group bg-white rounded-[1.5rem] cursor-pointer h-full flex flex-col justify-between"
        onClick={() => setLocation(`/product/${product.id}`)}
        data-testid={`product-card-${product.id}`}
      >
        <div className="relative aspect-square bg-gray-50/50 p-4">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
          />
          {discount > 0 && (
            <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 font-bold px-2 py-1 text-xs shadow-lg shadow-red-500/20 animate-pulse">
              {discount}% خصم
            </Badge>
          )}
          <div className="absolute bottom-2 left-2">
             <Badge variant="secondary" className="bg-white/80 text-foreground backdrop-blur-md text-[10px] shadow-sm border border-gray-100 font-bold">
               {product.minOrder} {product.unit}
             </Badge>
          </div>
        </div>
        
        <div className="p-4 pt-2 flex flex-col flex-1">
          <h3 className="font-bold text-sm text-foreground line-clamp-2 min-h-[2.5rem] leading-snug mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          <div className="flex items-baseline gap-2 mb-4 mt-auto">
            <span className="text-primary font-black text-lg">
              {price} <span className="text-xs font-normal text-muted-foreground">ر.س</span>
            </span>
            {originalPrice && (
              <span className="text-muted-foreground text-xs line-through decoration-red-400 opacity-60">
                {originalPrice}
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            {quantity === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Button 
                  onClick={handleIncrement}
                  className="w-full bg-gray-100 hover:bg-primary hover:text-white text-foreground font-bold shadow-none h-10 rounded-xl border border-gray-200 transition-all duration-300"
                  data-testid={`button-add-${product.id}`}
                >
                  <Plus className="w-4 h-4 ml-1" />
                  أضف للسلة
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center justify-between bg-primary rounded-xl p-1 shadow-lg shadow-primary/20"
              >
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 bg-white/20 hover:bg-white/30 text-white rounded-lg"
                  onClick={handleIncrement}
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <div className="flex flex-col items-center">
                  <motion.span 
                    key={quantity}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="font-bold text-white text-lg"
                  >
                    {quantity}
                  </motion.span>
                  <span className="text-[8px] text-white/70 -mt-0.5">{product.unit}</span>
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className={cn(
                    "h-8 w-8 rounded-lg",
                    quantity <= product.minOrder 
                      ? "bg-red-500/80 hover:bg-red-500 text-white" 
                      : "bg-white/20 hover:bg-white/30 text-white"
                  )}
                  onClick={handleDecrement}
                >
                  <Minus className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}
