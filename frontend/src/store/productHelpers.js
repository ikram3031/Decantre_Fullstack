export const getApiBaseUrl = () => {
  const envUrl =
    import.meta.env.VITE_API_URL || import.meta.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }
  return "https://server.decantrebd.com";
};

export const normalizeProductImage = (rawImage = "") => {
  let imageUrl = rawImage || "";
  if (!imageUrl || imageUrl === "undefined") return "";
  if (imageUrl.startsWith("//")) imageUrl = `https:${imageUrl}`;

  imageUrl = imageUrl.replace(
    /webiste\.decantrebd\.com|webste\.decantrebd\.com/gi,
    "decantrebd.com",
  );
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
        name: "decantre-choice",
        text: "DECANTRE CHOICE",
        color: "#bf9b30",
        priority: 1,
      });
    }
  }

  return badges.sort((a, b) => (a.priority || 0) - (b.priority || 0));
};

const getCachedCategories = () => {
  try {
    const cached = localStorage.getItem("luxury_categories");
    return cached ? JSON.parse(cached) : [];
  } catch (e) {
    return [];
  }
};

const getCachedBrands = () => {
  try {
    const cached = localStorage.getItem("luxury_brands");
    return cached ? JSON.parse(cached) : [];
  } catch (e) {
    return [];
  }
};

export const resolveCategoryName = (catValue) => {
  if (!catValue) return "Unisex";
  if (typeof catValue === "object" && catValue !== null) {
    return catValue.name || catValue.title || catValue.slug || "Unisex";
  }
  const strVal = String(catValue).trim();
  if (!strVal) return "Unisex";
  const cachedList = getCachedCategories();
  const found = cachedList.find(
    (c) =>
      String(c._id || c.id) === strVal ||
      String(c.slug || "").toLowerCase() === strVal.toLowerCase() ||
      String(c.name || "").toLowerCase() === strVal.toLowerCase(),
  );
  if (found) return found.name || found.title || found.slug || strVal;
  return strVal;
};

export const resolveBrandName = (brandValue) => {
  if (!brandValue) return "";
  if (Array.isArray(brandValue)) {
    for (const item of brandValue) {
      const resolved = resolveBrandName(item);
      if (resolved) return resolved;
    }
    return "";
  }
  if (typeof brandValue === "object" && brandValue !== null) {
    const directName =
      brandValue.name || brandValue.title || brandValue.slug || "";
    if (directName) return directName;

    const lookupValue = String(
      brandValue.id || brandValue._id || brandValue.did || "",
    ).trim();
    if (lookupValue) {
      const cachedList = getCachedBrands();
      const found = cachedList.find((b) => {
        const candidates = [b._id, b.id, b.did, b.slug, b.name, b.title];
        return candidates.some(
          (candidate) =>
            String(candidate || "")
              .trim()
              .toLowerCase() === lookupValue.toLowerCase(),
        );
      });
      if (found) return found.name || found.title || found.slug || lookupValue;
      return lookupValue;
    }
    return "";
  }

  const strVal = String(brandValue).trim();
  if (!strVal) return "";
  const cachedList = getCachedBrands();
  const found = cachedList.find((b) => {
    const candidates = [b._id, b.id, b.did, b.slug, b.name, b.title];
    return candidates.some(
      (candidate) =>
        String(candidate || "")
          .trim()
          .toLowerCase() === strVal.toLowerCase(),
    );
  });
  if (found) return found.name || found.title || found.slug || strVal;
  return strVal;
};

const normalizeCategory = (product = {}) => {
  const catInput =
    product.category ||
    product.categoryId ||
    product.category_id ||
    (Array.isArray(product.categories) && product.categories.length > 0
      ? product.categories[0]
      : null);
  return resolveCategoryName(catInput);
};

