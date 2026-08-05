# ✅ Toyoland Local Docker Setup - Complete

**Setup Date:** 2025-08-06  
**Platform:** Toyoland (Kids Educational & Wooden Toys)  
**Database:** MongoDB 7.0 - toyoland-store  
**Frontend:** Next.js 15 + React 19  

---

## 📦 What Was Set Up

### ✓ Created Files

1. **docker-compose.toyoland.yml** - Multi-service orchestration
   - MongoDB 7.0 with auto-initialization
   - Toyoland Frontend (Next.js)
   - Persistent volumes and networking

2. **Configuration Files**
   - `.env` - Environment variables for local development
   - `.env.toyoland.local` - Template configuration
   - `toyoland-mongodb.env.example` - MongoDB specific settings

3. **Database Setup**
   - `toyoland-mongodb-init.js` - Auto-run schema initialization
   - Collections: users, categories, brands, products, orders
   - Validation schemas and indexes for each collection
   - MongoDB Shell (mongosh) ready

4. **Connection Module**
   - `toyoland-mongoConnection.js` - Mongoose connection helper
   - Ready for Node.js backend integration

5. **Automation Scripts**
   - `toyoland-docker-setup.sh` - Automated setup (Linux/macOS)
   - `QUICK_START.sh` - Fast startup script
   - `Makefile.toyoland` - Make shortcuts for all operations

6. **Documentation**
   - `TOYOLAND_DOCKER_SETUP.md` - Complete guide
   - `TOYOLAND_LOCAL_DOCKER_SETUP_SUMMARY.md` - This file

---

## 🚀 Quick Start (3 Steps)

### Step 1: Start Services
```bash
docker-compose -f docker-compose.toyoland.yml up -d
```

### Step 2: Wait for Initialization
```bash
# Check status
docker-compose -f docker-compose.toyoland.yml ps

# View logs
docker-compose -f docker-compose.toyoland.yml logs -f
```

### Step 3: Access Services
- **Frontend:** http://localhost:8006
- **MongoDB:** localhost:27017
- **Username:** admin
- **Password:** 11223345
- **Database:** toyoland-store

---

## 🔗 Connection Information

### MongoDB

**Connection String (Node.js):**
```
mongodb://admin:11223345@localhost:27017/toyoland-store?authSource=admin&authMechanism=SCRAM-SHA-256
```

**MongoDB Compass URI:**
```
mongodb://admin:[REDACTED]@localhost:27017/toyoland-store?authSource=admin
```

**Shell Access:**
```bash
docker exec -it toyoland-mongodb-dev mongosh \
  -u admin \
  -p 11223345 \
  --authenticationDatabase admin
```

### Frontend

**URL:** http://localhost:8006  
**Framework:** Next.js 15.4.9  
**React Version:** 19.2.1  
**Port:** 8006

**Access Shell:**
```bash
docker exec -it toyoland-frontend-dev sh
```

---

## 📊 Database Collections

All collections are created automatically with validation schemas:

### 1. **users**
- Fields: email, password, firstName, lastName, phone, role, address, profileImage, isActive
- Unique: email
- Roles: customer, admin, vendor

### 2. **categories**
- Fields: name, slug, description, image, icon, parentCategoryId, displayOrder
- Unique: slug
- Hierarchy: Supports parent categories

### 3. **brands**
- Fields: name, slug, description, logo, website, displayOrder
- Unique: slug

### 4. **products**
- Fields: name, sku, categoryId, brandId, price, stock, images, ageGroup, educationalValue
- Unique: slug
- Age Groups: 0-2, 2-5, 5-8, 8-12, 12+, All Ages
- Text Search: Enabled on name and description

### 5. **orders**
- Fields: orderNumber, userId, items[], shippingAddress, totalAmount, status, paymentStatus
- Unique: orderNumber
- Statuses: pending, confirmed, shipped, delivered, cancelled, returned

---

## 🛠 Common Commands

### Docker Compose Commands

```bash
# Start services
docker-compose -f docker-compose.toyoland.yml up -d

# Stop services
docker-compose -f docker-compose.toyoland.yml down

# Restart
docker-compose -f docker-compose.toyoland.yml restart

# Rebuild images
docker-compose -f docker-compose.toyoland.yml build --no-cache

# View status
docker-compose -f docker-compose.toyoland.yml ps

# View logs
docker-compose -f docker-compose.toyoland.yml logs -f
```

### Makefile Commands (Alternative)

```bash
# Start services
make toyoland-up

# Stop services
make toyoland-down

# View logs
make toyoland-logs

# MongoDB shell
make toyoland-mongo

# Frontend shell
make toyoland-bash

# See all commands
make toyoland-help
```

### MongoDB Operations

```bash
# Access MongoDB shell
docker exec -it toyoland-mongodb-dev mongosh -u admin -p 11223345 --authenticationDatabase admin

# Inside MongoDB shell - switch to toyoland-store
> use toyoland-store

# See all collections
> show collections

# Count documents in a collection
> db.users.countDocuments()
> db.products.countDocuments()

# Find one document
> db.users.findOne()

# Check indexes
> db.users.getIndexes()
```

### Database Backup/Restore

```bash
# Backup
docker exec toyoland-mongodb-dev mongodump \
  -u admin -p 11223345 \
  --authenticationDatabase admin \
  --out /data/backups

# Restore
docker exec toyoland-mongodb-dev mongorestore \
  -u admin -p 11223345 \
  --authenticationDatabase admin \
  /data/backups
```

