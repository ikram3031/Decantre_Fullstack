# Decantre Admin API & Token Security Documentation

This document provides a highly detailed guide for:
1. **The Order List and Details APIs** (how they should be structured and constructed on the backend).
2. **JWT and Refresh Token Handling** (how tokens are managed securely in vanilla JavaScript clients and corresponding Express/Node.js servers).

---

## 1. Order List & Details API Documentation

To connect the Decantre Admin dashboard with a real database/production backend, the following endpoints and JSON formats must be implemented.

### Order Data Model (JSON Structure)

Each Order contains standard metadata, customer details, a list of line items (including specific decant variant sizes), billing/shipping addresses, and transaction notes.

```json
{
  "id": "ord-7193a105",
  "orderNumber": "DEC-2026-8192",
  "date": "2026-07-19T11:27:12.000Z",
  "customerId": "cust-81237",
  "customerName": "Sadman Sakib",
  "customerEmail": "sakib@example.com",
  "status": "sold-directly", 
  "items": [
    {
      "productId": "prod-9182",
      "name": "Bleu de Chanel Eau de Parfum",
      "size": "10ml",
      "quantity": 2,
      "price": 1450.00,
      "image": "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=150&q=80"
    }
  ],
  "total": 2900.00,
  "paymentMethod": "bKash Personal (Paid)",
  "shippingAddress": {
    "street": "In-Store POS",
    "city": "Retail Store",
    "state": "Local",
    "postcode": "00000",
    "country": "In-Store"
  },
  "billingAddress": {
    "street": "In-Store POS",
    "city": "Retail Store",
    "state": "Local",
    "postcode": "00000",
    "country": "In-Store"
  },
  "notes": "Direct sale recorded via store counter"
}
```

### Endpoints Specification

#### A. List Orders
* **URL:** `/api/orders`
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <Access_Token>`
* **Query Parameters:**
  * `search` (optional) - Filter by `orderNumber`, `customerName`, or `customerEmail`.
  * `status` (optional) - Filter by order status (e.g. `pending`, `completed`, `sold-directly`).
  * `dateFilter` (optional) - Filter by date ranges (e.g., `7days`, `30days`).
  * `page` (optional) - Page number (defaults to `1`).
  * `limit` (optional) - Items per page (defaults to `10`).
* **Success Response (200 OK):**
  ```json
  {
    "orders": [ ... ],
    "pagination": {
      "totalItems": 142,
      "totalPages": 15,
      "currentPage": 1,
      "itemsPerPage": 10
    }
  }
  ```

#### B. Get Order Details
* **URL:** `/api/orders/:id`
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <Access_Token>`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "order": {
      "id": "ord-7193a105",
      "orderNumber": "DEC-2026-8192",
      "date": "2026-07-19T11:27:12.000Z",
      ...
    }
  }
  ```

#### C. Create Order (In-Store POS or Online checkout)
* **URL:** `/api/orders`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <Access_Token>`
* **Request Payload:**
  ```json
  {
    "customerId": "cust-81237",
    "customerName": "Sadman Sakib",
    "customerEmail": "sakib@example.com",
    "status": "sold-directly",
    "items": [
      {
        "productId": "prod-9182",
        "name": "Bleu de Chanel Eau de Parfum",
        "size": "10ml",
        "quantity": 2,
        "price": 1450.00
      }
    ],
    "total": 2900.00,
    "paymentMethod": "bKash Personal (Paid)",
    "notes": "Direct sale recorded via store counter"
  }
  ```
* **Success Response (201 Created):** Returns the full created order object with auto-generated `id`, `orderNumber`, and `date`.

#### D. Update Order Status
* **URL:** `/api/orders/:id`
* **Method:** `PUT`
* **Headers:** `Authorization: Bearer <Access_Token>`
* **Request Payload:**
  ```json
  {
    "status": "completed"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Order status updated successfully",
    "order": { ... }
  }
  ```

