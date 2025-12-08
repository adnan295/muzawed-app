import waterImg from '@assets/stock_images/bottled_water_pack_w_3888052e.jpg';
import riceImg from '@assets/stock_images/rice_bag_10kg_c7f1031c.jpg';
import oilImg from '@assets/stock_images/cooking_oil_bottles_1a0f06b3.jpg';
import cleaningImg from '@assets/stock_images/cleaning_detergents__d15a6f89.jpg';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  minOrder: number;
  unit: string; // e.g., "carton", "piece", "bag"
}

export interface Category {
  id: string;
  name: string;
  icon: string; // We'll use lucide icon names or emojis for simplicity in this mock
  color: string;
}

export const CATEGORIES: Category[] = [
  { id: 'water', name: 'مياه ومشروبات', icon: 'droplet', color: 'bg-blue-100 text-blue-600' },
  { id: 'food', name: 'مواد غذائية', icon: 'utensils', color: 'bg-orange-100 text-orange-600' },
  { id: 'cleaning', name: 'نظافة وعناية', icon: 'sparkles', color: 'bg-cyan-100 text-cyan-600' },
  { id: 'disposables', name: 'بلاستيكات', icon: 'box', color: 'bg-gray-100 text-gray-600' },
  { id: 'dairy', name: 'ألبان وأجبان', icon: 'milk', color: 'bg-yellow-100 text-yellow-600' },
  { id: 'sweets', name: 'حلويات', icon: 'candy', color: 'bg-pink-100 text-pink-600' },
];

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'مياه نوفا 330 مل - 40 حبة',
    category: 'water',
    price: 18.5,
    originalPrice: 20.0,
    image: waterImg,
    minOrder: 5,
    unit: 'كرتون'
  },
  {
    id: '2',
    name: 'أرز بسمتي الشعلان 10 كجم',
    category: 'food',
    price: 75.0,
    image: riceImg,
    minOrder: 2,
    unit: 'كيس'
  },
  {
    id: '3',
    name: 'زيت طبخ عافية 1.5 لتر - 6 حبات',
    category: 'food',
    price: 110.0,
    originalPrice: 125.0,
    image: oilImg,
    minOrder: 3,
    unit: 'كرتون'
  },
  {
    id: '4',
    name: 'منظف فيري ليمون 1 لتر',
    category: 'cleaning',
    price: 12.5,
    image: cleaningImg,
    minOrder: 10,
    unit: 'حبة'
  },
  {
    id: '5',
    name: 'مياه بيرين 200 مل - 48 حبة',
    category: 'water',
    price: 16.0,
    image: waterImg,
    minOrder: 5,
    unit: 'كرتون'
  },
  {
    id: '6',
    name: 'سكر الأسرة ناعم 10 كجم',
    category: 'food',
    price: 38.0,
    image: riceImg, // Placeholder reuse
    minOrder: 5,
    unit: 'كيس'
  }
];
