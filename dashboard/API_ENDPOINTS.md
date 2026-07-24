# Decantre Dashboard App Config Reference

Dashboard App runs on: `http://144.79.218.126:8005` (Dev Port `8005`)

---

## Backend Integration Details

Admin dashboard communication uses the backend instance configured in `.env` under `VITE_API_BASE_URL`:

*   **API Root Endpoint:** `http://144.79.218.126:5092/api`
*   **Key Integrated Modules (Admin Area):**
    1.  **Authentication:** Login & token refresh at `/api/v1/auth/*`.
    2.  **Product Management:** Admin CRUD operations.
    3.  **User Management:** Fetching and updating system accounts `/api/v1/users/*`.
    4.  **Order Management:** Processing and managing active orders `/api/v1/orders/*`.
    5.  **Manual WordPress Sync & Export:** Invokes `/api/v1/export/*` and `/api/wp/*` sync triggers.
