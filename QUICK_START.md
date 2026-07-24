# Quick VPS Deployment Guide

## 5-Minute Quick Start

### On Your Local Machine

1. Push code to GitHub/GitLab
2. Note your domain name and VPS IP address

### On Your VPS (via SSH)

```bash
# 1. Download and run setup script
ssh root@your-vps-ip
curl -fsSL https://raw.githubusercontent.com/yourusername/decantre/main/deploy.sh | bash

# 2. Configure environment
cd /opt/decantre
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit with your production values:
nano backend/.env
nano frontend/.env

# 3. Configure Nginx
nano /etc/nginx/sites-available/decantre
# Replace "your-domain.com" with your actual domain
# Or copy nginx.conf from the repo:
cp nginx.conf /etc/nginx/sites-available/decantre

# 4. Enable Nginx
ln -s /etc/nginx/sites-available/decantre /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t

# 5. Setup SSL
certbot --nginx -d your-domain.com -d www.your-domain.com

# 6. Start application
cd /opt/decantre
docker-compose -f docker-compose.prod.yml up -d

# 7. Verify
docker-compose ps
curl https://your-domain.com
```

## Managing Your Application

### View Logs
```bash
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Restart Services
```bash
docker-compose -f docker-compose.prod.yml restart
docker-compose -f docker-compose.prod.yml restart backend
```

### Update Application
```bash
cd /opt/decantre
./update-deploy.sh
```

### Stop Everything
```bash
docker-compose -f docker-compose.prod.yml down
```

## Common Issues

### "Connection refused" - Services not running
```bash
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs
```

### "502 Bad Gateway" - Nginx can't reach containers
```bash
# Check if containers are running
docker ps
# Check Nginx logs
tail -f /var/log/nginx/decantre-error.log
```

### "Certificate error" - SSL not working
```bash
# Renew certificate
certbot renew --dry-run
certbot renew

# Restart Nginx
systemctl restart nginx
```

### "Disk full" - Running out of space
```bash
docker system df
docker system prune -a --volumes
```

## Monitoring

### Check disk space
```bash
df -h
```

### Check container resource usage
```bash
docker stats
```

### View system logs
```bash
journalctl -u docker --no-pager -n 50
```

## Backup Strategy

### Backup Docker volumes
```bash
# Backup MongoDB/MySQL data
docker-compose exec backend tar czf /tmp/backup.tar.gz /app/data

# Copy to local machine
scp root@your-vps-ip:/tmp/backup.tar.gz ./backups/
```

### Database backup
```bash
# For MongoDB
docker-compose exec backend mongodump --out /tmp/mongo-backup

# For MySQL
docker-compose exec backend mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > /tmp/backup.sql
```

---

Need help? Check DEPLOY.md for detailed instructions.
