# Toyoland VPS & Deployment Management Guide

This document serves as the complete operational manual and single source of truth for managing the **Toyoland** dedicated production server infrastructure on the VPS (`144.79.218.122`).

---

## 1. VPS & Server Infrastructure Details

| Resource / Parameter | Details / Value |
| :--- | :--- |
| **Provider** | Putul Host |
| **Product / Service** | BDIX VPS 2 |
| **Client / Account** | MD Omer Faruk |
| **Server Hostname** | `host.toyoland.com` |
| **Main IP Address** | `144.79.218.122` |
| **SSH User** | `root` |
| **SSH Port** | `22` |
| **Root Password** | `P@ss02654` |
| **SSH Connect Command** | `ssh root@144.79.218.122` |
| **VPS Panel Login URL** | [http://vps-bdix.webxlogin.com](http://vpsus.webrserver.com:4083/) |
| **Panel Username** | `hosttoyo` |
| **Panel Password** | `P@ss02654` |
| **Billing Cycle** | Monthly (TK 950.00 BDT) |
| **Next Due Date** | 10/10/2026 |
| **Payment Method** | bKash Payment Instant |

---

## 2. Directory Structure on VPS

The architecture decouples the **codebase** from the **client configuration** (white-label setup):

| Purpose | Path on VPS | Description |
| :--- | :--- | :--- |
| **Codebase (Live)** | `/opt/live` | The central repository cloned from the `Live` branch. Contains `backend`, `dashboard`, and `docker-compose.prod.yml`. |
| **Client Configs** | `/opt/toyoland/configs` | Contains all sensitive `.env` files specific to Toyoland. **Never committed to Git.** |
| **Client Uploads** | `/var/www/uploads` | Stores all persistent product/user images and assets. |

---

## 3. Configuration & Environment Variables (`.env`)

The environment variables are stored centrally on the VPS host and mounted directly into the Docker containers at runtime. This ensures that any `git pull` or branch switch will **never** overwrite production credentials.

### File Locations:
1. **Backend Env:** `/opt/toyoland/configs/backend.env`
2. **Dashboard Env:** `/opt/toyoland/configs/dashboard.env`

### Example `/opt/toyoland/configs/backend.env`:
```env
NODE_ENV=production
PORT=5092
CLIENT_NAME=toyoland
CLIENT_CONFIG_PATH=/opt/toyoland/configs
PUBLIC_UPLOADS_PATH=/var/www/uploads

# Port Bindings
MONGODB_PORT=27017
BACKEND_PORT=5092
DASHBOARD_PORT=8005

# MongoDB Internal URI & Root Credentials
MONGODB_URI=mongodb://admin:toyoland_secure_pass_2026@toyoland-mongodb-live:27017/toyoland-db?authSource=admin
MONGODB_DB_NAME=toyoland-db
MONGODB_CONTAINER_NAME=toyoland-mongodb-live
BACKEND_CONTAINER_NAME=toyoland-backend-live
DASHBOARD_CONTAINER_NAME=toyoland-dashboard-live

MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=toyoland_secure_pass_2026
MONGO_INITDB_DATABASE=toyoland-db

# Domain Policies & Allowed Origins
ALLOWED_ORIGINS=https://toyoland.shop,https://admin.toyoland.shop,https://server.toyoland.shop,https://host.toyoland.com,http://localhost:8005,http://localhost:5092
FRONTEND_DOMAIN_KEYWORDS=toyoland.shop,host.toyoland.com
DASHBOARD_DOMAIN_KEYWORDS=admin.toyoland.shop
```

### How to Edit Configs:
```bash
ssh root@144.79.218.122
nano /opt/toyoland/configs/backend.env
```
*(After editing, restart the backend container for changes to take effect).*

---

## 4. Domain & Environment Architecture

| Service / Role | Domain Name | Target / Handler |
| :--- | :--- | :--- |
| **Frontend Storefront** | `https://toyoland.shop` / `https://host.toyoland.com` | Vite SPA / Nginx reverse proxy |
| **Merchant Dashboard** | `https://admin.toyoland.shop` | Vite React Admin Panel |
| **Backend REST API** | `https://server.toyoland.shop` | Express Node.js API |

---

## 5. Docker Volume Mounts & Static Files

Volumes are strictly mapped between the VPS host and the containers:

### Backend Volumes
- **Env:** `/opt/toyoland/configs/backend.env` → `/app/.env` (Read-only)
- **Uploads (Primary):** `/var/www/uploads` → `/app/src/uploads`
- **Uploads (Secondary):** `/opt/toyoland/uploads` → `/app/uploads`

### Database Volumes
- **MongoDB Data:** Docker internal volume `live_mongodb-data` (or `toyoland_mongodb-data`)

---

## 6. How to Redeploy (Update Production)

Whenever new code is pushed to the `Live` branch on GitHub:

```bash
# 1. Login to the VPS
ssh root@144.79.218.122

# 2. Go to the codebase directory
cd /opt/live

# 3. Pull latest code from GitHub
git pull origin Live

# 4. Set client variables and build/restart containers
CLIENT_NAME=toyoland \
CLIENT_CONFIG_PATH=/opt/toyoland/configs \
PUBLIC_UPLOADS_PATH=/var/www/uploads \
docker compose --env-file /opt/toyoland/configs/backend.env -f docker-compose.prod.yml up -d --build
```
*Note: We use `--build` to ensure any new npm packages and Vite frontend assets are freshly compiled.*

---

## 7. Docker Containers & Ports

All application containers bind strictly to `127.0.0.1` (localhost) to prevent direct public exposure and ensure routing through Nginx SSL / Cloudflare.

| Service | Container Name | Internal Port | Host Port Binding | Connected Domain / Routing | Exposure Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Backend** | `toyoland-backend-live` | `5092` | `127.0.0.1:5092` | `https://server.toyoland.shop` | Localhost Only |
| **Dashboard** | `toyoland-dashboard-live` | `8005` | `127.0.0.1:8005` | `https://admin.toyoland.shop` | Localhost Only |
| **Storefront** | `toyoland-frontend-live` | `8001` | `127.0.0.1:8001` | `https://toyoland.shop` | Localhost Only |
| **Database** | `toyoland-mongodb-live` | `27017` | `127.0.0.1:27017` | Internal Docker network only | **Localhost Only (SSH Tunnel)** |

---

## 8. Useful Maintenance Commands

### Check Live Logs
```bash
# View backend logs (tail last 50 lines and follow live)
docker logs toyoland-backend-live --tail 50 -f

# View dashboard logs
docker logs toyoland-dashboard-live --tail 50 -f
```

### Restart Services (Without Rebuilding)
```bash
docker restart toyoland-backend-live
docker restart toyoland-dashboard-live
```

### Check Running Containers
```bash
docker ps --filter name=toyoland --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

---

## 9. Security & Database Hardening (CRITICAL)

### A. Localhost Binding
All database ports in `docker-compose.prod.yml` are bound strictly to `127.0.0.1` (`127.0.0.1:${MONGODB_PORT:-27017}:27017`) so that external internet traffic cannot reach MongoDB directly.

### B. Connecting to MongoDB Remotely via MongoDB Compass (SSH Tunnel)
Connect securely through an encrypted SSH tunnel in MongoDB Compass:

1. **Connection String / Host**: `mongodb://localhost:27017`
2. **Authentication Tab**:
   - Authentication: `Username / Password`
   - Username: `<MONGO_INITDB_ROOT_USERNAME>`
   - Password: `<MONGO_INITDB_ROOT_PASSWORD>`
   - Authentication DB: `admin`
3. **Proxy / SSH Tunnel Tab**:
   - Proxy Method: `SSH with Password`
   - SSH Hostname: `144.79.218.122`
   - SSH Port: `22`
   - SSH Username: `root`
   - SSH Password: `P@ss02654`
4. Click **Connect**.
