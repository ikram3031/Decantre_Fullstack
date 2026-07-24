# WooCommerce / WordPress Database Tables Overview

## Core WordPress Tables

| Table | Description |
|--------|-------------|
| `wp_posts` | Stores Posts, Pages, Products, Product Variations, Attachments (Images), etc. One of the most important tables. |
| `wp_postmeta` | Stores metadata for posts/products. Includes price, SKU, stock, thumbnail, gallery, attributes, variations, etc. |
| `wp_terms` | Stores Categories, Tags, Brands (if taxonomy-based), Attributes, and other taxonomy names. |
| `wp_term_taxonomy` | Defines the taxonomy type (product category, product tag, brand, attribute, etc.). |
| `wp_term_relationships` | Maps products/posts to categories, tags, brands, and attributes. |
| `wp_termmeta` | Metadata for taxonomy terms (category image, icon, SEO data, etc.). |
| `wp_options` | Stores WordPress and plugin configuration settings. |
| `wp_users` | User accounts (Admins, Customers, Editors, etc.). |
| `wp_usermeta` | Metadata for users (billing address, shipping address, roles, preferences). |
| `wp_comments` | Product reviews and comments. |
| `wp_commentmeta` | Metadata for comments and reviews. |
| `wp_links` | Legacy WordPress links/blogroll table (rarely used). |

---

# WooCommerce Tables

| Table | Description |
|--------|-------------|
| `wp_wc_orders` | Main WooCommerce orders table (HPOS). |
| `wp_wc_orders_meta` | Metadata for orders. |
| `wp_wc_order_addresses` | Billing & Shipping addresses. |
| `wp_wc_order_product_lookup` | Product lookup for orders. |
| `wp_wc_order_coupon_lookup` | Coupon lookup. |
| `wp_wc_order_tax_lookup` | Tax lookup. |
| `wp_wc_order_operational_data` | Internal operational order data. |
| `wp_wc_order_stats` | Order analytics and reporting. |
| `wp_wc_customer_lookup` | Customer analytics. |
| `wp_wc_category_lookup` | Product-category lookup for reporting. |
| `wp_wc_product_attributes_lookup` | Product attribute lookup for filtering/search. |
| `wp_wc_download_log` | Download history for downloadable products. |
| `wp_wc_admin_notes` | WooCommerce admin notifications. |
| `wp_wc_admin_note_actions` | Actions for admin notes. |

---

# Action Scheduler

| Table | Description |
|--------|-------------|
| `wp_actionscheduler_actions` | Scheduled background jobs. |
| `wp_actionscheduler_claims` | Queue processing claims. |
| `wp_actionscheduler_groups` | Groups of scheduled actions. |
| `wp_actionscheduler_logs` | Logs for scheduled actions. |

---

# Elementor Tables

| Table | Description |
|--------|-------------|
| `wp_e_events` | Elementor events. |
| `wp_e_notes` | Elementor notes. |
| `wp_e_notes_users_relations` | Note-user relations. |
| `wp_e_submissions` | Elementor form submissions. |
| `wp_e_submissions_actions_log` | Form action logs. |
| `wp_e_submissions_values` | Submitted form values. |

---

# Hostinger Tables

| Table | Description |
|--------|-------------|
| `wp_hostinger_reach_carts` | Abandoned cart tracking. |
| `wp_hostinger_reach_contact_lists` | Marketing contact lists. |
| `wp_hostinger_reach_forms` | Marketing form submissions. |

---

# Popup Builder

| Table | Description |
|--------|-------------|
| `wp_sgpb_subscribers` | Popup subscribers. |
| `wp_sgpb_subscription_error_log` | Popup subscription errors. |

---

# Ultimate Member

| Table | Description |
|--------|-------------|
| `wp_um_metadata` | Ultimate Member plugin metadata. |

---

# Facebook Pixel / PixelYourSite

| Table | Description |
|--------|-------------|
| `wp_pys_options` | Facebook Pixel / PixelYourSite configuration. |

---

# Addon Library

| Table | Description |
|--------|-------------|
| `wp_addonlibrary_addons` | Installed addons. |
| `wp_addonlibrary_categories` | Addon categories. |

---

# Chaty Plugin

| Table | Description |
|--------|-------------|
| `wp_chaty_contact_form_leads` | Chaty contact form leads. |

---

# Product Badge Plugin

| Table | Description |
|--------|-------------|
| `wp_cpbw_badges` | Product badges. |
| `wp_cpbw_filters` | Badge display filters. |

---

# Invoice Plugin

| Table | Description |
|--------|-------------|
| `wp_wcpdf_invoice_number` | Invoice numbering. |

---

# Email Plugin

| Table | Description |
|--------|-------------|
| `wp_viwec_clicked` | Email click tracking. |

---

# Product Migration (Minimum Required Tables)

| Table | Required |
|--------|----------|
| `wp_posts` | ✅ |
| `wp_postmeta` | ✅ |
| `wp_terms` | ✅ |
| `wp_term_taxonomy` | ✅ |
| `wp_term_relationships` | ✅ |

These five tables are sufficient to migrate almost all product-related data, including:

- Product
- Product Variations
- Categories
- Brands (taxonomy-based)
- Tags
- Attributes
- SKU
- Price
- Sale Price
- Stock
- Thumbnail
- Gallery Images
- Product Status
- Slug
- Short Description
- Long Description

---

# API Route Dependencies

For the `/api/wp/products` route, the main table used is `wp_posts`.

To return full Magento-style WooCommerce product detail data, you would also need:

- `wp_postmeta` for price, SKU, stock, sale price, gallery, attributes, and metadata
- `wp_terms`, `wp_term_taxonomy`, and `wp_term_relationships` for categories, tags, and attributes

---

# WordPress Product API Documentation

## 1. Get all products

### Endpoint
`GET /api/wp/products`

### Description
Returns a paginated list of published WooCommerce products from WordPress.

### Query parameters
- `page` (optional): page number, default `1`
- `limit` (optional): number of results per page, default `10`, max `100`
- `q` (optional): search keyword for product title or excerpt

### Response example
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
      "image": "https://example.com/wp-content/uploads/2024/01/image.jpg"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

---

## 2. Get a single product by ID or slug

### Endpoint
`GET /api/wp/products/:identifier`

### Description
Returns a single published WooCommerce product using either the product ID or the product slug.

### Parameters
- `identifier`: product ID or slug

### Response example
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
    "image": "https://example.com/wp-content/uploads/2024/01/image.jpg"
  }
}
```

### Error response
```json
{
  "status": "error",
  "message": "Product not found"
}
```

```
