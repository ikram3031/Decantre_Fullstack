export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const envUrl = import.meta.env.VITE_API_URL || import.meta.env.NEXT_PUBLIC_API_URL;
    // If page is https and target API is http, use relative url '' so Vite dev server proxy handles it safely
    if (window.location.protocol === 'https:' && (!envUrl || envUrl.startsWith('http://'))) {
      return '';
    }
    return envUrl ? envUrl.replace(/\/$/, '') : '';
  }
  return (import.meta.env.VITE_API_URL || 'http://144.79.218.126:5092').replace(/\/$/, '');
};

export const normalizeProductImage = (rawImage = '') => {
  let imageUrl = rawImage || '';
  if (!imageUrl) return '';
  if (imageUrl.startsWith('//')) imageUrl = `https:${imageUrl}`;
  
  imageUrl = imageUrl.replace(/webiste\.decantrebd\.com|webste\.decantrebd\.com/gi, 'decantrebd.com');
  
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && imageUrl.includes('144.79.218.126')) {
      return imageUrl.replace(/^https?:\/\/[^/]+/, '');
    }
    return imageUrl;
  }

  if (imageUrl.startsWith('/')) {
    if (imageUrl.startsWith('/wp-content')) {
      return `https://decantrebd.com${imageUrl}`;
    }
    // Relative path for proxied static content like /content/products/... or /uploads/...
    return imageUrl;
  }

  return `/${imageUrl.replace(/^\/+/, '')}`;
};

const parseBadge = (badge = {}) => ({
  name: badge.badge_name || badge.key || badge.name || '',
  text: badge.badge_text || badge.value || badge.text || '',
  color: badge.badge_color || badge.color || '',
  priority: Number.isFinite(+badge.badge_priority) ? Number(badge.badge_priority) : 0
});

export const normalizeProductBadges = (product = {}) => {
  const badges = [];

  if (Array.isArray(product.badges)) {
    badges.push(...product.badges.map(parseBadge).filter((badge) => badge.text));
  } else if (product.badge) {
    const badge = parseBadge(product.badge);
    if (badge.text) badges.push(badge);
  } else if (product.badge_name || product.badge_text || product.badge_color || product.badge_priority !== undefined) {
    const badge = parseBadge(product);
    if (badge.text) badges.push(badge);
  }

  if (!badges.length) {
    if (product.isBestSeller) {
      badges.push({ name: 'best-seller', text: 'BESTSELLER', color: 'gold', priority: 0 });
    }
    if (product.isFeatured) {
      badges.push({ name: 'decantre-choice', text: 'DECANTRE CHOICE', color: '#bf9b30', priority: 1 });
    }
  }

  return badges.sort((a, b) => (a.priority || 0) - (b.priority || 0));
};

const normalizeCategory = (product = {}) => {
  if (Array.isArray(product.categories) && product.categories.length > 0) {
    const cat = product.categories[0];
    if (typeof cat === 'object' && cat !== null) {
      return cat.name || cat.title || cat.slug || 'Unisex';
    }
    if (typeof cat === 'string') return cat;
  }
  if (typeof product.category === 'object' && product.category !== null) {
    return product.category.name || 'Unisex';
  }
  if (typeof product.category === 'string') return product.category;
  return 'Unisex';
};

const normalizeBrand = (product = {}) => {
  if (Array.isArray(product.brands) && product.brands.length > 0) {
    const b = product.brands[0];
    if (typeof b === 'object' && b !== null) return b.name || 'Unknown Brand';
    if (typeof b === 'string') return b;
  }
  if (typeof product.brand === 'object' && product.brand !== null) {
    return product.brand.name || 'Unknown Brand';
  }
  if (typeof product.brand === 'string') return product.brand;
  return 'Unknown Brand';
};

