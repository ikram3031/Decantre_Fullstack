// Initial Taxonomies Seed Data
export const INITIAL_CATEGORIES = [
  { id: 'cat-1', name: 'Luxury Perfumes', slug: 'luxury-perfumes', parentId: null },
  { id: 'cat-2', name: 'Decants', slug: 'decants', parentId: null },
  { id: 'cat-3', name: 'Niche Scents', slug: 'niche-scents', parentId: null },
  { id: 'cat-4', name: 'Designer Scents', slug: 'designer-scents', parentId: null }
];

export const INITIAL_BRANDS = [
  { id: 'br-1', name: 'Creed', slug: 'creed', parentId: null },
  { id: 'br-2', name: 'Chanel', slug: 'chanel', parentId: null },
  { id: 'br-3', name: 'Dior', slug: 'dior', parentId: null },
  { id: 'br-4', name: 'Tom Ford', slug: 'tom-ford', parentId: null },
  { id: 'br-5', name: 'Parfums de Marly', slug: 'parfums-de-marly', parentId: null }
];

export const INITIAL_TAGS = [
  { id: 'tag-1', name: 'Fresh', slug: 'fresh' },
  { id: 'tag-2', name: 'Woody', slug: 'woody' },
  { id: 'tag-3', name: 'Sweet', slug: 'sweet' },
  { id: 'tag-4', name: 'Spicy', slug: 'spicy' },
  { id: 'tag-5', name: 'Citrus', slug: 'citrus' },
  { id: 'tag-6', name: 'Long-lasting', slug: 'long-lasting' },
  { id: 'tag-7', name: 'Best-seller', slug: 'best-seller' },
  { id: 'tag-8', name: 'Premium', slug: 'premium' }
];

export const INITIAL_SEASONS = [
  'All Seasons', 'Spring', 'Summer', 'Autumn', 'Winter'
];

