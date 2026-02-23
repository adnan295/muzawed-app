import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export interface FilterValues {
  sort: string;
  brandId: number | null;
  minPrice: number;
  maxPrice: number;
}

interface Brand {
  id: number;
  name: string;
  logo: string;
}

interface FilterSheetProps {
  filters?: FilterValues;
  onApply?: (filters: FilterValues) => void;
  brands?: Brand[];
  maxPriceLimit?: number;
}

const DEFAULT_FILTERS: FilterValues = {
  sort: 'featured',
  brandId: null,
  minPrice: 0,
  maxPrice: 999999,
};

export function FilterSheet({ filters, onApply, brands = [], maxPriceLimit = 50000 }: FilterSheetProps) {
  const [localSort, setLocalSort] = useState(filters?.sort || 'featured');
  const [localBrandId, setLocalBrandId] = useState<number | null>(filters?.brandId || null);
  const [localPriceRange, setLocalPriceRange] = useState<number[]>([filters?.maxPrice && filters.maxPrice < maxPriceLimit ? filters.maxPrice : maxPriceLimit]);

  useEffect(() => {
    setLocalSort(filters?.sort || 'featured');
    setLocalBrandId(filters?.brandId || null);
    setLocalPriceRange([filters?.maxPrice && filters.maxPrice < maxPriceLimit ? filters.maxPrice : maxPriceLimit]);
  }, [filters?.sort, filters?.brandId, filters?.maxPrice, maxPriceLimit]);

  const handleApply = () => {
    if (onApply) {
      onApply({
        sort: localSort,
        brandId: localBrandId,
        minPrice: 0,
        maxPrice: localPriceRange[0] >= maxPriceLimit ? 999999 : localPriceRange[0],
      });
    }
  };

  const handleReset = () => {
    setLocalSort('featured');
    setLocalBrandId(null);
    setLocalPriceRange([maxPriceLimit]);
    if (onApply) {
      onApply(DEFAULT_FILTERS);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="h-10 w-10 rounded-xl border-gray-200 shrink-0">
          <SlidersHorizontal className="w-5 h-5 text-gray-600" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-[2rem] h-[85vh] p-0 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <SheetHeader className="text-right">
            <SheetTitle>تصفية النتائج</SheetTitle>
            <SheetDescription>تخصيص نتائج البحث لتناسب احتياجاتك</SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="space-y-4">
            <h3 className="font-bold text-sm">نطاق السعر</h3>
            <Slider
              value={localPriceRange}
              onValueChange={setLocalPriceRange}
              max={maxPriceLimit}
              step={500}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground font-medium">
              <span>0 ل.س</span>
              <span className="font-bold text-primary">
                {localPriceRange[0] >= maxPriceLimit ? `${maxPriceLimit.toLocaleString('ar-SY')}+ ل.س` : `${localPriceRange[0].toLocaleString('ar-SY')} ل.س`}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-sm">ترتيب حسب</h3>
            <RadioGroup value={localSort} onValueChange={setLocalSort} className="grid grid-cols-2 gap-3">
              <div>
                <RadioGroupItem value="featured" id="featured" className="peer sr-only" />
                <Label
                  htmlFor="featured"
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer text-xs font-bold h-12"
                >
                  الأكثر طلباً
                </Label>
              </div>
              <div>
                <RadioGroupItem value="price-low" id="price-low" className="peer sr-only" />
                <Label
                  htmlFor="price-low"
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer text-xs font-bold h-12"
                >
                  الأقل سعراً
                </Label>
              </div>
              <div>
                <RadioGroupItem value="price-high" id="price-high" className="peer sr-only" />
                <Label
                  htmlFor="price-high"
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer text-xs font-bold h-12"
                >
                  الأعلى سعراً
                </Label>
              </div>
              <div>
                <RadioGroupItem value="newest" id="newest" className="peer sr-only" />
                <Label
                  htmlFor="newest"
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer text-xs font-bold h-12"
                >
                  الأحدث
                </Label>
              </div>
            </RadioGroup>
          </div>

          {brands.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm">العلامة التجارية</h3>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {brands.map((brand) => (
                  <div key={brand.id} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`brand-${brand.id}`}
                      checked={localBrandId === brand.id}
                      onCheckedChange={(checked) => {
                        setLocalBrandId(checked ? brand.id : null);
                      }}
                    />
                    <Label htmlFor={`brand-${brand.id}`} className="text-sm font-normal mr-2 flex items-center gap-2">
                      <span>{brand.logo}</span>
                      {brand.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-white pb-8">
          <div className="flex gap-3">
            <SheetClose asChild>
              <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold" onClick={handleReset}>إعادة تعيين</Button>
            </SheetClose>
            <SheetClose asChild>
              <Button className="flex-[2] h-12 rounded-xl font-bold shadow-lg shadow-primary/20" onClick={handleApply}>عرض النتائج</Button>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
