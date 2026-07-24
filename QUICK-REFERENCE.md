# 🚀 **DECANTRE DEV DEPLOYMENT - QUICK REFERENCE**

## ✅ **Status: READY**

All 4 services are built, configured, and running (or healthy):

```
✅ Frontend       → http://localhost:8001 (Healthy)
✅ Dashboard      → http://localhost:8005 (Healthy)
✅ MongoDB        → mongodb://localhost:27017 (Healthy)
⚠️  Backend       → http://localhost:4000 (Waiting MySQL)
```

---

## 📁 **Key Files Created/Updated**

```
docker-compose.dev.yml          ← Updated with args: for Vite
frontend/Dockerfile             ← Updated with ARG VITE_API_URL
dashboad/Dockerfile             ← Updated with ARG VITE_API_URL
.env.dev-prod                   ← Development environment values
DEV-DEPLOYMENT-EXECUTION.md     ← Full execution report
```

---

## 🛠️ **Common Commands**

```bash
# View all services
docker compose -f docker-compose.dev.yml ps

# View logs (all)
docker compose -f docker-compose.dev.yml logs -f

# View logs (specific service)
docker compose -f docker-compose.dev.yml logs -f backend

# Stop all
docker compose -f docker-compose.dev.yml down

# Restart one service
docker compose -f docker-compose.dev.yml restart backend

# Rebuild images
docker compose -f docker-compose.dev.yml build --pull

# Full restart
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up -d
```

---

## 🔧 **Fix Backend (Choose One)**

### Option A: Use Remote MySQL
```bash
# Edit .env.dev-prod
DB_HOST=your-mysql-host
DB_USER=your-user
DB_PASSWORD=your-password

# Restart
docker compose -f docker-compose.dev.yml restart backend
```

### Option B: Add Local MySQL
```yaml
# Add to docker-compose.dev.yml
mysql:
  image: mysql:8.0
  environment:
    MYSQL_ROOT_PASSWORD: devpass123
    MYSQL_DATABASE: perfume_store_dev
  ports:
    - "3306:3306"
```

---

## 📤 **Deploy to VPS (144.79.218.126)**

```bash
# 1. Commit & push
git add .
git commit -m "Dev deployment pipeline complete"
git push origin main

# 2. SSH to VPS
ssh root@144.79.218.126

# 3. Deploy
cd /opt/decantre-dev
bash dev-deploy.sh

# 4. Verify
docker compose -f docker-compose.dev.yml ps
```

---

## 🔒 **Security Status**

- ✅ No hardcoded secrets in code
- ✅ VITE_API_URL embedded at build time
- ✅ MongoDB credentials templated
- ✅ All sensitive values in `.env.dev-prod`
- ✅ `.env.dev-prod` NOT in git (.gitignore)

---

## 📋 **Checklist Before Production**

- [ ] Backend healthy with MySQL configured
- [ ] Frontend loads at http://localhost:8001
- [ ] Dashboard loads at http://localhost:8005
- [ ] API calls work (test /health endpoint)
- [ ] MongoDB accessible
- [ ] `.env.dev-prod` NOT committed to git
- [ ] All tests pass
- [ ] Ready for VPS deployment

---

## 🎯 **Next: VPS Deployment**

Once verified locally:
```bash
bash dev-deploy.sh
# This runs on VPS 144.79.218.126
```

See `DEV-DEPLOYMENT-EXECUTION.md` for full details.
