# Commit Log

> New logs are always added at the top of this file.

## D-02 | 2026-08-06
- Created `frontend/src/core/v2` directory containing TypeScript-friendly versions of all core modules.
- Created `types/index.ts` with strong TypeScript definitions for Product, Variation, Badge, Category, Brand, Combo, CartItem, User, Shipping, Order, Toast & AppState.
- Converted `context/AppContext.jsx` to `context/AppContext.tsx`.
- Converted `lib/api.js` to `lib/api.ts` with typed API functions and token refresh handling.
- Converted `lib/districts.js` to `lib/districts.ts` with `District` interface.
- Converted `store/productHelpers.js` to `store/productHelpers.ts` with typed normalization functions.
- Converted `store/useAppStore.js` to `store/useAppStore.ts` with fully typed Zustand `AppState` interface.
- Converted `utils/formatCurrency.js` and `utils/utilityFunctions.js` to TypeScript (`.ts`).
- Created central barrel export file `v2/index.ts`.

## D-01 | 2026-07-18
- Added full Decantre branding across site copy and UI labels.
- Updated `Footer.jsx`, `AboutUs.jsx`, `ContactUs.jsx`, `Shop.jsx`, `ProductCard.jsx`, `ProductDetailModal.jsx`, `TrustBadges.jsx`, `HeroSlider.jsx`, `CartDrawer.jsx`, `PrivacyPolicy.jsx`, `ReturnPolicy.jsx`, `TermsAndCondition.jsx`, `ThankYou.jsx`, `Home.jsx`, `Atelier.jsx`, `Catalog.jsx`, `Reviews.jsx`, `Header.jsx`, and `productHelpers.js`.
- Replaced legacy Atelier and L'Élixir references with consistent Decantre naming.
- Normalized branding for invoices, courier receipts, product calls-to-action, and concierge contact addresses.
- Preserved luxury copy tone while updating the site-wide identity.
- Confirmed `ContactUs.jsx` uses Decantre email addresses and salon naming.
- Changed product badge labels from `ATELIER CHOICE` to `DECANTRE CHOICE` in normalization logic.
- Ensured top-level navigation and hero CTA branding align with the new Decantre identity.
- Kept product fetch logic and API-driven taxonomy work intact while updating only copy.
- Documented this current change as the newest entry at the top of the commit log.