---

## 🌐 Environment Variables

Location: `.env` (project root)

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
DASHBOARD_URL=http://localhost:8005

# Optional APIs
GOOGLE_GENAI_API_KEY=
NEXT_PUBLIC_FIREBASE_API_KEY=
```

---

## 🔍 Troubleshooting

### MongoDB Won't Connect

```bash
# Check MongoDB logs
docker-compose -f docker-compose.toyoland.yml logs mongodb

# Test connection
docker exec -it toyoland-mongodb-dev mongosh \
  -u admin \
  -p 11223345 \
  --authenticationDatabase admin \
  --eval "db.version()"

# Reset (WARNING: DELETES DATA)
docker-compose -f docker-compose.toyoland.yml down -v
docker-compose -f docker-compose.toyoland.yml up -d mongodb
```

### Port Already in Use

```bash
# Find process on port 27017
lsof -i :27017  # macOS/Linux
netstat -ano | findstr :27017  # Windows

# Or change port in docker-compose.toyoland.yml:
#   ports:
#     - "27018:27017"
```

### Frontend Not Loading

```bash
# Check logs
docker-compose -f docker-compose.toyoland.yml logs toyoland-frontend

# Rebuild without cache
docker-compose -f docker-compose.toyoland.yml build --no-cache toyoland-frontend

# Restart
docker-compose -f docker-compose.toyoland.yml restart toyoland-frontend
```

### Out of Disk Space

```bash
# Check Docker usage
docker system df

# Clean up unused images/containers
docker system prune -f

# Remove volumes (WARNING: DELETES DATA)
docker volume prune -f
```

---

## 📁 Project Structure

```
Toyoland/
├── docker-compose.toyoland.yml      ← Use this for local dev
├── docker-compose.yml               ← Main/legacy compose
├── .env                             ← Local configuration
├── Makefile.toyoland                ← Make shortcuts
├── TOYOLAND_DOCKER_SETUP.md         ← Full documentation
├── QUICK_START.sh                   ← Fast startup
├── toyoland-docker-setup.sh         ← Automated setup
├── toyoland-mongodb-init.js         ← DB initialization
├── toyoland-mongoConnection.js      ← Mongoose helper
├── toyoland-mongodb.env.example     ← MongoDB config template
│
├── toyoland/                        ← Frontend (Next.js 15)
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.ts
│   ├── app/                         ← App Router
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   └── public/
│
├── backend/                         ← Backend API (if exists)
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   └── ...
│
└── ...
```

---

## 🎯 Next Steps

### 1. Verify Setup
```bash
# Check all services running
docker-compose -f docker-compose.toyoland.yml ps

# Access MongoDB to verify database
docker exec -it toyoland-mongodb-dev mongosh \
  -u admin -p 11223345 \
  --authenticationDatabase admin
```

### 2. Add Backend (Optional)
If you have a backend service:
- Uncomment backend section in `docker-compose.toyoland.yml`
- Point to your backend Dockerfile
- Add `depends_on: mongodb`

### 3. Develop
- Frontend code: `/toyoland/` - auto-updates via volumes
- Backend code: mount as needed
- Database: persistent volume `mongodb-toyoland-data`

### 4. Production Deployment
When ready to deploy:
- Use `docker-compose.prod.yml`
- Update environment variables
- Configure reverse proxy (nginx)
- Set up SSL/TLS

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────┐
│         TOYOLAND LOCAL DOCKER SETUP             │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐      ┌─────────────────┐   │
│  │   Frontend   │      │    MongoDB      │   │
│  │  Next.js 15  │──────│  Collections:   │   │
│  │   Port 8006  │      │  - users        │   │
│  │              │      │  - products     │   │
│  └──────────────┘      │  - categories   │   │
│                        │  - brands       │   │
│                        │  - orders       │   │
│                        │  Port 27017     │   │
│                        └─────────────────┘   │
│                                                 │
│        toyoland-network (bridge driver)        │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 📞 Support

### Logs
```bash
# All services
docker-compose -f docker-compose.toyoland.yml logs -f

# Specific service
docker-compose -f docker-compose.toyoland.yml logs -f mongodb
docker-compose -f docker-compose.toyoland.yml logs -f toyoland-frontend
```

### Health Checks
- MongoDB: Ping test every 10s
- Frontend: HTTP health check every 30s

### Reset Everything
```bash
# Stop and remove all data
docker-compose -f docker-compose.toyoland.yml down -v

# Rebuild and restart
docker-compose -f docker-compose.toyoland.yml up -d --build
```

---

## ✨ Features

✅ **MongoDB 7.0** - Latest stable version  
✅ **Schema Validation** - All collections have JSON schemas  
✅ **Indexes** - Optimized for queries (unique, text search)  
✅ **Auto-Initialization** - DB schema loads on first run  
✅ **Next.js 15** - Latest React 19 framework  
✅ **Hot Reload** - Source volumes for development  
✅ **Persistent Storage** - Data survives restarts  
✅ **Health Checks** - Automatic service monitoring  
✅ **Network Isolation** - Bridge network for services  
✅ **Easy Commands** - Makefile shortcuts  

---

**Status:** ✅ Complete and Ready  
**Last Updated:** 2025-08-06  
**Toyoland Version:** Local Development  
**Docker Compose Format:** Latest  

Enjoy developing Toyoland! 🎉
