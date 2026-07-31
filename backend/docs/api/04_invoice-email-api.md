# Invoice Email API Documentation

This endpoint sends a styled invoice email using Hostinger SMTP.

## Base URL

```text
http://144.79.218.126:5092/api/v1/sendEmail/invoice
```

## Endpoint

### Send invoice email

**Method:** POST

**URL:** `/api/v1/sendEmail/invoice`

### Request Body

```json
{
  "email": "customer@example.com",
  "invoiceNumber": "INV-0001",
  "issueDate": "2026-07-19",
  "shippingName": "Customer",
  "shippingAddress": "Customer Address",
  "shippingPhone": "+8801712345678",
  "items": [
    {
      "description": "Product Name 1",
      "price": "$35.00",
      "quantity": 2,
      "total": "$70.00"
    },
    {
      "description": "Product Name 2",
      "price": "$100.00",
      "quantity": 1,
      "total": "$100.00"
    }
  ],
  "subtotal": "$215.00",
  "taxes": "$0.00",
  "discount": "$0.00",
  "total": "$215.00",
  "invoiceUrl": "https://yourdomain.com/invoice/INV-0001"
}
```

### Success Response

```json
{
  "status": "success",
  "message": "Invoice email sent successfully",
  "email": "customer@example.com",
  "invoiceNumber": "INV-0001"
}
```

### Error Response

```json
{
  "status": "error",
  "message": "Failed to send invoice email",
  "details": "<error message>"
}
```

## Notes

- `email` is required and must be a valid address.
- `shippingName` and `shippingAddress` should be provided instead of buyer name/address.
- `total` should be provided in the request and will be used as-is; the server does not calculate totals.
- The invoice email uses a styled HTML template.
