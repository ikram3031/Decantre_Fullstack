# Products API

This document describes the product listing and detail endpoints backed by MongoDB.

Base path: `/api/v1/products`

## 1) List products (GET)

- Endpoint: `GET /api/v1/products`
- Purpose: Simple listing and free-text search.

Query parameters:

- `q` (string, optional) — free-text search against `name`, `slug`, and `description` (case-insensitive, partial match).
- `skip` or `offset` (integer, optional) — number of items to skip (default 0).
- `limit` (integer, optional) — number of items to return (default 10, max 100).
- `sortBy` (string, optional) — allowed: `name`, `price`, `createdAt`, `updatedAt`, `stockStatus`. Defaults to `createdAt`.
- `order` (string, optional) — `asc` or `desc` (default `desc`).

Response (200):
{
"data": [ /* array of product objects */ ],
"totalRows": 123,
"meta": { "total": 123, "skip": 0, "limit": 10, "totalPages": 13 }
}

Notes:

- GET only supports the `q` free-text search and pagination/sorting. Use POST for richer filters.

Example:

```
GET /api/v1/products?q=serum&skip=0&limit=12&sortBy=price&order=asc
```

## 2) List products (POST) — filtered

- Endpoint: `POST /api/v1/products`
- Purpose: Rich filtering via JSON body. Supports all filters below plus pagination and sorting.

Body (JSON) accepted fields:

- `q` / `search` / `keyword` (string) — free-text search (same as GET `q`).
- `filter` (object) — explicit field filters (e.g., `{ "stockStatus": "instock", "type": "simple" }`).
- `category` (string or array) — category id or slug (if your frontend passes slug, the server may need to resolve to ObjectId in the future).
- `brand` (string) — brand id or slug.
- `tags` (array|string) — tag names.
- `season` (string) — one of `Summer`, `Winter`, `Spring`, `Autumn`, `All-Season`.
- `name`, `slug`, `did` (string) — direct equality filters.
- `skip` / `offset`, `limit`, `sortBy`, `order` — same semantics as GET.

Example request:

```
POST /api/v1/products
Content-Type: application/json

{
  "q": "vitamin",
  "filter": { "stockStatus": "instock", "type": "simple" },
  "limit": 20,
  "skip": 0,
  "sortBy": "price",
  "order": "asc"
}
```

Response format is identical to GET.

## 3) Get single product

- Endpoint: `GET /api/v1/products/:identifier`
- `:identifier` may be a MongoDB `_id` or a product `slug`.
- Response (200): `{ "data": { /* product object */ } }`
- 404 when not found: `{ "status": "error", "message": "Product not found" }`

## 4) Product response shape (examples)

A product object returned by the API contains (not exhaustive):

- `id` — string (MongoDB `_id` as string)
- `did` — deterministic id (if present)
- `name`, `slug`, `description`
- `price`, `offerPrice`, `variants` (if any)
- `stock_status` — `instock` / `outofstock` / `preorder`
- `image_url`, `thumbnail_url`, `images` array
- `brand` (ObjectId or populated object)
- `categories` (array of ObjectIds or populated objects)
- `created_at`, `updated_at`

If you rely on slugs for filtering on POST, consider normalizing the request body (resolving slugs to ObjectIds) or pass explicit ids instead.

## 5) Notes & next steps

- Currently POST body filters accept raw slug/id values and do direct matches; if you want slug-to-id resolution for `category`/`brand`, I can add helper lookups to resolve slugs.
- I can add example curl commands and an OpenAPI snippet if you want API docs in a machine-readable format.
