const API_BASE = "/api";

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "حدث خطأ" }));
    throw new Error(error.error || "حدث خطأ");
  }

  return response.json();
}

// Auth API
export const authAPI = {
  register: (data: any) => request("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  login: (phone: string, password: string) => request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ phone, password }),
  }),
  checkPhone: (phone: string) => request("/auth/check-phone", {
    method: "POST",
    body: JSON.stringify({ phone }),
  }),
  sendOtp: (phone: string) => request("/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({ phone }),
  }),
  verifyOtp: (phone: string, code: string) => request("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ phone, code }),
  }),
};

// Products API
export const productsAPI = {
  getAll: (categoryId?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId.toString());
    if (limit) params.append('limit', limit.toString());
    const qs = params.toString();
    return request(`/products${qs ? `?${qs}` : ""}`);
  },
  getById: (id: number) => request(`/products/${id}`),
  search: (query: string) => request(`/products/search?q=${encodeURIComponent(query)}`),
};

// Price Tiers API - أسعار الجملة المتدرجة
export const priceTiersAPI = {
  getByProduct: (productId: number) => request(`/products/${productId}/price-tiers`),
  create: (productId: number, tier: any) => request(`/products/${productId}/price-tiers`, {
    method: "POST",
    body: JSON.stringify(tier),
  }),
  update: (id: number, tier: any) => request(`/price-tiers/${id}`, {
    method: "PUT",
    body: JSON.stringify(tier),
  }),
  delete: (id: number) => request(`/price-tiers/${id}`, { method: "DELETE" }),
  bulkUpdate: (productId: number, tiers: any[]) => request(`/products/${productId}/price-tiers`, {
    method: "PUT",
    body: JSON.stringify({ tiers }),
  }),
  getEffectivePrice: (productId: number, quantity: number) => 
    request(`/products/${productId}/effective-price?quantity=${quantity}`),
};

// Categories API
export const categoriesAPI = {
  getAll: () => request("/categories"),
};

// Brands API
export const brandsAPI = {
  getAll: () => request("/brands"),
};

// Cart API
export const cartAPI = {
  get: (userId: number) => request(`/cart/${userId}`),
  add: (data: any) => request("/cart", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id: number, quantity: number) => request(`/cart/${id}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  }),
  remove: (id: number) => request(`/cart/${id}`, {
    method: "DELETE",
  }),
  clear: (userId: number) => request(`/cart/user/${userId}`, {
    method: "DELETE",
  }),
};

// Orders API
export const ordersAPI = {
  getAll: (userId: number) => request(`/orders/${userId}`),
  getById: (orderId: number) => request(`/orders/detail/${orderId}`),
  create: (order: any, items: any[]) => request("/orders", {
    method: "POST",
    body: JSON.stringify({ order, items }),
  }),
  updateStatus: (id: number, status: string) => request(`/orders/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  }),
};

