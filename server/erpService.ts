import { storage } from "./storage";
import { db } from "./db";
import { products, productInventory, categories, erpProducts as erpProductsTable } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface ErpProduct {
  id: string;
  barcode: string;
  name: string;
  category: string;
  price: string;
  priceNew: string;
  priceUsd: string;
  resellerDiscount: string;
  availableQuantity: number;
}

export interface ErpApiResponse {
  success: boolean;
  products: ErpProduct[];
}

export async function fetchErpProducts(erpUrl: string, apiKey?: string | null): Promise<ErpApiResponse> {
  try {
    let cleanUrl = erpUrl.replace(/\/+$/, '');
    if (cleanUrl.endsWith('/api/public/products')) {
      cleanUrl = cleanUrl.replace(/\/api\/public\/products$/, '');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    
    const response = await fetch(`${cleanUrl}/api/public/products`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(30000),
    });
    
    if (!response.ok) {
      throw new Error(`ERP API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data as ErpApiResponse;
  } catch (error: any) {
    console.error('Error fetching ERP products:', error);
    throw error;
  }
}

export async function syncErpProducts(warehouseId: number): Promise<{ success: boolean; count: number; error?: string }> {
  const erpSetting = await storage.getErpSettingByWarehouse(warehouseId);
  
  if (!erpSetting) {
    return { success: false, count: 0, error: 'لم يتم إعداد نظام ERP لهذا المستودع' };
  }
  
  if (!erpSetting.isActive) {
    return { success: false, count: 0, error: 'نظام ERP معطل لهذا المستودع' };
  }
  
  try {
    const result = await fetchErpProducts(erpSetting.erpUrl, erpSetting.apiKey);
    
    if (!result.success || !result.products) {
      await storage.updateErpSettingSync(erpSetting.id, 'error', 'لم يتم العثور على منتجات');
      return { success: false, count: 0, error: 'لم يتم العثور على منتجات' };
    }

    const syncedCount = await db.transaction(async (tx) => {
      const allCategories = await tx.select().from(categories);
      const categoryMap = new Map<string, number>();
      for (const cat of allCategories) {
        categoryMap.set(cat.name.trim(), cat.id);
      }

      let defaultCategoryId = categoryMap.get('عام');
      if (!defaultCategoryId) {
        const [newCat] = await tx.insert(categories).values({
          name: 'عام',
          icon: '📦',
          color: 'from-blue-400 to-blue-500',
        }).returning();
        defaultCategoryId = newCat.id;
        categoryMap.set('عام', defaultCategoryId);
      }

      const existingProducts = await tx.select().from(products);
      const productNameMap = new Map<string, typeof existingProducts[0]>();
      for (const p of existingProducts) {
        productNameMap.set(p.name.trim(), p);
      }

      const existingInventory = await tx.select().from(productInventory)
        .where(eq(productInventory.warehouseId, warehouseId));
      const inventoryMap = new Map<number, typeof existingInventory[0]>();
      for (const inv of existingInventory) {
        inventoryMap.set(inv.productId, inv);
      }

      await tx.delete(erpProductsTable).where(eq(erpProductsTable.warehouseId, warehouseId));

      const syncedProductIds = new Set<number>();
      let count = 0;

      for (const erpProduct of result.products) {
        await tx.insert(erpProductsTable).values({
          warehouseId,
          externalId: erpProduct.id,
          barcode: erpProduct.barcode || null,
          name: erpProduct.name,
          category: erpProduct.category || null,
          price: erpProduct.price || '0',
          priceNew: erpProduct.priceNew || null,
          priceUsd: erpProduct.priceUsd || null,
          resellerDiscount: erpProduct.resellerDiscount || null,
          availableQuantity: erpProduct.availableQuantity || 0,
        });

        const catName = (erpProduct.category || '').trim();
        let categoryId: number;
        if (catName && categoryMap.has(catName)) {
          categoryId = categoryMap.get(catName)!;
        } else if (catName) {
          const [newCat] = await tx.insert(categories).values({
            name: catName,
            icon: '📦',
            color: 'from-blue-400 to-blue-500',
          }).returning();
          categoryId = newCat.id;
          categoryMap.set(catName, categoryId);
        } else {
          categoryId = defaultCategoryId!;
        }

        const productPrice = erpProduct.priceNew || erpProduct.price || '0';
        const originalPrice = (erpProduct.priceNew && erpProduct.price && erpProduct.priceNew !== erpProduct.price) 
          ? erpProduct.price 
          : null;
        const stock = erpProduct.availableQuantity || 0;
        const trimmedName = erpProduct.name.trim();

        let productId: number;
        const existingProd = productNameMap.get(trimmedName);

        if (existingProd) {
          await tx.update(products).set({
            categoryId,
            price: productPrice,
            originalPrice,
            stock,
          }).where(eq(products.id, existingProd.id));
          productId = existingProd.id;
        } else {
          const [newProduct] = await tx.insert(products).values({
            name: trimmedName,
            categoryId,
            price: productPrice,
            priceCurrency: 'SYP',
            originalPrice,
            image: '',
            minOrder: 1,
            unit: 'كرتون',
            stock,
          }).returning();
          productId = newProduct.id;
          productNameMap.set(trimmedName, newProduct);
        }

        syncedProductIds.add(productId);

        const existingInv = inventoryMap.get(productId);
        if (existingInv) {
          await tx.update(productInventory).set({
            stock,
            priceOverride: productPrice !== '0' ? productPrice : null,
            isActive: true,
          }).where(eq(productInventory.id, existingInv.id));
        } else {
          await tx.insert(productInventory).values({
            productId,
            warehouseId,
            stock,
            priceOverride: productPrice !== '0' ? productPrice : null,
            isActive: true,
          });
        }

        count++;
      }

      for (const inv of existingInventory) {
        if (!syncedProductIds.has(inv.productId)) {
          await tx.update(productInventory).set({
            isActive: false,
            stock: 0,
          }).where(eq(productInventory.id, inv.id));
        }
      }

      return count;
    });
    
    await storage.updateErpSettingSync(erpSetting.id, 'success');
    
    return { success: true, count: syncedCount };
  } catch (error: any) {
    const errorMessage = error.message || 'خطأ غير معروف';
    await storage.updateErpSettingSync(erpSetting.id, 'error', errorMessage);
    return { success: false, count: 0, error: errorMessage };
  }
}
