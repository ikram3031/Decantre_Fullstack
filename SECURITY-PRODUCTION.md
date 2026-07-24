# 🔒 **PRODUCTION DEPLOYMENT SECURITY GUIDE**

## ⚠️ CRITICAL SECURITY STEPS

### 1️⃣ **Environment Variables Setup**

```bash
# DO NOT use the template file as-is!
cp .env.prod.template .env.prod

# Edit with REAL values
nano .env.prod
```

**Required changes in `.env.prod`:**
- `MONGO_PASSWORD` - Use strong password (min 16 chars, special chars)
- `DB_PASSWORD` - Your MySQL password
- `ACCESS_TOKEN_SECRET` - Generate new: `openssl rand -base64 32`
- `SMTP_PASSWORD` - Email credentials
- `VITE_API_URL` - Your actual domain (https://)

### 2️⃣ **Git Security**

```bash
# Add to .gitignore BEFORE first commit
echo ".env.prod" >> .gitignore
echo ".env" >> .gitignore
echo "nginx-prod-secure.conf" >> .gitignore

# Verify it's not tracked
git status
```

### 3️⃣ **Database Security**

**MongoDB:**
- ✅ NOT exposed on public port (removed `ports:` section)
- ✅ Strong password in `.env.prod`
- ✅ Only accessible from backend container

**MySQL (External):**
- ✅ Use dedicated DB user (not root)
- ✅ Restrict DB access by IP
- ✅ Use strong password

### 4️⃣ **Container Network Security**

```bash
# MongoDB is NOT accessible from outside
# Only backend container can reach it via Docker network
docker network ls

# Verify MongoDB is internal-only
docker inspect decantre-network
```

### 5️⃣ **Nginx SSL/TLS Security**

```bash
# Use Let's Encrypt with Certbot
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (should be default)
systemctl enable certbot.timer
```

**Key security headers in nginx-prod-secure.conf:**
- X-Frame-Options: SAMEORIGIN (prevent clickjacking)
- X-Content-Type-Options: nosniff (prevent MIME-sniffing)
- Strict-Transport-Security (HSTS)
- CORS headers for API

### 6️⃣ **API Security**

**Frontend to Backend:**
```
Frontend (https://yourdomain.com) 
  → Nginx (port 443)
  → Backend (127.0.0.1:4000 - internal only)
```

**No direct exposure of:**
- ❌ Port 4000 to public
- ❌ Port 27017 (MongoDB)
- ❌ Port 3306 (MySQL)

### 7️⃣ **Secret Management Best Practices**

```bash
# Generate strong secrets
# JWT Secret (32+ chars)
openssl rand -base64 32

# Passwords (16+ chars, mixed)
openssl rand -base64 16

# Store in secure password manager (1Password, Bitwarden, etc.)
# NOT in git, NOT in email
```

## 🚀 **DEPLOYMENT CHECKLIST**

- [ ] `.env.prod` created with REAL values
- [ ] `.env.prod` added to `.gitignore`
- [ ] All MONGO_PASSWORD, DB_PASSWORD, JWT_SECRET are strong
- [ ] MySQL user is restricted (not root)
- [ ] Domain SSL certificate configured
- [ ] nginx-prod-secure.conf updated with your domain
- [ ] MongoDB port 27017 is NOT in docker-compose.prod.yml
- [ ] Firewall rules allow only 80, 443 (SSH on custom port recommended)
- [ ] Git repo doesn't contain secrets

## 📋 **PRE-PRODUCTION VALIDATION**

### Test Environment Variables
```bash
# Before deploying, verify all env vars are set
docker compose -f docker-compose.prod.yml config | grep -i "api_url\|mongo_password"
```

### Validate Nginx Config
```bash
# Check for syntax errors
sudo nginx -t

# Test SSL
curl -I https://yourdomain.com
```

### Verify Database Security
```bash
# Confirm MongoDB is NOT accessible externally
docker ps | grep mongodb
# Should show NO ports mapping like "27017:27017"

# Test from container only
docker compose exec backend mongosh -u admin -p
```

## 🔐 **ONGOING SECURITY**

- Update Docker images regularly: `docker compose pull`
- Monitor logs for suspicious activity
- Rotate JWT secrets quarterly
- Keep SSL certificates renewed (Certbot auto-renewal)
- Review database backups
- Run security scans: `docker scan <image-name>`

## ⚡ **EMERGENCY RESET**

If credentials are compromised:
```bash
# 1. Stop everything
docker compose -f docker-compose.prod.yml down

# 2. Update .env.prod with new secrets
nano .env.prod

# 3. Rebuild and restart
docker compose -f docker-compose.prod.yml build --pull
docker compose -f docker-compose.prod.yml up -d

# 4. Rotate database user in external MySQL
# 5. Regenerate JWT secrets in app
```
