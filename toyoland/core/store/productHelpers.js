export const getApiBaseUrl = () => {
  const envUrl =
    typeof process !== "undefined" && process.env
      ? process.env.NEXT_PUBLIC_API_URL
      : "";
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }
  return "http://localhost:5092";
};

export const normalizeProductImage = (rawImage = "") => {
  let imageUrl = rawImage || "";
  if (!imageUrl || imageUrl === "undefined") return "";
  if (imageUrl.startsWith("//")) imageUrl = `https:${imageUrl}`;

  imageUrl = imageUrl.replace(/\/content\//gi, "/uploads/");

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  const baseUrl = getApiBaseUrl();
  const cleanPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  return `${baseUrl}${cleanPath}`;
};

const parseBadge = (badge = {}) => ({
  name: badge.badge_name || badge.key || badge.name || "",
  text: badge.badge_text || badge.value || badge.text || "",
  color: badge.badge_color || badge.color || "",
  priority: Number.isFinite(+badge.badge_priority)
    ? Number(badge.badge_priority)
    : 0,
});

export const normalizeProductBadges = (product = {}) => {
  const badges = [];

  if (Array.isArray(product.badges)) {
    badges.push(
      ...product.badges.map(parseBadge).filter((badge) => badge.text),
    );
  } else if (product.badge) {
    const badge = parseBadge(product.badge);
    if (badge.text) badges.push(badge);
  } else if (
    product.badge_name ||
    product.badge_text ||
    product.badge_color ||
    product.badge_priority !== undefined
  ) {
    const badge = parseBadge(product);
    if (badge.text) badges.push(badge);
  }

  if (!badges.length) {
    if (product.isBestSeller) {
      badges.push({
        name: "best-seller",
        text: "BESTSELLER",
        color: "gold",
        priority: 0,
      });
    }
    if (product.isFeatured) {
      badges.push({
        name: "featured",
        text: "FEATURED",
        color: "#4F46E5",
        priority: 1,
      });
    }
  }

  return badges.sort((a, b) => (a.priority || 0) - (b.priority || 0));
};

const getCachedCategories = () => {
  if (typeof window === "undefined") return [];
  try {
    const cached = localStorage.getItem("toyoland_categories");
    return cached ? JSON.parse(cached) : [];
  } catch (e) {
    return [];
  }
};

const getCachedBrands = () => {
  if (typeof window === "undefined") return [];
  try {
    const cached = localStorage.getItem("toyoland_brands");
    return cached ? JSON.parse(cached) : [];
  } catch (e) {
    return [];
  }
};

export const resolveCategoryName = (catValue) => {
  if (!catValue) return "Toys";
  if (typeof catValue === "object") {
    if (catValue.name) return catValue.name;
    if (catValue.title) return catValue.title;
  }
  const strVal = String(catValue);
  const categories = getCachedCategories();
  const match = categories.find(
    (c) =>
      c.id === strVal ||
      c._id === strVal ||
      c.slug === strVal ||
      c.name?.toLowerCase() === strVal.toLowerCase(),
  );
  return match ? match.name : strVal;
};

export const resolveBrandName = (brandValue) => {
  if (!brandValue) return "Toyoland";
  if (typeof brandValue === "object") {
    if (brandValue.name) return brandValue.name;
    if (brandValue.title) return brandValue.title;
  }
  const strVal = String(brandValue);
  const brands = getCachedBrands();
  const match = brands.find(
    (b) =>
      b.id === strVal ||
      b._id === strVal ||
      b.slug === strVal ||
      b.name?.toLowerCase() === strVal.toLowerCase(),
  );
  return match ? match.name : strVal;
};

const normalizeCategory = (product = {}) => {
  if (product.category && typeof product.category === "object") {
    return product.category.name || product.category.title || "Toys";
  }
  if (product.category) {
    return resolveCategoryName(product.category);
  }
  if (Array.isArray(product.categories) && product.categories.length > 0) {
    const firstCat = product.categories[0];
    return typeof firstCat === "object"
      ? firstCat.name || firstCat.title || "Toys"
      : resolveCategoryName(firstCat);
  }
  return "Toys";
};

const normalizeBrand = (product = {}) => {
  if (product.brand && typeof product.brand === "object") {
    return product.brand.name || product.brand.title || "Toyoland";
  }
  if (product.brand) {
    return resolveBrandName(product.brand);
  }
  return "Toyoland";
};

export const mapRemoteProduct = (product = {}) => {
  const rawImage =
    product.image ||
    product.images?.[0] ||
    product.thumbnail ||
    product.featured_image ||
    "";

  let galleryImages = [];
  if (Array.isArray(product.images) && product.images.length > 0) {
    galleryImages = product.images.map((img) =>
      typeof img === "object"
        ? normalizeProductImage(img.src || img.url || "")
        : normalizeProductImage(img),
    );
  }

  const variations = (
    product.variations ||
    product.variants ||
    product.sizes ||
    []
  ).map((v) => {
    let size = v.size || v.name || v.title || "";

    const vOriginalPrice =
      Number(
        v.originalPrice ?? v.regular_price ?? v.price ?? product.price ?? 0,
      ) || 0;
    const vPrice =
      Number(v.price ?? v.offerPrice ?? v.sale_price ?? vOriginalPrice) || 0;

    const vStockQuantity = Number(
      v.stockQuantity ?? v.stock ?? product.stockQuantity ?? 0,
    );
    const vStockStatus =
      v.stockStatus ||
      (vStockQuantity > 0 ? "instock" : product.stockStatus || "instock");

    const vSku = v.sku || (product.sku ? `${product.sku}-${size}` : "");

    let rawVImg =
      v.image || v.featured_image || v.thumbnail || v.images?.[0] || "";
    if (typeof rawVImg === "object") rawVImg = rawVImg.src || rawVImg.url || "";
    const vImage = rawVImg ? normalizeProductImage(rawVImg) : "";

    return {
      id: v.id || v._id || `${product.id || product._id || "v"}-${size}`,
      _id: v._id || v.id,
      size,
      price: vPrice,
      originalPrice: vOriginalPrice > vPrice ? vOriginalPrice : vPrice,
      sku: vSku,
      stockQuantity: vStockQuantity,
      stockStatus: vStockStatus,
      image: vImage,
    };
  });

  const topOriginalPrice =
    Number(
      product.originalPrice ??
        product.regularPrice ??
        product.regular_price ??
        product.price ??
        0,
    ) || 0;
  const topPrice =
    Number(
      product.price ??
        product.offerPrice ??
        product.sale_price ??
        topOriginalPrice,
    ) || 0;

  const basePrice =
    variations.length > 0
      ? Math.min(...variations.map((v) => v.price))
      : topPrice;

  return {
    id: product.id || product._id || product.slug || String(Math.random()),
    _id: product._id || product.id,
    name: product.name || product.title || "",
    slug: product.slug || "",
    type: product.type || "simple",
    tagline: (product.excerpt || "").replace(/<[^>]+>/g, "").trim() || "",
    category: normalizeCategory(product),
    categories: product.categories || [],
    brand: normalizeBrand(product),
    basePrice: basePrice,
    price: topPrice,
    originalPrice: topOriginalPrice,
    offerPrice: product.offerPrice || null,
    stockQuantity: product.stockQuantity ?? 0,
    sku: product.sku || "",
    description: product.description || product.content || "",
    tags: Array.isArray(product.tags) ? product.tags : [],
    image: normalizeProductImage(rawImage),
    images:
      galleryImages.length > 0
        ? galleryImages
        : [normalizeProductImage(rawImage)],
    stockStatus: product.stockStatus || "instock",
    isBestSeller: product.isBestSeller || false,
    isFeatured: product.isFeatured || false,
    badges: normalizeProductBadges(product),
    variations,
    raw: product,
  };
};

export const getDefaultSelection = (product = {}) => {
  const variations = product.variations || [];
  if (variations.length === 0) {
    return { size: "", color: "" };
  }
  const lowest = variations.reduce((min, curr) => {
    return curr.price < min.price ? curr : min;
  }, variations[0]);
  return { size: lowest?.size || "" };
};