#### E. Delete Order
* **URL:** `/api/orders/:id`
* **Method:** `DELETE`
* **Headers:** `Authorization: Bearer <Access_Token>`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Order deleted successfully"
  }
  ```

---

## 2. JWT and Refresh Token Security Design

Our JavaScript client and the backend coordinate to manage stateless sessions securely using a **Two-Token System**:

1. **Access Token (Short-lived JWT):** Valid for 15 minutes. Sent in the `Authorization` header (`Bearer <Access_Token>`) for all resource API requests.
2. **Refresh Token (Long-lived Token):** Valid for 7 days. Stored inside an **HttpOnly, Secure, SameSite=Strict** Cookie. The frontend client has zero access to this cookie, protecting it completely from Cross-Site Scripting (XSS) attacks.

### Token Flow Lifecycle

```
[ Client Browser ]                                  [ Express Backend API ]
        |                                                     |
        | 1. Submit email, password & ReCAPTCHA               |
        |---------------------------------------------------->|
        |                                                     |-- verifies credentials
        | 2. Receive Access Token (JSON)                      |-- generates Access & Refresh tokens
        |    + Receive Refresh Token (HttpOnly Cookie)        |-- sets Cookie with Refresh token
        |<----------------------------------------------------|
        |                                                     |
        | 3. Subsequent Request with Access Token in Header   |
        |    Authorization: Bearer <Access_Token>             |
        |---------------------------------------------------->|
        |                                                     |-- validates JWT
        |<----------------------------------------------------|-- returns 200 OK (Data)
        |                                                     |
        | 4. Access Token Expires (Receive 401 Unauthorized)  |
        |<----------------------------------------------------|
        |                                                     |
        | 5. Silent Token Refresh (Automatic POST /refresh)   |
        |    (Cookie containing Refresh Token is auto-sent)   |
        |---------------------------------------------------->|
        |                                                     |-- validates Refresh Token
        | 6. Receive New Access Token                         |-- generates new Access Token
        |<----------------------------------------------------|
```

### Client-Side Integration Patterns (Vanilla JavaScript)

To prevent page reloads from losing the Access Token, the React/JS context manages the Access Token in standard closure memory (`authState`), and automatically handles refreshing expired tokens via Axios interceptors.

#### A. Storing Access Token in-Memory
Avoid writing the access token to `localStorage` or `sessionStorage` (as they are highly vulnerable to XSS). Keep it in standard local variables:

```javascript
let currentAccessToken = null;

export const setAccessToken = (token) => {
  currentAccessToken = token;
};

export const getAccessToken = () => {
  return currentAccessToken;
};
```

#### B. Silent Refresh Mechanism with Axios Interceptor
Configure Axios to intercept all outgoing API calls. If the Access Token is close to expiring or has expired, Axios will automatically send a `/api/auth/refresh` request, acquire a fresh access token, and then seamlessly retry the original request.

```javascript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'https://api.decantre.com',
  withCredentials: true, // Crucial: Enables automatic transmission of HttpOnly cookies
});

// Request Interceptor: Attach current access token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catch 401 Unauthorized and refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Send request to refresh endpoint. 
        // The HttpOnly refresh cookie is sent automatically by the browser.
        const res = await axios.post(
          'https://api.decantre.com/api/auth/refresh',
          {},
          { withCredentials: true }
        );
        
        const newAccessToken = res.data.accessToken;
        setAccessToken(newAccessToken);
        
        // Retry the original request with the new access token
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh token has expired, force a full logout
        setAccessToken(null);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

### Server-Side Implementation Patterns (Express / Node.js)

The Express backend handles issuing and validating JWTs, as well as mounting the cookie properly.

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(cookieParser()); // Enables parsing request cookies

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'supersecretaccess';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'supersecretrefresh';

// login endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // 1. Authenticate user credentials...
  const user = await authenticateUser(email, password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  
  // 2. Generate Access Token (Short-lived)
  const accessToken = jwt.sign({ userId: user.id, email: user.email }, ACCESS_SECRET, { expiresIn: '15m' });
  
  // 3. Generate Refresh Token (Long-lived)
  const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: '7d' });
  
  // 4. Save Refresh Token securely in database for rotation tracking/revocation
  await saveRefreshToken(user.id, refreshToken);
  
  // 5. Send Refresh Token as HttpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,       // Prevents client-side JS from reading the cookie
    secure: true,         // Ensures cookie is only transmitted over HTTPS
    sameSite: 'Strict',   // Protects against Cross-Site Request Forgery (CSRF)
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  });
  
  // 6. Return Access Token as JSON
  return res.json({ accessToken, user });
});

// refresh token endpoint
app.post('/api/auth/refresh', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });
  
  try {
    // 1. Verify token signature
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    
    // 2. Verify token is active in database (revocation list check)
    const isActive = await verifyRefreshTokenInDb(payload.userId, refreshToken);
    if (!isActive) return res.status(403).json({ error: 'Revoked refresh token' });
    
    // 3. Generate a brand new Access Token
    const newAccessToken = jwt.sign({ userId: payload.userId }, ACCESS_SECRET, { expiresIn: '15m' });
    
    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(403).json({ error: 'Expired or invalid refresh token' });
  }
});

// logout endpoint
app.post('/api/auth/logout', (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  // Revoke token from database
  if (refreshToken) revokeRefreshTokenInDb(refreshToken);
  
  // Clear the cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict'
  });
  
  return res.json({ success: true, message: 'Logged out successfully' });
});
```
