# Auth API Documentation

This document describes the authentication endpoints for the backend.

## Base URL

```text
http://localhost:4000/api/v1
```

## Endpoints

### Login

**Method:** POST

**URL:** `/api/v1/auth/login`

### Request Body

```json
{
  "email": "admin@example.com",
  "password": "securePassword123"
}
```

### Success Response

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "64a8c9b3f8e3a5c1d2e7f0a1",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "Super_Admin"
    },
    "accessToken": "<jwt-access-token>",
    "refreshToken": "<refresh-token>"
  }
}
```

### Refresh Token

**Method:** POST

**URL:** `/api/v1/auth/refresh-token`

### Request Body

```json
{
  "refreshToken": "<refresh-token>"
}
```

### Success Response

```json
{
  "status": "success",
  "data": {
    "accessToken": "<new-jwt-access-token>",
    "refreshToken": "<new-refresh-token>"
  }
}
```

### Logout

**Method:** POST

**URL:** `/api/v1/auth/logout`

### Request Body

```json
{
  "refreshToken": "<refresh-token>"
}
```

### Success Response

```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

## Notes

- `accessToken` is a JWT used for authenticated requests.
- Include JWT in secured requests with the header:

```http
Authorization: Bearer <accessToken>
```

- `refreshToken` is a long-lived token issued at login and used to obtain a new access token.
- Use `/api/v1/auth/refresh-token` when the access token expires.
- Use `/api/v1/auth/logout` to invalidate the refresh token.
