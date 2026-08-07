# Decantre Frontend App Config Reference

Frontend Web App runs on: `https://decantrebd.com` (Dev Port `8001`)

---

## Backend Integration Details

All API communication is directed to the backend instance configured in `.env` under `VITE_API_BASE_URL`:

- **API Root Endpoint:** `https://server.decantrebd.com/api`
- **Key Integrated Modules:**
  1.  **Product Catalog:** Consumes `GET /api/v1/products` and `GET /api/v1/products/search`.
  2.  **Order Submission:** POSTs orders to `/api/v1/orders/new-order`.
  3.  **Search Input:** Hits `/api/v1/search-products`.
