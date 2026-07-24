export const FALLBACK_PRODUCTS = [
  {
    id: 'baccarat-rouge-540',
    name: 'Baccarat Rouge 540 Extrait',
    tagline: 'An opulent amber floral fragrance with luminous jasmine and saffron',
    category: 'Unisex',
    brand: 'Maison Francis Kurkdjian',
    basePrice: 4200,
    description: 'Baccarat Rouge 540 extrait de parfum augments the strength and radiance of the fragrance’s amber woody floral aura. In this elevated version of a scent hallmark, jasmine blossoms and woody musks engage in a alchemy of the senses.',
    scentFamily: 'Amber Woody',
    notes: { top: ['Grandiflorum Jasmine', 'Saffron'], heart: ['Bitter Almond', 'Cedarwood'], base: ['Ambergris', 'Woody Musk'] },
    longevity: 5,
    sillage: 5,
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800',
    isBestSeller: true,
    isFeatured: true,
    badges: [{ name: 'bestseller', text: 'BESTSELLER', color: '#bf9b30', priority: 1 }],
    variations: [
      { id: 'br540-3ml', name: '3ml Decant', size: '3ml', price: 1200, stock_status: 'instock' },
      { id: 'br540-5ml', name: '5ml Decant', size: '5ml', price: 1950, stock_status: 'instock' },
      { id: 'br540-10ml', name: '10ml Decant', size: '10ml', price: 3800, stock_status: 'instock' },
      { id: 'br540-full', name: '70ml Full Bottle', size: '70ml', price: 42000, stock_status: 'instock' }
    ]
  },
  {
    id: 'creed-aventus',
    name: 'Creed Aventus',
    tagline: 'Sensual, audacious and contemporary EDP for men',
    category: 'For Him',
    brand: 'Creed',
    basePrice: 2800,
    description: 'The exceptional Aventus was inspired by the dramatic life of a historic emperor, celebrating strength, power and success. Introduced in 2010 and crafted by the deft hand of Sixth Generation Master Perfumer Olivier Creed.',
    scentFamily: 'Chypre Fruity',
    notes: { top: ['Lemon', 'Pink Pepper', 'Apple', 'Bergamot', 'Blackcurrant'], heart: ['Pineapple', 'Jasmine', 'Patchouli'], base: ['Birch', 'Ambergris', 'Cedarwood', 'Oakmoss', 'Musk'] },
    longevity: 4.5,
    sillage: 4.5,
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=800',
    isBestSeller: true,
    isFeatured: true,
    badges: [{ name: 'choice', text: 'DECANTRE CHOICE', color: '#bf9b30', priority: 1 }],
    variations: [
      { id: 'aventus-3ml', name: '3ml Decant', size: '3ml', price: 950, stock_status: 'instock' },
      { id: 'aventus-5ml', name: '5ml Decant', size: '5ml', price: 1550, stock_status: 'instock' },
      { id: 'aventus-10ml', name: '10ml Decant', size: '10ml', price: 2800, stock_status: 'instock' },
      { id: 'aventus-full', name: '100ml Full Bottle', size: '100ml', price: 38000, stock_status: 'instock' }
    ]
  },
  {
    id: 'tom-ford-tobacco-vanille',
    name: 'Tom Ford Tobacco Vanille',
    tagline: 'Opulent, warm and iconic private blend fragrance',
    category: 'Unisex',
    brand: 'Tom Ford',
    basePrice: 2400,
    description: 'Tom Ford’s affection for London inspired this scent, reminiscent of an English gentlemen’s club, redolent with spice. He reinvents a classic fragrance genre by adding creamy tonka bean, vanilla, cocoa, dry fruit accords and sweet wood sap.',
    scentFamily: 'Warm & Spicy',
    notes: { top: ['Tobacco Leaf', 'Spicy Notes'], heart: ['Tonka Bean', 'Tobacco Blossom', 'Vanilla', 'Cacao'], base: ['Dry Fruit Accord', 'Wood Sap'] },
    longevity: 5,
    sillage: 4.5,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800',
    isBestSeller: false,
    isFeatured: true,
    badges: [{ name: 'featured', text: 'NICHE INTACT', color: '#8b5cf6', priority: 2 }],
    variations: [
      { id: 'tv-3ml', name: '3ml Decant', size: '3ml', price: 850, stock_status: 'instock' },
      { id: 'tv-5ml', name: '5ml Decant', size: '5ml', price: 1350, stock_status: 'instock' },
      { id: 'tv-10ml', name: '10ml Decant', size: '10ml', price: 2400, stock_status: 'instock' }
    ]
  },
  {
    id: 'pdm-delina-exclusif',
    name: 'Parfums de Marly Delina Exclusif',
    tagline: 'A captivating floral elixir with Turkish rose and lychee',
    category: 'For Her',
    brand: 'Parfums de Marly',
    basePrice: 2600,
    description: 'Delina Exclusif is a captivating floral elixir. The fragrance opens with notes of pear, lychee and grapefruit before revealing a heart of Turkish rose, incense and vetiver.',
    scentFamily: 'Floral Woody',
    notes: { top: ['Bergamot', 'Pear', 'Lychee'], heart: ['Turkish Rose', 'Incense', 'Oud'], base: ['Woody Notes', 'Amber', 'Vanilla'] },
    longevity: 4.8,
    sillage: 4.6,
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=800',
    isBestSeller: true,
    isFeatured: false,
    badges: [{ name: 'bestseller', text: 'BESTSELLER', color: '#bf9b30', priority: 1 }],
    variations: [
      { id: 'delina-3ml', name: '3ml Decant', size: '3ml', price: 900, stock_status: 'instock' },
      { id: 'delina-5ml', name: '5ml Decant', size: '5ml', price: 1450, stock_status: 'instock' },
      { id: 'delina-10ml', name: '10ml Decant', size: '10ml', price: 2600, stock_status: 'instock' }
    ]
  },
  {
    id: 'xerjoff-naxos',
    name: 'Xerjoff Naxos 1861',
    tagline: 'A homage to Sicily with sweet tobacco, honey and citrus',
    category: 'Unisex',
    brand: 'Xerjoff',
    basePrice: 2200,
    description: 'Naxos celebrates Sicily’s deep and sensual heart with a rich perfume, imbued with tradition yet striving towards the modern. Mediterranean citrus top notes contrast with precious spices.',
    scentFamily: 'Aromatic Spicy',
    notes: { top: ['Bergamot', 'Lemon', 'Lavender'], heart: ['Jasmine Sambac', 'Cinnamon', 'Honey', 'Cashmeran'], base: ['Tobacco Leaf', 'Tonka Bean', 'Vanilla'] },
    longevity: 5,
    sillage: 4.7,
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800',
    isBestSeller: true,
    isFeatured: true,
    badges: [{ name: 'popular', text: 'POPULAR', color: '#10b981', priority: 2 }],
    variations: [
      { id: 'naxos-3ml', name: '3ml Decant', size: '3ml', price: 800, stock_status: 'instock' },
      { id: 'naxos-5ml', name: '5ml Decant', size: '5ml', price: 1250, stock_status: 'instock' },
      { id: 'naxos-10ml', name: '10ml Decant', size: '10ml', price: 2200, stock_status: 'instock' }
    ]
  },
  {
    id: 'byredo-gypsy-water',
    name: 'Byredo Gypsy Water',
    tagline: 'An ode to the beauty of Romani culture and forest air',
    category: 'Unisex',
    brand: 'Byredo',
    basePrice: 2100,
    description: 'Gypsy Water is an ode to the beauty of Romani culture, its unique customs, intimate beliefs and distinguished way of living.',
    scentFamily: 'Woody Aromatic',
    notes: { top: ['Bergamot', 'Lemon', 'Pepper', 'Juniper'], heart: ['Incense', 'Pine Needles', 'Orris'], base: ['Amber', 'Vanilla', 'Sandalwood'] },
    longevity: 3.8,
    sillage: 3.5,
    image: 'https://images.unsplash.com/photo-1512777576244-b846ac3d816f?auto=format&fit=crop&q=80&w=800',
    isBestSeller: false,
    isFeatured: true,
    badges: [],
    variations: [
      { id: 'gw-3ml', name: '3ml Decant', size: '3ml', price: 750, stock_status: 'instock' },
      { id: 'gw-5ml', name: '5ml Decant', size: '5ml', price: 1200, stock_status: 'instock' },
      { id: 'gw-10ml', name: '10ml Decant', size: '10ml', price: 2100, stock_status: 'instock' }
    ]
  }
];

