# New Order API Documentation

This document describes the order endpoint used to accept a checkout order from the website.

## Base URL

```text
http://localhost:4000/api/v1
```

## Endpoint

### Create a new order

**Method:** POST

**URL:** `/api/v1/orders/new-order`

### Request Body

```json
{
  "fullName": "Nadia Rahman",
  "phone": "+8801712345678",
  "email": "customer@example.com",
  "address": "House 12, Road 3",
  "city": "Dhaka",
  "thana": "Dhanmondi",
  "district": "Dhaka",
  "zip": "1209",
  "giftWrap": false,
  "paymentMethod": "cod",
  "subtotal": 1200,
  "shippingFee": 0,
  "tax": 96,
  "total": 1296,
  "items": [
    {
      "name": "Oud Imperial",
      "quantity": 1,
      "unitPrice": 1200,
      "size": "100ml",
      "concentration": "Eau de Parfum"
    }
  ]
}
```

### Success Response

```json
{
  "status": "success",
  "message": "Order received successfully",
  "data": {
    "orderNumber": "ORD-20260719-123456",
    "status": "received",
    "createdAt": "2026-07-19T10:00:00.000Z",
    "customer": {
      "fullName": "Nadia Rahman",
      "phone": "+8801712345678",
      "email": "customer@example.com",
      "address": "House 12, Road 3",
      "city": "Dhaka",
      "thana": "Dhanmondi",
      "district": "Dhaka",
      "zip": "1209",
      "giftWrap": false
    },
    "paymentMethod": "cod",
    "shippingAddress": {},
    "items": [
      {
        "name": "Oud Imperial",
        "quantity": 1,
        "unitPrice": 1200,
        "size": "100ml",
        "concentration": "Eau de Parfum"
      }
    ],
    "totals": {
      "subtotal": 1200,
      "shippingFee": 0,
      "tax": 96,
      "total": 1296
    }
  }
}
```

### Error Response

```json
{
  "status": "error",
  "message": "Invalid order payload",
  "errors": [
    "email must be a valid email address"
  ]
}
```

## Notes

- This endpoint currently accepts and validates the order payload and returns a generated order number.
- It does not yet persist the order to a database.
- Use this endpoint from the checkout form once the frontend is ready to submit real orders.
