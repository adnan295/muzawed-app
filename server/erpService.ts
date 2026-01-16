import { storage } from "./storage";

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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    
    const response = await fetch(`${erpUrl}/api/public/products`, {
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
    
    await storage.deleteErpProductsByWarehouse(warehouseId);
    
    for (const product of result.products) {
      await storage.createErpProduct({
        warehouseId,
        externalId: product.id,
        barcode: product.barcode || null,
        name: product.name,
        category: product.category || null,
        price: product.price || '0',
        priceNew: product.priceNew || null,
        priceUsd: product.priceUsd || null,
        resellerDiscount: product.resellerDiscount || null,
        availableQuantity: product.availableQuantity || 0,
      });
    }
    
    await storage.updateErpSettingSync(erpSetting.id, 'success');
    
    return { success: true, count: result.products.length };
  } catch (error: any) {
    const errorMessage = error.message || 'خطأ غير معروف';
    await storage.updateErpSettingSync(erpSetting.id, 'error', errorMessage);
    return { success: false, count: 0, error: errorMessage };
  }
}
