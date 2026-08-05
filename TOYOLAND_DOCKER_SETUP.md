# Toyoland Local Docker Setup Guide

Complete local development environment for **Toyoland** (Kids Educational & Wooden Toys Platform) using Docker.

## 📋 Prerequisites

- Docker Desktop (macOS/Windows) or Docker Engine (Linux)
- Docker Compose v3.9+
- 4GB+ RAM available
- Port availability: `27017` (MongoDB), `8006` (Frontend)

**Installation:**
- macOS/Windows: [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Linux: [Docker Engine](https://docs.docker.com/engine/install/)

---

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Make the script executable
chmod +x toyoland-docker-setup.sh

# Run setup
./toyoland-docker-setup.sh
```

### Option 2: Manual Setup

```bash
# Load environment
export $(cat .env.toyoland.local | grep -v '^#' | xargs)

# Start services
docker-compose -f docker-compose.toyoland.yml up -d

# Verify
docker-compose -f docker-compose.toyoland.yml ps
```

### Option 3: Using Makefile

```bash
# Start services
make toyoland-up

# View status
make toyoland-status

# See all commands
make toyoland-help
```

---

## 📦 Services

### 1. MongoDB (Port 27017)
- **Image:** mongo:7.0
- **Username:** admin
- **Password:** 11223345
- **Database:** toyoland-store
- **Volume:** `mongodb-toyoland-data` (persistent storage)
- **Initialization:** Auto-runs `toyoland-mongodb-init.js` on first start

**Collections Created:**
- `users` - User accounts and profiles
- `categories` - Product categories (with hierarchy support)
- `brands` - Toy brands
- `products` - Product catalog (with educational metadata)
- `orders` - Order management

### 2. Toyoland Frontend (Port 8006)
- **Framework:** Next.js 15.4.9 (React 19)
- **Type:** TypeScript
- **Styling:** Tailwind CSS 4.1
- **Dependencies:** Redux Toolkit, TanStack Query, Google GenAI
- **Build:** Multi-stage Docker build
- **Volume Mounts:** Source code for live updates

---

## 🔗 Connection Details

### MongoDB Access

**From Docker:**
```bash
# Via Makefile
make toyoland-mongo

# Or manual
docker exec -it toyoland-mongodb-dev mongosh \
  -u admin \
  -p 11223345 \
  --authenticationDatabase admin
```

**From MongoDB Compass:**
```
URI: mongodb://admin:[REDACTED]@localhost:27017/toyoland-store?authSource=admin
```

**From Node.js:**
```javascript
const MONGO_URI = 'mongodb://admin:[REDACTED]@localhost:27017/toyoland-store?authSource=admin';
```

### Frontend Access
- URL: `http://localhost:8006`
- Dev Mode: Supports hot reload from source volume mounts

---

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: string (unique),
  password: string (hashed),
  firstName: string,
  lastName: string,
  phone: string,
  role: enum['customer', 'admin', 'vendor'],
  address: { street, city, state, postalCode, country },
  profileImage: string,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Categories Collection
```javascript
{
  _id: ObjectId,
  name: string,
  slug: string (unique),
  description: string,
  image: string,
  icon: string,
  parentCategoryId: ObjectId,
  isActive: boolean,
  displayOrder: number,
  createdAt: Date,
  updatedAt: Date
}
```

### Brands Collection
```javascript
{
  _id: ObjectId,
  name: string,
  slug: string (unique),
  description: string,
  logo: string,
  website: string,
  isActive: boolean,
  displayOrder: number,
  createdAt: Date,
  updatedAt: Date
}
```

### Products Collection
```javascript
{
  _id: ObjectId,
  name: string,
  slug: string (unique),
  description: string,
  sku: string,
  categoryId: ObjectId,
  brandId: ObjectId,
  price: Decimal,
  discountPrice: Decimal,
  stock: number,
  images: string[],
  specifications: object,
  ageGroup: enum['0-2', '2-5', '5-8', '8-12', '12+', 'All Ages'],
  educationalValue: string,
  safetyRatings: string[],
  rating: number,
  reviews: number,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Orders Collection
```javascript
{
  _id: ObjectId,
  orderNumber: string,
  userId: ObjectId,
  items: [
    { productId, quantity, price, discount }
  ],
  shippingAddress: { street, city, state, postalCode, country },
  billingAddress: object,
  subtotal: Decimal,
  tax: Decimal,
  shippingCost: Decimal,
  totalAmount: Decimal,
  paymentMethod: enum['credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer'],
  paymentStatus: enum['pending', 'completed', 'failed', 'refunded'],
  status: enum['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'],
  trackingNumber: string,
  notes: string,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🛠 Common Commands

### Start/Stop Services

```bash
# Start all services
docker-compose -f docker-compose.toyoland.yml up -d

# Stop all services
docker-compose -f docker-compose.toyoland.yml down

# Restart services
docker-compose -f docker-compose.toyoland.yml restart

# Rebuild and start
docker-compose -f docker-compose.toyoland.yml up -d --build
```

### View Logs

```bash
# All services
docker-compose -f docker-compose.toyoland.yml logs -f

# MongoDB only
docker-compose -f docker-compose.toyoland.yml logs -f mongodb

# Frontend only
docker-compose -f docker-compose.toyoland.yml logs -f toyoland-frontend
```

### Access Services

```bash
# MongoDB Shell
docker exec -it toyoland-mongodb-dev mongosh \
  -u admin -p 11223345 \
  --authenticationDatabase admin

# Frontend Shell
docker exec -it toyoland-frontend-dev sh

# Inspect Network
docker network inspect toyoland_toyoland-network
```

### Database Operations

```bash
# Backup database
docker exec toyoland-mongodb-dev mongodump \
  -u admin -p 11223345 \
  --authenticationDatabase admin \
  --out /data/backups/toyoland-dump

# Restore database
docker exec toyoland-mongodb-dev mongorestore \
  -u admin -p 11223345 \
  --authenticationDatabase admin \
  /data/backups/toyoland-dump
```

### Cleanup

```bash
# Stop and remove containers
docker-compose -f docker-compose.toyoland.yml down

# Remove volumes (DELETES DATA)
docker-compose -f docker-compose.toyoland.yml down -v

# Clean Docker system
docker system prune -f
```

---

## 📝 Environment Variables

Located in `.env.toyoland.local`:

```env
# MongoDB
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=11223345
MONGO_INITDB_DATABASE=toyoland-store
MONGODB_CONTAINER_NAME=toyoland-mongodb-dev

# Frontend
TOYOLAND_FRONTEND_PORT=8006
TOYOLAND_FRONTEND_CONTAINER_NAME=toyoland-frontend-dev

# Node
NODE_ENV=development

# URLs
BACKEND_URL=http://localhost:5093
FRONTEND_URL=http://localhost:8006

# Optional: Google GenAI API
GOOGLE_GENAI_API_KEY=your_api_key_here

# Optional: Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
```

**To use:** Copy to `.env` in project root

---

## 🔍 Troubleshooting

### MongoDB Won't Start

```bash
# Check logs
docker-compose -f docker-compose.toyoland.yml logs mongodb

# Verify Docker volume
docker volume ls | grep toyoland

# Reset (WARNING: deletes data)
docker-compose -f docker-compose.toyoland.yml down -v
docker-compose -f docker-compose.toyoland.yml up -d mongodb
```

### Frontend Port Already in Use

```bash
# Find process using port 8006
lsof -i :8006  # macOS/Linux
netstat -ano | findstr :8006  # Windows

# Or use different port in .env.toyoland.local
TOYOLAND_FRONTEND_PORT=8007
```

### Container Crashes on Startup

```bash
# Check detailed logs
docker logs toyoland-frontend-dev

# Rebuild without cache
docker-compose -f docker-compose.toyoland.yml build --no-cache
docker-compose -f docker-compose.toyoland.yml up -d
```

### MongoDB Authentication Failed

```bash
# Verify credentials in compose file
cat docker-compose.toyoland.yml | grep MONGO_

# Test connection manually
docker exec -it toyoland-mongodb-dev mongosh \
  -u admin \
  -p 11223345 \
  --authenticationDatabase admin \
  --eval "db.version()"
```

---

## 📋 File Manifest

Generated files for this setup:

- `docker-compose.toyoland.yml` - Docker Compose configuration
- `.env.toyoland.local` - Environment variables
- `toyoland-docker-setup.sh` - Automated setup script
- `Makefile.toyoland` - Make shortcuts
- `toyoland-mongodb-init.js` - MongoDB initialization script
- `toyoland-mongoConnection.js` - Mongoose connection module
- `TOYOLAND_DOCKER_SETUP.md` - This guide

---

## 🎯 Next Steps

1. **Start Services:** `./toyoland-docker-setup.sh` or `docker-compose -f docker-compose.toyoland.yml up -d`

2. **Access Frontend:** `http://localhost:8006`

3. **Initialize DB:** MongoDB auto-initializes on first run via `toyoland-mongodb-init.js`

4. **Verify DB:** 
   ```bash
   make toyoland-mongo
   > use toyoland-store
   > show collections
   ```

5. **Develop:** 
   - Frontend code auto-updates via volume mounts
   - Backend (when added) follows same pattern

6. **Deploy:** See deployment guides in parent directory

---

## 📞 Support

For issues:
1. Check logs: `docker-compose -f docker-compose.toyoland.yml logs -f`
2. Verify networking: `docker network inspect toyoland_toyoland-network`
3. Reset everything: `docker-compose -f docker-compose.toyoland.yml down -v && docker-compose -f docker-compose.toyoland.yml up -d`

---

**Created:** $(date)  
**Toyoland Platform** - Kids Educational & Wooden Toys  
**Database:** toyoland-store  
**Stack:** Next.js 15 | React 19 | MongoDB 7.0 | Docker
