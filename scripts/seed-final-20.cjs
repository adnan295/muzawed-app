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

const products = [
  {name: 'زيت زيتون غدير للقلي 2 لتر', cat: 1, brand: 11, price: 120000, unit: 'كرتون', min: 4},
  {name: 'فريكة خشنة الخير 1 كغ', cat: 1, brand: 37, price: 28000, unit: 'كرتون', min: 12},
  {name: 'جبنة دوبل كريم صوفيا 200 غ', cat: 1, brand: 19, price: 14000, unit: 'كرتون', min: 12},
  {name: 'معكرونة الغوطة أورزو 500 غ', cat: 1, brand: 12, price: 5500, unit: 'كرتون', min: 24},
  {name: 'يانسون غصن البان 100 غ', cat: 1, brand: 13, price: 5000, unit: 'كرتون', min: 24},
  {name: 'عصير الغوطة كيوي 1 لتر', cat: 2, brand: 12, price: 9000, unit: 'كرتون', min: 12},
  {name: 'شراب السوس شام 750 مل', cat: 2, brand: 14, price: 10000, unit: 'كرتون', min: 12},
  {name: 'مياه أوغاريت 10 لتر', cat: 2, brand: 16, price: 8000, unit: 'غالون', min: 2},
  {name: 'شوكولاتة نتاليا بالزبيب 100 غ', cat: 3, brand: 33, price: 13500, unit: 'كرتون', min: 24},
  {name: 'معمول عربو مشكل 1 كغ', cat: 3, brand: 35, price: 55000, unit: 'كرتون', min: 6},
  {name: 'ويفر ياك بالكاكاو 40 غ', cat: 3, brand: 34, price: 2800, unit: 'كرتون', min: 48},
  {name: 'حلاوة عربو بالشوكولاتة 500 غ', cat: 3, brand: 35, price: 28000, unit: 'كرتون', min: 12},
  {name: 'صابون غسيل الوزير بالليمون 400 غ', cat: 4, brand: 26, price: 6500, unit: 'كرتون', min: 24},
  {name: 'منظف مواسير سيكو 500 مل', cat: 4, brand: 27, price: 10000, unit: 'كرتون', min: 12},
  {name: 'مطهر كرمل 1 لتر', cat: 4, brand: 28, price: 9500, unit: 'كرتون', min: 12},
  {name: 'كريم بيرين مضاد للتجاعيد 50 مل', cat: 5, brand: 36, price: 25000, unit: 'كرتون', min: 12},
  {name: 'بودرة أطفال أوغاريت 200 غ', cat: 5, brand: 16, price: 7000, unit: 'كرتون', min: 24},
  {name: 'زيت أطفال أوغاريت 200 مل', cat: 5, brand: 16, price: 8000, unit: 'كرتون', min: 24},
  {name: 'فول الدرة مع الحمص 400 غ', cat: 6, brand: 23, price: 5500, unit: 'كرتون', min: 24},
  {name: 'صلصة بيتزا الغوطة 400 غ', cat: 6, brand: 12, price: 6000, unit: 'كرتون', min: 24},
];

async function seed() {
  const client = await pool.connect();
  try {
    const values = [];
    const params = [];
    let paramIdx = 1;
    
    for (const p of products) {
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
    
    console.log(`Inserted ${products.length} more products`);
    const result = await client.query('SELECT COUNT(*) as total FROM products');
    console.log(`Total products in database: ${result.rows[0].total}`);
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(console.error);
