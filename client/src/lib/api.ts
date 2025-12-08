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
};

// Products API
export const productsAPI = {
  getAll: (categoryId?: number) => 
    request(`/products${categoryId ? `?categoryId=${categoryId}` : ""}`),
  getById: (id: number) => request(`/products/${id}`),
  search: (query: string) => request(`/products/search?q=${encodeURIComponent(query)}`),
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

// Admin Stats API
export const adminAPI = {
  getStats: () => request("/admin/stats"),
  getOrders: () => request("/admin/orders"),
  getUsers: () => request("/admin/users"),
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
  create: (data: any) => request("/segments", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => request(`/segments/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
};

// Reports API
export const reportsAPI = {
  getAll: () => request("/reports"),
  create: (data: any) => request("/reports", {
    method: "POST",
    body: JSON.stringify(data),
  }),
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
  create: (data: any) => request("/warehouses", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => request(`/warehouses/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
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
