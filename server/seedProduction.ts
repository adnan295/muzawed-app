import { db } from "./db";
import { pool } from "./db";
import { categories, brands, products, cities, warehouses, productInventory, staff, deliverySettings } from "@shared/schema";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

export async function seedProductionIfEmpty() {
  try {
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(products);
    
    if (Number(count) > 0) {
      console.log(`Database already has ${count} products, skipping seed.`);
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
