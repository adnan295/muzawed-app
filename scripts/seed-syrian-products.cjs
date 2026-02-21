const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const images = {
  1: Array.from({length: 8}, (_, i) => `/products/food_${i+1}.jpg`),
  2: Array.from({length: 8}, (_, i) => `/products/drinks_${i+1}.jpg`),
  3: Array.from({length: 8}, (_, i) => `/products/sweets_${i+1}.jpg`),
  4: Array.from({length: 8}, (_, i) => `/products/cleaning_${i+1}.jpg`),
  5: Array.from({length: 8}, (_, i) => `/products/personal_${i+1}.jpg`),
  6: Array.from({length: 8}, (_, i) => `/products/canned_${i+1}.jpg`),
};

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randPrice(min, max) { return (Math.random() * (max - min) + min).toFixed(2); }

const products = [
  // ===== مواد غذائية (category 1) - ~100 products =====
  // زيوت
  {name: 'زيت زيتون غدير بكر ممتاز 1 لتر', cat: 1, brand: 11, price: 85000, unit: 'كرتون', min: 6},
  {name: 'زيت زيتون غدير بكر ممتاز 500 مل', cat: 1, brand: 11, price: 45000, unit: 'كرتون', min: 12},
  {name: 'زيت زيتون غدير بكر 2 لتر', cat: 1, brand: 11, price: 155000, unit: 'كرتون', min: 4},
  {name: 'زيت زيتون غدير عصرة أولى 750 مل', cat: 1, brand: 11, price: 70000, unit: 'كرتون', min: 8},
  {name: 'زيت نباتي غدير 1.5 لتر', cat: 1, brand: 11, price: 28000, unit: 'كرتون', min: 12},
  {name: 'زيت نباتي غدير 5 لتر', cat: 1, brand: 11, price: 75000, unit: 'غالون', min: 4},
  {name: 'زيت ذرة غدير 1 لتر', cat: 1, brand: 11, price: 32000, unit: 'كرتون', min: 12},
  {name: 'زيت دوار الشمس غدير 1.8 لتر', cat: 1, brand: 11, price: 35000, unit: 'كرتون', min: 6},
  // أرز وبقوليات
  {name: 'أرز الخير بسمتي 5 كغ', cat: 1, brand: 37, price: 95000, unit: 'كيس', min: 4},
  {name: 'أرز الخير بسمتي 1 كغ', cat: 1, brand: 37, price: 22000, unit: 'كرتون', min: 12},
  {name: 'أرز الخير مصري 5 كغ', cat: 1, brand: 37, price: 65000, unit: 'كيس', min: 4},
  {name: 'أرز الخير مصري 1 كغ', cat: 1, brand: 37, price: 15000, unit: 'كرتون', min: 12},
  {name: 'أرز الخير أمريكي طويل 2 كغ', cat: 1, brand: 37, price: 40000, unit: 'كرتون', min: 6},
  {name: 'عدس أحمر الخير 1 كغ', cat: 1, brand: 37, price: 12000, unit: 'كرتون', min: 12},
  {name: 'عدس أخضر الخير 1 كغ', cat: 1, brand: 37, price: 14000, unit: 'كرتون', min: 12},
  {name: 'فول الخير 1 كغ', cat: 1, brand: 37, price: 10000, unit: 'كرتون', min: 12},
  {name: 'حمص الخير 1 كغ', cat: 1, brand: 37, price: 16000, unit: 'كرتون', min: 12},
  {name: 'فاصولياء بيضاء الخير 1 كغ', cat: 1, brand: 37, price: 18000, unit: 'كرتون', min: 12},
  {name: 'برغل ناعم الخير 1 كغ', cat: 1, brand: 37, price: 8000, unit: 'كرتون', min: 12},
  {name: 'برغل خشن الخير 1 كغ', cat: 1, brand: 37, price: 8500, unit: 'كرتون', min: 12},
  {name: 'فريكة الخير 1 كغ', cat: 1, brand: 37, price: 25000, unit: 'كرتون', min: 12},
  // سكر وطحين
  {name: 'سكر الوحدة 1 كغ', cat: 1, brand: 15, price: 7500, unit: 'كرتون', min: 24},
  {name: 'سكر الوحدة 5 كغ', cat: 1, brand: 15, price: 35000, unit: 'كيس', min: 4},
  {name: 'سكر الوحدة 10 كغ', cat: 1, brand: 15, price: 68000, unit: 'كيس', min: 2},
  {name: 'طحين الوحدة أبيض 2 كغ', cat: 1, brand: 15, price: 6000, unit: 'كرتون', min: 12},
  {name: 'طحين الوحدة أبيض 5 كغ', cat: 1, brand: 15, price: 14000, unit: 'كيس', min: 4},
  {name: 'طحين الوحدة قمح كامل 2 كغ', cat: 1, brand: 15, price: 7000, unit: 'كرتون', min: 12},
  {name: 'نشاء الوحدة 500 غ', cat: 1, brand: 15, price: 4500, unit: 'كرتون', min: 24},
  // ألبان وأجبان
  {name: 'جبنة بيضاء صوفيا 400 غ', cat: 1, brand: 19, price: 18000, unit: 'كرتون', min: 12},
  {name: 'جبنة بيضاء صوفيا 800 غ', cat: 1, brand: 19, price: 32000, unit: 'كرتون', min: 6},
  {name: 'جبنة حلوم صوفيا 250 غ', cat: 1, brand: 19, price: 22000, unit: 'كرتون', min: 12},
  {name: 'جبنة مشللة صوفيا 400 غ', cat: 1, brand: 19, price: 25000, unit: 'كرتون', min: 12},
  {name: 'جبنة عكاوي صوفيا 500 غ', cat: 1, brand: 19, price: 28000, unit: 'كرتون', min: 12},
  {name: 'لبنة صوفيا 500 غ', cat: 1, brand: 19, price: 12000, unit: 'كرتون', min: 12},
  {name: 'لبن صوفيا 1 لتر', cat: 1, brand: 19, price: 8000, unit: 'كرتون', min: 12},
  {name: 'حليب صوفيا كامل الدسم 1 لتر', cat: 1, brand: 19, price: 9000, unit: 'كرتون', min: 12},
  {name: 'حليب صوفيا قليل الدسم 1 لتر', cat: 1, brand: 19, price: 9500, unit: 'كرتون', min: 12},
  {name: 'زبدة صوفيا 200 غ', cat: 1, brand: 19, price: 15000, unit: 'كرتون', min: 24},
  {name: 'قشطة صوفيا 170 غ', cat: 1, brand: 19, price: 6000, unit: 'كرتون', min: 24},
  // منتجات غذائية متنوعة - الغوطة
  {name: 'معكرونة الغوطة سباغيتي 500 غ', cat: 1, brand: 12, price: 5500, unit: 'كرتون', min: 24},
  {name: 'معكرونة الغوطة بيني 500 غ', cat: 1, brand: 12, price: 5500, unit: 'كرتون', min: 24},
  {name: 'معكرونة الغوطة فوسيلي 500 غ', cat: 1, brand: 12, price: 5800, unit: 'كرتون', min: 24},
  {name: 'معكرونة الغوطة لازانيا 500 غ', cat: 1, brand: 12, price: 7000, unit: 'كرتون', min: 12},
  {name: 'شعيرية الغوطة 500 غ', cat: 1, brand: 12, price: 4500, unit: 'كرتون', min: 24},
  {name: 'كسكس الغوطة 500 غ', cat: 1, brand: 12, price: 6000, unit: 'كرتون', min: 24},
  // غصن البان
  {name: 'زعتر غصن البان 500 غ', cat: 1, brand: 13, price: 20000, unit: 'كرتون', min: 12},
  {name: 'سماق غصن البان 250 غ', cat: 1, brand: 13, price: 8000, unit: 'كرتون', min: 24},
  {name: 'كمون غصن البان 100 غ', cat: 1, brand: 13, price: 5000, unit: 'كرتون', min: 24},
  {name: 'بهارات مشكلة غصن البان 100 غ', cat: 1, brand: 13, price: 5500, unit: 'كرتون', min: 24},
  {name: 'فلفل أسود غصن البان 100 غ', cat: 1, brand: 13, price: 7000, unit: 'كرتون', min: 24},
  {name: 'كركم غصن البان 100 غ', cat: 1, brand: 13, price: 4500, unit: 'كرتون', min: 24},
  {name: 'بابريكا غصن البان 100 غ', cat: 1, brand: 13, price: 4000, unit: 'كرتون', min: 24},
  {name: 'قرفة غصن البان 100 غ', cat: 1, brand: 13, price: 6000, unit: 'كرتون', min: 24},
  {name: 'هيل غصن البان 50 غ', cat: 1, brand: 13, price: 12000, unit: 'كرتون', min: 24},
  {name: 'زنجبيل غصن البان 100 غ', cat: 1, brand: 13, price: 5000, unit: 'كرتون', min: 24},
  // شام
  {name: 'طحينة شام 500 غ', cat: 1, brand: 14, price: 18000, unit: 'كرتون', min: 12},
  {name: 'طحينة شام 1 كغ', cat: 1, brand: 14, price: 33000, unit: 'كرتون', min: 6},
  {name: 'حلاوة شام بالفستق 500 غ', cat: 1, brand: 14, price: 28000, unit: 'كرتون', min: 12},
  {name: 'حلاوة شام سادة 500 غ', cat: 1, brand: 14, price: 22000, unit: 'كرتون', min: 12},
  {name: 'دبس رمان شام 500 مل', cat: 1, brand: 14, price: 15000, unit: 'كرتون', min: 12},
  {name: 'دبس فليفلة شام 500 مل', cat: 1, brand: 14, price: 12000, unit: 'كرتون', min: 12},
  {name: 'دبس تمر شام 500 مل', cat: 1, brand: 14, price: 14000, unit: 'كرتون', min: 12},
  {name: 'خل تفاح شام 500 مل', cat: 1, brand: 14, price: 8000, unit: 'كرتون', min: 12},
  {name: 'ماء ورد شام 250 مل', cat: 1, brand: 14, price: 7000, unit: 'كرتون', min: 24},
  {name: 'ماء زهر شام 250 مل', cat: 1, brand: 14, price: 7000, unit: 'كرتون', min: 24},
  // أوغاريت
  {name: 'زيتون أخضر أوغاريت 500 غ', cat: 1, brand: 16, price: 18000, unit: 'كرتون', min: 12},
  {name: 'زيتون أسود أوغاريت 500 غ', cat: 1, brand: 16, price: 20000, unit: 'كرتون', min: 12},
  {name: 'مكدوس أوغاريت 800 غ', cat: 1, brand: 16, price: 35000, unit: 'كرتون', min: 6},
  {name: 'لبنة كرات أوغاريت بالزيت 400 غ', cat: 1, brand: 16, price: 22000, unit: 'كرتون', min: 12},
  {name: 'مربى مشمش أوغاريت 450 غ', cat: 1, brand: 16, price: 12000, unit: 'كرتون', min: 12},
  {name: 'مربى فراولة أوغاريت 450 غ', cat: 1, brand: 16, price: 13000, unit: 'كرتون', min: 12},
  {name: 'مربى تين أوغاريت 450 غ', cat: 1, brand: 16, price: 14000, unit: 'كرتون', min: 12},
  {name: 'مربى توت أوغاريت 450 غ', cat: 1, brand: 16, price: 15000, unit: 'كرتون', min: 12},
  // قهوة الحموي
  {name: 'قهوة الحموي سادة 500 غ', cat: 1, brand: 20, price: 45000, unit: 'كرتون', min: 12},
  {name: 'قهوة الحموي سادة 250 غ', cat: 1, brand: 20, price: 25000, unit: 'كرتون', min: 24},
  {name: 'قهوة الحموي مع هيل 500 غ', cat: 1, brand: 20, price: 52000, unit: 'كرتون', min: 12},
  {name: 'قهوة الحموي مع هيل 250 غ', cat: 1, brand: 20, price: 28000, unit: 'كرتون', min: 24},
  {name: 'قهوة الحموي تركية فاخرة 200 غ', cat: 1, brand: 20, price: 22000, unit: 'كرتون', min: 24},
  {name: 'قهوة الحموي عربية 200 غ', cat: 1, brand: 20, price: 20000, unit: 'كرتون', min: 24},
  // كتاكيت / تنمية
  {name: 'شيبس كتاكيت بالجبنة 30 غ', cat: 1, brand: 21, price: 1500, unit: 'كرتون', min: 48},
  {name: 'شيبس كتاكيت بالشطة 30 غ', cat: 1, brand: 21, price: 1500, unit: 'كرتون', min: 48},
  {name: 'شيبس كتاكيت بالملح 30 غ', cat: 1, brand: 21, price: 1500, unit: 'كرتون', min: 48},
  {name: 'بسكويت كتاكيت بالشوكولاتة 100 غ', cat: 1, brand: 21, price: 4000, unit: 'كرتون', min: 24},
  {name: 'بسكويت كتاكيت سادة 100 غ', cat: 1, brand: 21, price: 3500, unit: 'كرتون', min: 24},
  {name: 'كيك كتاكيت بالفانيلا 50 غ', cat: 1, brand: 21, price: 2500, unit: 'كرتون', min: 48},
  {name: 'كيك كتاكيت بالشوكولاتة 50 غ', cat: 1, brand: 21, price: 2500, unit: 'كرتون', min: 48},
  // نسور بلدنا
  {name: 'مرتديلا نسور بلدنا 500 غ', cat: 1, brand: 22, price: 22000, unit: 'كرتون', min: 12},
  {name: 'مرتديلا نسور بلدنا بالزيتون 500 غ', cat: 1, brand: 22, price: 25000, unit: 'كرتون', min: 12},
  {name: 'نقانق نسور بلدنا 400 غ', cat: 1, brand: 22, price: 18000, unit: 'كرتون', min: 12},
  {name: 'برغر نسور بلدنا 8 قطع', cat: 1, brand: 22, price: 28000, unit: 'كرتون', min: 6},
  {name: 'شاورما نسور بلدنا مجمدة 500 غ', cat: 1, brand: 22, price: 35000, unit: 'كرتون', min: 6},
  {name: 'كباب نسور بلدنا مجمد 500 غ', cat: 1, brand: 22, price: 38000, unit: 'كرتون', min: 6},

  // ===== مشروبات (category 2) - ~80 products =====
  {name: 'عصير الغوطة برتقال 1 لتر', cat: 2, brand: 12, price: 8000, unit: 'كرتون', min: 12},
  {name: 'عصير الغوطة تفاح 1 لتر', cat: 2, brand: 12, price: 8000, unit: 'كرتون', min: 12},
  {name: 'عصير الغوطة مانجو 1 لتر', cat: 2, brand: 12, price: 8500, unit: 'كرتون', min: 12},
  {name: 'عصير الغوطة فراولة 1 لتر', cat: 2, brand: 12, price: 8500, unit: 'كرتون', min: 12},
  {name: 'عصير الغوطة كوكتيل 1 لتر', cat: 2, brand: 12, price: 8000, unit: 'كرتون', min: 12},
  {name: 'عصير الغوطة أناناس 1 لتر', cat: 2, brand: 12, price: 9000, unit: 'كرتون', min: 12},
  {name: 'عصير الغوطة عنب 1 لتر', cat: 2, brand: 12, price: 8500, unit: 'كرتون', min: 12},
  {name: 'عصير الغوطة رمان 1 لتر', cat: 2, brand: 12, price: 9500, unit: 'كرتون', min: 12},
  {name: 'عصير الغوطة برتقال 250 مل', cat: 2, brand: 12, price: 2500, unit: 'كرتون', min: 24},
  {name: 'عصير الغوطة تفاح 250 مل', cat: 2, brand: 12, price: 2500, unit: 'كرتون', min: 24},
  {name: 'عصير الغوطة مانجو 250 مل', cat: 2, brand: 12, price: 2700, unit: 'كرتون', min: 24},
  {name: 'نكتار الغوطة خوخ 1 لتر', cat: 2, brand: 12, price: 7500, unit: 'كرتون', min: 12},
  {name: 'نكتار الغوطة مشمش 1 لتر', cat: 2, brand: 12, price: 7500, unit: 'كرتون', min: 12},
  // شام مشروبات
  {name: 'شراب التوت شام 750 مل', cat: 2, brand: 14, price: 12000, unit: 'كرتون', min: 12},
  {name: 'شراب الورد شام 750 مل', cat: 2, brand: 14, price: 10000, unit: 'كرتون', min: 12},
  {name: 'شراب التمر هندي شام 750 مل', cat: 2, brand: 14, price: 11000, unit: 'كرتون', min: 12},
  {name: 'شراب الجلاب شام 750 مل', cat: 2, brand: 14, price: 13000, unit: 'كرتون', min: 12},
  {name: 'شراب العرقسوس شام 750 مل', cat: 2, brand: 14, price: 10000, unit: 'كرتون', min: 12},
  {name: 'شراب الليمون بالنعناع شام 750 مل', cat: 2, brand: 14, price: 11000, unit: 'كرتون', min: 12},
  // مياه
  {name: 'مياه أوغاريت 500 مل', cat: 2, brand: 16, price: 1500, unit: 'علبة', min: 24},
  {name: 'مياه أوغاريت 1.5 لتر', cat: 2, brand: 16, price: 3000, unit: 'علبة', min: 12},
  {name: 'مياه أوغاريت 5 لتر', cat: 2, brand: 16, price: 5000, unit: 'غالون', min: 4},
  {name: 'مياه أوغاريت 330 مل', cat: 2, brand: 16, price: 1200, unit: 'علبة', min: 24},
  {name: 'مياه أوغاريت غازية 330 مل', cat: 2, brand: 16, price: 1800, unit: 'علبة', min: 24},
  // خيمي وداوود مشروبات
  {name: 'شاي أحمر KD 250 غ', cat: 2, brand: 38, price: 15000, unit: 'كرتون', min: 24},
  {name: 'شاي أحمر KD 500 غ', cat: 2, brand: 38, price: 28000, unit: 'كرتون', min: 12},
  {name: 'شاي أخضر KD 250 غ', cat: 2, brand: 38, price: 18000, unit: 'كرتون', min: 24},
  {name: 'شاي أعشاب KD بابونج 20 كيس', cat: 2, brand: 38, price: 8000, unit: 'كرتون', min: 24},
  {name: 'شاي أعشاب KD يانسون 20 كيس', cat: 2, brand: 38, price: 8000, unit: 'كرتون', min: 24},
  {name: 'شاي أعشاب KD نعناع 20 كيس', cat: 2, brand: 38, price: 8000, unit: 'كرتون', min: 24},
  {name: 'شاي أعشاب KD زنجبيل 20 كيس', cat: 2, brand: 38, price: 8500, unit: 'كرتون', min: 24},
  {name: 'قهوة عربية KD 200 غ', cat: 2, brand: 38, price: 18000, unit: 'كرتون', min: 24},
  // مشروبات غازية
  {name: 'كولا شام 330 مل', cat: 2, brand: 14, price: 2000, unit: 'علبة', min: 24},
  {name: 'ليمون غازي شام 330 مل', cat: 2, brand: 14, price: 2000, unit: 'علبة', min: 24},
  {name: 'برتقال غازي شام 330 مل', cat: 2, brand: 14, price: 2000, unit: 'علبة', min: 24},
  {name: 'تفاح غازي شام 330 مل', cat: 2, brand: 14, price: 2000, unit: 'علبة', min: 24},
  {name: 'مشروب طاقة شام 250 مل', cat: 2, brand: 14, price: 3500, unit: 'علبة', min: 24},
  {name: 'كولا شام 1 لتر', cat: 2, brand: 14, price: 4500, unit: 'كرتون', min: 12},
  {name: 'كولا شام 2 لتر', cat: 2, brand: 14, price: 6500, unit: 'كرتون', min: 6},
  // عصائر بودرة
  {name: 'عصير بودرة الغوطة برتقال 25 غ', cat: 2, brand: 12, price: 500, unit: 'كرتون', min: 100},
  {name: 'عصير بودرة الغوطة ليمون 25 غ', cat: 2, brand: 12, price: 500, unit: 'كرتون', min: 100},
  {name: 'عصير بودرة الغوطة فراولة 25 غ', cat: 2, brand: 12, price: 500, unit: 'كرتون', min: 100},
  {name: 'عصير بودرة الغوطة مانجو 25 غ', cat: 2, brand: 12, price: 500, unit: 'كرتون', min: 100},
  // حليب ولبن مشروبات
  {name: 'حليب صوفيا بالشوكولاتة 200 مل', cat: 2, brand: 19, price: 4000, unit: 'كرتون', min: 24},
  {name: 'حليب صوفيا بالفراولة 200 مل', cat: 2, brand: 19, price: 4000, unit: 'كرتون', min: 24},
  {name: 'حليب صوفيا بالموز 200 مل', cat: 2, brand: 19, price: 4000, unit: 'كرتون', min: 24},
  {name: 'عيران صوفيا 250 مل', cat: 2, brand: 19, price: 3000, unit: 'كرتون', min: 24},
  {name: 'عيران صوفيا 1 لتر', cat: 2, brand: 19, price: 7000, unit: 'كرتون', min: 12},
  // متة
  {name: 'متة أوغاريت 250 غ', cat: 2, brand: 16, price: 12000, unit: 'كرتون', min: 24},
  {name: 'متة أوغاريت 500 غ', cat: 2, brand: 16, price: 22000, unit: 'كرتون', min: 12},
  {name: 'متة أوغاريت 1 كغ', cat: 2, brand: 16, price: 40000, unit: 'كرتون', min: 6},

  // ===== حلويات (category 3) - ~80 products =====
  // نتاليا شوكولاتة
  {name: 'شوكولاتة نتاليا بالحليب 100 غ', cat: 3, brand: 33, price: 12000, unit: 'كرتون', min: 24},
  {name: 'شوكولاتة نتاليا داكنة 100 غ', cat: 3, brand: 33, price: 13000, unit: 'كرتون', min: 24},
  {name: 'شوكولاتة نتاليا بالبندق 100 غ', cat: 3, brand: 33, price: 15000, unit: 'كرتون', min: 24},
  {name: 'شوكولاتة نتاليا بالفستق 100 غ', cat: 3, brand: 33, price: 16000, unit: 'كرتون', min: 24},
  {name: 'شوكولاتة نتاليا بيضاء 100 غ', cat: 3, brand: 33, price: 12000, unit: 'كرتون', min: 24},
  {name: 'شوكولاتة نتاليا ميني مشكلة 500 غ', cat: 3, brand: 33, price: 45000, unit: 'كرتون', min: 6},
  {name: 'بونبون نتاليا بالكراميل 200 غ', cat: 3, brand: 33, price: 10000, unit: 'كرتون', min: 24},
  {name: 'بونبون نتاليا بالفراولة 200 غ', cat: 3, brand: 33, price: 10000, unit: 'كرتون', min: 24},
  {name: 'ويفر نتاليا بالشوكولاتة 40 غ', cat: 3, brand: 33, price: 2500, unit: 'كرتون', min: 48},
  {name: 'ويفر نتاليا بالبندق 40 غ', cat: 3, brand: 33, price: 2800, unit: 'كرتون', min: 48},
  // ياك
  {name: 'شوكولاتة ياك بالحليب 50 غ', cat: 3, brand: 34, price: 5000, unit: 'كرتون', min: 48},
  {name: 'شوكولاتة ياك داكنة 50 غ', cat: 3, brand: 34, price: 5500, unit: 'كرتون', min: 48},
  {name: 'شوكولاتة ياك بالكراميل 50 غ', cat: 3, brand: 34, price: 5500, unit: 'كرتون', min: 48},
  {name: 'شوكولاتة ياك بالبسكويت 50 غ', cat: 3, brand: 34, price: 5500, unit: 'كرتون', min: 48},
  {name: 'دراجيه ياك بالشوكولاتة 150 غ', cat: 3, brand: 34, price: 8000, unit: 'كرتون', min: 24},
  {name: 'كرات ياك بالبندق 200 غ', cat: 3, brand: 34, price: 12000, unit: 'كرتون', min: 24},
  // عربو حلويات
  {name: 'بقلاوة عربو مشكلة 500 غ', cat: 3, brand: 35, price: 65000, unit: 'كرتون', min: 6},
  {name: 'بقلاوة عربو بالفستق 500 غ', cat: 3, brand: 35, price: 75000, unit: 'كرتون', min: 6},
  {name: 'بقلاوة عربو بالجوز 500 غ', cat: 3, brand: 35, price: 60000, unit: 'كرتون', min: 6},
  {name: 'مبرومة عربو 500 غ', cat: 3, brand: 35, price: 55000, unit: 'كرتون', min: 6},
  {name: 'معمول عربو بالتمر 500 غ', cat: 3, brand: 35, price: 35000, unit: 'كرتون', min: 12},
  {name: 'معمول عربو بالفستق 500 غ', cat: 3, brand: 35, price: 50000, unit: 'كرتون', min: 12},
  {name: 'معمول عربو بالجوز 500 غ', cat: 3, brand: 35, price: 45000, unit: 'كرتون', min: 12},
  {name: 'غريبة عربو 500 غ', cat: 3, brand: 35, price: 30000, unit: 'كرتون', min: 12},
  {name: 'نمورة عربو 500 غ', cat: 3, brand: 35, price: 25000, unit: 'كرتون', min: 12},
  {name: 'كنافة عربو 1 كغ', cat: 3, brand: 35, price: 45000, unit: 'كرتون', min: 6},
  // كتاكيت حلويات
  {name: 'بسكويت كتاكيت بالفانيلا 150 غ', cat: 3, brand: 21, price: 5000, unit: 'كرتون', min: 24},
  {name: 'بسكويت كتاكيت محشو شوكولاتة 150 غ', cat: 3, brand: 21, price: 6000, unit: 'كرتون', min: 24},
  {name: 'بسكويت كتاكيت محشو فراولة 150 غ', cat: 3, brand: 21, price: 6000, unit: 'كرتون', min: 24},
  {name: 'كراكرز كتاكيت مملح 100 غ', cat: 3, brand: 21, price: 3500, unit: 'كرتون', min: 24},
  {name: 'كعك كتاكيت بالسمسم 200 غ', cat: 3, brand: 21, price: 7000, unit: 'كرتون', min: 24},
  {name: 'تورتة كتاكيت بالشوكولاتة 200 غ', cat: 3, brand: 21, price: 8000, unit: 'كرتون', min: 12},
  // حلويات شام
  {name: 'راحة الحلقوم شام 500 غ', cat: 3, brand: 14, price: 22000, unit: 'كرتون', min: 12},
  {name: 'راحة الحلقوم شام بالفستق 500 غ', cat: 3, brand: 14, price: 28000, unit: 'كرتون', min: 12},
  {name: 'نوغا شام 300 غ', cat: 3, brand: 14, price: 18000, unit: 'كرتون', min: 12},
  {name: 'ملبن شام 500 غ', cat: 3, brand: 14, price: 20000, unit: 'كرتون', min: 12},
  {name: 'سكاكر شام مشكلة 1 كغ', cat: 3, brand: 14, price: 25000, unit: 'كرتون', min: 6},
  {name: 'سكاكر شام بالنعناع 200 غ', cat: 3, brand: 14, price: 6000, unit: 'كرتون', min: 24},
  {name: 'سكاكر شام بالفواكه 200 غ', cat: 3, brand: 14, price: 6000, unit: 'كرتون', min: 24},
  {name: 'تمر سكري أوغاريت 500 غ', cat: 3, brand: 16, price: 30000, unit: 'كرتون', min: 12},
  {name: 'تمر مجدول أوغاريت 500 غ', cat: 3, brand: 16, price: 40000, unit: 'كرتون', min: 12},
  {name: 'فواكه مجففة أوغاريت مشكلة 300 غ', cat: 3, brand: 16, price: 25000, unit: 'كرتون', min: 12},
  {name: 'مكسرات أوغاريت مشكلة 500 غ', cat: 3, brand: 16, price: 55000, unit: 'كرتون', min: 6},
  {name: 'فستق حلبي أوغاريت 250 غ', cat: 3, brand: 16, price: 45000, unit: 'كرتون', min: 12},
  {name: 'كاجو أوغاريت محمص 250 غ', cat: 3, brand: 16, price: 35000, unit: 'كرتون', min: 12},
  {name: 'لوز أوغاريت محمص 250 غ', cat: 3, brand: 16, price: 30000, unit: 'كرتون', min: 12},
  {name: 'جوز أوغاريت 250 غ', cat: 3, brand: 16, price: 28000, unit: 'كرتون', min: 12},
  {name: 'بذور دوار الشمس أوغاريت 200 غ', cat: 3, brand: 16, price: 5000, unit: 'كرتون', min: 24},
  {name: 'بذور قرع أوغاريت 200 غ', cat: 3, brand: 16, price: 8000, unit: 'كرتون', min: 24},
  // علكة وسكاكر
  {name: 'علكة شام بالنعناع 100 حبة', cat: 3, brand: 14, price: 15000, unit: 'كرتون', min: 12},
  {name: 'علكة شام بالفراولة 100 حبة', cat: 3, brand: 14, price: 15000, unit: 'كرتون', min: 12},
  {name: 'مصاصة شام مشكلة 50 حبة', cat: 3, brand: 14, price: 12000, unit: 'كرتون', min: 12},

  // ===== منظفات (category 4) - ~90 products =====
  // الوزير
  {name: 'صابون غسيل الوزير 900 غ', cat: 4, brand: 26, price: 12000, unit: 'كرتون', min: 12},
  {name: 'صابون غسيل الوزير 400 غ', cat: 4, brand: 26, price: 6000, unit: 'كرتون', min: 24},
  {name: 'مسحوق غسيل الوزير 3 كغ', cat: 4, brand: 26, price: 35000, unit: 'كرتون', min: 4},
  {name: 'مسحوق غسيل الوزير 6 كغ', cat: 4, brand: 26, price: 65000, unit: 'كرتون', min: 2},
  {name: 'مسحوق غسيل الوزير 1 كغ', cat: 4, brand: 26, price: 14000, unit: 'كرتون', min: 12},
  {name: 'سائل غسيل الوزير 2 لتر', cat: 4, brand: 26, price: 28000, unit: 'كرتون', min: 6},
  {name: 'سائل غسيل الوزير 1 لتر', cat: 4, brand: 26, price: 16000, unit: 'كرتون', min: 12},
  {name: 'منعم أقمشة الوزير 1 لتر', cat: 4, brand: 26, price: 12000, unit: 'كرتون', min: 12},
  {name: 'منعم أقمشة الوزير 2 لتر', cat: 4, brand: 26, price: 22000, unit: 'كرتون', min: 6},
  {name: 'صابون يد الوزير 500 مل', cat: 4, brand: 26, price: 8000, unit: 'كرتون', min: 12},
  {name: 'صابون يد الوزير بالورد 500 مل', cat: 4, brand: 26, price: 8500, unit: 'كرتون', min: 12},
  {name: 'مبيض الوزير 1 لتر', cat: 4, brand: 26, price: 6000, unit: 'كرتون', min: 12},
  {name: 'مبيض الوزير 4 لتر', cat: 4, brand: 26, price: 18000, unit: 'غالون', min: 4},
  // سيكو
  {name: 'سائل جلي سيكو 750 مل', cat: 4, brand: 27, price: 7000, unit: 'كرتون', min: 12},
  {name: 'سائل جلي سيكو 1.5 لتر', cat: 4, brand: 27, price: 12000, unit: 'كرتون', min: 6},
  {name: 'سائل جلي سيكو ليمون 750 مل', cat: 4, brand: 27, price: 7500, unit: 'كرتون', min: 12},
  {name: 'منظف أرضيات سيكو 1 لتر', cat: 4, brand: 27, price: 9000, unit: 'كرتون', min: 12},
  {name: 'منظف أرضيات سيكو صنوبر 1 لتر', cat: 4, brand: 27, price: 9500, unit: 'كرتون', min: 12},
  {name: 'منظف أرضيات سيكو لافندر 1 لتر', cat: 4, brand: 27, price: 9500, unit: 'كرتون', min: 12},
  {name: 'منظف زجاج سيكو 500 مل', cat: 4, brand: 27, price: 5000, unit: 'كرتون', min: 12},
  {name: 'منظف حمامات سيكو 750 مل', cat: 4, brand: 27, price: 8000, unit: 'كرتون', min: 12},
  {name: 'منظف مطابخ سيكو 750 مل', cat: 4, brand: 27, price: 8500, unit: 'كرتون', min: 12},
  {name: 'مزيل دهون سيكو 500 مل', cat: 4, brand: 27, price: 7000, unit: 'كرتون', min: 12},
  {name: 'معقم سيكو 1 لتر', cat: 4, brand: 27, price: 10000, unit: 'كرتون', min: 12},
  // كرمل
  {name: 'سائل جلي كرمل 1 لتر', cat: 4, brand: 28, price: 8000, unit: 'كرتون', min: 12},
  {name: 'سائل جلي كرمل تفاح 1 لتر', cat: 4, brand: 28, price: 8500, unit: 'كرتون', min: 12},
  {name: 'منظف أرضيات كرمل 2 لتر', cat: 4, brand: 28, price: 14000, unit: 'كرتون', min: 6},
  {name: 'منظف زجاج كرمل 500 مل', cat: 4, brand: 28, price: 5500, unit: 'كرتون', min: 12},
  {name: 'معقم أرضيات كرمل 1 لتر', cat: 4, brand: 28, price: 9000, unit: 'كرتون', min: 12},
  {name: 'صابون سائل كرمل 500 مل', cat: 4, brand: 28, price: 7000, unit: 'كرتون', min: 12},
  // جوري الشام
  {name: 'مسحوق غسيل جوري الشام 3 كغ', cat: 4, brand: 29, price: 30000, unit: 'كرتون', min: 4},
  {name: 'مسحوق غسيل جوري الشام 1 كغ', cat: 4, brand: 29, price: 12000, unit: 'كرتون', min: 12},
  {name: 'منعم أقمشة جوري الشام ورد 1 لتر', cat: 4, brand: 29, price: 10000, unit: 'كرتون', min: 12},
  {name: 'منعم أقمشة جوري الشام ياسمين 1 لتر', cat: 4, brand: 29, price: 10000, unit: 'كرتون', min: 12},
  {name: 'سائل جلي جوري الشام 750 مل', cat: 4, brand: 29, price: 7000, unit: 'كرتون', min: 12},
  {name: 'معطر جو جوري الشام 300 مل', cat: 4, brand: 29, price: 8000, unit: 'كرتون', min: 24},
  {name: 'معطر جو جوري الشام لافندر 300 مل', cat: 4, brand: 29, price: 8000, unit: 'كرتون', min: 24},
  // ريفا
  {name: 'سائل جلي ريفا 1 لتر', cat: 4, brand: 30, price: 7500, unit: 'كرتون', min: 12},
  {name: 'منظف أرضيات ريفا 1 لتر', cat: 4, brand: 30, price: 8500, unit: 'كرتون', min: 12},
  {name: 'منظف حمامات ريفا 750 مل', cat: 4, brand: 30, price: 7500, unit: 'كرتون', min: 12},
  {name: 'مبيض ريفا 1 لتر', cat: 4, brand: 30, price: 5500, unit: 'كرتون', min: 12},
  {name: 'صابون سائل ريفا 500 مل', cat: 4, brand: 30, price: 6500, unit: 'كرتون', min: 12},
  // لوربير صابون غار
  {name: 'صابون غار لوربير كلاسيك 200 غ', cat: 4, brand: 31, price: 15000, unit: 'كرتون', min: 24},
  {name: 'صابون غار لوربير بالعسل 200 غ', cat: 4, brand: 31, price: 16000, unit: 'كرتون', min: 24},
  {name: 'صابون غار لوربير بالبابونج 200 غ', cat: 4, brand: 31, price: 16000, unit: 'كرتون', min: 24},
  {name: 'صابون غار لوربير بالورد 200 غ', cat: 4, brand: 31, price: 16000, unit: 'كرتون', min: 24},
  {name: 'صابون غار لوربير 40% زيت غار 200 غ', cat: 4, brand: 31, price: 25000, unit: 'كرتون', min: 24},
  {name: 'صابون غار لوربير سائل 500 مل', cat: 4, brand: 31, price: 22000, unit: 'كرتون', min: 12},
  {name: 'شامبو لوربير بزيت الغار 400 مل', cat: 4, brand: 31, price: 20000, unit: 'كرتون', min: 12},
  // سيجما
  {name: 'مسحوق غسيل سيجما 2 كغ', cat: 4, brand: 32, price: 22000, unit: 'كرتون', min: 6},
  {name: 'سائل غسيل سيجما 2 لتر', cat: 4, brand: 32, price: 25000, unit: 'كرتون', min: 6},
  {name: 'سائل جلي سيجما 1 لتر', cat: 4, brand: 32, price: 7500, unit: 'كرتون', min: 12},
  {name: 'منظف متعدد الاستعمال سيجما 1 لتر', cat: 4, brand: 32, price: 9000, unit: 'كرتون', min: 12},
  // لينكس
  {name: 'سائل جلي لينكس 750 مل', cat: 4, brand: 39, price: 6500, unit: 'كرتون', min: 12},
  {name: 'منظف أرضيات لينكس 1 لتر', cat: 4, brand: 39, price: 8000, unit: 'كرتون', min: 12},
  {name: 'منظف زجاج لينكس 500 مل', cat: 4, brand: 39, price: 5000, unit: 'كرتون', min: 12},
  {name: 'مبيض لينكس 2 لتر', cat: 4, brand: 39, price: 9000, unit: 'كرتون', min: 6},
  // المتحدة
  {name: 'صابون المتحدة بالورد 125 غ × 6', cat: 4, brand: 40, price: 12000, unit: 'كرتون', min: 12},
  {name: 'صابون المتحدة بالياسمين 125 غ × 6', cat: 4, brand: 40, price: 12000, unit: 'كرتون', min: 12},
  {name: 'صابون المتحدة غسيل 200 غ × 5', cat: 4, brand: 40, price: 10000, unit: 'كرتون', min: 12},
  {name: 'ملمع أثاث المتحدة 300 مل', cat: 4, brand: 40, price: 7000, unit: 'كرتون', min: 24},
  {name: 'معطر أقمشة المتحدة 1 لتر', cat: 4, brand: 40, price: 11000, unit: 'كرتون', min: 12},

  // ===== العناية الشخصية (category 5) - ~80 products =====
  // بيرين
  {name: 'شامبو بيرين للشعر العادي 400 مل', cat: 5, brand: 36, price: 18000, unit: 'كرتون', min: 12},
  {name: 'شامبو بيرين للشعر الجاف 400 مل', cat: 5, brand: 36, price: 18000, unit: 'كرتون', min: 12},
  {name: 'شامبو بيرين للشعر الدهني 400 مل', cat: 5, brand: 36, price: 18000, unit: 'كرتون', min: 12},
  {name: 'شامبو بيرين ضد القشرة 400 مل', cat: 5, brand: 36, price: 20000, unit: 'كرتون', min: 12},
  {name: 'شامبو بيرين بالكيراتين 400 مل', cat: 5, brand: 36, price: 22000, unit: 'كرتون', min: 12},
  {name: 'شامبو بيرين للأطفال 300 مل', cat: 5, brand: 36, price: 15000, unit: 'كرتون', min: 12},
  {name: 'بلسم بيرين للشعر 300 مل', cat: 5, brand: 36, price: 16000, unit: 'كرتون', min: 12},
  {name: 'كريم شعر بيرين بالكيراتين 200 مل', cat: 5, brand: 36, price: 14000, unit: 'كرتون', min: 12},
  {name: 'جل شعر بيرين 250 مل', cat: 5, brand: 36, price: 12000, unit: 'كرتون', min: 12},
  {name: 'سبراي شعر بيرين 200 مل', cat: 5, brand: 36, price: 10000, unit: 'كرتون', min: 12},
  {name: 'غسول وجه بيرين 200 مل', cat: 5, brand: 36, price: 15000, unit: 'كرتون', min: 12},
  {name: 'كريم وجه بيرين مرطب 100 مل', cat: 5, brand: 36, price: 18000, unit: 'كرتون', min: 12},
  {name: 'كريم يدين بيرين 100 مل', cat: 5, brand: 36, price: 8000, unit: 'كرتون', min: 24},
  {name: 'لوشن جسم بيرين 400 مل', cat: 5, brand: 36, price: 20000, unit: 'كرتون', min: 12},
  {name: 'صابون بيرين بالعسل 125 غ', cat: 5, brand: 36, price: 4000, unit: 'كرتون', min: 48},
  {name: 'صابون بيرين بالورد 125 غ', cat: 5, brand: 36, price: 4000, unit: 'كرتون', min: 48},
  {name: 'صابون بيرين بزيت الزيتون 125 غ', cat: 5, brand: 36, price: 4500, unit: 'كرتون', min: 48},
  // لوربير عناية شخصية
  {name: 'شامبو لوربير بالحناء 400 مل', cat: 5, brand: 31, price: 22000, unit: 'كرتون', min: 12},
  {name: 'شامبو لوربير بالبابونج 400 مل', cat: 5, brand: 31, price: 22000, unit: 'كرتون', min: 12},
  {name: 'غسول جسم لوربير 500 مل', cat: 5, brand: 31, price: 25000, unit: 'كرتون', min: 12},
  {name: 'كريم لوربير بزيت الغار 100 مل', cat: 5, brand: 31, price: 15000, unit: 'كرتون', min: 24},
  {name: 'صابون لوربير للبشرة الحساسة 150 غ', cat: 5, brand: 31, price: 12000, unit: 'كرتون', min: 24},
  // جوري الشام عناية
  {name: 'شامبو جوري الشام بالورد 400 مل', cat: 5, brand: 29, price: 16000, unit: 'كرتون', min: 12},
  {name: 'شامبو جوري الشام بالياسمين 400 مل', cat: 5, brand: 29, price: 16000, unit: 'كرتون', min: 12},
  {name: 'غسول جسم جوري الشام 500 مل', cat: 5, brand: 29, price: 18000, unit: 'كرتون', min: 12},
  {name: 'كريم جسم جوري الشام 200 مل', cat: 5, brand: 29, price: 14000, unit: 'كرتون', min: 12},
  {name: 'عطر جوري الشام للرجال 100 مل', cat: 5, brand: 29, price: 35000, unit: 'كرتون', min: 6},
  {name: 'عطر جوري الشام للنساء 100 مل', cat: 5, brand: 29, price: 35000, unit: 'كرتون', min: 6},
  {name: 'مزيل عرق جوري الشام رول 50 مل', cat: 5, brand: 29, price: 8000, unit: 'كرتون', min: 24},
  {name: 'مزيل عرق جوري الشام سبراي 150 مل', cat: 5, brand: 29, price: 12000, unit: 'كرتون', min: 12},
  // المتحدة عناية
  {name: 'صابون المتحدة بالحليب 125 غ × 6', cat: 5, brand: 40, price: 14000, unit: 'كرتون', min: 12},
  {name: 'صابون المتحدة بالعسل 125 غ × 6', cat: 5, brand: 40, price: 14000, unit: 'كرتون', min: 12},
  // أوغاريت عناية
  {name: 'معجون أسنان أوغاريت نعناع 100 مل', cat: 5, brand: 16, price: 6000, unit: 'كرتون', min: 24},
  {name: 'معجون أسنان أوغاريت أطفال 50 مل', cat: 5, brand: 16, price: 4000, unit: 'كرتون', min: 24},
  {name: 'فرشاة أسنان أوغاريت ناعمة', cat: 5, brand: 16, price: 3000, unit: 'كرتون', min: 48},
  {name: 'فرشاة أسنان أوغاريت متوسطة', cat: 5, brand: 16, price: 3000, unit: 'كرتون', min: 48},
  {name: 'مناديل مبللة أوغاريت 80 منديل', cat: 5, brand: 16, price: 5000, unit: 'كرتون', min: 24},
  {name: 'مناديل مبللة أوغاريت أطفال 72 منديل', cat: 5, brand: 16, price: 5500, unit: 'كرتون', min: 24},
  {name: 'مناديل ورقية أوغاريت 200 منديل', cat: 5, brand: 16, price: 4000, unit: 'كرتون', min: 24},
  {name: 'مناديل ورقية أوغاريت 100 منديل', cat: 5, brand: 16, price: 2500, unit: 'كرتون', min: 48},
  {name: 'قطن طبي أوغاريت 100 غ', cat: 5, brand: 16, price: 5000, unit: 'كرتون', min: 24},
  {name: 'حفاضات أوغاريت مقاس 3 × 30', cat: 5, brand: 16, price: 25000, unit: 'كرتون', min: 4},
  {name: 'حفاضات أوغاريت مقاس 4 × 30', cat: 5, brand: 16, price: 27000, unit: 'كرتون', min: 4},
  {name: 'حفاضات أوغاريت مقاس 5 × 30', cat: 5, brand: 16, price: 29000, unit: 'كرتون', min: 4},
  // شام عناية
  {name: 'كولونيا شام ليمون 200 مل', cat: 5, brand: 14, price: 10000, unit: 'كرتون', min: 12},
  {name: 'كولونيا شام لافندر 200 مل', cat: 5, brand: 14, price: 10000, unit: 'كرتون', min: 12},
  {name: 'معقم يدين شام 250 مل', cat: 5, brand: 14, price: 7000, unit: 'كرتون', min: 24},
  {name: 'معقم يدين شام 500 مل', cat: 5, brand: 14, price: 12000, unit: 'كرتون', min: 12},

  // ===== معلبات (category 6) - ~80 products =====
  // الدرة
  {name: 'فول مدمس الدرة 400 غ', cat: 6, brand: 23, price: 5000, unit: 'كرتون', min: 24},
  {name: 'فول مدمس الدرة 800 غ', cat: 6, brand: 23, price: 9000, unit: 'كرتون', min: 12},
  {name: 'حمص بالطحينة الدرة 400 غ', cat: 6, brand: 23, price: 6000, unit: 'كرتون', min: 24},
  {name: 'بابا غنوج الدرة 400 غ', cat: 6, brand: 23, price: 7000, unit: 'كرتون', min: 24},
  {name: 'فاصولياء بيضاء بالصلصة الدرة 400 غ', cat: 6, brand: 23, price: 5500, unit: 'كرتون', min: 24},
  {name: 'ذرة حلوة الدرة 340 غ', cat: 6, brand: 23, price: 6000, unit: 'كرتون', min: 24},
  {name: 'بازلاء خضراء الدرة 400 غ', cat: 6, brand: 23, price: 5000, unit: 'كرتون', min: 24},
  {name: 'فاصولياء خضراء الدرة 400 غ', cat: 6, brand: 23, price: 5500, unit: 'كرتون', min: 24},
  {name: 'تونة الدرة بالزيت 185 غ', cat: 6, brand: 23, price: 12000, unit: 'كرتون', min: 24},
  {name: 'تونة الدرة بالماء 185 غ', cat: 6, brand: 23, price: 11000, unit: 'كرتون', min: 24},
  {name: 'سردين الدرة بالزيت 125 غ', cat: 6, brand: 23, price: 8000, unit: 'كرتون', min: 24},
  // مياس معلبات
  {name: 'صلصة طماطم مياس 400 غ', cat: 6, brand: 18, price: 5000, unit: 'كرتون', min: 24},
  {name: 'صلصة طماطم مياس 800 غ', cat: 6, brand: 18, price: 9000, unit: 'كرتون', min: 12},
  {name: 'معجون طماطم مياس 200 غ', cat: 6, brand: 18, price: 3500, unit: 'كرتون', min: 24},
  {name: 'معجون طماطم مياس 400 غ', cat: 6, brand: 18, price: 6000, unit: 'كرتون', min: 24},
  {name: 'معجون طماطم مياس 800 غ', cat: 6, brand: 18, price: 10000, unit: 'كرتون', min: 12},
  {name: 'طماطم مقشرة مياس 400 غ', cat: 6, brand: 18, price: 4500, unit: 'كرتون', min: 24},
  {name: 'مخلل خيار مياس 650 غ', cat: 6, brand: 18, price: 8000, unit: 'كرتون', min: 12},
  {name: 'مخلل مشكل مياس 650 غ', cat: 6, brand: 18, price: 9000, unit: 'كرتون', min: 12},
  {name: 'مخلل فليفلة مياس 650 غ', cat: 6, brand: 18, price: 8500, unit: 'كرتون', min: 12},
  {name: 'مخلل زيتون مياس 650 غ', cat: 6, brand: 18, price: 12000, unit: 'كرتون', min: 12},
  {name: 'مخلل لفت مياس 650 غ', cat: 6, brand: 18, price: 7500, unit: 'كرتون', min: 12},
  // طيبة معلبات
  {name: 'لانشون طيبة دجاج 340 غ', cat: 6, brand: 17, price: 12000, unit: 'كرتون', min: 24},
  {name: 'لانشون طيبة لحم 340 غ', cat: 6, brand: 17, price: 14000, unit: 'كرتون', min: 24},
  {name: 'لانشون طيبة بالزيتون 340 غ', cat: 6, brand: 17, price: 13000, unit: 'كرتون', min: 24},
  {name: 'لانشون طيبة بالفلفل 340 غ', cat: 6, brand: 17, price: 13000, unit: 'كرتون', min: 24},
  {name: 'مرتديلا طيبة 500 غ', cat: 6, brand: 17, price: 15000, unit: 'كرتون', min: 12},
  {name: 'كورنبيف طيبة 340 غ', cat: 6, brand: 17, price: 16000, unit: 'كرتون', min: 24},
  // الإيمان معلبات
  {name: 'فول الإيمان بالزيت 400 غ', cat: 6, brand: 25, price: 4500, unit: 'كرتون', min: 24},
  {name: 'فول الإيمان بالطماطم 400 غ', cat: 6, brand: 25, price: 4500, unit: 'كرتون', min: 24},
  {name: 'حمص الإيمان 400 غ', cat: 6, brand: 25, price: 5500, unit: 'كرتون', min: 24},
  {name: 'فاصولياء الإيمان بالصلصة 400 غ', cat: 6, brand: 25, price: 5000, unit: 'كرتون', min: 24},
  {name: 'بازلاء الإيمان 400 غ', cat: 6, brand: 25, price: 4500, unit: 'كرتون', min: 24},
  // السعادة معلبات
  {name: 'مربى السعادة مشمش 450 غ', cat: 6, brand: 24, price: 10000, unit: 'كرتون', min: 12},
  {name: 'مربى السعادة فراولة 450 غ', cat: 6, brand: 24, price: 11000, unit: 'كرتون', min: 12},
  {name: 'مربى السعادة تين 450 غ', cat: 6, brand: 24, price: 12000, unit: 'كرتون', min: 12},
  {name: 'مربى السعادة كرز 450 غ', cat: 6, brand: 24, price: 13000, unit: 'كرتون', min: 12},
  {name: 'مربى السعادة برتقال 450 غ', cat: 6, brand: 24, price: 10000, unit: 'كرتون', min: 12},
  {name: 'عسل السعادة طبيعي 500 غ', cat: 6, brand: 24, price: 45000, unit: 'كرتون', min: 6},
  {name: 'عسل السعادة طبيعي 1 كغ', cat: 6, brand: 24, price: 82000, unit: 'كرتون', min: 4},
  {name: 'عسل السعادة جبلي 500 غ', cat: 6, brand: 24, price: 65000, unit: 'كرتون', min: 6},
  // أوغاريت معلبات
  {name: 'زيتون أوغاريت مسلوق 500 غ', cat: 6, brand: 16, price: 15000, unit: 'كرتون', min: 12},
  {name: 'زيتون أوغاريت محشو 350 غ', cat: 6, brand: 16, price: 18000, unit: 'كرتون', min: 12},
  {name: 'كبيس أوغاريت خيار 1 كغ', cat: 6, brand: 16, price: 12000, unit: 'كرتون', min: 6},
  {name: 'كبيس أوغاريت لفت 1 كغ', cat: 6, brand: 16, price: 10000, unit: 'كرتون', min: 6},
  {name: 'مكدوس أوغاريت 400 غ', cat: 6, brand: 16, price: 20000, unit: 'كرتون', min: 12},
  // الغوطة معلبات
  {name: 'صلصة طماطم الغوطة 400 غ', cat: 6, brand: 12, price: 4500, unit: 'كرتون', min: 24},
  {name: 'معجون طماطم الغوطة 200 غ', cat: 6, brand: 12, price: 3000, unit: 'كرتون', min: 24},
  {name: 'فول الغوطة حب 400 غ', cat: 6, brand: 12, price: 4000, unit: 'كرتون', min: 24},
  {name: 'حمص الغوطة حب 400 غ', cat: 6, brand: 12, price: 5000, unit: 'كرتون', min: 24},
  {name: 'كاتشب الغوطة 500 غ', cat: 6, brand: 12, price: 7000, unit: 'كرتون', min: 12},
  {name: 'مايونيز الغوطة 500 غ', cat: 6, brand: 12, price: 8000, unit: 'كرتون', min: 12},
  {name: 'خردل الغوطة 200 غ', cat: 6, brand: 12, price: 4000, unit: 'كرتون', min: 24},
  // غصن البان معلبات
  {name: 'زعتر مخلوط غصن البان 1 كغ', cat: 6, brand: 13, price: 35000, unit: 'كرتون', min: 6},
  {name: 'سمنة غصن البان 1 كغ', cat: 6, brand: 13, price: 42000, unit: 'كرتون', min: 6},
  {name: 'سمنة غصن البان 500 غ', cat: 6, brand: 13, price: 23000, unit: 'كرتون', min: 12},
  {name: 'طحينة غصن البان 500 غ', cat: 6, brand: 13, price: 16000, unit: 'كرتون', min: 12},
  {name: 'حلاوة غصن البان سادة 500 غ', cat: 6, brand: 13, price: 20000, unit: 'كرتون', min: 12},
  {name: 'حلاوة غصن البان بالفستق 500 غ', cat: 6, brand: 13, price: 26000, unit: 'كرتون', min: 12},
  {name: 'دبس رمان غصن البان 330 مل', cat: 6, brand: 13, price: 10000, unit: 'كرتون', min: 12},
  {name: 'خل أبيض غصن البان 500 مل', cat: 6, brand: 13, price: 4000, unit: 'كرتون', min: 24},
  {name: 'خل تفاح غصن البان 500 مل', cat: 6, brand: 13, price: 6000, unit: 'كرتون', min: 24},
  // شام معلبات
  {name: 'فلافل شام جاهزة 400 غ', cat: 6, brand: 14, price: 7000, unit: 'كرتون', min: 24},
  {name: 'كشك شام 500 غ', cat: 6, brand: 14, price: 15000, unit: 'كرتون', min: 12},
  {name: 'شنكليش شام 250 غ', cat: 6, brand: 14, price: 18000, unit: 'كرتون', min: 12},
];

