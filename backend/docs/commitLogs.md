# Commit Logs

> **📌 Instructions:** Add new entries at TOP. Format: `## TAG — Description`. Keep each commit 10-15 lines max. Order: newest first.

---

## DEC-04 — Auth and Orders Enhancement

**Date:** 2026-07-20 | **Type:** Feature | **Status:** ✅

**Description:** Added JWT authentication with refresh tokens, secured user routes, persisted orders in MongoDB, and expanded order management endpoints.

**Created:**
- `src/models/order.model.js` — Order persistence model
- `src/controllers/auth.js` — Login, refresh token, logout logic
- `src/routes/auth.js` — Auth endpoints route
- `src/middlewares/auth.middleware.js` — JWT authentication middleware
- `docs/05_orders-api.md` — Full orders API documentation
- `docs/06_auth-api.md` — Authentication API documentation

**Modified:**
- `src/app.js` — Registered auth and orders routes
- `src/config/env.js` — Added JWT and refresh token environment validation
- `src/controllers/orders.js` — Added order CRUD using MongoDB
- `src/controllers/users.js` — Added secure password hashing for users
- `src/routes/orders.js` — Added order listing, read, update, delete endpoints
- `src/routes/users.js` — Secured user routes with auth middleware

**Benefits:** Secure login flow, better order management, and clear API documentation for frontend integration.

**Testing:** ✅ Verified route registration and API documentation updates.

---

## DEC-03 — Email API Implementation

**Date:** 2026-07-19 | **Type:** Feature | **Status:** ✅

**Description:** Added an email API flow for sending test and invoice emails through SMTP.

**Created:**
- `src/routes/email.js` — Email route handling for test and invoice mail requests
- `src/utils/invoiceEmailTemplate.js` — HTML invoice email template
- `docs/email-api.md` — Email API documentation
- `docs/invoice-email-api.md` — Invoice email API documentation

**Modified:**
- `src/app.js` — Registered the email API route under the backend app

**Benefits:** Easier email testing | Reusable invoice email generation | Better integration with checkout flow

**Testing:** ✅ Email route structure added and documented

---

## DEC-02 — New Order API

**Date:** 2026-07-19 | **Type:** Feature | **Status:** ✅

**Description:** Added a new checkout order endpoint and reorganized the order flow into MVC structure with helper utilities.

**Created:**
- `src/controllers/orders.js` — Order request handling logic
- `src/helper/orderHelper.js` — Order validation and order number generation utility
- `docs/new-order-api.md` — New order API documentation
- `tests/orders.test.js` — Validation tests for the new order flow

**Modified:**
- `src/routes/orders.js` — Route now delegates to controller
- `src/app.js` — Registered the new order API under `/api/v1`

**Benefits:** Cleaner architecture | Reusable validation logic | Easier future database integration

**Testing:** ✅ Order payload validation covered by automated tests

---

## DEC-01 — MVC Architecture Refactoring

**Date:** 2026-07-18 | **Type:** Refactor | **Status:** ✅

**Description:** Refactored WordPress product API from monolithic routes to clean MVC architecture.

**Created:**
- `src/utils/productFormatter.js` — Product formatting utilities
- `src/models/wpProducts.model.js` — Product database queries
- `src/models/wpTaxonomies.model.js` — Category/brand database queries
- `src/controllers/wpProducts.js` — Product business logic
- `src/controllers/wpTaxonomies.js` — Taxonomy business logic
- `docs/wordpress-taxonomy-api.md` — Taxonomy API documentation

**Modified:**
- `src/routes/wpProducts.js` — Now delegates to controller (9 lines)
- `src/routes/wpTaxonomies.js` — Now delegates to controller (9 lines)

**Benefits:** Reusable code | Better testability | Clear separation of concerns | Easy scaling

**Testing:** ✅ All endpoints working | No static errors

---
