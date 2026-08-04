# Multi-Client Architecture & Core Code Isolation Guide

This guide details the backend directory structure and steps required to replicate this multi-client architecture on other branches.

---

## 1. Directory Structure Overview

To allow multiple client branches to co-exist without merge conflicts over core product logic, all base features are moved under a unified `core/` folder, while config settings use a base-and-override structure:

```text
backend/
├── docs/
│   └── multi-client-architecture.md  <-- This Guide
├── src/
│   ├── core/                        <-- Unified Core Folder
│   │   ├── controllers/             <-- Core business controllers
│   │   ├── routes/                  <-- Core Express route definitions
│   │   ├── models/                  <-- Core Mongoose schemas/models
│   │   ├── middlewares/             <-- Core Express middlewares
│   │   ├── utils/                   <-- Core utilities & helper functions
│   │   ├── helper/                  <-- Core logical helpers
│   │   └── routesIndex.js           <-- Aggregates all core routes
│   │
│   ├── config/                      <-- Base + Override Configurations
│   │   ├── config.core.json         <-- Default system config (tracked)
│   │   ├── config.client.json       <-- Client-specific overrides (ignored in git)
│   │   └── index.js                 <-- Configuration loader/merger
│   │
│   ├── database/                    <-- DB Connections (remains unchanged)
│   ├── templates/                   <-- Email templates (remains unchanged)
│   ├── app.js                       <-- Express application configuration
│   └── server.js                    <-- Node.js startup server
│
├── .gitignore                       <-- Shields client-specific files
└── .gitattributes                   <-- Prevents git merge conflicts
```

---

## 2. Re-creating this Architecture (For AI Agents)

To implement this exact same directory structure and routing style on another branch, execute the following steps:

### Step 1: Create `core` Directories
Create the target directory inside `src/core/`:
- `src/core/controllers`
- `src/core/routes`
- `src/core/models`
- `src/core/middlewares`
- `src/core/utils`
- `src/core/helper`

### Step 2: Move All Current Modules
Move all `.js` files from `src/controllers/`, `src/routes/`, `src/models/`, `src/middlewares/`, `src/utils/`, and `src/helper/` into their corresponding folders inside `src/core/`.

### Step 3: Update Imports for Relative Levels
Since files inside `core/` directories are now **one level deeper**, update import paths that resolve to files outside of `core/`:
1. **Config Imports:** Change any `import ... from "../config/..."` to `import ... from "../../config/..."`.
2. **Database Imports:** Change any `import ... from "../database/..."` to `import ... from "../../database/..."`.
3. **Templates Imports:** Change any `import ... from "../templates/..."` to `import ... from "../../templates/..."`.

*Note: All relative imports referencing sibling folders inside core (e.g. from controllers to models via `../models/`) remain exactly the same since they all shifted down together.*

### Step 4: Create routing aggregation
Create `src/core/routesIndex.js` to register and export all routes:
```javascript
import { Router } from "express";
import productsRouter from "./routes/ProductsRoute.js";
import authRouter from "./routes/AuthRoute.js";
// ... (Import other core routes)

const coreRouter = Router();
coreRouter.use("/products", productsRouter);
coreRouter.use("/auth", authRouter);
// ... (Register other routers)

export default coreRouter;
```

### Step 5: Clean up `app.js`
In `src/app.js`, remove all individual route imports and registrations, replacing them with:
```javascript
import coreRouter from "./core/routesIndex.js";

// Inside createApp():
app.use("/api/v1", coreRouter);
```

### Step 6: Apply Git Protection Rules
To shield client-specific configurations from being overridden during upstream merges, add the following configurations:

1. **In `backend/.gitignore`:**
   ```text
   src/config/config.client.json
   ```
2. **In `backend/.gitattributes`:**
   ```text
   src/config/config.client.json merge=ours
   src/config/config.core.json merge=ours
   ```
