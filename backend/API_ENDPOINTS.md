# Decantre API Endpoints Reference

Base API Address in Dev Environment: `http://144.79.218.126:5092`

---

## 1. Product Endpoints
**Base Prefix:** `/api/v1/products`

*   **GET `/`** - List all products with filtering (`q`), sorting (`sortBy`, `order`), and pagination (`page`, `limit`).
*   **GET `/search`** - Autocomplete / live-search endpoint that returns minimal fields (`id`, `name`, `category`, `image`) for query `q`.
*   **GET `/:identifier`** - Fetch details of a single product using its Mongo ID or slug.

---

## 2. Search Endpoints
*   **GET `/api/v1/search-products`** - Search products in the database with fuzzy/wildcard match (handled by SearchController).

---

## 3. Auth Endpoints
**Base Prefix:** `/api/v1/auth`

*   **POST `/login`** - Authenticate admin/user credentials and return access and refresh tokens.
*   **POST `/refresh-token`** - Renew expired access tokens using the refresh token.
*   **POST `/logout`** - Invalidate active session tokens.

---

## 4. Users Endpoints
**Base Prefix:** `/api/v1/users` *(Requires JWT Authorization Header)*

*   **GET `/`** - List all registered users.
*   **GET `/:userId`** - Fetch details of a specific user.
*   **POST `/`** - Create a new user.
*   **PUT `/:userId`** - Update an existing user.
*   **DELETE `/:userId`** - Delete a user.

---

## 5. Orders Endpoints
**Base Prefix:** `/api/v1/orders`

*   **POST `/new-order`** - Create a new order *(Public Endpoint)*.
*   **GET `/`** - List all orders *(Requires JWT)*.
*   **GET `/:orderId`** - Fetch a specific order details *(Requires JWT)*.
*   **PUT `/:orderId`** - Update an order *(Requires JWT)*.
*   **DELETE `/:orderId`** - Delete an order *(Requires JWT)*.

---

## 6. Email Endpoints
**Base Prefix:** `/api/v1/sendEmail`

*   **GET `/`** & **POST `/`** - Send a test email (`?email=user@example.com`).
*   **POST `/invoice`** - Send structured HTML Invoice email containing transaction details to target client.

---

## 7. Export Endpoints
**Base Prefix:** `/api/v1/export`

*   **GET `/products/mysql`** - Query the external WordPress/MySQL database for products and write them to a local JSON file in `data/products_from_mysql.json`.

---

## 8. WordPress Sync Endpoints
**Base Prefix:** `/api/wp`

*   **GET `/products`** - List WordPress products.
*   **GET `/products/:identifier`** - Fetch a single WordPress product by ID or slug.
*   **GET `/taxonomies/categories`** - List categories retrieved from the WordPress database.
*   **GET `/taxonomies/brands`** - List brands/taxonomies retrieved from the WordPress database.