const normalizeBrand = (product = {}) => {
  const brandCandidates = [];

  if (Array.isArray(product.brands) && product.brands.length > 0) {
    brandCandidates.push(...product.brands);
  }

  brandCandidates.push(
    product.brand,
    product.brandName,
    product.brand_name,
    product.brandInfo,
    product.brandData,
    product.brandId,
    product.brand_id,
    product.brandDetails,
  );

  for (const brandInput of brandCandidates) {
    const resolved = resolveBrandName(brandInput);
    if (resolved) return resolved;
  }

  // Fallback: extract from product name if name is in "Brand - Product" or "Brand Product" format
  if (product.name || product.title) {
    const fullName = String(product.name || product.title).trim();
    if (fullName.includes(" - ")) {
      return fullName.split(" - ")[0].trim();
    }
    const words = fullName.split(" ");
    if (words.length > 1) {
      return words[0];
    }
    return fullName;
  }
  return "";
};

export const mapRemoteProduct = (product = {}) => {
  // Determine Primary Image URL
  let rawImage = product.imageUrl || product.image || "";
  if (!rawImage && Array.isArray(product.images) && product.images.length > 0) {
    const firstImg = product.images[0];
    rawImage = typeof firstImg === "object" ? firstImg.url : firstImg;
  }

  // Handle Gallery Images
  const galleryImages = Array.isArray(product.images)
    ? product.images
        .map((img) =>
          typeof img === "object"
            ? normalizeProductImage(img.url)
            : normalizeProductImage(img),
        )
        .filter(Boolean)
    : [];

  // Determine Product Variations (Mongoose 'variants' or WP 'variations')
  let variations = [];

  if (Array.isArray(product.variants) && product.variants.length > 0) {
    // Mongoose Variant Schema
    variations = product.variants.map((v, idx) => {
      const effectivePrice =
        Number.isFinite(+v.offerPrice) && +v.offerPrice > 0
          ? Number(v.offerPrice)
          : Number(v.price || 0);
      const originalPrice =
        Number.isFinite(+v.offerPrice) && +v.offerPrice > 0
          ? Number(v.price)
          : null;
      return {
        id: v._id || v.id || `var-${idx}`,
        name: `${product.name || product.title} - ${v.size}`,
        size: v.size || "Standard",
        price: effectivePrice,
        originalPrice: originalPrice,
        stockQuantity: v.stockQuantity ?? 0,
        stockStatus: (v.stockQuantity ?? 1) > 0 ? "instock" : "outofstock",
        sku: v.sku || "",
        raw: v,
      };
    });
  } else if (
    Array.isArray(product.variations) &&
    product.variations.length > 0
  ) {
    // WP / Legacy Variations Schema
    variations = product.variations.map((v, idx) => ({
      id: v.id || `var-${idx}`,
      name: v.name || product.title || product.name,
      size: v.size || "Standard",
      price: Number(v.price || 0),
      originalPrice: v.originalPrice ? Number(v.originalPrice) : null,
      stockStatus: v.stockStatus || "instock",
      raw: v,
    }));
  }

  // If simple product or no variations specified, create a default top-level variation
  const topPrice =
    Number.isFinite(+product.offerPrice) && +product.offerPrice > 0
      ? Number(product.offerPrice)
      : Number(product.price || 0);
  const topOriginalPrice =
    Number.isFinite(+product.offerPrice) && +product.offerPrice > 0
      ? Number(product.price)
      : null;

  if (variations.length === 0) {
    variations.push({
      id: product.id || product._id || product.slug || "var-default",
      name: product.name || product.title || "",
      size: "Full Bottle",
      price: topPrice,
      originalPrice: topOriginalPrice,
      stockQuantity: product.stockQuantity ?? 0,
      stockStatus: product.stockStatus || "instock",
      sku: product.sku || "",
      raw: product,
    });
  }

  // Base price calculation (lowest variation price or top-level price)
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
    season: product.season || "All-Season",
    tags: Array.isArray(product.tags) ? product.tags : [],
    notes: Array.isArray(product.notes)
      ? product.notes
      : typeof product.notes === "object"
        ? product.notes
        : [],
    scentFamily:
      product.scentFamily ||
      (Array.isArray(product.tags) ? product.tags.join(", ") : ""),
    longevity: product.longevity || 4,
    sillage: product.sillage || 4,
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
    return { size: "", concentration: "Eau de Parfum" };
  }
  // Find variation with the lowest price
  const lowest = variations.reduce((min, curr) => {
    return (curr.price < min.price) ? curr : min;
  }, variations[0]);
  return { size: lowest?.size || "", concentration: "Eau de Parfum" };
};

