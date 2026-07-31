# Search Products API

**Endpoint**: `GET /api/v1/search-products`

Purpose: lightweight "like" search endpoint for typeahead and quick search. Returns minimal product info useful for suggestions and search results preview.

Query Parameters:

- `q` (string, required) — search term (partial match against product `name`, `brand.name`, and `categories.name`).
- `limit` (number, optional) — max results (default `12`, max `100`).

Response (200):

```json
{
  "data": [
    {
      "id": "64a1f...",
      "name": "Aromatic Oud",
      "category": "Oud",
      "brand": "Azzaro",
      "image": "https://host/api/v1/images/resize?url=...&w=200&h=200"
    }
  ]
}
```

Notes:

- The endpoint performs a case-insensitive partial match (MongoDB regex) across product name, brand name, and first category name.
- `image` points to the internal resize proxy (`/api/v1/images/resize`) to return a CDN-friendly thumbnail.
- If `q` is empty or missing, the endpoint returns `{ data: [] }`.

Integration tips:

- Use this for frontend typeahead/autocomplete. Debounce user input (e.g., 250ms) and require a minimum input length (3 characters) to reduce DB load.
- Consider adding rate-limiting or caching (e.g., in-memory or Redis) for high-traffic applications.

Implementation details:

- Located at controller: `src/controllers/search.js`
- Registered in `src/app.js` as: `GET /api/v1/search-products`
- Returns fields: `id`, `name`, `category`, `brand`, `image`.

Example curl:

```bash
curl "http://144.79.218.126:5092/api/v1/search-products?q=a&limit=12"
```

Security & performance:

- The current implementation uses unanchored regex; for large datasets consider switching to text indexes or a dedicated search engine (ElasticSearch / Typesense) for better performance and ranking.

---
