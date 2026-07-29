# Brands API

**Endpoint**: `GET /api/v1/brands`

**Description**: Retrieves a paginated list of brand records stored in the `brands` collection.

**Query Parameters**:
- `skip` (optional, integer, default `0`): Number of records to skip.
- `limit` (optional, integer, default `10`): Maximum number of records to return.

**Response (JSON)**:
```json
{
  "status": "success",
  "data": [
    {
      "_id": "6a647ac500d5281346d53cbf",
      "slug": "afnan",
      "createdAt": "2026-07-25T08:58:45.572Z",
      "description": "",
      "did": "611e13aa8e50c2ae",
      "imageUrl": "",
      "name": "Afnan",
      "productCount": 0,
      "updatedAt": "2026-07-25T08:58:45.572Z"
    }
    // ... more brand objects ...
  ],
  "pagination": {
    "skip": 0,
    "limit": 10,
    "total": 113
  }
}
```

**Notes**:
- `did` is a unique 16‑character hexadecimal identifier for each brand.
- `productCount` indicates how many products reference the brand.
- Mirrors the category API behavior.

---
*Generated from `src/controllers/BrandController.js` and `src/routes/BrandRoute.js`.*
