import { storage } from "./storage";

async function seed() {
  console.log("🌱 Seeding database...");

  // Seed categories
  const categoryData = [
    { name: "مواد غذائية", icon: "🍞", color: "from-orange-400 to-orange-500" },
    { name: "مشروبات", icon: "🥤", color: "from-blue-400 to-blue-500" },
    { name: "حلويات", icon: "🍫", color: "from-pink-400 to-pink-500" },
    { name: "منظفات", icon: "🧴", color: "from-green-400 to-green-500" },
    { name: "العناية الشخصية", icon: "🧼", color: "from-purple-400 to-purple-500" },
    { name: "معلبات", icon: "🥫", color: "from-red-400 to-red-500" },
  ];

  console.log("📦 Creating categories...");
  for (const cat of categoryData) {
    await storage.createCategory(cat);
  }

  // Seed brands
  const brandData = [
    { name: "المراعي", logo: "🥛" },
    { name: "نادك", logo: "🧀" },
    { name: "كوكاكولا", logo: "🥤" },
    { name: "بيبسي", logo: "🥤" },
    { name: "كدكو", logo: "🍫" },
    { name: "جالكسي", logo: "🍫" },
    { name: "داوني", logo: "🧴" },
    { name: "تايد", logo: "🧴" },
    { name: "دوف", logo: "🧼" },
    { name: "نيفيا", logo: "🧴" },
  ];

  console.log("🏷️ Creating brands...");
  for (const brand of brandData) {
    await storage.createBrand(brand);
  }

  // Seed products
  const productData = [
    {
      name: "حليب المراعي كامل الدسم",
      categoryId: 2,
      brandId: 1,
      price: "89.99",
      originalPrice: "120.00",
      image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400",
      minOrder: 24,
      unit: "كرتون",
      stock: 150,
    },
    {
      name: "كوكاكولا",
      categoryId: 2,
      brandId: 3,
      price: "45.00",
      originalPrice: null,
      image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400",
      minOrder: 24,
      unit: "كرتون",
      stock: 200,
    },
    {
      name: "شوكولاتة كدكو",
      categoryId: 3,
      brandId: 5,
      price: "125.50",
      originalPrice: "150.00",
      image: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400",
      minOrder: 12,
      unit: "كرتون",
      stock: 80,
    },
    {
      name: "منظف تايد",
      categoryId: 4,
      brandId: 8,
      price: "199.99",
      originalPrice: null,
      image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400",
      minOrder: 6,
      unit: "كرتون",
      stock: 100,
    },
    {
      name: "لبن نادك",
      categoryId: 2,
      brandId: 2,
      price: "65.00",
      originalPrice: "80.00",
      image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400",
      minOrder: 24,
      unit: "كرتون",
      stock: 120,
    },
    {
      name: "بيبسي",
      categoryId: 2,
      brandId: 4,
      price: "42.00",
      originalPrice: null,
      image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400",
      minOrder: 24,
      unit: "كرتون",
      stock: 180,
    },
    {
      name: "شوكولاتة جالكسي",
      categoryId: 3,
      brandId: 6,
      price: "135.00",
      originalPrice: null,
      image: "https://images.unsplash.com/photo-1606312619070-d48b4f0e4dff?w=400",
      minOrder: 12,
      unit: "كرتون",
      stock: 60,
    },
    {
      name: "معطر داوني",
      categoryId: 4,
      brandId: 7,
      price: "89.99",
      originalPrice: "110.00",
      image: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400",
      minOrder: 12,
      unit: "كرتون",
      stock: 90,
    },
    {
      name: "صابون دوف",
      categoryId: 5,
      brandId: 9,
      price: "75.00",
      originalPrice: null,
      image: "https://images.unsplash.com/photo-1585155698987-f629903f2f76?w=400",
      minOrder: 24,
      unit: "كرتون",
      stock: 110,
    },
    {
      name: "كريم نيفيا",
      categoryId: 5,
      brandId: 10,
      price: "159.99",
      originalPrice: "180.00",
      image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400",
      minOrder: 12,
      unit: "كرتون",
      stock: 70,
    },
    {
      name: "رز أبو كاس",
      categoryId: 1,
      brandId: null,
      price: "299.99",
      originalPrice: "350.00",
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
      minOrder: 10,
      unit: "كيس",
      stock: 50,
    },
    {
      name: "معكرونة باريلا",
      categoryId: 1,
      brandId: null,
      price: "179.00",
      originalPrice: null,
      image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400",
      minOrder: 20,
      unit: "كرتون",
      stock: 85,
    },
    {
      name: "تونة ريو ماري",
      categoryId: 6,
      brandId: null,
      price: "145.00",
      originalPrice: "165.00",
      image: "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=400",
      minOrder: 24,
      unit: "كرتون",
      stock: 95,
    },
    {
      name: "فول مدمس",
      categoryId: 6,
      brandId: null,
      price: "95.00",
      originalPrice: null,
      image: "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=400",
      minOrder: 24,
      unit: "كرتون",
      stock: 130,
    },
    {
      name: "زيت زيتون",
      categoryId: 1,
      brandId: null,
      price: "449.99",
      originalPrice: "500.00",
      image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400",
      minOrder: 6,
      unit: "كرتون",
      stock: 40,
    },
  ];

  console.log("🛍️ Creating products...");
  for (const product of productData) {
    await storage.createProduct(product);
  }

  console.log("✅ Seeding completed!");
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
