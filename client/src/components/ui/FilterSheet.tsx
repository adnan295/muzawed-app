import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function FilterSheet() {
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
          {/* Price Range */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm">نطاق السعر</h3>
            <Slider defaultValue={[50]} max={500} step={1} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground font-medium">
              <span>0 ر.س</span>
              <span>500+ ر.س</span>
            </div>
          </div>

          {/* Sort By */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm">ترتيب حسب</h3>
            <RadioGroup defaultValue="featured" className="grid grid-cols-2 gap-3">
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

          {/* Brands */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm">العلامة التجارية</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox id="brand1" />
                <Label htmlFor="brand1" className="text-sm font-normal mr-2">المراعي</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox id="brand2" />
                <Label htmlFor="brand2" className="text-sm font-normal mr-2">نادك</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox id="brand3" />
                <Label htmlFor="brand3" className="text-sm font-normal mr-2">الصافي</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox id="brand4" />
                <Label htmlFor="brand4" className="text-sm font-normal mr-2">سعودية</Label>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-white pb-8">
          <div className="flex gap-3">
             <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold">إعادة تعيين</Button>
             <SheetClose asChild>
               <Button className="flex-[2] h-12 rounded-xl font-bold shadow-lg shadow-primary/20">عرض النتائج</Button>
             </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
