# Categories API

**Endpoint**: `GET /api/v1/categories`

**Description**: Retrieves a paginated list of category records from the `categories` collection.

**Query Parameters**:
- `skip` (optional, integer, default `0`): Number of records to skip.
- `limit` (optional, integer, default `10`): Maximum number of records to return.

**Response (JSON)**:
```json
{
  "status": "success",
  "data": [
    {
      "_id": "6a64742900d5281346d53872",
      "did": "c5ab3a9d11e8d4a7",
      "name": "For Him"
    }
    // ... more category objects ...
  ],
  "pagination": {
    "skip": 0,
    "limit": 10,
    "total": 6
  }
}
```

**Notes**:
- `did` is a unique 16‑character hexadecimal identifier for each category.
- The endpoint supports pagination using `skip` and `limit` which are also documented for the brands API.

---
*Generated from `src/controllers/CategoryController.js` and `src/routes/CategoryRoute.js`.*
