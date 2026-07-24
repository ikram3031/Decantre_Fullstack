# Development Deployment Guide

## Quick Start (Dev Server)

### Prerequisites
- Ubuntu 22.04 LTS server
- SSH access as root
- Git access to your repository
- Remote MySQL server credentials (optional)

### Step 1: Prepare Environment File

Before deploying, edit `.env.dev-prod` with your dev credentials:

```bash
# On local machine
nano .env.dev-prod
```

Update:
- `DB_HOST` - Your MySQL server IP/hostname
- `DB_USER` - MySQL username
- `DB_PASSWORD` - MySQL password
- `VITE_API_URL` - Your dev server IP (e.g., http://192.168.1.100)

### Step 2: Push to Repository

```bash
git add .
git commit -m "Dev deployment configuration"
git push origin main
```

### Step 3: Deploy on Dev Server

SSH to your dev server and run:

```bash
# As root
ssh root@your-dev-server-ip

# Clone if not already cloned
cd /opt
git clone <your-repo-url> decantre-dev
cd decantre-dev

# Run deployment
bash dev-deploy.sh
```

### Step 4: Verify Services

```bash
docker compose -f docker-compose.dev.yml ps
```

All 4 services should be running:
- **Frontend:** http://your-dev-server-ip:3000
- **Backend:** http://your-dev-server-ip:4000  
- **Dashboard:** http://your-dev-server-ip:5000
- **MongoDB:** mongodb://admin@your-dev-server-ip:27017

## Useful Commands

### View Logs
```bash
# All services
docker compose -f docker-compose.dev.yml logs -f

# Specific service
docker compose -f docker-compose.dev.yml logs -f backend
docker compose -f docker-compose.dev.yml logs -f frontend
docker compose -f docker-compose.dev.yml logs -f dashboard
```

### Restart Services
```bash
docker compose -f docker-compose.dev.yml restart
docker compose -f docker-compose.dev.yml restart backend
```

### Stop/Start
```bash
# Stop all
docker compose -f docker-compose.dev.yml down

# Start all
docker compose -f docker-compose.dev.yml up -d
```

### Quick Update (New Code)
```bash
# On dev server
bash dev-update.sh

# Or manual
cd /opt/decantre-dev
git pull origin main
docker compose -f docker-compose.dev.yml build --pull
docker compose -f docker-compose.dev.yml up -d
```

### Rebuild Images
```bash
docker compose -f docker-compose.dev.yml build --no-cache
docker compose -f docker-compose.dev.yml up -d
```

## Troubleshooting

### Backend not healthy
Check if remote MySQL is accessible:
```bash
docker compose -f docker-compose.dev.yml logs backend
```

### Port already in use
Change ports in `docker-compose.dev.yml` (3000 → 3001, etc.)

### Out of disk space
```bash
docker system prune -a
```

### Clear all data (Fresh start)
```bash
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d
```

## Directory Structure

```
/opt/decantre-dev/          # Project root
├── docker-compose.dev.yml  # Dev compose config
├── .env.dev-prod          # Dev environment vars
├── dev-deploy.sh          # Initial deployment
├── dev-update.sh          # Quick update script
├── backend/               # Backend code
├── frontend/              # Frontend code
└── dashboad/              # Dashboard code
```

## Next Steps

1. Edit `.env.dev-prod` with your credentials
2. Push to repository
3. Run `dev-deploy.sh` on dev server
4. Verify all 4 services are healthy
5. Test endpoints
6. For updates, use `dev-update.sh`
