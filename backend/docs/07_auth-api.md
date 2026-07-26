# Users API Documentation

This document describes the users collection endpoints for the backend.

## Base URL

```text
http://localhost:4000/api/v1
```

## Base Path

`/api/v1/users`

## Notes

These endpoints require a valid JWT token in the `Authorization` header:

```http
Authorization: Bearer <accessToken>
```

## Endpoints

### List Users

**Method:** GET

**URL:** `/api/v1/users`

### Success Response

```json
{
  "data": [
    {
      "id": "64a8c9b3f8e3a5c1d2e7f0a1",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "Super_Admin",
      "isActive": true,
      "did": "user-did-123",
      "createdAt": "2026-07-26T12:34:56.789Z",
      "updatedAt": "2026-07-26T12:34:56.789Z"
    }
  ]
}
```

### Get User by ID

**Method:** GET

**URL:** `/api/v1/users/:userId`

### Success Response

```json
{
  "data": {
    "id": "64a8c9b3f8e3a5c1d2e7f0a1",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "Super_Admin",
    "isActive": true,
    "did": "user-did-123",
    "createdAt": "2026-07-26T12:34:56.789Z",
    "updatedAt": "2026-07-26T12:34:56.789Z"
  }
}
```

### Create User

**Method:** POST

**URL:** `/api/v1/users`

### Request Body

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "securePassword123",
  "role": "Store_manager"
}
```

### Success Response

```json
{
  "status": "success",
  "data": {
    "id": "64a8c9b3f8e3a5c1d2e7f0a1",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "Store_manager",
    "isActive": true,
    "did": "user-did-123",
    "createdAt": "2026-07-26T12:34:56.789Z",
    "updatedAt": "2026-07-26T12:34:56.789Z"
  }
}
```

### Update User

**Method:** PUT

**URL:** `/api/v1/users/:userId`

### Request Body

```json
{
  "name": "Admin User Updated",
  "email": "admin-updated@example.com",
  "role": "Admin",
  "password": "newSecurePassword123",
  "isActive": true
}
```

### Success Response

```json
{
  "status": "success",
  "data": {
    "id": "64a8c9b3f8e3a5c1d2e7f0a1",
    "name": "Admin User Updated",
    "email": "admin-updated@example.com",
    "role": "Admin",
    "isActive": true,
    "did": "user-did-123",
    "createdAt": "2026-07-26T12:34:56.789Z",
    "updatedAt": "2026-07-26T12:45:00.123Z"
  }
}
```

### Delete User

**Method:** DELETE

**URL:** `/api/v1/users/:userId`

### Success Response

```json
{
  "status": "success",
  "message": "User deleted successfully"
}
```
