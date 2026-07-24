# WordPress Product API Documentation

## Overview
This API exposes product catalog data from a WordPress/WooCommerce database through simple REST endpoints.

Base URL:
- http://localhost:4000/api/wp

Main endpoints:
- GET /api/wp/products
- GET /api/wp/products/:identifier
- GET /api/wp/taxonomies/categories
- GET /api/wp/taxonomies/brands

---

## 1. Products List Endpoint

### Endpoint
GET /api/wp/products

### Purpose
Use this endpoint to fetch a paginated list of products for the frontend catalog, shop page, search page, or category page.

### Query Parameters

#### 1. Pagination
- skip: number of products to skip before returning results
  - default: 0
  - example: skip=20
- limit: number of products per request
  - default: 10
  - max: 100
  - example: limit=20

Example:
```http
GET /api/wp/products?skip=20&limit=20
```

This returns the next 20 products after skipping the first 20.

#### 2. Search
- q: search keyword
  - searches product title and excerpt
  - example: q=serum

Example:
```http
GET /api/wp/products?q=serum
```

#### 3. Category Filter
- category: category slug
  - example: category=skincare

Example:
```http
GET /api/wp/products?category=skincare
```

#### 4. Brand Filter
- brand: brand slug
  - example: brand=decantre

Example:
```http
GET /api/wp/products?brand=decantre
```

#### 5. Sorting
- sortBy: field to sort by
  - supported values:
    - date_added
    - price_asc
    - price_desc
- sortOrder: sort direction
  - supported values:
    - asc
    - desc

Examples:
```http
GET /api/wp/products?sortBy=date_added&sortOrder=desc
GET /api/wp/products?sortBy=price_asc&sortOrder=asc
GET /api/wp/products?sortBy=price_desc&sortOrder=desc
```

### Combined Example
```http
GET /api/wp/products?skip=0&limit=12&q=serum&category=skincare&brand=decantre&sortBy=price_desc&sortOrder=desc
```

### Response Shape
```json
{
  "data": [
    {
      "id": 123,
      "slug": "sample-product",
      "title": "Sample Product",
      "excerpt": "Short description",
      "status": "publish",
      "date": "2024-01-01T10:00:00.000Z",
      "type": "product",
      "product_type": "simple",
      "image": "https://example.com/wp-content/uploads/2024/01/image.jpg",
      "price": 250,
      "variations": []
    }
  ],
  "meta": {
    "total": 25,
    "skip": 0,
    "limit": 10,
    "totalPages": 3
  }
}
```

### Notes
- The endpoint returns published products only.
- If a product has variations, it is treated as a variable product.
- Product variations are returned under the variations field.

---

## 2. Single Product Endpoint

### Endpoint
GET /api/wp/products/:identifier

### Purpose
Use this endpoint to fetch one product by its ID or slug.

### Examples
```http
GET /api/wp/products/123
GET /api/wp/products/sample-product
```

### Response Shape
```json
{
  "data": {
    "id": 123,
    "slug": "sample-product",
    "title": "Sample Product",
    "excerpt": "Short description",
    "status": "publish",
    "date": "2024-01-01T10:00:00.000Z",
    "type": "product",
    "product_type": "variable",
    "image": "https://example.com/wp-content/uploads/2024/01/image.jpg",
    "price": null,
    "variations": [
      {
        "id": 456,
        "name": "Variation 1",
        "size": "5ml",
        "price": 180,
        "stock_status": "instock"
      }
    ]
  }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Product not found"
}
```

---

## 3. Categories Endpoint

### Endpoint
GET /api/wp/taxonomies/categories

### Purpose
Returns all product categories available in the WordPress database.

### Example
```http
GET /api/wp/taxonomies/categories
```

### Response Shape
```json
{
  "data": [
    {
      "id": 1,
      "name": "Skincare",
      "slug": "skincare"
    }
  ]
}
```

---

## 4. Brands Endpoint

### Endpoint
GET /api/wp/taxonomies/brands

### Purpose
Returns all product brands available in the WordPress database.

### Example
```http
GET /api/wp/taxonomies/brands
```

### Response Shape
```json
{
  "data": [
    {
      "id": 2,
      "name": "Decantre",
      "slug": "decantre"
    }
  ]
}
```

---

## 5. How to Use the API in a Frontend

### Example 1: Fetch first set of products
```http
GET /api/wp/products?skip=0&limit=10
```

### Example 2: Search products
```http
GET /api/wp/products?q=oil
```

### Example 3: Filter by category
```http
GET /api/wp/products?category=skincare
```

### Example 4: Filter by brand
```http
GET /api/wp/products?brand=decantre
```

### Example 5: Sort by price descending
```http
GET /api/wp/products?sortBy=price_desc&sortOrder=desc
```

### Example 6: Combine search + filter + sort + pagination
```http
GET /api/wp/products?skip=12&limit=12&q=serum&category=skincare&brand=decantre&sortBy=price_desc&sortOrder=desc
```

---

## 6. Pagination Flow
When using pagination:
1. Send skip=0 initially.
2. Read meta.total and meta.totalPages.
3. Increase skip by limit for the next page of results.

Example:
```json
{
  "meta": {
    "total": 50,
    "skip": 0,
    "limit": 10,
    "totalPages": 5
  }
}
```

For the next page, use:
```http
GET /api/wp/products?skip=10&limit=10
```

This means:
- 50 products total
- 5 result windows total
- 10 products per request

---

## 7. Search and Filter Strategy
A typical frontend flow can be:
1. Load categories and brands from the taxonomy endpoints.
2. Fetch products with category/brand/search filters.
3. Use pagination to load more results.
4. Apply sorting for price or newest products.

---

## 8. Current Scope
This API currently supports:
- product listing
- single product details
- search
- pagination
- category filtering
- brand filtering
- sorting by date or price
- simple and variable products
- variation details

It does not yet cover:
- cart
- checkout
- user authentication
- orders
- full WooCommerce admin operations