async function seed() {
  const client = await pool.connect();
  try {
    let inserted = 0;
    const batchSize = 50;
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      const values = [];
      const params = [];
      let paramIdx = 1;
      
      for (const p of batch) {
        const imgArr = images[p.cat];
        const img = imgArr[Math.floor(Math.random() * imgArr.length)];
        const stock = rand(50, 500);
        const origPrice = p.price > 5000 ? Math.round(p.price * (1 + Math.random() * 0.2)) : null;
        
        values.push(`($${paramIdx}, $${paramIdx+1}, $${paramIdx+2}, $${paramIdx+3}, $${paramIdx+4}, $${paramIdx+5}, $${paramIdx+6}, $${paramIdx+7}, $${paramIdx+8})`);
        params.push(p.name, p.cat, p.brand, p.price, origPrice, img, p.min, p.unit, stock);
        paramIdx += 9;
      }
      
      const sql = `INSERT INTO products (name, category_id, brand_id, price, original_price, image, min_order, unit, stock, price_currency) VALUES ${values.map(v => v.replace(/\)$/, ", 'SYP')")).join(', ')} ON CONFLICT DO NOTHING`;
      
      await client.query(sql, params);
      inserted += batch.length;
      console.log(`Inserted batch: ${inserted}/${products.length}`);
    }
    
    console.log(`\nTotal products defined: ${products.length}`);
    const result = await client.query('SELECT COUNT(*) as total FROM products');
    console.log(`Total products in database: ${result.rows[0].total}`);
    
    const byCat = await client.query('SELECT c.name, COUNT(p.id) as count FROM products p JOIN categories c ON p.category_id = c.id GROUP BY c.name ORDER BY count DESC');
    console.log('\nProducts per category:');
    byCat.rows.forEach(r => console.log(`  ${r.name}: ${r.count}`));
    
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(console.error);