// Addresses API
export const addressesAPI = {
  getAll: (userId: number) => request(`/addresses/${userId}`),
  create: (data: any) => request("/addresses", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => request(`/addresses/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
  delete: (id: number) => request(`/addresses/${id}`, {
    method: "DELETE",
  }),
  setDefault: (userId: number, addressId: number) => 
    request(`/addresses/${userId}/default/${addressId}`, {
      method: "POST",
    }),
};

// Payment Cards API
export const cardsAPI = {
  getAll: (userId: number) => request(`/cards/${userId}`),
  create: (data: any) => request("/cards", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  delete: (id: number) => request(`/cards/${id}`, {
    method: "DELETE",
  }),
};

// Wallet API
export const walletAPI = {
  get: (userId: number) => request(`/wallet/${userId}`),
  getTransactions: (userId: number) => request(`/wallet/${userId}/transactions`),
  createTransaction: (data: any) => request("/wallet/transaction", {
    method: "POST",
    body: JSON.stringify(data),
  }),
};

// Admin Stats API - warehouse filtering is handled server-side via session
export const adminAPI = {
  getStats: () => request("/admin/stats"),
  getOrders: (warehouseId?: number) => {
    const params = new URLSearchParams();
    if (warehouseId) params.append('warehouseId', warehouseId.toString());
    return request(`/admin/orders${params.toString() ? `?${params.toString()}` : ''}`);
  },
  getUsers: () => request("/admin/users"),
  updateUser: (id: number, data: any) => request(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
};

// Promotions API
export const promotionsAPI = {
  getAll: () => request("/promotions"),
  getById: (id: number) => request(`/promotions/${id}`),
  create: (data: any) => request("/promotions", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => request(`/promotions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
  delete: (id: number) => request(`/promotions/${id}`, {
    method: "DELETE",
  }),
};

// Suppliers API
export const suppliersAPI = {
  getAll: () => request("/suppliers"),
  getById: (id: number) => request(`/suppliers/${id}`),
  create: (data: any) => request("/suppliers", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => request(`/suppliers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
  delete: (id: number) => request(`/suppliers/${id}`, {
    method: "DELETE",
  }),
  getDashboard: (id: number) => request(`/suppliers/${id}/dashboard`),
  getTransactions: (id: number) => request(`/suppliers/${id}/transactions`),
  getBalance: (id: number) => request(`/suppliers/${id}/balance`),
  getStock: (id: number) => request(`/suppliers/${id}/stock`),
  recordImport: (id: number, data: { warehouseId: number; productId: number; quantity: number; unitPrice: string; notes?: string }) => 
    request(`/suppliers/${id}/import`, { method: "POST", body: JSON.stringify(data) }),
  recordExport: (id: number, data: { warehouseId: number; productId: number; quantity: number; unitPrice: string; notes?: string }) => 
    request(`/suppliers/${id}/export`, { method: "POST", body: JSON.stringify(data) }),
  recordPayment: (id: number, data: { amount: string; paymentMethod: string; referenceNumber?: string; notes?: string }) => 
    request(`/suppliers/${id}/payment`, { method: "POST", body: JSON.stringify(data) }),
  recalculateBalance: (id: number) => request(`/suppliers/${id}/recalculate`, { method: "POST" }),
};

// Returns API
export const returnsAPI = {
  getAll: () => request("/returns"),
  getById: (id: number) => request(`/returns/${id}`),
  create: (data: any) => request("/returns", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => request(`/returns/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
  approve: (id: number, refundMethod: string, notes?: string) => request(`/returns/${id}/approve`, {
    method: "POST",
    body: JSON.stringify({ refundMethod, notes }),
  }),
  reject: (id: number, notes: string) => request(`/returns/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ notes }),
  }),
  getStats: () => request("/returns/stats"),
};

// Customers API
export const customersAPI = {
  getStats: () => request("/admin/customers/stats"),
  getTopCustomers: (limit?: number) => request(`/admin/customers/top${limit ? `?limit=${limit}` : ''}`),
  getGrowthData: () => request("/admin/customers/growth"),
  getDetails: (id: number) => request(`/admin/customers/${id}/details`),
  create: (data: any) => request("/admin/customers", {
    method: "POST",
    body: JSON.stringify(data),
  }),
};

// Shipments API
export const shipmentsAPI = {
  getAll: () => request("/shipments"),
  getById: (id: number) => request(`/shipments/${id}`),
  getByOrder: (orderId: number) => request(`/shipments/order/${orderId}`),
  create: (data: any) => request("/shipments", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => request(`/shipments/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
};

// Customer Segments API
export const segmentsAPI = {
  getAll: () => request("/segments"),
  getById: (id: number) => request(`/segments/${id}`),
  create: (data: any) => request("/segments", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => request(`/segments/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
  delete: (id: number) => request(`/segments/${id}`, {
    method: "DELETE",
  }),
  recalculate: () => request("/segments/recalculate", {
    method: "POST",
  }),
};

// Reports API
export const reportsAPI = {
  getAll: () => request("/reports"),
  create: (data: any) => request("/reports", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  getProductProfit: () => request<{
    summary: {
      totalRevenue: number;
      totalCost: number;
      totalProfit: number;
      avgMargin: number;
      totalSoldQty: number;
      totalStockQty: number;
    };
    breakdown: Array<{
      productId: number;
      productName: string;
      productImage: string | null;
      categoryName: string | null;
      stockQty: number;
      soldQty: number;
      remainingQty: number;
      revenue: number;
      cost: number;
      profit: number;
      margin: number;
      salePrice: string;
      avgCostPrice: number;
    }>;
  }>("/reports/product-profit"),
};

// Staff API
export const staffAPI = {
  getAll: () => request("/staff"),
  getById: (id: number) => request(`/staff/${id}`),
  create: (data: any) => request("/staff", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => request(`/staff/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
  delete: (id: number) => request(`/staff/${id}`, {
    method: "DELETE",
  }),
};

// Support Tickets API
export const ticketsAPI = {
  getAll: () => request("/tickets"),
  getById: (id: number) => request(`/tickets/${id}`),
  create: (data: any) => request("/tickets", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => request(`/tickets/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
};

// Coupons API
export const couponsAPI = {
  getAll: () => request("/coupons"),
  getById: (id: number) => request(`/coupons/${id}`),
  getByCode: (code: string) => request(`/coupons/code/${code}`),
  create: (data: any) => request("/coupons", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => request(`/coupons/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
  delete: (id: number) => request(`/coupons/${id}`, {
    method: "DELETE",
  }),
};

// Warehouses API
export const warehousesAPI = {
  getAll: () => request("/warehouses"),
  getById: (id: number) => request(`/warehouses/${id}`),
  getByCity: (cityId: number) => request(`/warehouses/by-city/${cityId}`),
  create: (data: any) => request("/warehouses", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => request(`/warehouses/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
  delete: (id: number) => request(`/warehouses/${id}`, {
    method: "DELETE",
  }),
};

// Cities API
export const citiesAPI = {
  getAll: () => request("/cities"),
  getById: (id: number) => request(`/cities/${id}`),
  create: (data: any) => request("/cities", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => request(`/cities/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
  delete: (id: number) => request(`/cities/${id}`, {
    method: "DELETE",
  }),
};

// Product Inventory API (per warehouse)
export const productInventoryAPI = {
  getByWarehouse: (warehouseId: number) => request(`/product-inventory/warehouse/${warehouseId}`),
  getByProduct: (productId: number) => request(`/product-inventory/product/${productId}`),
  create: (data: any) => request("/product-inventory", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => request(`/product-inventory/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
  delete: (id: number) => request(`/product-inventory/${id}`, {
    method: "DELETE",
  }),
};

// Products by City API (for customer filtering)
export const productsByCityAPI = {
  getByCity: (cityId: number, limit?: number) => {
    const params = limit ? `?limit=${limit}` : '';
    return request(`/products/by-city/${cityId}${params}`);
  },
};

// Notifications API
export const notificationsAPI = {
  getAll: (userId?: number, staffId?: number) => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId.toString());
    if (staffId) params.append('staffId', staffId.toString());
    return request(`/notifications?${params.toString()}`);
  },
  getUnreadCount: (userId?: number, staffId?: number) => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId.toString());
    if (staffId) params.append('staffId', staffId.toString());
    return request(`/notifications/unread/count?${params.toString()}`);
  },
  create: (data: any) => request("/notifications", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  markRead: (id: number) => request(`/notifications/${id}/read`, {
    method: "PUT",
  }),
  markAllRead: (userId?: number, staffId?: number) => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId.toString());
    if (staffId) params.append('staffId', staffId.toString());
    return request(`/notifications/read-all?${params.toString()}`, {
      method: "PUT",
    });
  },
};

// Activity Logs API
export const activityLogsAPI = {
  getAll: (limit?: number) => request(`/activity-logs${limit ? `?limit=${limit}` : ''}`),
  create: (data: any) => request("/activity-logs", {
    method: "POST",
    body: JSON.stringify(data),
  }),
};

// Inventory API
export const inventoryAPI = {
  getLowStock: (threshold?: number) => request(`/inventory/low-stock${threshold ? `?threshold=${threshold}` : ''}`),
  updateStock: (id: number, quantity: number) => request(`/inventory/${id}/stock`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  }),
};

// Drivers API
export const driversAPI = {
  getAll: () => request("/drivers"),
  getById: (id: number) => request(`/drivers/${id}`),
  getAvailable: () => request("/drivers/available"),
  getByWarehouse: (warehouseId: number) => request(`/drivers/warehouse/${warehouseId}`),
  create: (data: any) => request("/drivers", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => request(`/drivers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
  delete: (id: number) => request(`/drivers/${id}`, {
    method: "DELETE",
  }),
};

// Vehicles API
export const vehiclesAPI = {
  getAll: () => request("/vehicles"),
  getById: (id: number) => request(`/vehicles/${id}`),
  getAvailable: () => request("/vehicles/available"),
  getByWarehouse: (warehouseId: number) => request(`/vehicles/warehouse/${warehouseId}`),
  create: (data: any) => request("/vehicles", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => request(`/vehicles/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
  delete: (id: number) => request(`/vehicles/${id}`, {
    method: "DELETE",
  }),
  assignDriver: (vehicleId: number, driverId: number) => request(`/vehicles/${vehicleId}/assign-driver`, {
    method: "POST",
    body: JSON.stringify({ driverId }),
  }),
};

// Banners API
export const bannersAPI = {
  getAll: () => request("/banners"),
  getActive: (cityId?: number) => request(`/banners/active${cityId ? `?cityId=${cityId}` : ''}`),
  getById: (id: number) => request(`/banners/${id}`),
  getStats: () => request("/banners/stats"),
  create: (data: any) => request("/banners", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => request(`/banners/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
  delete: (id: number) => request(`/banners/${id}`, {
    method: "DELETE",
  }),
  duplicate: (id: number) => request(`/banners/${id}/duplicate`, {
    method: "POST",
  }),
  trackView: (id: number, userId?: number) => request(`/banners/${id}/view`, {
    method: "POST",
    body: JSON.stringify({ userId }),
  }),
  trackClick: (id: number, userId?: number) => request(`/banners/${id}/click`, {
    method: "POST",
    body: JSON.stringify({ userId }),
  }),
  getViewers: (id: number) => request(`/banners/${id}/viewers`),
  reorder: (bannerIds: number[]) => request("/banners/reorder", {
    method: "POST",
    body: JSON.stringify({ bannerIds }),
  }),
  bulkDelete: (ids: number[]) => request("/banners/bulk-delete", {
    method: "POST",
    body: JSON.stringify({ ids }),
  }),
};

export const expenseCategoriesAPI = {
  getAll: () => request("/expense-categories"),
  getById: (id: number) => request(`/expense-categories/${id}`),
  create: (data: { name: string; icon?: string; color?: string; description?: string }) => request("/expense-categories", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id: number, data: Partial<{ name: string; icon: string; color: string; description: string; isActive: boolean }>) => request(`/expense-categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
  delete: (id: number) => request(`/expense-categories/${id}`, {
    method: "DELETE",
  }),
};

export const expensesAPI = {
  getAll: (filters?: { categoryId?: number; warehouseId?: number; startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams();
    if (filters?.categoryId) params.append("categoryId", filters.categoryId.toString());
    if (filters?.warehouseId) params.append("warehouseId", filters.warehouseId.toString());
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    const queryString = params.toString();
    return request(`/expenses${queryString ? `?${queryString}` : ""}`);
  },
  getById: (id: number) => request(`/expenses/${id}`),
  getSummary: (filters?: { warehouseId?: number; startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams();
    if (filters?.warehouseId) params.append("warehouseId", filters.warehouseId.toString());
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    const queryString = params.toString();
    return request(`/expenses/summary${queryString ? `?${queryString}` : ""}`);
  },
  create: (data: { categoryId: number; warehouseId?: number; amount: string; description: string; notes?: string; paymentMethod?: string; reference?: string; expenseDate?: string }) => request("/expenses", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id: number, data: Partial<{ categoryId: number; warehouseId: number; amount: string; description: string; notes: string; paymentMethod: string; reference: string; expenseDate: string }>) => request(`/expenses/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
  delete: (id: number) => request(`/expenses/${id}`, {
    method: "DELETE",
  }),
};

export const deliverySettingsAPI = {
  getAll: () => request("/delivery-settings"),
  getById: (id: number) => request(`/delivery-settings/${id}`),
  resolve: (warehouseId: number, subtotal: number, quantity: number) => 
    request(`/delivery-settings/resolve?warehouseId=${warehouseId}&subtotal=${subtotal}&quantity=${quantity}`),
  create: (data: { warehouseId: number; cityId?: number; baseFee: string; freeThresholdAmount?: string; freeThresholdQuantity?: number; isEnabled?: boolean; notes?: string }) => request("/delivery-settings", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id: number, data: Partial<{ warehouseId: number; cityId: number; baseFee: string; freeThresholdAmount: string; freeThresholdQuantity: number; isEnabled: boolean; notes: string }>) => request(`/delivery-settings/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
  delete: (id: number) => request(`/delivery-settings/${id}`, {
    method: "DELETE",
  }),
};

// Customer Credit API - نظام الآجل
export const creditsAPI = {
  get: (userId: number) => request(`/credits/${userId}`),
  getAll: () => request("/credits"),
  checkEligibility: (userId: number, amount: number) => request(`/credits/${userId}/check-eligibility`, {
    method: "POST",
    body: JSON.stringify({ amount }),
  }),
  updateLevel: (userId: number) => request(`/credits/${userId}/update-level`, {
    method: "POST",
  }),
  getTransactions: (userId: number) => request(`/credits/${userId}/transactions`),
  createPurchase: (userId: number, orderId: number, amount: number) => request(`/credits/${userId}/purchase`, {
    method: "POST",
    body: JSON.stringify({ orderId, amount }),
  }),
  createPayment: (userId: number, amount: number, notes?: string) => request(`/credits/${userId}/payment`, {
    method: "POST",
    body: JSON.stringify({ amount, notes }),
  }),
  update: (userId: number, data: Partial<{ creditLimit: string; isEligible: boolean }>) => request(`/credits/${userId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
  getAllPending: () => request("/credits/pending/all"),
  getNextDue: (userId: number) => request(`/credits/${userId}/next-due`),
};

// ERP Settings API - إعدادات نظام ERP الخارجي
export const erpSettingsAPI = {
  getAll: () => request("/erp-settings"),
  getById: (id: number) => request(`/erp-settings/${id}`),
  getByWarehouse: (warehouseId: number) => request(`/erp-settings/warehouse/${warehouseId}`),
  create: (data: { warehouseId: number; erpUrl: string; apiKey?: string; isActive?: boolean }) => request("/erp-settings", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id: number, data: Partial<{ warehouseId: number; erpUrl: string; apiKey: string; isActive: boolean }>) => request(`/erp-settings/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
  delete: (id: number) => request(`/erp-settings/${id}`, {
    method: "DELETE",
  }),
};

// ERP Products API - منتجات نظام ERP
export const erpProductsAPI = {
  getByWarehouse: (warehouseId: number) => request(`/erp-products/${warehouseId}`),
  sync: (warehouseId: number) => request(`/erp-products/${warehouseId}/sync`, {
    method: "POST",
  }),
};
