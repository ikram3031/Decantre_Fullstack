# Development & Production Deployment Guide

## Quick Start

### Development (Local Machine)
```bash
bash dev-start.sh
```
- Starts all services locally
- MongoDB exposed on `localhost:27017`
- Frontend at `http://localhost:3000`
- Backend at `http://localhost:4000`

### Production (VPS)
```bash
# On VPS as root
bash prod-deploy.sh
```
- Automated VPS setup
- Docker & Compose installation
- Service startup with production config

---

## Development Setup

### Prerequisites
- Docker & Docker Compose installed
- Port 3000, 4000, 27017 available

### Start Development
```bash
bash dev-start.sh
```

### Stop Development
```bash
docker compose down
```

### View Logs
```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f
```

### Rebuild on Code Changes
```bash
docker compose build --no-cache
docker compose up -d
```

---

## Production Deployment

### Prerequisites
- Ubuntu 22.04 LTS VPS (2GB RAM minimum)
- Domain name pointing to VPS IP
- Git repository clone ready
- `.env.prod` file with secrets

### VPS Deployment Steps

#### 1. Prepare Environment
```bash
# On local machine
cp .env.prod .env.prod.backup  # Backup template
# Edit .env.prod with production values:
# - Change all CHANGE_ME_ values
# - Set domain in VITE_API_URL
# - Use strong passwords
```

#### 2. Deploy to VPS
```bash
# SSH to VPS
ssh root@your-vps-ip

# Clone repo (if not already done)
cd /opt
git clone <repo-url> decantre
cd decantre

# Copy production environment
# (via SFTP or edit after deploy)
```

#### 3. Run Deployment Script
```bash
bash prod-deploy.sh
```

This script:
- Updates system packages
- Installs Docker & Docker Compose
- Builds/pulls images
- Starts MongoDB, MySQL, Backend, Frontend
- Displays next steps for Nginx

#### 4. Configure Nginx Reverse Proxy
```bash
# Create Nginx config
nano /etc/nginx/sites-available/decantre
```

Paste this config (replace `yourdomain.com`):
```nginx
upstream frontend {
    server 127.0.0.1:3000;
}

upstream backend {
    server 127.0.0.1:4000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        rewrite ^/api/(.*)$ /$1 break;
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 5. Enable Nginx & SSL
```bash
# Enable site
ln -s /etc/nginx/sites-available/decantre /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test config
nginx -t

# Start Nginx
systemctl start nginx
systemctl enable nginx

# Setup SSL with Certbot
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Restart Nginx
systemctl restart nginx
```

#### 6. Verify Deployment
```bash
# Check services
docker compose -f docker-compose.prod.yml ps

# Check logs
docker compose -f docker-compose.prod.yml logs -f

# Test endpoints
curl https://yourdomain.com
curl https://yourdomain.com/api/health
```

---

## Production Updates

### Quick Update (Pull latest code & restart)
```bash
bash prod-update.sh
```

### Manual Update
```bash
# SSH to VPS
ssh root@your-vps-ip
cd /opt/decantre

git pull origin main
docker compose -f docker-compose.prod.yml build --pull
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

---

## Environment Variables

### Development (`.env.dev`)
- Basic credentials for local testing
- MongoDB on localhost
- No external services

### Production (`.env.prod`)
- Must be edited with real values
- Strong passwords required
- Real domain for VITE_API_URL
- SMTP credentials for email
- Kept in `.git/` ignored for security

---

## Monitoring & Logs

### View All Logs
```bash
# Development
docker compose logs -f

# Production
docker compose -f docker-compose.prod.yml logs -f
```

### View Specific Service
```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongodb
docker compose logs -f mysql
```

### Check Service Health
```bash
docker compose ps
docker compose -f docker-compose.prod.yml ps
```

---

## Troubleshooting

### Containers Won't Start
```bash
docker compose logs backend
docker compose logs frontend
# Check for port conflicts, memory issues, or build errors
```

### Port Already in Use
```bash
# Check what's using port
netstat -tulpn | grep :3000
netstat -tulpn | grep :4000

# Kill the process or change docker-compose port mapping
```

### Database Connection Failed
```bash
# Check MongoDB/MySQL is healthy
docker compose exec mongodb mongosh
docker compose exec mysql mysql -uroot -p

# Check environment variables
docker compose exec backend env | grep MONGODB
docker compose exec backend env | grep DB_
```

### Out of Disk Space
```bash
df -h
docker system df
docker system prune -a --volumes
```

### Nginx Not Proxying
```bash
# Test Nginx config
nginx -t

# Check error logs
tail -f /var/log/nginx/error.log

# Verify upstream services running
curl http://127.0.0.1:3000
curl http://127.0.0.1:4000
```

---

## Production Checklist

- [ ] `.env.prod` created with all real values
- [ ] Strong passwords set for all services
- [ ] Domain DNS points to VPS IP
- [ ] SSH keys configured
- [ ] Firewall rules applied (UFW)
- [ ] Nginx reverse proxy configured
- [ ] SSL certificate installed
- [ ] Services verified healthy
- [ ] Backups scheduled
- [ ] Monitoring setup

---

## Security Notes

- Never commit `.env.prod` with real secrets
- Use `.gitignore` to exclude `.env` files
- Rotate passwords regularly
- Keep dependencies updated
- Monitor logs for errors
- Backup databases regularly
