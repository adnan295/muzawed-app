interface CacheEntry<T> {
  data: T;
  expiry: number;
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL = 60000; // 1 minute default

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs?: number): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + (ttlMs || this.defaultTTL)
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    Array.from(this.cache.keys()).forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const cache = new SimpleCache();

export const CACHE_KEYS = {
  PRODUCTS: 'products',
  PRODUCTS_BY_CATEGORY: 'products:category:',
  CATEGORIES: 'categories',
  BRANDS: 'brands',
};

export const CACHE_TTL = {
  SHORT: 30000,    // 30 seconds
  MEDIUM: 60000,   // 1 minute
  LONG: 300000,    // 5 minutes
};
