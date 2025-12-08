import { Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/data';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(0);
  const { toast } = useToast();

  const handleIncrement = () => {
    if (quantity === 0) {
      setQuantity(product.minOrder);
      toast({
        title: "تمت الإضافة للسلة",
        description: `تم إضافة ${product.minOrder} ${product.unit} من ${product.name}`,
        className: "bg-secondary text-white border-none",
      });
    } else {
      setQuantity(q => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > product.minOrder) {
      setQuantity(q => q - 1);
    } else {
      setQuantity(0);
    }
  };

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow group bg-white rounded-2xl">
      <div className="relative aspect-square bg-gray-50 p-4">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
        />
        {discount > 0 && (
          <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 font-bold px-2 py-0.5 text-xs">
            {discount}% خصم
          </Badge>
        )}
        <div className="absolute bottom-2 left-2">
           <Badge variant="secondary" className="bg-white/90 text-foreground backdrop-blur-sm text-[10px] shadow-sm border border-gray-100">
             أقل كمية: {product.minOrder} {product.unit}
           </Badge>
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="font-bold text-sm text-foreground line-clamp-2 min-h-[2.5rem] leading-snug mb-2">
          {product.name}
        </h3>
        
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-primary font-bold text-lg">
            {product.price} <span className="text-xs font-normal">ر.س</span>
          </span>
          {product.originalPrice && (
            <span className="text-muted-foreground text-xs line-through decoration-red-400">
              {product.originalPrice}
            </span>
          )}
        </div>

        {quantity === 0 ? (
          <Button 
            onClick={handleIncrement}
            className="w-full bg-gray-100 hover:bg-gray-200 text-foreground font-bold shadow-none h-9 rounded-xl border border-gray-200"
          >
            <Plus className="w-4 h-4 ml-1" />
            أضف للسلة
          </Button>
        ) : (
          <div className="flex items-center justify-between bg-primary/5 rounded-xl p-1 border border-primary/20">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-7 w-7 rounded-lg hover:bg-white text-primary"
              onClick={handleIncrement}
            >
              <Plus className="w-4 h-4" />
            </Button>
            <span className="font-bold text-sm w-8 text-center tabular-nums">{quantity}</span>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-7 w-7 rounded-lg hover:bg-white text-destructive hover:text-destructive"
              onClick={handleDecrement}
            >
              <Minus className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
