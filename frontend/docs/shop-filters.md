# Shop Filters Documentation

This document explains the architecture, design choices, and implementation details of the Shop Catalog filtering system in Decantre.

---

## 1. Overview

The shop filter system is designed to provide a premium, smooth, and highly responsive experience when browsing, searching, and filtering products (e.g. by Category, Brand, Price Range, and Sorting).

The filtering flows between the frontend (React + React Router + Zustand) and backend (Express + Mongoose MongoDB) as follows:

```
[UI Interaction] -> [Local State Change] 
                        |
            (Drag Release / Interaction Stop)
                        |
            [URL Params Sync & Route State Update]
                        |
             [GET API Fetch Products]
                        |
             [Backend Filter Builder] -> [MongoDB Query]
```

---

## 2. Frontend Implementation

### A. URL Search Parameters (Source of Truth)
URL Search parameters are used as the global state for filters. This allows users to bookmark URLs, share direct links, and preserve browser history.
- `category`: Category slug (e.g. `for-him`, `for-her`). Omitted when `All` is selected.
- `brand`: Comma-separated brand slugs (e.g. `niche,designer`).
- `search`: Active search keyword.
- `minPrice` / `maxPrice`: Custom price range filters.

### B. Price Range Slider Interaction
To prevent visual lag, locking, and jumping of the slider thumbs during dragging:
- **Local State Sync:** The slider maintains local `minValue` and `maxValue` states that update instantly and continuously in real-time as the user drags.
- **Update on Release (`onMouseUp` / `onTouchEnd`):** The parent state/URL is updated **only** when the user releases the slider thumb, triggering the API call immediately without artificial latency.
- **Keyboard Debounce:** If arrow keys are used, a `500ms` fallback timer debounces updates.
- **Echo Shield:** A `1s` settling guard ignores incoming parent URL parameter updates right after local changes, preventing the slider from jumping backwards.

### C. Smooth Loading Transitions
To avoid jarring white flashes and layout shifts during updates:
- **Keep Previous Data:** The frontend keeps rendering the previous list of products while a new API call is in progress (instead of clearing them immediately).
- **Glassmorphic Spinner Overlay:** A theme-compatible loading blur overlay containing a golden rotating spinner fades in over the active grid.
- **Dynamic Skeleton Fallback:** The pulse skeleton loader is only shown on initial/first load when there are no products to display.
- **Reset All:** A "Reset All" button above the categories panel clears all parameters, resets the slider, categories, brand selections, and sorting back to their default states instantly.

---

## 3. Backend Implementation

The backend handles filtering inside the `buildProductFilter` utility in `productUtils.js`.

### A. Case-Insensitive Regex matching
To accommodate differences between frontend query variables and database fields, the backend performs case-insensitive regex lookups:
- `brand=designer` matches the brand document with slug `designer-brands`.
- `brand=arabian` matches `uae--arabian-brands`.

### B. Parent/Sub-Brand Resolution
If a matched brand is a parent brand (e.g. `Designer Brands`), the backend automatically retrieves all of its sub-brands' IDs/DIDs and includes them in the `$in` match array:
```javascript
filter.brand = { $in: [parentBrandDid, ...subBrandDIDs] }
```
This ensures querying a parent brand correctly returns all products belonging to any of its child brands.

### C. Strict Filter Enforcement
If a filter parameter is provided in the request but doesn't match any entity in the database, the backend queries an empty array (`{ $in: [] }`) to return `0` results, instead of ignoring the filter and returning all products.
