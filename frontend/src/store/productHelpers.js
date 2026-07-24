export const normalizeProductImage = (rawImage = '') => {
  let imageUrl = rawImage || '';
  if (imageUrl.startsWith('//')) imageUrl = `https:${imageUrl}`;
  imageUrl = imageUrl.replace(/webiste\.decantrebd\.com|webste\.decantrebd\.com/gi, 'decantrebd.com');
  if (imageUrl.startsWith('/')) imageUrl = `https://decantrebd.com${imageUrl}`;
  if (imageUrl && !/^https?:\/\//i.test(imageUrl)) imageUrl = `https://decantrebd.com/${imageUrl.replace(/^\/+/, '')}`;
  return imageUrl;
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
    return product.categories[0].name || 'Unisex';
  }
  if (product.category) return product.category;
  return 'Unisex';
};

const normalizeBrand = (product = {}) => {
  if (Array.isArray(product.brands) && product.brands.length > 0) {
    return product.brands[0].name || 'Unknown Brand';
  }
  return product.brand || 'Unknown Brand';
};

export const mapRemoteProduct = (product = {}) => {
  const variations = Array.isArray(product.variations)
    ? product.variations.map((variation) => ({
        id: variation.id,
        name: variation.name || product.title || product.name,
        size: variation.size || '',
        price: variation.price || 0,
        stock_status: variation.stock_status || 'instock',
        raw: variation
      }))
    : [];

  return {
    id: product.slug || String(product.id),
    name: product.title || product.name || '',
    tagline: (product.excerpt || '').replace(/<[^>]+>/g, '').trim() || '',
    category: normalizeCategory(product),
    brand: normalizeBrand(product),
    basePrice: (variations[0] && variations[0].price) || product.price || 0,
    description: product.description || product.content || '',
    scentFamily: product.scentFamily || '',
    notes: {},
    longevity: product.longevity || 3,
    sillage: product.sillage || 3,
    image: normalizeProductImage(product.image || ''),
    isBestSeller: product.isBestSeller || false,
    isFeatured: product.isFeatured || false,
    badges: normalizeProductBadges(product),
    variations,
    raw: product
  };
};