export const mapRemoteProduct = (product = {}) => {
  // Determine Primary Image URL
  let rawImage = product.imageUrl || product.image || '';
  if (!rawImage && Array.isArray(product.images) && product.images.length > 0) {
    const firstImg = product.images[0];
    rawImage = typeof firstImg === 'object' ? firstImg.url : firstImg;
  }

  // Handle Gallery Images
  const galleryImages = Array.isArray(product.images)
    ? product.images.map((img) => (typeof img === 'object' ? normalizeProductImage(img.url) : normalizeProductImage(img))).filter(Boolean)
    : [];

  // Determine Product Variations (Mongoose 'variants' or WP 'variations')
  let variations = [];

  if (Array.isArray(product.variants) && product.variants.length > 0) {
    // Mongoose Variant Schema
    variations = product.variants.map((v, idx) => {
      const effectivePrice = Number.isFinite(+v.offerPrice) && +v.offerPrice > 0 ? Number(v.offerPrice) : Number(v.price || 0);
      const originalPrice = Number.isFinite(+v.offerPrice) && +v.offerPrice > 0 ? Number(v.price) : null;
      return {
        id: v._id || v.id || `var-${idx}`,
        name: `${product.name || product.title} - ${v.size}`,
        size: v.size || 'Standard',
        price: effectivePrice,
        originalPrice: originalPrice,
        stockQuantity: v.stockQuantity ?? 0,
        stock_status: (v.stockQuantity ?? 1) > 0 ? 'instock' : 'outofstock',
        sku: v.sku || '',
        raw: v
      };
    });
  } else if (Array.isArray(product.variations) && product.variations.length > 0) {
    // WP / Legacy Variations Schema
    variations = product.variations.map((v, idx) => ({
      id: v.id || `var-${idx}`,
      name: v.name || product.title || product.name,
      size: v.size || 'Standard',
      price: Number(v.price || 0),
      originalPrice: v.originalPrice ? Number(v.originalPrice) : null,
      stock_status: v.stock_status || 'instock',
      raw: v
    }));
  }

  // If simple product or no variations specified, create a default top-level variation
  const topPrice = Number.isFinite(+product.offerPrice) && +product.offerPrice > 0 ? Number(product.offerPrice) : Number(product.price || 0);
  const topOriginalPrice = Number.isFinite(+product.offerPrice) && +product.offerPrice > 0 ? Number(product.price) : null;

  if (variations.length === 0) {
    variations.push({
      id: product.id || product._id || product.slug || 'var-default',
      name: product.name || product.title || '',
      size: 'Full Bottle',
      price: topPrice,
      originalPrice: topOriginalPrice,
      stockQuantity: product.stockQuantity ?? 0,
      stock_status: product.stockStatus || 'instock',
      sku: product.sku || '',
      raw: product
    });
  }

  // Base price calculation (lowest variation price or top-level price)
  const basePrice = variations.length > 0 ? Math.min(...variations.map((v) => v.price)) : topPrice;

  return {
    id: product.id || product._id || product.slug || String(Math.random()),
    _id: product._id || product.id,
    name: product.name || product.title || '',
    slug: product.slug || '',
    type: product.type || 'simple',
    tagline: (product.excerpt || '').replace(/<[^>]+>/g, '').trim() || '',
    category: normalizeCategory(product),
    categories: product.categories || [],
    brand: normalizeBrand(product),
    basePrice: basePrice,
    price: topPrice,
    originalPrice: topOriginalPrice,
    offerPrice: product.offerPrice || null,
    stockQuantity: product.stockQuantity ?? 0,
    sku: product.sku || '',
    description: product.description || product.content || '',
    season: product.season || 'All-Season',
    tags: Array.isArray(product.tags) ? product.tags : [],
    notes: Array.isArray(product.notes) ? product.notes : (typeof product.notes === 'object' ? product.notes : []),
    scentFamily: product.scentFamily || (Array.isArray(product.tags) ? product.tags.join(', ') : ''),
    longevity: product.longevity || 4,
    sillage: product.sillage || 4,
    image: normalizeProductImage(rawImage),
    images: galleryImages.length > 0 ? galleryImages : [normalizeProductImage(rawImage)],
    stockStatus: product.stockStatus || 'instock',
    isBestSeller: product.isBestSeller || false,
    isFeatured: product.isFeatured || false,
    badges: normalizeProductBadges(product),
    variations,
    raw: product
  };
};
