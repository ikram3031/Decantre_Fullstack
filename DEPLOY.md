# VPS Deployment Guide - Decantre Perfume Store

## Prerequisites
- VPS with Ubuntu 22.04 LTS (2GB RAM minimum)
- Domain name pointing to your VPS IP
- SSH access to the VPS

## Step 1: Initial VPS Setup

### 1.1 Connect to VPS
```bash
ssh root@your-vps-ip
```

### 1.2 Update System
```bash
apt update && apt upgrade -y
apt install -y curl git wget
```

### 1.3 Install Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker root
```

### 1.4 Install Docker Compose
```bash
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

### 1.5 Install Certbot (for SSL)
```bash
apt install -y certbot python3-certbot-nginx
```

## Step 2: Clone & Configure Project

### 2.1 Clone Repository
```bash
cd /opt
git clone <your-repo-url> decantre
cd decantre
```

### 2.2 Create Environment Files
```bash
# Backend
cp backend/.env.example backend/.env
nano backend/.env  # Edit with production values

# Frontend
cp frontend/.env.example frontend/.env
nano frontend/.env  # Set VITE_API_URL to your domain
```

### 2.3 Update docker-compose.yml
Replace domain placeholders:
```bash
sed -i 's/your-domain.com/yourdomain.com/g' docker-compose.yml
```

## Step 3: Set Up Nginx Reverse Proxy

### 3.1 Install Nginx
```bash
apt install -y nginx
```

### 3.2 Create Nginx Config
```bash
cat > /etc/nginx/sites-available/decantre <<'EOF'
upstream frontend {
    server 127.0.0.1:3000;
}

upstream backend {
    server 127.0.0.1:4000;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

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
EOF
```

### 3.3 Enable Nginx Site
```bash
ln -s /etc/nginx/sites-available/decantre /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl start nginx
systemctl enable nginx
```

### 3.4 Setup SSL with Certbot
```bash
certbot --nginx -d your-domain.com -d www.your-domain.com
systemctl restart nginx
```

## Step 4: Deploy Application

### 4.1 Pull Latest Images
```bash
cd /opt/decantre
docker-compose pull
```

### 4.2 Build Images on VPS (Alternative)
```bash
docker-compose build --no-cache
```

### 4.3 Start Services
```bash
docker-compose up -d
docker-compose logs -f  # Check logs
```

### 4.4 Verify Deployment
```bash
docker-compose ps
curl http://localhost:3000  # Frontend
curl http://localhost:4000  # Backend
```

## Step 5: Monitoring & Maintenance

### 5.1 View Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f  # All services
```

### 5.2 Restart Services
```bash
docker-compose restart backend
docker-compose restart frontend
```

### 5.3 Update Application
```bash
cd /opt/decantre
git pull origin main
docker-compose pull
docker-compose up -d
```

### 5.4 Clean Up
```bash
docker system prune -a --volumes  # Remove unused images/volumes
docker-compose down  # Stop all services
```

## Step 6: Firewall Setup

### 6.1 UFW Configuration
```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
ufw status
```

## Troubleshooting

### Port Already in Use
```bash
netstat -tulpn | grep LISTEN
lsof -i :3000  # Check port 3000
```

### Nginx Not Proxying
```bash
nginx -t
tail -f /var/log/nginx/error.log
```

### Containers Not Starting
```bash
docker-compose logs backend
docker-compose logs frontend
```

### Out of Disk Space
```bash
df -h
docker system df
docker system prune -a
```

## Production Checklist

- [ ] Secrets rotated and in `.env` files
- [ ] Domain SSL certificate installed
- [ ] Nginx reverse proxy configured
- [ ] Firewall rules applied
- [ ] Database backups scheduled
- [ ] Monitoring enabled
- [ ] Log rotation configured
