# Decantre Frontend App Config Reference

Frontend Web App runs on: `http://144.79.218.126:8001` (Dev Port `8001`)

---

## Backend Integration Details

All API communication is directed to the backend instance configured in `.env` under `VITE_API_BASE_URL`:

*   **API Root Endpoint:** `http://144.79.218.126:5092/api`
*   **Key Integrated Modules:**
    1.  **Product Catalog:** Consumes `GET /api/v1/products` and `GET /api/v1/products/search`.
    2.  **Order Submission:** POSTs orders to `/api/v1/orders/new-order`.
    3.  **Search Input:** Hits `/api/v1/search-products`.
