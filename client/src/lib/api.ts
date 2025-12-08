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
