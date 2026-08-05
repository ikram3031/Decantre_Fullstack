/**
 * Toyoland MongoDB Initialization Script
 * 
 * This script initializes the MongoDB database with:
 * - Target Database: toyoland-store
 * - Collections: users, products, categories, brands, orders
 * - Authentication: admin user with password
 * 
 * Run after MongoDB is running:
 *   mongosh -u admin -p 11223345 --authenticationDatabase admin < toyoland-mongodb-init.js
 * 
 * Or use mongosh directly and paste commands
 */

// Switch to admin database for user verification
db = db.getSiblingDB('admin');
console.log('Current database:', db.getName());

// Verify admin user exists (should already be created by MONGO_INITDB_ROOT_USERNAME/PASSWORD)
const adminUsers = db.getCollection('system.users').find({ user: 'admin' }).toArray();
console.log('Admin users found:', adminUsers.length);

// Switch to toyoland-store database
db = db.getSiblingDB('toyoland-store');
console.log('\n=== Switching to toyoland-store database ===');
console.log('Current database:', db.getName());

// Create collections with schema validation
console.log('\n=== Creating collections with schema validation ===\n');

// 1. USERS Collection
console.log('Creating users collection...');
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'createdAt'],
      properties: {
        _id: { bsonType: 'objectId' },
        email: { 
          bsonType: 'string',
          description: 'User email address (unique)'
        },
        password: { 
          bsonType: 'string',
          description: 'Hashed password'
        },
        firstName: { bsonType: 'string' },
        lastName: { bsonType: 'string' },
        phone: { bsonType: 'string' },
        role: { 
          enum: ['customer', 'admin', 'vendor'],
          description: 'User role'
        },
        address: {
          bsonType: 'object',
          properties: {
            street: { bsonType: 'string' },
            city: { bsonType: 'string' },
            state: { bsonType: 'string' },
            postalCode: { bsonType: 'string' },
            country: { bsonType: 'string' }
          }
        },
        profileImage: { bsonType: 'string' },
        isActive: { bsonType: 'bool' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});
db.users.createIndex({ email: 1 }, { unique: true });
console.log('✓ users collection created with unique email index\n');

// 2. CATEGORIES Collection
console.log('Creating categories collection...');
db.createCollection('categories', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name'],
      properties: {
        _id: { bsonType: 'objectId' },
        name: { 
          bsonType: 'string',
          description: 'Category name (e.g., Wooden Toys, Educational Games)'
        },
        slug: { bsonType: 'string' },
        description: { bsonType: 'string' },
        image: { bsonType: 'string' },
        icon: { bsonType: 'string' },
        parentCategoryId: { bsonType: 'objectId' },
        isActive: { bsonType: 'bool' },
        displayOrder: { bsonType: 'int' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});
db.categories.createIndex({ slug: 1 }, { unique: true });
db.categories.createIndex({ name: 1 });
console.log('✓ categories collection created\n');

// 3. BRANDS Collection
console.log('Creating brands collection...');
db.createCollection('brands', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name'],
      properties: {
        _id: { bsonType: 'objectId' },
        name: { 
          bsonType: 'string',
          description: 'Brand name'
        },
        slug: { bsonType: 'string' },
        description: { bsonType: 'string' },
        logo: { bsonType: 'string' },
        website: { bsonType: 'string' },
        isActive: { bsonType: 'bool' },
        displayOrder: { bsonType: 'int' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});
db.brands.createIndex({ slug: 1 }, { unique: true });
db.brands.createIndex({ name: 1 });
console.log('✓ brands collection created\n');

// 4. PRODUCTS Collection
console.log('Creating products collection...');
db.createCollection('products', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'categoryId', 'price', 'stock'],
      properties: {
        _id: { bsonType: 'objectId' },
        name: { bsonType: 'string' },
        slug: { bsonType: 'string' },
        description: { bsonType: 'string' },
        sku: { bsonType: 'string' },
        categoryId: { bsonType: 'objectId' },
        brandId: { bsonType: 'objectId' },
        price: { bsonType: 'decimal' },
        discountPrice: { bsonType: 'decimal' },
        stock: { bsonType: 'int' },
        images: { 
          bsonType: 'array',
          items: { bsonType: 'string' }
        },
        specifications: { bsonType: 'object' },
        ageGroup: { 
          enum: ['0-2', '2-5', '5-8', '8-12', '12+', 'All Ages'],
          description: 'Target age group for educational toys'
        },
        educationalValue: { bsonType: 'string' },
        safetyRatings: { bsonType: 'array' },
        rating: { bsonType: 'double' },
        reviews: { bsonType: 'int' },
        isActive: { bsonType: 'bool' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});
db.products.createIndex({ slug: 1 }, { unique: true });
db.products.createIndex({ categoryId: 1 });
db.products.createIndex({ brandId: 1 });
db.products.createIndex({ name: 'text', description: 'text' });
console.log('✓ products collection created with text search index\n');

// 5. ORDERS Collection
console.log('Creating orders collection...');
db.createCollection('orders', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'items', 'totalAmount', 'status'],
      properties: {
        _id: { bsonType: 'objectId' },
        orderNumber: { bsonType: 'string' },
        userId: { bsonType: 'objectId' },
        items: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['productId', 'quantity', 'price'],
            properties: {
              productId: { bsonType: 'objectId' },
              quantity: { bsonType: 'int' },
              price: { bsonType: 'decimal' },
              discount: { bsonType: 'decimal' }
            }
          }
        },
        shippingAddress: {
          bsonType: 'object',
          properties: {
            street: { bsonType: 'string' },
            city: { bsonType: 'string' },
            state: { bsonType: 'string' },
            postalCode: { bsonType: 'string' },
            country: { bsonType: 'string' }
          }
        },
        billingAddress: { bsonType: 'object' },
        subtotal: { bsonType: 'decimal' },
        tax: { bsonType: 'decimal' },
        shippingCost: { bsonType: 'decimal' },
        totalAmount: { bsonType: 'decimal' },
        paymentMethod: { 
          enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer'],
          description: 'Payment method used'
        },
        paymentStatus: { 
          enum: ['pending', 'completed', 'failed', 'refunded'],
          description: 'Payment status'
        },
        status: { 
          enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'],
          description: 'Order status'
        },
        trackingNumber: { bsonType: 'string' },
        notes: { bsonType: 'string' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});
db.orders.createIndex({ userId: 1 });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ createdAt: -1 });
db.orders.createIndex({ orderNumber: 1 }, { unique: true });
console.log('✓ orders collection created\n');

// Display summary
console.log('\n=== Database Initialization Complete ===\n');
console.log('Database:', db.getName());
console.log('Collections created:');
db.getCollectionNames().forEach(col => {
  console.log(`  ✓ ${col}`);
});

console.log('\n=== Connection Information ===\n');
console.log('Host: localhost');
console.log('Port: 27017');
console.log('Database: toyoland-store');
console.log('Username: admin');
console.log('Password: 11223345');
console.log('Auth Database: admin');
