# Assets API

## Base URL

```text
http://144.79.218.126:5092/api/v1
```

## Base Path

`/api/v1/assets`

## Notes

- All assets endpoints require authentication.
- Include the access token in the `Authorization` header:

```http
Authorization: Bearer <accessToken>
```
- The GET endpoints are available to any authenticated user.
- The POST, PUT, and DELETE endpoints require `Owner` or `Admin` role privileges.

## Endpoints

### List Assets

- **Method:** GET
- **URL:** `/api/v1/assets`

#### Success Response

```json
{
  "data": [
    {
      "_id": "64b1e0d7a6d02d37c2be1f3a",
      "name": "Laptop",
      "did": "asset-did-123",
      "createdBy": "64b1e0a1a6d02d37c2be1f39",
      "metadata": {},
      "createdAt": "2026-07-29T12:34:56.789Z",
      "updatedAt": "2026-07-29T12:34:56.789Z"
    }
  ]
}
```

### Get Asset by ID

- **Method:** GET
- **URL:** `/api/v1/assets/:assetId`

#### Success Response

```json
{
  "data": {
    "_id": "64b1e0d7a6d02d37c2be1f3a",
    "name": "Laptop",
    "did": "asset-did-123",
    "createdBy": "64b1e0a1a6d02d37c2be1f39",
    "metadata": {},
    "createdAt": "2026-07-29T12:34:56.789Z",
    "updatedAt": "2026-07-29T12:34:56.789Z"
  }
}
```

### Create Asset

- **Method:** POST
- **URL:** `/api/v1/assets`

#### Request Body

```json
{
  "name": "Laptop",
  "metadata": {
    "serial": "ABC123",
    "location": "Dhaka Office"
  }
}
```

#### Success Response

```json
{
  "status": "success",
  "data": {
    "_id": "64b1e0d7a6d02d37c2be1f3a",
    "name": "Laptop",
    "did": "asset-did-123",
    "createdBy": "64b1e0a1a6d02d37c2be1f39",
    "metadata": {
      "serial": "ABC123",
      "location": "Dhaka Office"
    },
    "createdAt": "2026-07-29T12:34:56.789Z",
    "updatedAt": "2026-07-29T12:34:56.789Z"
  }
}
```

### Update Asset

- **Method:** PUT
- **URL:** `/api/v1/assets/:assetId`

#### Request Body

```json
{
  "name": "Updated Laptop",
  "metadata": {
    "serial": "ABC123",
    "location": "Dhaka Warehouse"
  }
}
```

#### Success Response

```json
{
  "status": "success",
  "data": {
    "_id": "64b1e0d7a6d02d37c2be1f3a",
    "name": "Updated Laptop",
    "did": "asset-did-123",
    "createdBy": "64b1e0a1a6d02d37c2be1f39",
    "metadata": {
      "serial": "ABC123",
      "location": "Dhaka Warehouse"
    },
    "createdAt": "2026-07-29T12:34:56.789Z",
    "updatedAt": "2026-07-29T12:45:00.123Z"
  }
}
```

### Delete Asset

- **Method:** DELETE
- **URL:** `/api/v1/assets/:assetId`

#### Success Response

```json
{
  "status": "success",
  "message": "Asset deleted"
}
```

## Error Responses

### Missing or invalid token

```json
{
  "status": "error",
  "message": "Authorization header missing"
}
```

### Validation error

```json
{
  "status": "error",
  "message": "Asset name is required"
}
```

### Resource not found

```json
{
  "status": "error",
  "message": "Asset not found"
}
```

### Forbidden for insufficient role

```json
{
  "status": "error",
  "message": "Forbidden"
}
```

## Notes

- `createdBy` is set from the authenticated user who made the request.
- Any authenticated user can list and view assets.
- Only `Owner` and `Admin` roles can create, update, or delete assets.