// Initial Seed Data
const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Creed Aventus',
    slug: 'creed-aventus',
    description: '<p>A scent designed for the bold, spirited, and confident. Creed Aventus features rich, premium notes of pineapple, blackcurrant, birch, and oakmoss.</p><p>Known worldwide as the ultimate luxury fragrance statement.</p>',
    shortDescription: 'Ultimate luxury fragrance featuring pineapple, birch, and oakmoss.',
    regularPrice: 320,
    sku: 'CR-AV-100',
    stockQuantity: 45,
    stockStatus: 'instock',
    lowStockThreshold: 5,
    categories: ['Luxury Perfumes', 'Niche Scents'],
    brand: 'Creed',
    tags: ['Fresh', 'Woody', 'Best-seller', 'Premium'],
    season: 'Summer',
    variants: [
      { id: 'var-1-3ml', size: '3ml', price: 15, stockQuantity: 50, sku: 'CR-AV-3' },
      { id: 'var-1-5ml', size: '5ml', price: 24, stockQuantity: 40, sku: 'CR-AV-5' },
      { id: 'var-1-10ml', size: '10ml', price: 45, stockQuantity: 25, sku: 'CR-AV-10' },
      { id: 'var-1-100ml', size: 'Full Bottle (100ml)', price: 320, stockQuantity: 5, sku: 'CR-AV-100' }
    ],
    images: [
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80'
    ],
    createdAt: '2026-01-15T08:00:00Z'
  },
  {
    id: 'prod-2',
    name: 'Bleu de Chanel Eau de Parfum',
    slug: 'bleu-de-chanel-edp',
    description: '<p>An aromatic-woody fragrance that unites the invigorating zest of citrus with the woody whisper of dry cedar. New sandalwood from New Caledonia gives it a warm and sensual trail.</p>',
    shortDescription: 'Unifying refreshing citrus with dry cedar and warm sandalwood.',
    regularPrice: 145,
    sku: 'CH-BL-100',
    stockQuantity: 12,
    stockStatus: 'instock',
    lowStockThreshold: 5,
    categories: ['Luxury Perfumes', 'Designer Scents'],
    brand: 'Chanel',
    tags: ['Fresh', 'Citrus', 'Best-seller'],
    season: 'All Seasons',
    variants: [
      { id: 'var-2-3ml', size: '3ml', price: 8, stockQuantity: 100, sku: 'CH-BL-3' },
      { id: 'var-2-5ml', size: '5ml', price: 12, stockQuantity: 80, sku: 'CH-BL-5' },
      { id: 'var-2-10ml', size: '10ml', price: 22, stockQuantity: 50, sku: 'CH-BL-10' },
      { id: 'var-2-100ml', size: 'Full Bottle (100ml)', price: 145, stockQuantity: 12, sku: 'CH-BL-100' }
    ],
    images: [
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80'
    ],
    createdAt: '2026-02-10T14:30:00Z'
  },
  {
    id: 'prod-3',
    name: 'Dior Sauvage Elixir',
    slug: 'dior-sauvage-elixir',
    description: '<p>An extraordinarily concentrated fragrance steeped in the iconic freshness of Sauvage with an intoxicating heart of spices, a "tailor-made" lavender essence and a blend of rich woods.</p>',
    shortDescription: 'Extraordinarily concentrated fragrance with wild spice and rich lavender.',
    regularPrice: 180,
    sku: 'DI-SV-60',
    stockQuantity: 4,
    stockStatus: 'instock',
    lowStockThreshold: 5,
    categories: ['Luxury Perfumes', 'Designer Scents'],
    brand: 'Dior',
    tags: ['Spicy', 'Woody', 'Best-seller', 'Premium'],
    season: 'Winter',
    variants: [
      { id: 'var-3-3ml', size: '3ml', price: 12, stockQuantity: 60, sku: 'DI-SV-3' },
      { id: 'var-3-5ml', size: '5ml', price: 18, stockQuantity: 45, sku: 'DI-SV-5' },
      { id: 'var-3-10ml', size: '10ml', price: 32, stockQuantity: 30, sku: 'DI-SV-10' },
      { id: 'var-3-60ml', size: 'Full Bottle (60ml)', price: 180, stockQuantity: 8, sku: 'DI-SV-60' }
    ],
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80'
    ],
    createdAt: '2026-03-01T09:15:00Z'
  },
  {
    id: 'prod-4',
    name: 'Tom Ford Lost Cherry',
    slug: 'tom-ford-lost-cherry',
    description: '<p>A full-bodied journey into the once-forbidden; a contrasting scent that reveals a tempting dichotomy of playful, candy-like gleam on the outside and luscious flesh on the inside.</p>',
    shortDescription: 'A luscious amber floral fragrance featuring sweet cherry, almond, and rose.',
    regularPrice: 395,
    sku: 'TF-LC-50',
    stockQuantity: 0,
    stockStatus: 'outofstock',
    lowStockThreshold: 5,
    categories: ['Luxury Perfumes', 'Niche Scents'],
    brand: 'Tom Ford',
    tags: ['Sweet', 'Spicy', 'Premium'],
    season: 'Autumn',
    variants: [
      { id: 'var-4-3ml', size: '3ml', price: 22, stockQuantity: 35, sku: 'TF-LC-3' },
      { id: 'var-4-5ml', size: '5ml', price: 35, stockQuantity: 25, sku: 'TF-LC-5' },
      { id: 'var-4-10ml', size: '10ml', price: 65, stockQuantity: 15, sku: 'TF-LC-10' },
      { id: 'var-4-50ml', size: 'Full Bottle (50ml)', price: 395, stockQuantity: 3, sku: 'TF-LC-50' }
    ],
    images: [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80'
    ],
    createdAt: '2026-03-12T11:45:00Z'
  },
  {
    id: 'prod-5',
    name: 'Parfums de Marly Layton',
    slug: 'pdm-layton',
    description: '<p>Layton is an addictive fragrance that exudes elegance and luxury, with notes of vanilla, amber, apple, and spices.</p>',
    shortDescription: 'Seductive oriental-floral scent with apple, vanilla, and woods.',
    regularPrice: 250,
    sku: 'PM-LY-125',
    stockQuantity: 85,
    stockStatus: 'instock',
    lowStockThreshold: 10,
    categories: ['Luxury Perfumes', 'Niche Scents'],
    brand: 'Parfums de Marly',
    tags: ['Sweet', 'Spicy', 'Woody', 'Premium'],
    season: 'Winter',
    variants: [
      { id: 'var-5-3ml', size: '3ml', price: 14, stockQuantity: 40, sku: 'PM-LY-3' },
      { id: 'var-5-5ml', size: '5ml', price: 22, stockQuantity: 30, sku: 'PM-LY-5' },
      { id: 'var-5-10ml', size: '10ml', price: 40, stockQuantity: 20, sku: 'PM-LY-10' },
      { id: 'var-5-125ml', size: 'Full Bottle (125ml)', price: 250, stockQuantity: 6, sku: 'PM-LY-125' }
    ],
    images: [
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80'
    ],
    createdAt: '2026-04-05T16:20:00Z'
  }
];

