# Members API Documentation

This document describes the member collection endpoints for the backend.

## Base Path

`/api/v1/members`

## Endpoints

### List Members

**Method:** GET

**URL:** `/api/v1/members`

### Success Response

```json
{
  "status": "success",
  "data": [
    {
      "id": "64a8c9b3f8e3a5c1d2e7f0a1",
      "name": "Member Name",
      "email": "member@example.com",
      "phone": "+8801XXXXXXXXX",
      "did": "member-did-123",
      "isActive": true,
      "role": "Customer",
      "billingInfo": {
        "firstName": "Member",
        "lastName": "Name",
        "company": "",
        "address1": "123 Main Street",
        "address2": "",
        "district": "Dhaka",
        "city": "Dhaka",
        "state": "Dhaka",
        "postcode": "1207",
        "country": "Bangladesh",
        "email": "member@example.com",
        "phone": "+8801XXXXXXXXX"
      },
      "shippingInfo": {
        "firstName": "Member",
        "lastName": "Name",
        "company": "",
        "address1": "123 Main Street",
        "address2": "",
        "district": "Dhaka",
        "city": "Dhaka",
        "state": "Dhaka",
        "postcode": "1207",
        "country": "Bangladesh",
        "email": "member@example.com",
        "phone": "+8801XXXXXXXXX"
      },
      "orders": [],
      "createdAt": "2026-07-26T12:34:56.789Z",
      "updatedAt": "2026-07-26T12:34:56.789Z"
    }
  ]
}
```

### Get Member by ID

**Method:** GET

**URL:** `/api/v1/members/:memberId`

### Success Response

```json
{
  "status": "success",
  "data": {
    "id": "64a8c9b3f8e3a5c1d2e7f0a1",
    "name": "Member Name",
    "email": "member@example.com",
    "phone": "+8801XXXXXXXXX",
    "role": "Customer",
    "billingInfo": { ... },
    "shippingInfo": { ... },
    "orders": [],
    "createdAt": "2026-07-26T12:34:56.789Z",
    "updatedAt": "2026-07-26T12:34:56.789Z"
  }
}
```

### Create Member

**Method:** POST

**URL:** `/api/v1/members`

### Request Body

```json
{
  "name": "Member Name",
  "email": "member@example.com",
  "phone": "+8801XXXXXXXXX",
  "password": "securePassword123",
  "billingInfo": {
    "firstName": "Member",
    "lastName": "Name",
    "company": "",
    "address1": "123 Main Street",
    "address2": "",
    "district": "Dhaka",
    "city": "Dhaka",
    "state": "Dhaka",
    "postcode": "1207",
    "country": "Bangladesh",
    "email": "member@example.com",
    "phone": "+8801XXXXXXXXX"
  },
  "shippingInfo": {
    "firstName": "Member",
    "lastName": "Name",
    "company": "",
    "address1": "123 Main Street",
    "address2": "",
    "district": "Dhaka",
    "city": "Dhaka",
    "state": "Dhaka",
    "postcode": "1207",
    "country": "Bangladesh",
    "email": "member@example.com",
    "phone": "+8801XXXXXXXXX"
  }
}
```

### Success Response

```json
{
  "status": "success",
  "data": {
    "id": "64a8c9b3f8e3a5c1d2e7f0a1",
    "name": "Member Name",
    "email": "member@example.com",
    "phone": "+8801XXXXXXXXX",
    "role": "Customer",
    "billingInfo": { ... },
    "shippingInfo": { ... },
    "orders": [],
    "createdAt": "2026-07-26T12:34:56.789Z",
    "updatedAt": "2026-07-26T12:34:56.789Z"
  }
}
```

### Update Member

**Method:** PUT

**URL:** `/api/v1/members/:memberId`

### Request Body

```json
{
  "name": "New Member Name",
  "email": "newmember@example.com",
  "phone": "+8801YYYYYYYYY",
  "password": "newSecurePassword123",
  "billingInfo": { ... },
  "shippingInfo": { ... }
}
```

### Success Response

```json
{
  "status": "success",
  "data": {
    "id": "64a8c9b3f8e3a5c1d2e7f0a1",
    "name": "New Member Name",
    "email": "newmember@example.com",
    "phone": "+8801YYYYYYYYY",
    "role": "Customer",
    "billingInfo": { ... },
    "shippingInfo": { ... },
    "orders": [],
    "createdAt": "2026-07-26T12:34:56.789Z",
    "updatedAt": "2026-07-26T12:45:00.123Z"
  }
}
```

### Delete Member

**Method:** DELETE

**URL:** `/api/v1/members/:memberId`

### Success Response

```json
{
  "status": "success",
  "message": "Member deleted successfully"
}
```

## Notes

- `billingInfo` and `shippingInfo` are required on create.
- `password` is required on create and must be at least 6 characters.
- Member data returned by the API does not include password or OTP fields.
