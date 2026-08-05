# ✅ Toyoland Docker Setup - Installation Checklist

**Toyoland** - Kids Educational & Wooden Toys Platform  
**Setup Type:** Local Development with Docker  
**Date:** 2025-08-06

---

## 📋 Pre-Installation Requirements

- [ ] Docker Desktop installed (macOS/Windows) or Docker Engine (Linux)
- [ ] Docker Compose v3.9+ (`docker-compose --version`)
- [ ] 4GB+ RAM available for containers
- [ ] Ports available:
  - [ ] 27017 (MongoDB)
  - [ ] 8006 (Toyoland Frontend)
  - [ ] 5093 (Backend, if applicable)

**Verify Prerequisites:**
```bash
docker --version
docker-compose --version
```

---

## 📦 Installation Files Created

### Core Files
- [x] `docker-compose.toyoland.yml` - Service orchestration
- [x] `.env` - Environment configuration
- [x] `.env.toyoland.local` - Template config

### Database Setup
- [x] `toyoland-mongodb-init.js` - Schema initialization
- [x] `toyoland-mongoConnection.js` - Mongoose helper
- [x] `toyoland-mongodb.env.example` - MongoDB config example

### Automation & Commands
- [x] `toyoland-docker-setup.sh` - Automated setup script
- [x] `QUICK_START.sh` - Quick startup script
- [x] `Makefile.toyoland` - Make command shortcuts

### Documentation
- [x] `TOYOLAND_DOCKER_SETUP.md` - Complete guide (9.3KB)
- [x] `TOYOLAND_LOCAL_DOCKER_SETUP_SUMMARY.md` - Setup summary (11.5KB)
- [x] `TOYOLAND_DOCKER_SETUP_CHECKLIST.md` - This file

---

## 🚀 Installation Steps

### Step 1: Verify Configuration
```bash
# Check .env file exists and has values
cat .env

# Expected output should include:
# MONGO_INITDB_ROOT_USERNAME=admin
# MONGO_INITDB_ROOT_PASSWORD=11223345
# MONGO_INITDB_DATABASE=toyoland-store
# TOYOLAND_FRONTEND_PORT=8006
```
- [ ] .env file configured
- [ ] Credentials set
- [ ] Ports available

### Step 2: Validate Docker Compose File
```bash
# Validate syntax
docker-compose -f docker-compose.toyoland.yml config > /dev/null && echo "✓ Valid"

# Should output services without errors
```
- [ ] docker-compose.yml validates
- [ ] Services listed correctly

### Step 3: Start Services
**Option A - Quick Start:**
```bash
docker-compose -f docker-compose.toyoland.yml up -d
```

**Option B - With Output:**
```bash
docker-compose -f docker-compose.toyoland.yml up -d --build
docker-compose -f docker-compose.toyoland.yml logs -f
```

**Option C - Automated Script:**
```bash
bash toyoland-docker-setup.sh
```
- [ ] Services started without errors
- [ ] No port conflicts

### Step 4: Verify Services
```bash
# Check container status
docker-compose -f docker-compose.toyoland.yml ps

# Should show:
# STATUS: Up (with healthcheck passing)
```
- [ ] MongoDB container running
- [ ] Frontend container running
- [ ] Health checks passing

### Step 5: Verify MongoDB
```bash
# Access MongoDB shell
docker exec -it toyoland-mongodb-dev mongosh \
  -u admin -p 11223345 \
  --authenticationDatabase admin

# Inside mongosh, run:
> show dbs
> use toyoland-store
> show collections
> db.users.count()  # Should be 0 initially
```
- [ ] MongoDB connection successful
- [ ] toyoland-store database exists
- [ ] Collections created (users, products, categories, brands, orders)
- [ ] Indexes created

### Step 6: Verify Frontend
```bash
# Check if running
curl http://localhost:8006

# Or visit in browser
# http://localhost:8006
```
- [ ] Frontend responds on port 8006
- [ ] No build errors in logs

---

## 🌐 Services Configuration Summary

### MongoDB
```
Container:  toyoland-mongodb-dev
Image:      mongo:7.0
Port:       27017
Username:   admin
Password:   11223345
Database:   toyoland-store
Auth DB:    admin
Volume:     mongodb-toyoland-data (persistent)
Healthcheck: Ping test every 10s
```

### Frontend
```
Container:  toyoland-frontend-dev
Image:      Built from ./toyoland/Dockerfile
Framework:  Next.js 15.4.9
Runtime:    Node 22-alpine
Port:       8006
Volumes:    Source code for hot reload
Healthcheck: HTTP GET every 30s
```

---

## 🔗 Connection References

### MongoDB Connection String
```
mongodb://admin:[REDACTED]@localhost:27017/toyoland-store?authSource=admin&authMechanism=SCRAM-SHA-256
```

### MongoDB Compass
```
URI: mongodb://admin:[REDACTED]@localhost:27017/toyoland-store?authSource=admin
```

### Frontend URL
```
http://localhost:8006
```

---

## 📊 Database Collections Created

1. **users** - 7 indexes (email unique)
2. **categories** - 3 indexes (slug unique)
3. **brands** - 3 indexes (slug unique)
4. **products** - 5 indexes (slug unique, text search enabled)
5. **orders** - 4 indexes (orderNumber unique)

All collections have JSON schema validation enabled.

---

## 🛠 Post-Installation Verification

### Test MongoDB Connection
```bash
# From container
docker exec toyoland-mongodb-dev mongosh \
  -u admin \
  -p 11223345 \
  --authenticationDatabase admin \
  --eval "db.version()"
```
- [ ] MongoDB responds with version

