#!/bin/bash

# Decantre VPS Deployment Script
# Run this on your VPS to set up Docker and deploy the application

set -e

echo "🚀 Starting Decantre Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root${NC}"
   exit 1
fi

echo -e "${YELLOW}Step 1: Updating system packages...${NC}"
apt update
apt upgrade -y
apt install -y curl git wget

echo -e "${YELLOW}Step 2: Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
else
    echo "Docker already installed"
fi

echo -e "${YELLOW}Step 3: Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

echo -e "${YELLOW}Step 4: Verifying installations...${NC}"
docker --version
docker-compose --version

echo -e "${YELLOW}Step 5: Installing Nginx & Certbot...${NC}"
apt install -y nginx certbot python3-certbot-nginx

echo -e "${YELLOW}Step 6: Creating project directory...${NC}"
mkdir -p /opt/decantre
cd /opt/decantre

if [ ! -d ".git" ]; then
    echo -e "${YELLOW}Cloning repository...${NC}"
    git clone . . 2>/dev/null || echo "Repository already exists"
else
    echo "Repository already cloned"
fi

echo -e "${GREEN}✓ Installation complete!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update environment files:"
echo "   nano /opt/decantre/backend/.env"
echo "   nano /opt/decantre/frontend/.env"
echo ""
echo "2. Configure Nginx with your domain"
echo "3. Run: docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "See DEPLOY.md for detailed instructions"
