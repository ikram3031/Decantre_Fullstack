#!/bin/bash

# Decantre Development Environment Deployment
# Run this on your dev/staging server

set -e

echo "🚀 Starting Decantre Development Deployment..."

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root${NC}"
   exit 1
fi

PROJECT_DIR="/opt/decantre-dev"

echo -e "${YELLOW}Step 1: Updating system packages...${NC}"
apt update && apt upgrade -y
apt install -y curl git wget

echo -e "${YELLOW}Step 2: Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    usermod -aG docker root
fi

echo -e "${YELLOW}Step 3: Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

echo -e "${YELLOW}Step 4: Creating project directory...${NC}"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

echo -e "${YELLOW}Step 5: Cloning/Updating repository...${NC}"
if [ -d ".git" ]; then
    git pull origin main
else
    echo -e "${RED}ERROR: Repository not cloned!${NC}"
    echo "Clone your repo first: git clone <repo-url> $PROJECT_DIR"
    exit 1
fi

echo -e "${YELLOW}Step 6: Setting up environment...${NC}"
if [ ! -f ".env.dev-prod" ]; then
    echo -e "${RED}ERROR: .env.dev-prod not found!${NC}"
    echo "Create .env.dev-prod with your development credentials"
    exit 1
fi

cp .env.dev-prod .env

echo -e "${YELLOW}Step 7: Building/Pulling images...${NC}"
docker compose -f docker-compose.dev.yml pull || docker compose -f docker-compose.dev.yml build --pull

echo -e "${YELLOW}Step 8: Starting services...${NC}"
docker compose -f docker-compose.dev.yml up -d

echo -e "${YELLOW}Step 9: Verifying services...${NC}"
sleep 5
docker compose -f docker-compose.dev.yml ps

echo -e "${GREEN}✓ Development services deployed!${NC}"
echo ""
echo "Services running:"
echo "  Frontend:  http://your-dev-server-ip:3000"
echo "  Backend:   http://your-dev-server-ip:4000"
echo "  Dashboard: http://your-dev-server-ip:5000"
echo "  MongoDB:   mongodb://admin@your-dev-server-ip:27017"
echo ""
echo "Check logs: docker compose -f docker-compose.dev.yml logs -f"
echo "Update: cd $PROJECT_DIR && git pull && docker compose -f docker-compose.dev.yml up -d"
