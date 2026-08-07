I’m preparing a concise AI-oriented project guide in the README so it’s easy for future assistants to understand the app structure and conventions.

Read [](file:///e%3A/AAAAA/frontend/README.md)

I’m reading the app entry points and config so the documentation matches the actual project structure and workflows.

Read [](file:///e%3A/AAAAA/frontend/package.json)

Read [](file:///e%3A/AAAAA/frontend/src/App.jsx)

Read [](file:///e%3A/AAAAA/frontend/src/context/AppContext.jsx)

I’m writing a compact guide that covers structure, running the app, and the design/system conventions an AI assistant should follow.

Inserted into memory file [](file:///c%3A/Users/mdikr/AppData/Roaming/Code/User/globalStorage/github.copilot-chat/memory-tool/memories)

I’m writing the documentation into the README now with the project overview, setup steps, structure, and AI-oriented guidance.

Got last terminal command

I’m saving a practical README that explains the app flow, folders, theme system, and editing rules for future AI-assisted changes.

Got last terminal command

Got last terminal command

Got last terminal command

I’m writing the documentation directly into the README so it’s available in the project root.

Got last terminal command

Below is ready-to-paste documentation for README.md:

```md
# Decantre Frontend

This project is a luxury perfume e-commerce frontend built with React, Vite, Tailwind CSS, React Router, Zustand, and Motion.

## Quick Start

```bash
npm install
npm run dev
```

- Development server: http://localhost:8001
- Preview build: `npm run preview`
- Production build: `npm run build`

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- React Router
- Zustand
- Motion / Framer-style animations
- Lucide icons

## Project Structure

- App.jsx — main app router and route definitions
- components — reusable UI components and section components
- pages — route-level pages such as Home, Shop, Cart, Checkout, Wishlist
- context — shared app context
- store — Zustand store and state helpers
- lib — API layer and shared helpers
- utils — utility functions
- data — static data such as menu content
- assets — images and static assets
- index.css — Tailwind theme tokens and global styling

## Important Notes for AI / Future Development

1. Prefer existing design tokens over hardcoded colors.
   - Use classes like `bg-gold`, `text-gold`, `border-gold`
   - Use `bg-luxury-black`, `bg-luxury-dark`, `bg-luxury-gray`, `bg-luxury-white`

2. Keep the luxury visual style consistent.
   - Use `font-serif` and `font-sans`
   - Preserve the existing dark luxury aesthetic and minimal rounded UI

3. Reuse shared components first.
   - Generic UI should go in ui
   - Page-specific logic should stay inside the relevant page under pages

4. Follow the existing data flow.
   - App-wide state is handled via AppContext.jsx and useAppStore.js
   - Prefer using the shared store and `useApp()` instead of creating redundant local state

5. Keep API logic centralized.
   - Add or update API calls in api.js
   - Avoid placing network logic directly in components unless it is page-specific

## Theme Tokens

The following theme tokens are already available in index.css:

- `--color-gold` → `#C5A059`
- `--color-luxury-black` → `#050505`
- `--color-luxury-gray` → `#0A0A0A`
- `--color-luxury-dark` → `#080808`
- `--color-luxury-white` → `#F5F5F5`

Example usage:

```jsx
<div className="bg-luxury-black text-luxury-white border border-gold" />
```

## Main Routes

Routes are defined in App.jsx:

- `/` — Home
- `/shop` — Shop
- `/product` — Product detail
- `/cart` — Cart
- `/checkout` — Checkout
- `/wishlist` — Wishlist
- `/season` — Seasonal page
- `/combo` — Combo page
- `/about-us`
- `/contact-us`
- `/faq`
- `/privacy-policy`
- `/terms-and-condition`
- `/return-policy`

## Maintenance Guidelines

- Avoid introducing new hardcoded color values unless necessary
- Keep components readable and reusable
- Preserve existing behavior for cart, auth modal, and product browsing flows
- Prefer extending the existing store or API layer over duplicating logic
```