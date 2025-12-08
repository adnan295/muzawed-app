import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Autoplay from 'embla-carousel-autoplay';
import { useQuery } from '@tanstack/react-query';
import { bannersAPI } from '@/lib/api';

// Default fallback images
import deliveryImg from '@assets/stock_images/grocery_delivery_tru_61152cdf.jpg';
import promoImg from '@assets/stock_images/supermarket_promotio_94a2e34b.jpg';
import freshImg from '@assets/stock_images/fresh_fruits_and_veg_5edc76b9.jpg';
import cleaningImg from '@assets/stock_images/cleaning_products_sa_fdf8a31e.jpg';

interface BannerProps {
  id: string | number;
  image: string;
  title: string;
  subtitle: string;
  buttonText: string;
  colorClass: string;
  buttonLink?: string;
}

const DEFAULT_BANNERS: BannerProps[] = [
  {
    id: 'default-1',
    image: deliveryImg,
    title: 'مقاضيك واصلة لباب محلك',
    subtitle: 'توصيل مجاني للطلبات فوق 500000 ليرة',
    buttonText: 'اطلب الآن',
    colorClass: 'from-primary to-purple-800',
  },
  {
    id: 'default-2',
    image: promoImg,
    title: 'عروض نهاية الشهر الكبرى',
    subtitle: 'خصومات تصل إلى 50% على المنتجات الأساسية',
    buttonText: 'تصفح العروض',
    colorClass: 'from-red-600 to-orange-600',
  },
  {
    id: 'default-3',
    image: freshImg,
    title: 'خضار وفواكه طازجة يومياً',
    subtitle: 'من المزرعة إلى متجرك مباشرة',
    buttonText: 'تسوق الطازج',
    colorClass: 'from-green-600 to-emerald-800',
  },
  {
    id: 'default-4',
    image: cleaningImg,
    title: 'نظافة وتوفير',
    subtitle: 'أفضل أسعار المنظفات بالجملة',
    buttonText: 'اشتري الآن',
    colorClass: 'from-blue-500 to-cyan-600',
  },
];

export function AdsCarousel() {
  const { data: apiBanners = [] } = useQuery({
    queryKey: ['/api/banners/active'],
    queryFn: bannersAPI.getActive,
  });

  const banners: BannerProps[] = apiBanners.length > 0 
    ? apiBanners.map((b: any) => ({
        id: b.id,
        image: b.image || deliveryImg,
        title: b.title,
        subtitle: b.subtitle || '',
        buttonText: b.buttonText || 'اطلب الآن',
        colorClass: b.colorClass || 'from-primary to-purple-800',
        buttonLink: b.buttonLink,
      }))
    : DEFAULT_BANNERS;

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, direction: 'rtl' }, [
    Autoplay({ delay: 5000, stopOnInteraction: false })
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative" dir="rtl">
      <div className="overflow-hidden rounded-2xl shadow-md" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {banners.map((banner) => (
            <div className="flex-[0_0_100%] min-w-0 relative aspect-[2.4/1]" key={banner.id}>
               <div className={cn(
                 "relative h-full w-full overflow-hidden bg-gradient-to-l text-white p-5 flex flex-col justify-center items-start",
                 banner.colorClass
               )}>
                  <div className="absolute inset-0 bg-black/10 z-0"></div>
                  <img 
                    src={banner.image} 
                    alt={banner.title} 
                    className="absolute right-0 top-0 h-full w-3/4 object-cover opacity-25 mix-blend-overlay z-0"
                  />
                  
                  <div className="relative z-10 max-w-[75%]">
                    <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md mb-2 inline-block border border-white/10">
                      مميز
                    </span>
                    <h2 className="text-xl font-bold mb-1 leading-tight text-shadow-sm">{banner.title}</h2>
                    <p className="text-white/90 text-[11px] mb-3 line-clamp-1">{banner.subtitle}</p>
                    <Button size="sm" className="bg-white text-foreground hover:bg-white/90 font-bold rounded-lg text-[10px] h-7 px-4 shadow-sm">
                      {banner.buttonText}
                    </Button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {banners.map((_, index) => (
          <button
            key={index}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              index === selectedIndex ? "w-6 bg-primary" : "w-1.5 bg-gray-300"
            )}
            onClick={() => emblaApi?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