### Test Frontend Access
```bash
# From command line
curl -I http://localhost:8006

# Or visit in browser
# http://localhost:8006
```
- [ ] Frontend responds with status 200

### Test Network
```bash
# Inspect bridge network
docker network inspect toyoland_toyoland-network
```
- [ ] Both containers connected
- [ ] Network gateway configured

---

## 📝 Quick Reference Commands

### Start/Stop
```bash
# Start
docker-compose -f docker-compose.toyoland.yml up -d

# Stop
docker-compose -f docker-compose.toyoland.yml down

# Restart
docker-compose -f docker-compose.toyoland.yml restart
```

### Logs & Status
```bash
# Status
docker-compose -f docker-compose.toyoland.yml ps

# All logs
docker-compose -f docker-compose.toyoland.yml logs -f

# MongoDB logs only
docker-compose -f docker-compose.toyoland.yml logs -f mongodb
```

### MongoDB Access
```bash
# Shell
docker exec -it toyoland-mongodb-dev mongosh \
  -u admin -p 11223345 \
  --authenticationDatabase admin

# Backup
docker exec toyoland-mongodb-dev mongodump \
  -u admin -p 11223345 \
  --authenticationDatabase admin \
  --out /data/backups
```

### Makefile Shortcuts
```bash
make toyoland-help      # See all commands
make toyoland-up        # Start services
make toyoland-down      # Stop services
make toyoland-logs      # View logs
make toyoland-mongo     # Open MongoDB shell
make toyoland-bash      # Shell in frontend
```

---

## 🔧 Troubleshooting Checklist

### MongoDB Issues
- [ ] Check: `docker-compose -f docker-compose.toyoland.yml logs mongodb`
- [ ] Verify: Port 27017 not in use (`lsof -i :27017`)
- [ ] Test: `docker exec -it toyoland-mongodb-dev ping localhost` works
- [ ] Reset: `docker-compose -f docker-compose.toyoland.yml down -v && docker-compose -f docker-compose.toyoland.yml up -d mongodb`

### Frontend Issues
- [ ] Check: `docker-compose -f docker-compose.toyoland.yml logs toyoland-frontend`
- [ ] Verify: Port 8006 not in use (`lsof -i :8006`)
- [ ] Rebuild: `docker-compose -f docker-compose.toyoland.yml build --no-cache toyoland-frontend`
- [ ] Restart: `docker-compose -f docker-compose.toyoland.yml restart toyoland-frontend`

### General Issues
- [ ] Check disk space: `docker system df`
- [ ] Check Docker daemon: `docker ps`
- [ ] Verify network: `docker network ls` and `docker network inspect toyoland_toyoland-network`
- [ ] Clean up: `docker system prune -f`

---

## ✨ Features Enabled

- [x] MongoDB 7.0 with schema validation
- [x] Auto-database initialization on first run
- [x] Persistent data volumes
- [x] Health checks for all services
- [x] Bridge network for service communication
- [x] Source code hot reload (frontend)
- [x] Non-root user execution (security)
- [x] Text search indexing (products)
- [x] Unique constraints (email, slug, orderNumber)
- [x] Comprehensive logging

---

## 📖 Documentation Files

For detailed information, see:

1. **TOYOLAND_DOCKER_SETUP.md** - Complete setup guide
   - Detailed service descriptions
   - Database schema documentation
   - Common commands and troubleshooting

2. **TOYOLAND_LOCAL_DOCKER_SETUP_SUMMARY.md** - Setup summary
   - Quick reference
   - Connection information
   - Architecture diagram

3. **This File** - Installation checklist
   - Step-by-step verification
   - Quick reference commands
   - Troubleshooting guide

---

## 🎯 Next Steps After Installation

1. **Develop Frontend**
   - Edit code in `/toyoland/` directory
   - Changes auto-reflect via volume mounts
   - View frontend at http://localhost:8006

2. **Add Backend** (Optional)
   - Create backend service in docker-compose.toyoland.yml
   - Connect to MongoDB on `mongodb:27017`
   - Use credentials: admin / 11223345

3. **Load Sample Data** (Optional)
   - Connect to MongoDB
   - Insert test documents in collections
   - Build and test API endpoints

4. **Production Ready**
   - When ready: Use `docker-compose.prod.yml`
   - Configure environment for production
   - Set up reverse proxy and SSL

---

## ✅ Installation Complete Checklist

- [ ] Docker and Docker Compose installed
- [ ] All required files created (12 files)
- [ ] .env configured with credentials
- [ ] docker-compose.toyoland.yml validated
- [ ] Services started successfully
- [ ] MongoDB running and accessible
- [ ] Frontend running and accessible
- [ ] Collections created in database
- [ ] Health checks passing
- [ ] Documentation reviewed

---

## 🎉 You're All Set!

Your Toyoland local development environment is ready.

**Quick Commands:**
```bash
# View status anytime
docker-compose -f docker-compose.toyoland.yml ps

# Access frontend
# http://localhost:8006

# Access MongoDB
docker exec -it toyoland-mongodb-dev mongosh -u admin -p 11223345 --authenticationDatabase admin

# View all logs
docker-compose -f docker-compose.toyoland.yml logs -f
```

**Questions?** Check the documentation files or the logs.

Happy developing! 🚀

---

**Setup Date:** 2025-08-06  
**Platform:** Toyoland  
**Environment:** Local Development  
**Status:** ✅ Complete
