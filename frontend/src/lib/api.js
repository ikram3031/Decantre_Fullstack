import { mapRemoteProduct } from '../store/productHelpers';

// Centralized helper to get the sanitized API base URL from env
export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.NEXT_PUBLIC_API_URL || '';
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && envUrl.startsWith('http://')) {
    return '';
  }
  return envUrl ? envUrl.replace(/\/$/, '') : '';
};



// Centralized helper to get the image base URL from env
export const getImageBaseUrl = () => {
  const envImgUrl = import.meta.env.VITE_IMAGE_BASE_URL || import.meta.env.NEXT_PUBLIC_IMAGE_BASE_URL || '';
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && envImgUrl.startsWith('http://')) {
    return '';
  }
  return envImgUrl ? envImgUrl.replace(/\/$/, '') : getApiBaseUrl();
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

const fetchWithRetry = async (url, options = {}, timeout = 10000, maxAttempts = 3, attempt = 1) => {
  try {
    return await fetchWithTimeout(url, options, timeout);
  } catch (err) {
    if (attempt >= maxAttempts) {
      throw new Error('Something went wrong');
    }
    await delay(250 * attempt);
    return fetchWithRetry(url, options, timeout, maxAttempts, attempt + 1);
  }
};

/**
 * Centralized API call to fetch products.
 *
 * Simple listing (GET):
 *   fetchProducts({ q: 'serum', skip: 0, limit: 12, sortBy: 'price', order: 'asc' })
 *
 * Rich filtered listing (POST) — triggered when category/brand/season/tags/filter is present:
 *   fetchProducts({ q: 'vitamin', category: 'skincare', brand: 'xyz', limit: 20 })
 *
 * Response shape: { data: [...], totalRows, meta: { total, skip, limit, totalPages } }
 */
export async function fetchProducts(opts = {}) {
  const apiBaseUrl = getApiBaseUrl();

  const skip = opts.skip ?? opts.offset ?? 0;
  const limit = Math.min(opts.limit || 20, 100);
  const sortBy = opts.sortBy || 'createdAt';
  const order = opts.order || 'desc';
  const q = opts.q || opts.search || opts.keyword || '';

  // Determine if we need a POST (rich filters) or GET (simple listing)
  const hasFilters = opts.category || opts.brand || opts.season || opts.tags || opts.filter || opts.name || opts.slug || opts.did;

  let res;
  try {
    if (hasFilters) {
      // POST — rich filtered listing
      const body = {};
      if (q) body.q = q;
      if (opts.category) body.category = opts.category;
      if (opts.brand) body.brand = opts.brand;
      if (opts.season) body.season = opts.season;
      if (opts.tags) body.tags = opts.tags;
      if (opts.filter) body.filter = opts.filter;
      if (opts.name) body.name = opts.name;
      if (opts.slug) body.slug = opts.slug;
      if (opts.did) body.did = opts.did;
      body.skip = skip;
      body.limit = limit;
      body.sortBy = sortBy;
      body.order = order;

      res = await fetchWithRetry(`${apiBaseUrl}/api/v1/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }, 10000, 3);
    } else {
      // GET — simple listing + optional free-text search
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      params.set('skip', String(skip));
      params.set('limit', String(limit));
      params.set('sortBy', sortBy);
      params.set('order', order);

      res = await fetchWithRetry(`${apiBaseUrl}/api/v1/products?${params.toString()}`, {}, 10000, 3);
    }
  } catch (err) {
    throw new Error('Something went wrong');
  }

  if (!res.ok) {
    throw new Error('Something went wrong');
  }

  try {
    const json = await res.json();
    const list = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
    const mapped = list.map(mapRemoteProduct);
    // Attach pagination meta so callers can use it
    mapped._meta = json.meta || null;
    mapped._totalRows = json.totalRows || list.length;
    return mapped;
  } catch (err) {
    throw new Error('Something went wrong');
  }
}


/**
 * Centralized API call to fetch product details
 */
export async function fetchProductDetails(slugOrId) {
  const apiBaseUrl = getApiBaseUrl();
  let res;
  try {
    res = await fetchWithRetry(`${apiBaseUrl}/api/v1/products/${slugOrId}`, {}, 8000, 3);
    if (!res.ok) {
      res = await fetchWithRetry(`${apiBaseUrl}/api/wp/products/${slugOrId}`, {}, 8000, 3);
    }
  } catch (err) {
    throw new Error('Something went wrong');
  }

  if (!res.ok) {
    throw new Error('Something went wrong');
  }

  try {
    const json = await res.json();
    const targetData = json.data || json;
    if (targetData && typeof targetData === 'object') {
      return mapRemoteProduct(targetData);
    }
    return null;
  } catch (err) {
    throw new Error('Something went wrong');
  }
}

/**
 * Centralized API call to fetch categories
 */
export async function fetchCategories(opts = {}) {
  const apiBaseUrl = getApiBaseUrl();
  const skip = opts.skip ?? 0;
  const limit = opts.limit || 50;

  let res;
  try {
    res = await fetchWithRetry(`${apiBaseUrl}/api/v1/categories?skip=${skip}&limit=${limit}`, {}, 8000, 3);
  } catch (err) {
    throw new Error('Something went wrong');
  }

  if (!res.ok) {
    throw new Error('Something went wrong');
  }

  try {
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
  } catch (err) {
    throw new Error('Something went wrong');
  }
}

/**
 * Centralized API call to fetch brands
 */
export async function fetchBrands(opts = {}) {
  const apiBaseUrl = getApiBaseUrl();
  const skip = opts.skip ?? 0;
  const limit = opts.limit || 50;

  let res;
  try {
    res = await fetchWithRetry(`${apiBaseUrl}/api/v1/brands?skip=${skip}&limit=${limit}`, {}, 8000, 3);
  } catch (err) {
    throw new Error('Something went wrong');
  }

  if (!res.ok) {
    throw new Error('Something went wrong');
  }

  try {
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
  } catch (err) {
    throw new Error('Something went wrong');
  }
}


/**
 * Centralized API call to fetch combo/bundle products.
 * Uses POST with category filter per the API spec.
 */
export async function fetchCombos(opts = {}) {
  const limit = opts.limit || 100;
  const categoryNames = ['Combo', 'Bundle', 'Combo Set'];

  for (const cat of categoryNames) {
    try {
      const results = await fetchProducts({ category: cat, skip: 0, limit });
      if (results.length > 0) return results;
    } catch (_) {
      // try next category
    }
  }
  return [];
}

/**
 * Centralized API call to create order
 */
export async function createOrder(orderPayload) {
  const apiBaseUrl = getApiBaseUrl();
  const res = await fetch(`${apiBaseUrl}/api/v1/orders/new-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const errorMsg = json?.errors?.join(', ') || json?.message || 'Failed to place order';
    throw new Error(errorMsg);
  }
  return json;
}
