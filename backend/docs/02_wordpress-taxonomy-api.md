# WordPress Taxonomy API Documentation

This document describes the taxonomy endpoints for categories and brands used in the WooCommerce product system.

## Base URL

```
http://localhost:4000/api/wp/taxonomies
```

## Endpoints

### 1. Get Categories

**Endpoint:** `GET /categories`

Retrieve all product categories with product count and optional search/filtering.

#### Query Parameters

| Parameter | Type   | Default | Max    | Description                      |
|-----------|--------|---------|--------|----------------------------------|
| `q`       | string | -       | -      | Search by name or slug           |
| `skip`    | number | 0       | -      | Pagination offset                |
| `limit`   | number | 10      | 100    | Items per page                   |

#### Example Requests

**List all categories (with pagination):**
```
GET /categories?skip=0&limit=10
```

**Search categories:**
```
GET /categories?q=skincare&skip=0&limit=10
```

**Get specific category page:**
```
GET /categories?skip=20&limit=10
```

#### Response Format

**Status:** 200 OK

```json
{
  "data": [
    {
      "id": 1,
      "name": "Skincare",
      "slug": "skincare",
      "product_count": 15
    },
    {
      "id": 2,
      "name": "Haircare",
      "slug": "haircare",
      "product_count": 8
    }
  ],
  "meta": {
    "total": 2,
    "skip": 0,
    "limit": 10,
    "totalPages": 1
  }
}
```

#### Response Fields

| Field         | Type   | Description                          |
|---------------|--------|--------------------------------------|
| `id`          | number | Category term ID (unique)            |
| `name`        | string | Display name of category             |
| `slug`        | string | URL-friendly identifier              |
| `product_count` | number | Number of published products         |
| `total`       | number | Total matching categories            |
| `skip`        | number | Pagination offset used               |
| `limit`       | number | Items per page used                  |
| `totalPages`  | number | Total pages available                |

---

### 2. Get Brands

**Endpoint:** `GET /brands`

Retrieve all product brands with product count and optional search/filtering.

#### Query Parameters

| Parameter | Type   | Default | Max    | Description                      |
|-----------|--------|---------|--------|----------------------------------|
| `q`       | string | -       | -      | Search by name or slug           |
| `skip`    | number | 0       | -      | Pagination offset                |
| `limit`   | number | 10      | 100    | Items per page                   |

#### Example Requests

**List all brands (with pagination):**
```
GET /brands?skip=0&limit=10
```

**Search brands:**
```
GET /brands?q=loreal&skip=0&limit=10
```

**Get specific brand page:**
```
GET /brands?skip=10&limit=5
```

#### Response Format

**Status:** 200 OK

```json
{
  "data": [
    {
      "id": 3,
      "name": "L'Oréal",
      "slug": "loreal",
      "product_count": 24
    },
    {
      "id": 4,
      "name": "Neutrogena",
      "slug": "neutrogena",
      "product_count": 12
    }
  ],
  "meta": {
    "total": 2,
    "skip": 0,
    "limit": 10,
    "totalPages": 1
  }
}
```

#### Response Fields

Same as Categories (see above).

---

## Pagination Strategy

Both endpoints use **skip-based pagination** (offset/limit pattern).

### How to Paginate

1. **First page:**
   ```
   GET /categories?skip=0&limit=10
   ```

2. **Next page (second page):**
   ```
   GET /categories?skip=10&limit=10
   ```

3. **Calculate offset:**
   ```
   offset = (page_number - 1) * limit
   skip = offset
   ```

### Example: Get Page 3 with 15 items per page
```
GET /categories?skip=30&limit=15
```

---

## Search & Filter

### Search by Name or Slug

```
GET /categories?q=skincare
GET /brands?q=loreal
```

The `q` parameter searches in both the `name` and `slug` fields (case-insensitive).

### Combine Search with Pagination

```
GET /categories?q=care&skip=0&limit=10
GET /brands?q=neutro&skip=20&limit=5
```

---

## Use Cases

### 1. Shop Page - Display Category Filters

```javascript
// Fetch categories for sidebar filter
const response = await fetch('/api/wp/taxonomies/categories?limit=50');
const { data, meta } = await response.json();

// Render checkboxes/links for each category
data.forEach(cat => {
  console.log(`${cat.name} (${cat.product_count} products)`);
});
```

### 2. Shop Page - Display Brand Filters

```javascript
// Fetch brands for sidebar filter
const response = await fetch('/api/wp/taxonomies/brands?limit=50');
const { data } = await response.json();

// Render as dropdown or list
data.forEach(brand => {
  console.log(`${brand.name} - ${brand.product_count} products`);
});
```

### 3. Auto-complete / Type-ahead Search

```javascript
// Fetch categories matching user input
const query = 'skin';
const response = await fetch(
  `/api/wp/taxonomies/categories?q=${encodeURIComponent(query)}&limit=10`
);
const { data } = await response.json();

// Show matching results
data.forEach(cat => {
  console.log(cat.name);
});
```

### 4. Filter Products by Category

After fetching categories, use the `slug` to filter products:

```javascript
// Get all skincare products
const response = await fetch(
  '/api/wp/products?category=skincare&skip=0&limit=20'
);
```

### 5. Filter Products by Brand

Similarly, use brand slug to filter products:

```javascript
// Get all L'Oréal products
const response = await fetch(
  '/api/wp/products?brand=loreal&skip=0&limit=20'
);
```

---

## Error Responses

### Not Found

If a requested resource doesn't exist:

```json
{
  "status": "error",
  "message": "Resource not found"
}
```

**Status:** 404

### Server Error

If something goes wrong on the server:

```json
{
  "status": "error",
  "message": "Internal server error"
}
```

**Status:** 500

---

## Performance Tips

1. **Limit product counts:** Use `limit=50` for categories/brands to avoid large payloads
2. **Search before fetching:** Always use `q` parameter when user provides search input
3. **Cache results:** Cache category/brand list on client for better UX
4. **Lazy load:** Load categories/brands only when needed (e.g., on shop page)

---

## Related Endpoints

- **Product List:** `GET /api/wp/products` — Filter by `category` or `brand` slug
- **Product Detail:** `GET /api/wp/products/:id` — Includes embedded categories and brands
- **Product Search:** `GET /api/wp/products?q=...` — Search by keyword

---

## Technical Details

### Database Schema

**Tables involved:**
- `wp_terms` — stores term data (id, name, slug)
- `wp_term_taxonomy` — stores taxonomy type (product_cat, product_brand)
- `wp_term_relationships` — links terms to products
- `wp_posts` — stores product data (for counting)

### Taxonomy Types

- `product_cat` — Product Categories
- `product_brand` — Product Brands

### Product Count Logic

Only published products (`post_status = 'publish'`) of type `product` are counted. Variation products are excluded.

---

## FAQ

**Q: What if a category has 0 products?**
A: It will still appear in the list with `product_count: 0`. You can filter client-side if needed.

**Q: Can I sort by product count?**
A: Not directly via API. Results are sorted by name (A-Z). You can sort client-side if needed.

**Q: What's the max limit value?**
A: Max `limit` is 100. Higher values will be capped to 100.

**Q: Can I search by product count?**
A: No, search only works on `name` and `slug` fields.

---

## Version History

| Version | Date       | Changes                          |
|---------|------------|---------------------------------|
| 1.0     | 2026-07-18 | Initial release                 |