const INITIAL_CUSTOMERS = [
  {
    id: 'cust-1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    phone: '+1 (555) 234-5678',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    totalOrders: 3,
    totalSpent: 410,
    shippingAddress: {
      street: '124 Shadow Lane Apt B',
      city: 'Portland',
      state: 'OR',
      postcode: '97201',
      country: 'United States'
    },
    billingAddress: {
      street: '124 Shadow Lane Apt B',
      city: 'Portland',
      state: 'OR',
      postcode: '97201',
      country: 'United States'
    },
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'cust-2',
    name: 'Marcus Vance',
    email: 'marcus.vance@example.com',
    phone: '+1 (555) 876-5432',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    totalOrders: 1,
    totalSpent: 299,
    shippingAddress: {
      street: '458 Pine Needle Way',
      city: 'Seattle',
      state: 'WA',
      postcode: '98101',
      country: 'United States'
    },
    billingAddress: {
      street: '458 Pine Needle Way',
      city: 'Seattle',
      state: 'WA',
      postcode: '98101',
      country: 'United States'
    },
    createdAt: '2026-02-12T11:20:00Z'
  },
  {
    id: 'cust-3',
    name: 'Emily Zhao',
    email: 'emily.zhao@example.com',
    phone: '+1 (555) 432-1098',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    totalOrders: 2,
    totalSpent: 231,
    shippingAddress: {
      street: '88 Lotus Garden Dr',
      city: 'San Francisco',
      state: 'CA',
      postcode: '94107',
      country: 'United States'
    },
    billingAddress: {
      street: '88 Lotus Garden Dr',
      city: 'San Francisco',
      state: 'CA',
      postcode: '94107',
      country: 'United States'
    },
    createdAt: '2026-03-01T15:30:00Z'
  }
];

const INITIAL_ORDERS = [
  {
    id: 'ord-1001',
    orderNumber: 'WC-1001',
    customerId: 'cust-1',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.j@example.com',
    date: '2026-07-15T10:14:00Z',
    status: 'completed',
    items: [
      {
        productId: 'prod-1',
        name: 'Creed Aventus',
        size: '5ml',
        quantity: 1,
        price: 24,
        image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80'
      },
      {
        productId: 'prod-5',
        name: 'Parfums de Marly Layton',
        size: '10ml',
        quantity: 1,
        price: 40,
        image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80'
      }
    ],
    total: 64,
    paymentMethod: 'Credit Card (Stripe)',
    shippingAddress: {
      street: '124 Shadow Lane Apt B',
      city: 'Portland',
      state: 'OR',
      postcode: '97201',
      country: 'United States'
    },
    billingAddress: {
      street: '124 Shadow Lane Apt B',
      city: 'Portland',
      state: 'OR',
      postcode: '97201',
      country: 'United States'
    },
    notes: 'Please leave packages behind the green planter if not home.',
    history: [
      {
        id: 'h-1',
        date: '2026-07-15T10:14:00Z',
        status: 'pending',
        comment: 'Order received via checkout',
        updatedBy: 'System'
      },
      {
        id: 'h-2',
        date: '2026-07-15T11:00:00Z',
        status: 'processing',
        comment: 'Payment authorized and order sent to fulfillment.',
        updatedBy: 'System'
      },
      {
        id: 'h-3',
        date: '2026-07-16T14:25:00Z',
        status: 'completed',
        comment: 'Order shipped via UPS Tracking #1Z9999999999999999',
        updatedBy: 'admin'
      }
    ]
  },
  {
    id: 'ord-1002',
    orderNumber: 'WC-1002',
    customerId: 'cust-2',
    customerName: 'Marcus Vance',
    customerEmail: 'marcus.vance@example.com',
    date: '2026-07-17T08:45:00Z',
    status: 'processing',
    items: [
      {
        productId: 'prod-2',
        name: 'Bleu de Chanel Eau de Parfum',
        size: 'Full Bottle (100ml)',
        quantity: 1,
        price: 145,
        image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80'
      }
    ],
    total: 145,
    paymentMethod: 'PayPal',
    shippingAddress: {
      street: '458 Pine Needle Way',
      city: 'Seattle',
      state: 'WA',
      postcode: '98101',
      country: 'United States'
    },
    billingAddress: {
      street: '458 Pine Needle Way',
      city: 'Seattle',
      state: 'WA',
      postcode: '98101',
      country: 'United States'
    },
    notes: 'Signature required on delivery.',
    history: [
      {
        id: 'h-4',
        date: '2026-07-17T08:45:00Z',
        status: 'pending',
        comment: 'Order received via checkout',
        updatedBy: 'System'
      },
      {
        id: 'h-5',
        date: '2026-07-17T09:30:00Z',
        status: 'processing',
        comment: 'PayPal payment cleared. Preparing for shipment.',
        updatedBy: 'System'
      }
    ]
  },
  {
    id: 'ord-1003',
    orderNumber: 'WC-1003',
    customerId: 'cust-3',
    customerName: 'Emily Zhao',
    customerEmail: 'emily.zhao@example.com',
    date: '2026-07-18T14:20:00Z',
    status: 'pending',
    items: [
      {
        productId: 'prod-3',
        name: 'Dior Sauvage Elixir',
        size: '10ml',
        quantity: 1,
        price: 32,
        image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80'
      },
      {
        productId: 'prod-5',
        name: 'Parfums de Marly Layton',
        size: '5ml',
        quantity: 1,
        price: 22,
        image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80'
      }
    ],
    total: 54,
    paymentMethod: 'Credit Card (Stripe)',
    shippingAddress: {
      street: '88 Lotus Garden Dr',
      city: 'San Francisco',
      state: 'CA',
      postcode: '94107',
      country: 'United States'
    },
    billingAddress: {
      street: '88 Lotus Garden Dr',
      city: 'San Francisco',
      state: 'CA',
      postcode: '94107',
      country: 'United States'
    },
    history: [
      {
        id: 'h-6',
        date: '2026-07-18T14:20:00Z',
        status: 'pending',
        comment: 'Order received. Awaiting payment authorization.',
        updatedBy: 'System'
      }
    ]
  }
];

