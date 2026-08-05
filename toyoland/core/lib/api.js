import { mapRemoteProduct } from "../store/productHelpers";

export const getApiBaseUrl = () => {
  const envUrl =
    typeof process !== "undefined" && process.env
      ? process.env.NEXT_PUBLIC_API_URL
      : "";
  return envUrl ? envUrl.replace(/\/$/, "") : "https://server.decantrebd.com";
};

export const getImageBaseUrl = () => {
  const envImgUrl =
    typeof process !== "undefined" && process.env
      ? process.env.NEXT_PUBLIC_IMAGE_BASE_URL
      : "";
  return envImgUrl ? envImgUrl.replace(/\/$/, "") : getApiBaseUrl();
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

const fetchWithRetry = async (
  url,
  options = {},
  timeout = 10000,
  maxAttempts = 3,
  attempt = 1,
) => {
  try {
    return await fetchWithTimeout(url, options, timeout);
  } catch (err) {
    if (attempt >= maxAttempts) {
      throw err;
    }
    await delay(250 * attempt);
    return fetchWithRetry(url, options, timeout, maxAttempts, attempt + 1);
  }
};

export const fetchProducts = async (options = {}) => {
  try {
    const baseUrl = getApiBaseUrl();
    const params = new URLSearchParams();

    if (options.limit) params.set("limit", String(options.limit));
    if (options.page) params.set("page", String(options.page));
    if (options.category) params.set("category", options.category);
    if (options.brand) params.set("brand", options.brand);
    if (options.search) params.set("search", options.search);

    const queryString = params.toString();
    const url = `${baseUrl}/api/v1/products${queryString ? `?${queryString}` : ""}`;

    const res = await fetchWithRetry(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const json = await res.json();
    const rawList = Array.isArray(json)
      ? json
      : Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json?.products)
          ? json.products
          : [];

    return rawList.map(mapRemoteProduct);
  } catch (err) {
    console.error("fetchProducts error:", err);
    return [];
  }
};

export const fetchCategories = async () => {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetchWithRetry(`${baseUrl}/api/v1/categories`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    const categories = Array.isArray(json) ? json : json?.data || [];
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("luxury_categories", JSON.stringify(categories));
      } catch (e) {}
    }
    return categories;
  } catch (err) {
    console.error("fetchCategories error:", err);
    return [];
  }
};

export const fetchBrands = async () => {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetchWithRetry(`${baseUrl}/api/v1/brands`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    const brands = Array.isArray(json) ? json : json?.data || [];
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("luxury_brands", JSON.stringify(brands));
      } catch (e) {}
    }
    return brands;
  } catch (err) {
    console.error("fetchBrands error:", err);
    return [];
  }
};

export const fetchProductDetails = async (idOrSlug) => {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetchWithRetry(`${baseUrl}/api/v1/products/${idOrSlug}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    const raw = json?.data || json;
    return raw ? mapRemoteProduct(raw) : null;
  } catch (err) {
    console.error("fetchProductDetails error:", err);
    return null;
  }
};

export const createOrder = async (orderPayload) => {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetchWithRetry(`${baseUrl}/api/v1/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.message || "Order placement failed.");
    }
    return json;
  } catch (err) {
    console.error("createOrder error:", err);
    throw err;
  }
};
