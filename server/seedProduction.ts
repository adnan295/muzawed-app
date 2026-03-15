import { db } from "./db";
import { pool } from "./db";
import { categories, brands, products, cities, warehouses, productInventory, staff, deliverySettings } from "@shared/schema";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

export async function seedProductionIfEmpty() {
  try {
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(products);
    
    if (Number(count) > 0 && Number(count) >= 50) {
      console.log(`Database already has ${count} products, skipping seed.`);
      return;
    }

    if (Number(count) > 0 && Number(count) < 50) {
      console.log(`Database has only ${count} products, adding additional products...`);
      await seedAdditionalProducts();
      return;
    }

    console.log("Database is empty, seeding production data...");

    const possiblePaths = [
      path.join(process.cwd(), "scripts", "seed-data.json"),
      path.join(process.cwd(), "dist", "scripts", "seed-data.json"),
      path.join(__dirname, "scripts", "seed-data.json"),
      path.join(__dirname, "..", "scripts", "seed-data.json"),
    ];
    
    const seedPath = possiblePaths.find(p => fs.existsSync(p));
    if (!seedPath) {
      console.error("WARNING: Database is empty and no seed-data.json found!");
      console.error("Searched:", possiblePaths.join(", "));
      console.error("The application will start with an empty database.");
      return;
    }
    console.log("Found seed data at:", seedPath);

    const data = JSON.parse(fs.readFileSync(seedPath, "utf-8"));
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      if (data.categories?.length) {
        for (const cat of data.categories) {
          await client.query(
            `INSERT INTO categories (id, name, icon, color) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
            [cat.id, cat.name, cat.icon, cat.color]
          );
        }
        await client.query(`SELECT setval('categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM categories))`);
        console.log(`Seeded ${data.categories.length} categories`);
      }

      if (data.brands?.length) {
        for (const brand of data.brands) {
          await client.query(
            `INSERT INTO brands (id, name, logo) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
            [brand.id, brand.name, brand.logo]
          );
        }
        await client.query(`SELECT setval('brands_id_seq', (SELECT COALESCE(MAX(id), 1) FROM brands))`);
        console.log(`Seeded ${data.brands.length} brands`);
      }

      if (data.cities?.length) {
        for (const city of data.cities) {
          await client.query(
            `INSERT INTO cities (id, name, province, is_active) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
            [city.id, city.name, city.province, city.is_active]
          );
        }
        await client.query(`SELECT setval('cities_id_seq', (SELECT COALESCE(MAX(id), 1) FROM cities))`);
        console.log(`Seeded ${data.cities.length} cities`);
      }

      if (data.warehouses?.length) {
        for (const wh of data.warehouses) {
          await client.query(
            `INSERT INTO warehouses (id, name, address, phone, is_active, city_id, manager_id) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING`,
            [wh.id, wh.name, wh.address, wh.phone, wh.is_active, wh.city_id, wh.manager_id]
          );
        }
        await client.query(`SELECT setval('warehouses_id_seq', (SELECT COALESCE(MAX(id), 1) FROM warehouses))`);
        console.log(`Seeded ${data.warehouses.length} warehouses`);
      }

      if (data.products?.length) {
        const batchSize = 100;
        for (let i = 0; i < data.products.length; i += batchSize) {
          const batch = data.products.slice(i, i + batchSize);
          for (const p of batch) {
            await client.query(
              `INSERT INTO products (id, name, category_id, brand_id, price, price_currency, original_price, image, min_order, unit, stock) 
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (id) DO NOTHING`,
              [p.id, p.name, p.category_id, p.brand_id, p.price, p.price_currency, p.original_price, p.image, p.min_order, p.unit, p.stock]
            );
          }
          console.log(`Seeded products: ${Math.min(i + batchSize, data.products.length)}/${data.products.length}`);
        }
        await client.query(`SELECT setval('products_id_seq', (SELECT COALESCE(MAX(id), 1) FROM products))`);
      }

      if (data.product_inventory?.length) {
        for (const inv of data.product_inventory) {
          await client.query(
            `INSERT INTO product_inventory (id, product_id, warehouse_id, stock, price_override, min_order_override, is_active) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING`,
            [inv.id, inv.product_id, inv.warehouse_id, inv.stock, inv.price_override, inv.min_order_override, inv.is_active]
          );
        }
        await client.query(`SELECT setval('product_inventory_id_seq', (SELECT COALESCE(MAX(id), 1) FROM product_inventory))`);
        console.log(`Seeded ${data.product_inventory.length} inventory records`);
      }

      if (data.staff?.length) {
        for (const s of data.staff) {
          await client.query(
            `INSERT INTO staff (id, name, email, phone, password, role, department, warehouse_id, permissions, status, avatar) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (id) DO NOTHING`,
            [s.id, s.name, s.email, s.phone, s.password, s.role, s.department, s.warehouse_id, s.permissions, s.status, s.avatar]
          );
        }
        await client.query(`SELECT setval('staff_id_seq', (SELECT COALESCE(MAX(id), 1) FROM staff))`);
        console.log(`Seeded ${data.staff.length} staff members`);
      }

      if (data.delivery_settings?.length) {
        for (const ds of data.delivery_settings) {
          await client.query(
            `INSERT INTO delivery_settings (id, warehouse_id, base_fee, free_delivery_threshold, free_delivery_qty_threshold, is_active) 
             VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
            [ds.id, ds.warehouse_id, ds.base_fee, ds.free_delivery_threshold, ds.free_delivery_qty_threshold, ds.is_active]
          );
        }
        await client.query(`SELECT setval('delivery_settings_id_seq', (SELECT COALESCE(MAX(id), 1) FROM delivery_settings))`);
        console.log(`Seeded ${data.delivery_settings.length} delivery settings`);
      }

      await client.query("COMMIT");
      console.log("Production database seeded successfully!");
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error seeding production database:", error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Seed check failed:", error);
  }
}

async function seedAdditionalProducts() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const additionalProducts = [
      // زيت قلي (Cooking Oil) - categoryId: 4
      { name: "زيت دوار الشمس 5 لتر", categoryId: 4, brandId: 1, price: "180000", unit: "حبة", minOrder: 4, stock: 300 },
      { name: "زيت ذرة صافي 3 لتر", categoryId: 4, brandId: 3, price: "145000", unit: "حبة", minOrder: 5, stock: 280 },
      { name: "زيت زيتون بكر 2 لتر", categoryId: 4, brandId: 2, price: "250000", unit: "حبة", minOrder: 3, stock: 260 },
      { name: "زيت نباتي للقلي 10 لتر", categoryId: 4, brandId: 1, price: "320000", unit: "حبة", minOrder: 2, stock: 300 },
      { name: "زيت سمسم طبيعي 500 مل", categoryId: 4, brandId: 3, price: "85000", unit: "حبة", minOrder: 8, stock: 350 },
      { name: "زيت نباتي 1.5 لتر عبوة 6", categoryId: 4, brandId: 2, price: "210000", unit: "كرتون", minOrder: 3, stock: 270 },
      { name: "زيت جوز الهند 500 مل", categoryId: 4, brandId: 5, price: "95000", unit: "حبة", minOrder: 6, stock: 300 },
      { name: "زيت قلي اقتصادي 5 لتر", categoryId: 4, brandId: 11, price: "155000", unit: "حبة", minOrder: 4, stock: 350 },

      // المناديل (Tissues) - categoryId: 5
      { name: "مناديل ورقية 200 منديل عبوة 5", categoryId: 5, brandId: 5, price: "35000", unit: "كرتون", minOrder: 8, stock: 400 },
      { name: "مناديل وجه ناعمة 150 منديل", categoryId: 5, brandId: 5, price: "18000", unit: "كرتون", minOrder: 15, stock: 500 },
      { name: "ورق تواليت 12 رول", categoryId: 5, brandId: 15, price: "42000", unit: "كرتون", minOrder: 6, stock: 350 },
      { name: "مناديل مبللة 72 منديل عبوة 3", categoryId: 5, brandId: 5, price: "28000", unit: "كرتون", minOrder: 10, stock: 380 },
      { name: "مناديل معطرة جيب 10 عبوات", categoryId: 5, brandId: 15, price: "15000", unit: "كرتون", minOrder: 20, stock: 450 },
      { name: "ورق مطبخ 6 رول", categoryId: 5, brandId: 5, price: "32000", unit: "كرتون", minOrder: 8, stock: 400 },

      // الأرز والبرغل (Rice & Bulgur) - categoryId: 6
      { name: "أرز بسمتي طويل الحبة 5 كغ", categoryId: 6, brandId: 2, price: "85000", unit: "كيس", minOrder: 5, stock: 300 },
      { name: "أرز مصري قصير الحبة 5 كغ", categoryId: 6, brandId: 3, price: "72000", unit: "كيس", minOrder: 5, stock: 350 },
      { name: "برغل خشن 5 كغ", categoryId: 6, brandId: 2, price: "65000", unit: "كيس", minOrder: 5, stock: 400 },
      { name: "برغل ناعم 2 كغ", categoryId: 6, brandId: 3, price: "32000", unit: "كيس", minOrder: 8, stock: 350 },
      { name: "أرز بسمتي 10 كغ فاخر", categoryId: 6, brandId: 1, price: "165000", unit: "كيس", minOrder: 3, stock: 280 },
      { name: "فريكة خضراء 1 كغ", categoryId: 6, brandId: 2, price: "45000", unit: "كيس", minOrder: 10, stock: 300 },
      { name: "أرز ياسمين 2 كغ", categoryId: 6, brandId: 3, price: "55000", unit: "كيس", minOrder: 8, stock: 320 },

      // الفول (Beans) - categoryId: 7
      { name: "فول مدمس 400 غ عبوة 24", categoryId: 7, brandId: 1, price: "72000", unit: "كرتون", minOrder: 5, stock: 400 },
      { name: "فول حب كبير 2 كغ", categoryId: 7, brandId: 2, price: "38000", unit: "كيس", minOrder: 8, stock: 350 },
      { name: "فول مدمس بالزيت 400 غ عبوة 24", categoryId: 7, brandId: 3, price: "78000", unit: "كرتون", minOrder: 4, stock: 300 },
      { name: "فول مقشور 1 كغ", categoryId: 7, brandId: 2, price: "25000", unit: "كيس", minOrder: 12, stock: 380 },
      { name: "فول أخضر مجمد 1 كغ", categoryId: 7, brandId: 1, price: "22000", unit: "كيس", minOrder: 10, stock: 300 },
      { name: "فول مدمس حار 400 غ عبوة 24", categoryId: 7, brandId: 3, price: "75000", unit: "كرتون", minOrder: 5, stock: 350 },

      // مشروبات سريعة التحضير (Instant Drinks) - categoryId: 8
      { name: "نسكافيه كلاسيك 200 غ", categoryId: 8, brandId: 4, price: "95000", unit: "حبة", minOrder: 10, stock: 300 },
      { name: "شاي أسود فاخر 500 غ", categoryId: 8, brandId: 4, price: "75000", unit: "حبة", minOrder: 12, stock: 450 },
      { name: "قهوة عربية محمصة 500 غ", categoryId: 8, brandId: 4, price: "88000", unit: "حبة", minOrder: 10, stock: 300 },
      { name: "كابتشينو سريع التحضير 10 أكياس", categoryId: 8, brandId: 4, price: "35000", unit: "كرتون", minOrder: 10, stock: 350 },
      { name: "شاي أخضر 100 كيس", categoryId: 8, brandId: 4, price: "42000", unit: "حبة", minOrder: 8, stock: 400 },
      { name: "مشروب شوكولاتة ساخنة 500 غ", categoryId: 8, brandId: 5, price: "55000", unit: "حبة", minOrder: 8, stock: 280 },
      { name: "قهوة تركية ناعمة 250 غ", categoryId: 8, brandId: 4, price: "48000", unit: "حبة", minOrder: 12, stock: 350 },
      { name: "عصير بودرة برتقال 1 كغ", categoryId: 8, brandId: 6, price: "32000", unit: "حبة", minOrder: 10, stock: 400 },

      // سكر - سميد - طحين (Sugar, Semolina, Flour) - categoryId: 9
      { name: "سكر أبيض ناعم 10 كغ", categoryId: 9, brandId: 2, price: "120000", unit: "كيس", minOrder: 3, stock: 350 },
      { name: "طحين أبيض فاخر 10 كغ", categoryId: 9, brandId: 3, price: "95000", unit: "كيس", minOrder: 5, stock: 400 },
      { name: "سميد خشن 5 كغ", categoryId: 9, brandId: 2, price: "55000", unit: "كيس", minOrder: 5, stock: 350 },
      { name: "سكر بني 1 كغ", categoryId: 9, brandId: 1, price: "28000", unit: "كيس", minOrder: 10, stock: 300 },
      { name: "طحين أسمر كامل 5 كغ", categoryId: 9, brandId: 3, price: "85000", unit: "كيس", minOrder: 5, stock: 280 },
      { name: "نشاء ذرة 500 غ عبوة 12", categoryId: 9, brandId: 2, price: "48000", unit: "كرتون", minOrder: 6, stock: 400 },
      { name: "سكر ناعم بودرة 1 كغ", categoryId: 9, brandId: 1, price: "18000", unit: "كيس", minOrder: 12, stock: 350 },

      // البقوليات (Legumes) - categoryId: 10
      { name: "عدس أحمر مجروش 2 كغ", categoryId: 10, brandId: 2, price: "45000", unit: "كيس", minOrder: 8, stock: 400 },
      { name: "حمص حب كامل 2 كغ", categoryId: 10, brandId: 3, price: "55000", unit: "كيس", minOrder: 6, stock: 320 },
      { name: "فاصولياء بيضاء 1 كغ", categoryId: 10, brandId: 2, price: "35000", unit: "كيس", minOrder: 10, stock: 280 },
      { name: "عدس أخضر كامل 2 كغ", categoryId: 10, brandId: 3, price: "42000", unit: "كيس", minOrder: 8, stock: 350 },
      { name: "فاصولياء حمراء 1 كغ", categoryId: 10, brandId: 2, price: "38000", unit: "كيس", minOrder: 10, stock: 300 },
      { name: "بازلاء مجففة 1 كغ", categoryId: 10, brandId: 1, price: "28000", unit: "كيس", minOrder: 12, stock: 350 },
      { name: "ماش أخضر 1 كغ", categoryId: 10, brandId: 3, price: "32000", unit: "كيس", minOrder: 10, stock: 280 },

      // صابون (Soap) - categoryId: 11
      { name: "صابون غار طبيعي 200 غ عبوة 6", categoryId: 11, brandId: 7, price: "45000", unit: "كرتون", minOrder: 8, stock: 350 },
      { name: "صابون سائل لليدين 500 مل", categoryId: 11, brandId: 7, price: "22000", unit: "حبة", minOrder: 12, stock: 400 },
      { name: "سائل جلي صحون 1 لتر", categoryId: 11, brandId: 7, price: "25000", unit: "حبة", minOrder: 12, stock: 500 },
      { name: "مسحوق غسيل أوتوماتيك 6 كغ", categoryId: 11, brandId: 8, price: "145000", unit: "حبة", minOrder: 4, stock: 300 },
      { name: "منعم أقمشة 3 لتر", categoryId: 11, brandId: 7, price: "85000", unit: "حبة", minOrder: 6, stock: 350 },
      { name: "صابون استحمام 125 غ عبوة 6", categoryId: 11, brandId: 7, price: "38000", unit: "كرتون", minOrder: 10, stock: 450 },
      { name: "مبيض كلور 4 لتر", categoryId: 11, brandId: 8, price: "18000", unit: "حبة", minOrder: 8, stock: 400 },
      { name: "معقم أرضيات 3 لتر", categoryId: 11, brandId: 8, price: "35000", unit: "حبة", minOrder: 6, stock: 350 },

      // سمن (Ghee/Butter) - categoryId: 12
      { name: "سمنة حيوانية صافية 1 كغ", categoryId: 12, brandId: 11, price: "180000", unit: "حبة", minOrder: 6, stock: 250 },
      { name: "سمنة نباتية 1 كغ", categoryId: 12, brandId: 11, price: "95000", unit: "حبة", minOrder: 8, stock: 300 },
      { name: "زبدة حيوانية 200 غ عبوة 10", categoryId: 12, brandId: 1, price: "95000", unit: "كرتون", minOrder: 6, stock: 280 },
      { name: "سمنة بلدية 2 كغ", categoryId: 12, brandId: 11, price: "350000", unit: "حبة", minOrder: 3, stock: 260 },
      { name: "سمنة مخلوطة 800 غ", categoryId: 12, brandId: 11, price: "72000", unit: "حبة", minOrder: 8, stock: 300 },
      { name: "زبدة مملحة 400 غ عبوة 6", categoryId: 12, brandId: 1, price: "85000", unit: "كرتون", minOrder: 6, stock: 280 },

      // البسكويت (Biscuits) - categoryId: 13
      { name: "بسكويت شاي سادة 200 غ عبوة 24", categoryId: 13, brandId: 9, price: "48000", unit: "كرتون", minOrder: 5, stock: 400 },
      { name: "بسكويت محشو شوكولاتة 36 حبة", categoryId: 13, brandId: 9, price: "62000", unit: "كرتون", minOrder: 5, stock: 320 },
      { name: "ويفر بالشوكولاتة 40 غ عبوة 24", categoryId: 13, brandId: 9, price: "55000", unit: "كرتون", minOrder: 6, stock: 380 },
      { name: "كيك فانيلا جاهز 12 حبة", categoryId: 13, brandId: 9, price: "42000", unit: "كرتون", minOrder: 8, stock: 350 },
      { name: "كرواسون بالشوكولاتة 6 حبات", categoryId: 13, brandId: 14, price: "28000", unit: "كرتون", minOrder: 10, stock: 300 },
      { name: "بسكويت مالح بالجبنة 200 غ عبوة 24", categoryId: 13, brandId: 9, price: "52000", unit: "كرتون", minOrder: 5, stock: 350 },
      { name: "بسكويت بالحليب 200 غ عبوة 24", categoryId: 13, brandId: 14, price: "45000", unit: "كرتون", minOrder: 6, stock: 380 },

      // الشيبس (Chips) - categoryId: 14
      { name: "شيبس بطاطا كلاسيك 150 غ عبوة 12", categoryId: 14, brandId: 12, price: "55000", unit: "كرتون", minOrder: 6, stock: 400 },
      { name: "شيبس ذرة بالجبنة 100 غ عبوة 24", categoryId: 14, brandId: 12, price: "72000", unit: "كرتون", minOrder: 5, stock: 350 },
      { name: "شيبس بطاطا بالفلفل 150 غ عبوة 12", categoryId: 14, brandId: 13, price: "58000", unit: "كرتون", minOrder: 6, stock: 380 },
      { name: "بوشار جاهز بالزبدة 100 غ عبوة 12", categoryId: 14, brandId: 12, price: "42000", unit: "كرتون", minOrder: 8, stock: 350 },
      { name: "شيبس بطاطا بالكاتشب 80 غ عبوة 24", categoryId: 14, brandId: 13, price: "65000", unit: "كرتون", minOrder: 5, stock: 400 },
      { name: "مكسرات مشكلة مملحة 500 غ", categoryId: 14, brandId: 10, price: "85000", unit: "حبة", minOrder: 8, stock: 300 },

      // عام (General) - categoryId: 15
      { name: "ملح طعام ناعم 1 كغ", categoryId: 15, brandId: 15, price: "8000", unit: "كرتون", minOrder: 20, stock: 600 },
      { name: "خل تفاح طبيعي 1 لتر", categoryId: 15, brandId: 2, price: "25000", unit: "حبة", minOrder: 12, stock: 350 },
      { name: "دبس رمان طبيعي 500 مل", categoryId: 15, brandId: 2, price: "45000", unit: "حبة", minOrder: 10, stock: 300 },
      { name: "طحينة سائلة 900 غ", categoryId: 15, brandId: 3, price: "65000", unit: "حبة", minOrder: 8, stock: 280 },
      { name: "معجون طماطم 800 غ", categoryId: 15, brandId: 3, price: "25000", unit: "حبة", minOrder: 12, stock: 450 },
      { name: "صلصة حارة 250 مل عبوة 12", categoryId: 15, brandId: 2, price: "48000", unit: "كرتون", minOrder: 6, stock: 320 },

      // مواد غذائية (Food Items) - categoryId: 16
      { name: "معكرونة سباغيتي 500 غ عبوة 20", categoryId: 16, brandId: 6, price: "65000", unit: "كرتون", minOrder: 5, stock: 400 },
      { name: "حمص جاهز 400 غ عبوة 24", categoryId: 16, brandId: 1, price: "68000", unit: "كرتون", minOrder: 5, stock: 380 },
      { name: "تونة قطع في زيت 185 غ عبوة 24", categoryId: 16, brandId: 15, price: "145000", unit: "كرتون", minOrder: 4, stock: 300 },
      { name: "ذرة حلوة معلبة 340 غ عبوة 24", categoryId: 16, brandId: 6, price: "85000", unit: "كرتون", minOrder: 4, stock: 350 },
      { name: "زيتون أخضر محشي 650 غ", categoryId: 16, brandId: 2, price: "45000", unit: "حبة", minOrder: 8, stock: 300 },
      { name: "مخلل خيار 650 غ", categoryId: 16, brandId: 2, price: "28000", unit: "حبة", minOrder: 10, stock: 350 },
      { name: "حليب كامل الدسم 1 لتر عبوة 12", categoryId: 16, brandId: 1, price: "72000", unit: "كرتون", minOrder: 5, stock: 400 },
      { name: "لبنة جاهزة 500 غ", categoryId: 16, brandId: 1, price: "35000", unit: "حبة", minOrder: 10, stock: 300 },
      { name: "جبنة بيضاء 400 غ", categoryId: 16, brandId: 1, price: "42000", unit: "حبة", minOrder: 10, stock: 350 },
      { name: "مكدوس باذنجان 650 غ", categoryId: 16, brandId: 2, price: "55000", unit: "حبة", minOrder: 8, stock: 280 },
    ];

    for (const p of additionalProducts) {
      await client.query(
        `INSERT INTO products (name, category_id, brand_id, price, price_currency, image, min_order, unit, stock)
         VALUES ($1, $2, $3, $4, 'SYP', '', $5, $6, $7)`,
        [p.name, p.categoryId, p.brandId, p.price, p.minOrder, p.unit, p.stock]
      );
    }

    await client.query("COMMIT");
    console.log(`Seeded ${additionalProducts.length} additional products successfully!`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error seeding additional products:", error);
  } finally {
    client.release();
  }
}