const INITIAL_USERS = [
  {
    id: 'usr-1',
    name: 'Alexander Wright',
    email: 'admin@example.com',
    role: 'Administrator',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'active',
    createdAt: '2025-12-01T08:00:00Z'
  },
  {
    id: 'usr-2',
    name: 'Elena Rostova',
    email: 'elena@example.com',
    role: 'Shop Manager',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'active',
    createdAt: '2026-02-15T10:30:00Z'
  },
  {
    id: 'usr-3',
    name: 'Marcus Aurelius',
    email: 'marcus@example.com',
    role: 'Editor',
    avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'inactive',
    createdAt: '2026-04-10T12:00:00Z'
  }
];

// Database Manager
export class MockDb {
  static getStore(key, initialData) {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(data);
  }

  static setStore(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  static getProducts() {
    const products = this.getStore('products', INITIAL_PRODUCTS);
    // Auto-migrate if we have stale backpack data or missing variant list
    if (products.length > 0 && (products[0].name.includes('Backpack') || !products[0].variants)) {
      localStorage.clear(); // Clear all old localStorage keys to prevent mismatched data issues
      return this.getStore('products', INITIAL_PRODUCTS);
    }
    return products;
  }

  static saveProducts(products) {
    this.setStore('products', products);
  }

  static getOrders() {
    return this.getStore('orders', INITIAL_ORDERS);
  }

  static saveOrders(orders) {
    this.setStore('orders', orders);
  }

  static getCustomers() {
    return this.getStore('customers', INITIAL_CUSTOMERS);
  }

  static saveCustomers(customers) {
    this.setStore('customers', customers);
  }

  static getUsers() {
    return this.getStore('users', INITIAL_USERS);
  }

  static saveUsers(users) {
    this.setStore('users', users);
  }

  static getCategories() {
    return this.getStore('categories', INITIAL_CATEGORIES);
  }

  static saveCategories(categories) {
    this.setStore('categories', categories);
  }

  static getBrands() {
    return this.getStore('brands', INITIAL_BRANDS);
  }

  static saveBrands(brands) {
    this.setStore('brands', brands);
  }

  static getTags() {
    return this.getStore('tags', INITIAL_TAGS);
  }

  static saveTags(tags) {
    this.setStore('tags', tags);
  }

  static reset() {
    localStorage.removeItem('products');
    localStorage.removeItem('orders');
    localStorage.removeItem('customers');
    localStorage.removeItem('users');
    localStorage.removeItem('categories');
    localStorage.removeItem('brands');
    localStorage.removeItem('tags');
  }
}
