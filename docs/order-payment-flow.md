# Order and Payment Flow

## Overview

This document describes the current backend order flow for the Decantre app, including:
- order creation and update behavior
- payment record creation and synchronization
- member totals updates
- payment status rules

The implementation lives in:
- `backend/src/controllers/OrdersController.js`
- `backend/src/controllers/PaymentsController.js`
- `backend/src/models/order.model.js`
- `backend/src/models/payment.model.js`
- `backend/src/models/member.model.js`

## API Endpoints

### Order endpoints
- `POST /api/v1/orders/new-order` — create a new order
- `PUT /api/v1/orders/:orderId` — update an existing order
- `DELETE /api/v1/orders/:orderId` — delete an order

### Payment endpoints
- `POST /api/v1/payments` — create a payment record
- `PUT /api/v1/payments/:paymentId` — update a payment record
- `GET /api/v1/payments` — list payments
- `GET /api/v1/payments/:paymentId` — get a payment record
- `DELETE /api/v1/payments/:paymentId` — delete a payment record

## Order Creation Flow

When an order is created via `POST /api/v1/orders/new-order`:
1. The payload is validated by `validateOrderPayload`.
2. The order is created in the `Order` collection.
3. A corresponding payment document is created or upserted in the `Payment` collection.
4. If the order includes a `memberId`, the member doc is updated:
   - add the order reference to `member.orders`
   - recalculate `totalOrderAmount`, `totalPaidAmount`, and `totalPendingAmount`

### Order payload

Required fields:
- `fullName`
- `phone`
- `paymentMethod`
- `items` (non-empty array)
- `totals.total`

Optional fields:
- `email`
- `address`
- `city`
- `thana`
- `district`
- `zip`
- `shippingAddress`
- `memberId`
- `billingInfo`
- `shippingInfo`

## Payment Document Creation

For each order created or updated, the backend writes a payment document with these fields:
- `orderId` — reference to the order
- `paymentMethod`
- `paymentPhone`
- `totalAmount`
- `paidAmount`
- `pendingAmount`
- `amount`
- `paymentStatus`
- `createdBy`

The payment document uses the same order total amount as the order.

### Default payment status logic

The payment status is derived using the payment method and amount values:
- `cod`, `cash`, `full`, `paid` => treated as paid-style methods
- if `paidAmount >= totalAmount` => `paid`
- if `paidAmount > 0 && paidAmount < totalAmount` => `partial`
- if `paidAmount === 0` => `pending`

For non-cash methods, the same amount-based rules still apply.

## Order Update Flow

When an order is updated via `PUT /api/v1/orders/:orderId`:
1. The existing order is loaded.
2. The order document is updated with allowed fields.
3. The payment record is synced via `PaymentModel.findOneAndUpdate(..., { upsert: true })`.
4. If the order member changes:
   - the old member loses the order reference from `orders`
   - the new member gets the updated order reference
5. The affected members’ totals are recalculated.

## Order Delete Flow

When an order is deleted via `DELETE /api/v1/orders/:orderId`:
1. The order document is removed.
2. The matching payment document is removed.
3. The associated member loses the order reference.
4. The member totals are recalculated.

## Member Totals

The member document stores three aggregate fields:
- `totalOrderAmount` — sum of order totals for that member
- `totalPaidAmount` — sum of paid order totals for that member
- `totalPendingAmount` — sum of pending order totals for that member

These totals are recalculated whenever an order is created, updated, or deleted for that member.

## Data Relationships

### Member model
The member document now stores:
- `orders` — an array of objects with `did` and `value`
- `totalOrderAmount`
- `totalPaidAmount`
- `totalPendingAmount`

### Payment model
The payment document stores order payment state and status.

## Notes

- The payment collection is kept in sync from the order controller rather than relying on a separate manual payment creation step for order-based payments.
- The `status` field in payments is used to indicate `paid`, `partial`, `pending`, or `failed`.
- The order flow intentionally treats cash/COD/full payment methods as immediately paid unless partial amounts are supplied.