export const FALLBACK_CATEGORIES = [
  { id: 'for-him', name: 'For Him', slug: 'for-him' },
  { id: 'for-her', name: 'For Her', slug: 'for-her' },
  { id: 'unisex', name: 'Unisex', slug: 'unisex' },
  { id: 'miniatures', name: 'Miniatures', slug: 'miniatures' },
  { id: 'decant-accessories', name: 'Decant Accessories', slug: 'decant-accessories' },
  { id: 'niche-intacts', name: 'Niche Intacts', slug: 'niche-intacts' },
  { id: 'designer-intacts', name: 'Designer Intacts', slug: 'designer-intacts' },
  { id: 'arabian-intacts', name: 'Arabian Intacts', slug: 'arabian-intacts' }
];

export const FALLBACK_BRANDS = [
  { id: 'mfk', name: 'Maison Francis Kurkdjian', slug: 'mfk' },
  { id: 'creed', name: 'Creed', slug: 'creed' },
  { id: 'tom-ford', name: 'Tom Ford', slug: 'tom-ford' },
  { id: 'pdm', name: 'Parfums de Marly', slug: 'parfums-de-marly' },
  { id: 'xerjoff', name: 'Xerjoff', slug: 'xerjoff' },
  { id: 'byredo', name: 'Byredo', slug: 'byredo' },
  { id: 'roja', name: 'Roja Parfums', slug: 'roja-parfums' },
  { id: 'diptyque', name: 'Diptyque', slug: 'diptyque' },
  { id: 'amouage', name: 'Amouage', slug: 'amouage' },
  { id: 'dior', name: 'Dior', slug: 'dior' },
  { id: 'chanel', name: 'Chanel', slug: 'chanel' },
  { id: 'ysl', name: 'YSL', slug: 'ysl' }
];
