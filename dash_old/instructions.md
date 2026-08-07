# Metadata Caching System

To avoid redundant server queries and to populate category and brand details across lists, we implement a background metadata caching layer using TanStack Query and `localStorage`.

## How It Works

1. **Background Query Loading**:
   On application boot (within the sidebar provider layout), the `MetadataCacheLoader` mounts. It triggers two TanStack queries:
   - `useCategories()`: Fetches all category documents (`limit=1000`).
   - `useBrands()`: Fetches all brand documents (`limit=1000`).

2. **Local Storage Synchronization**:
   When the queries succeed, they save a mapped array of `{ did, name, slug }` entries into `localStorage` keys:
   - Category key: `decantre_category_cache`
   - Brand key: `decantre_brand_cache`

3. **Name Resolution**:
   Synchronous helper functions can be imported to resolve names by their `did`:
   - `getCategoryName(did)` / `getCategoryNamesByDids(dids)`
   - `getBrandName(did)` / `getBrandNamesByDids(dids)`

---

## Code Examples

### Querying the Cache Synchronously

```typescript
import { getCategoryName, getBrandName } from '@/lib/category-cache';

const categoryName = getCategoryName(categoryDid) || 'Uncategorized';
const brandName = getBrandName(brandDid) || 'Unbranded';
```

### Component Loader (Mounted globally in Provider layout)

```typescript
import { MetadataCacheLoader } from '@/lib/category-cache';

export function ClientSidebarProvider({ children }) {
  return (
    <SidebarProvider>
      <MetadataCacheLoader />
      {children}
    </SidebarProvider>
  );
}
```
