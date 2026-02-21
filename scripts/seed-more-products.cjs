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

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

const products = [
  // مواد غذائية إضافية
  {name: 'سمنة غدير حيوانية 1 كغ', cat: 1, brand: 11, price: 55000, unit: 'كرتون', min: 6},
  {name: 'سمنة غدير حيوانية 500 غ', cat: 1, brand: 11, price: 30000, unit: 'كرتون', min: 12},
  {name: 'سمنة غدير نباتية 1 كغ', cat: 1, brand: 11, price: 28000, unit: 'كرتون', min: 6},
  {name: 'زيت سمسم غدير 250 مل', cat: 1, brand: 11, price: 18000, unit: 'كرتون', min: 24},
  {name: 'ملح الوحدة ناعم 1 كغ', cat: 1, brand: 15, price: 2000, unit: 'كرتون', min: 24},
  {name: 'ملح الوحدة خشن 1 كغ', cat: 1, brand: 15, price: 1800, unit: 'كرتون', min: 24},
  {name: 'ملح الوحدة معالج باليود 500 غ', cat: 1, brand: 15, price: 1500, unit: 'كرتون', min: 48},
  {name: 'خميرة الوحدة فورية 100 غ', cat: 1, brand: 15, price: 3000, unit: 'كرتون', min: 48},
  {name: 'بيكنغ باودر الوحدة 100 غ', cat: 1, brand: 15, price: 2500, unit: 'كرتون', min: 48},
  {name: 'سميد الوحدة ناعم 1 كغ', cat: 1, brand: 15, price: 5000, unit: 'كرتون', min: 12},
  {name: 'سميد الوحدة خشن 1 كغ', cat: 1, brand: 15, price: 5000, unit: 'كرتون', min: 12},
  {name: 'شوفان الخير 500 غ', cat: 1, brand: 37, price: 12000, unit: 'كرتون', min: 12},
  {name: 'ذرة صفراء الخير 1 كغ', cat: 1, brand: 37, price: 8000, unit: 'كرتون', min: 12},
  {name: 'سمسم الخير 250 غ', cat: 1, brand: 37, price: 8000, unit: 'كرتون', min: 24},
  {name: 'حبة البركة الخير 100 غ', cat: 1, brand: 37, price: 6000, unit: 'كرتون', min: 24},
  {name: 'جبنة قريش صوفيا 500 غ', cat: 1, brand: 19, price: 15000, unit: 'كرتون', min: 12},
  {name: 'جبنة مضفرة صوفيا 250 غ', cat: 1, brand: 19, price: 20000, unit: 'كرتون', min: 12},
  {name: 'جبنة شيدر صوفيا 200 غ', cat: 1, brand: 19, price: 16000, unit: 'كرتون', min: 12},
  {name: 'زبادي صوفيا 500 غ', cat: 1, brand: 19, price: 7000, unit: 'كرتون', min: 12},
  {name: 'زبادي صوفيا بالفراولة 150 غ', cat: 1, brand: 19, price: 4000, unit: 'كرتون', min: 24},
  // معكرونة وشعيرية إضافية
  {name: 'معكرونة الغوطة فيتوتشيني 500 غ', cat: 1, brand: 12, price: 6000, unit: 'كرتون', min: 24},
  {name: 'معكرونة الغوطة ماكروني 500 غ', cat: 1, brand: 12, price: 5200, unit: 'كرتون', min: 24},
  {name: 'معكرونة الغوطة قمح كامل 500 غ', cat: 1, brand: 12, price: 7000, unit: 'كرتون', min: 24},
  {name: 'كعك شام مالح 500 غ', cat: 1, brand: 14, price: 8000, unit: 'كرتون', min: 12},
  {name: 'رقائق خبز شام 200 غ', cat: 1, brand: 14, price: 5000, unit: 'كرتون', min: 24},

  // مشروبات إضافية
  {name: 'عصير الغوطة جوافة 1 لتر', cat: 2, brand: 12, price: 8500, unit: 'كرتون', min: 12},
  {name: 'عصير الغوطة توت 1 لتر', cat: 2, brand: 12, price: 9000, unit: 'كرتون', min: 12},
  {name: 'عصير الغوطة ليمون نعناع 1 لتر', cat: 2, brand: 12, price: 8500, unit: 'كرتون', min: 12},
  {name: 'عصير الغوطة جزر 1 لتر', cat: 2, brand: 12, price: 7500, unit: 'كرتون', min: 12},
  {name: 'عصير الغوطة جوافة 250 مل', cat: 2, brand: 12, price: 2700, unit: 'كرتون', min: 24},
  {name: 'مياه شام معدنية 500 مل', cat: 2, brand: 14, price: 1200, unit: 'علبة', min: 24},
  {name: 'مياه شام معدنية 1.5 لتر', cat: 2, brand: 14, price: 2500, unit: 'علبة', min: 12},
  {name: 'مياه شام غازية ليمون 330 مل', cat: 2, brand: 14, price: 2000, unit: 'علبة', min: 24},
  {name: 'قهوة الحموي سريعة التحضير 20 ظرف', cat: 2, brand: 20, price: 15000, unit: 'كرتون', min: 24},
  {name: 'قهوة الحموي 3 في 1 × 20', cat: 2, brand: 20, price: 18000, unit: 'كرتون', min: 24},
  {name: 'كاكاو الحموي 200 غ', cat: 2, brand: 20, price: 12000, unit: 'كرتون', min: 24},
  {name: 'سحلب الحموي 200 غ', cat: 2, brand: 20, price: 10000, unit: 'كرتون', min: 24},
  {name: 'شاي KD سيلاني 100 كيس', cat: 2, brand: 38, price: 22000, unit: 'كرتون', min: 12},
  {name: 'شاي KD إيرل غري 25 كيس', cat: 2, brand: 38, price: 10000, unit: 'كرتون', min: 24},
  {name: 'نسكافيه KD 200 غ', cat: 2, brand: 38, price: 35000, unit: 'كرتون', min: 12},

  // حلويات إضافية
  {name: 'شوكولاتة نتاليا بالكراميل 100 غ', cat: 3, brand: 33, price: 14000, unit: 'كرتون', min: 24},
  {name: 'شوكولاتة نتاليا بالتوفي 100 غ', cat: 3, brand: 33, price: 14000, unit: 'كرتون', min: 24},
  {name: 'شوكولاتة نتاليا صندوق هدايا 250 غ', cat: 3, brand: 33, price: 30000, unit: 'كرتون', min: 6},
  {name: 'بسكويت عربو بالسمسم 300 غ', cat: 3, brand: 35, price: 12000, unit: 'كرتون', min: 12},
  {name: 'كعك عربو بالتمر 400 غ', cat: 3, brand: 35, price: 18000, unit: 'كرتون', min: 12},
  {name: 'هريسة عربو بالجوز 500 غ', cat: 3, brand: 35, price: 25000, unit: 'كرتون', min: 12},
  {name: 'بسبوسة عربو 500 غ', cat: 3, brand: 35, price: 22000, unit: 'كرتون', min: 12},
  {name: 'ويفر ياك بالفانيلا 40 غ', cat: 3, brand: 34, price: 2500, unit: 'كرتون', min: 48},
  {name: 'ويفر ياك بالفراولة 40 غ', cat: 3, brand: 34, price: 2500, unit: 'كرتون', min: 48},
  {name: 'تشيبس كتاكيت باربكيو 30 غ', cat: 3, brand: 21, price: 1500, unit: 'كرتون', min: 48},
  {name: 'بوب كورن كتاكيت بالجبنة 80 غ', cat: 3, brand: 21, price: 3000, unit: 'كرتون', min: 24},
  {name: 'بوب كورن كتاكيت بالكراميل 80 غ', cat: 3, brand: 21, price: 3500, unit: 'كرتون', min: 24},
  {name: 'سكاكر نتاليا بالقهوة 200 غ', cat: 3, brand: 33, price: 8000, unit: 'كرتون', min: 24},
  {name: 'سكاكر نتاليا بالنعناع 200 غ', cat: 3, brand: 33, price: 7000, unit: 'كرتون', min: 24},
  {name: 'ملبس أوغاريت لوز 300 غ', cat: 3, brand: 16, price: 22000, unit: 'كرتون', min: 12},
  {name: 'حلقوم أوغاريت بالورد 300 غ', cat: 3, brand: 16, price: 15000, unit: 'كرتون', min: 12},

  // منظفات إضافية
  {name: 'سائل غسالة أطباق الوزير 1 لتر', cat: 4, brand: 26, price: 15000, unit: 'كرتون', min: 12},
  {name: 'معطر جو الوزير لافندر 300 مل', cat: 4, brand: 26, price: 7500, unit: 'كرتون', min: 24},
  {name: 'معطر جو الوزير ورد 300 مل', cat: 4, brand: 26, price: 7500, unit: 'كرتون', min: 24},
  {name: 'منظف سجاد الوزير 500 مل', cat: 4, brand: 26, price: 12000, unit: 'كرتون', min: 12},
  {name: 'معقم أرضيات سيكو صنوبر 2 لتر', cat: 4, brand: 27, price: 16000, unit: 'كرتون', min: 6},
  {name: 'مزيل بقع سيكو 500 مل', cat: 4, brand: 27, price: 8000, unit: 'كرتون', min: 12},
  {name: 'منظف فرن سيكو 500 مل', cat: 4, brand: 27, price: 9000, unit: 'كرتون', min: 12},
  {name: 'سائل غسالة صحون كرمل 1 لتر', cat: 4, brand: 28, price: 14000, unit: 'كرتون', min: 12},
  {name: 'منظف سيراميك كرمل 750 مل', cat: 4, brand: 28, price: 8000, unit: 'كرتون', min: 12},
  {name: 'مبيض جوري الشام 1 لتر', cat: 4, brand: 29, price: 5500, unit: 'كرتون', min: 12},
  {name: 'منظف أرضيات جوري الشام صنوبر 1 لتر', cat: 4, brand: 29, price: 8500, unit: 'كرتون', min: 12},
  {name: 'سائل غسالة ملابس ريفا 2 لتر', cat: 4, brand: 30, price: 22000, unit: 'كرتون', min: 6},
  {name: 'منعم أقمشة ريفا 1 لتر', cat: 4, brand: 30, price: 10000, unit: 'كرتون', min: 12},
  {name: 'مسحوق غسيل لينكس 2 كغ', cat: 4, brand: 39, price: 20000, unit: 'كرتون', min: 6},
  {name: 'سائل جلي لينكس ليمون 750 مل', cat: 4, brand: 39, price: 7000, unit: 'كرتون', min: 12},
  {name: 'إسفنج المتحدة للجلي × 6', cat: 4, brand: 40, price: 3000, unit: 'كرتون', min: 24},
  {name: 'قفازات المتحدة مطاطية × 12', cat: 4, brand: 40, price: 8000, unit: 'كرتون', min: 12},
  {name: 'أكياس نفايات المتحدة 50 لتر × 20', cat: 4, brand: 40, price: 5000, unit: 'كرتون', min: 24},

  // عناية شخصية إضافية
  {name: 'مزيل عرق بيرين رول رجالي 50 مل', cat: 5, brand: 36, price: 7000, unit: 'كرتون', min: 24},
  {name: 'مزيل عرق بيرين رول نسائي 50 مل', cat: 5, brand: 36, price: 7000, unit: 'كرتون', min: 24},
  {name: 'مزيل عرق بيرين سبراي 150 مل', cat: 5, brand: 36, price: 10000, unit: 'كرتون', min: 12},
  {name: 'واقي شمس بيرين SPF50 100 مل', cat: 5, brand: 36, price: 22000, unit: 'كرتون', min: 12},
  {name: 'كريم حلاقة بيرين 200 مل', cat: 5, brand: 36, price: 12000, unit: 'كرتون', min: 12},
  {name: 'شفرات حلاقة بيرين × 5', cat: 5, brand: 36, price: 8000, unit: 'كرتون', min: 24},
  {name: 'غسول يدين بيرين مضاد للبكتيريا 500 مل', cat: 5, brand: 36, price: 12000, unit: 'كرتون', min: 12},
  {name: 'غسول جسم لوربير بالغار 500 مل', cat: 5, brand: 31, price: 28000, unit: 'كرتون', min: 12},
  {name: 'كريم قدمين لوربير 100 مل', cat: 5, brand: 31, price: 10000, unit: 'كرتون', min: 24},
  {name: 'زيت شعر لوربير 100 مل', cat: 5, brand: 31, price: 14000, unit: 'كرتون', min: 24},
  {name: 'بلسم شعر جوري الشام 300 مل', cat: 5, brand: 29, price: 14000, unit: 'كرتون', min: 12},
  {name: 'ماسك شعر جوري الشام 250 مل', cat: 5, brand: 29, price: 16000, unit: 'كرتون', min: 12},
  {name: 'ورق تواليت أوغاريت 12 رول', cat: 5, brand: 16, price: 15000, unit: 'كرتون', min: 4},
  {name: 'ورق تواليت أوغاريت 4 رول', cat: 5, brand: 16, price: 6000, unit: 'كرتون', min: 12},
  {name: 'فوط صحية أوغاريت عادية × 10', cat: 5, brand: 16, price: 5000, unit: 'كرتون', min: 24},
  {name: 'فوط صحية أوغاريت ليلية × 8', cat: 5, brand: 16, price: 6000, unit: 'كرتون', min: 24},

  // معلبات إضافية
  {name: 'تونة الدرة بالفلفل 185 غ', cat: 6, brand: 23, price: 13000, unit: 'كرتون', min: 24},
  {name: 'فول الدرة بالطماطم 400 غ', cat: 6, brand: 23, price: 5500, unit: 'كرتون', min: 24},
  {name: 'لوبياء الدرة 400 غ', cat: 6, brand: 23, price: 5000, unit: 'كرتون', min: 24},
  {name: 'حمص مسبح الدرة 400 غ', cat: 6, brand: 23, price: 6500, unit: 'كرتون', min: 24},
  {name: 'ورق عنب الدرة 400 غ', cat: 6, brand: 23, price: 8000, unit: 'كرتون', min: 24},
  {name: 'معجون طماطم الغوطة 800 غ', cat: 6, brand: 12, price: 9500, unit: 'كرتون', min: 12},
  {name: 'طماطم مجففة الغوطة 200 غ', cat: 6, brand: 12, price: 8000, unit: 'كرتون', min: 24},
  {name: 'صلصة حارة الغوطة 250 مل', cat: 6, brand: 12, price: 5000, unit: 'كرتون', min: 24},
  {name: 'مخلل فلفل حار مياس 650 غ', cat: 6, brand: 18, price: 9000, unit: 'كرتون', min: 12},
  {name: 'مخلل باذنجان مياس 650 غ', cat: 6, brand: 18, price: 10000, unit: 'كرتون', min: 12},
  {name: 'لانشون طيبة حبش 340 غ', cat: 6, brand: 17, price: 15000, unit: 'كرتون', min: 24},
  {name: 'لانشون طيبة بالجبنة 340 غ', cat: 6, brand: 17, price: 14000, unit: 'كرتون', min: 24},
  {name: 'فاصولياء الإيمان حمراء 400 غ', cat: 6, brand: 25, price: 5500, unit: 'كرتون', min: 24},
  {name: 'ذرة الإيمان حلوة 340 غ', cat: 6, brand: 25, price: 5500, unit: 'كرتون', min: 24},
  {name: 'مربى السعادة توت 450 غ', cat: 6, brand: 24, price: 12000, unit: 'كرتون', min: 12},
  {name: 'مربى السعادة ورد 450 غ', cat: 6, brand: 24, price: 14000, unit: 'كرتون', min: 12},
  {name: 'دبس خروب غصن البان 330 مل', cat: 6, brand: 13, price: 9000, unit: 'كرتون', min: 12},
  {name: 'ماء ورد غصن البان 500 مل', cat: 6, brand: 13, price: 10000, unit: 'كرتون', min: 12},
  {name: 'ماء زهر غصن البان 500 مل', cat: 6, brand: 13, price: 10000, unit: 'كرتون', min: 12},
  {name: 'شنكليش شام بالفلفل الأحمر 250 غ', cat: 6, brand: 14, price: 20000, unit: 'كرتون', min: 12},
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
        const stock = Math.floor(Math.random() * 451) + 50;
        const origPrice = p.price > 5000 ? Math.round(p.price * (1 + Math.random() * 0.2)) : null;
        
        values.push(`($${paramIdx}, $${paramIdx+1}, $${paramIdx+2}, $${paramIdx+3}, $${paramIdx+4}, $${paramIdx+5}, $${paramIdx+6}, $${paramIdx+7}, $${paramIdx+8}, 'SYP')`);
        params.push(p.name, p.cat, p.brand, p.price, origPrice, img, p.min, p.unit, stock);
        paramIdx += 9;
      }
      
      const sql = `INSERT INTO products (name, category_id, brand_id, price, original_price, image, min_order, unit, stock, price_currency) VALUES ${values.join(', ')}`;
      
      await client.query(sql, params);
      inserted += batch.length;
      console.log(`Inserted batch: ${inserted}/${products.length}`);
    }
    
    console.log(`\nAdditional products inserted: ${products.length}`);
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
