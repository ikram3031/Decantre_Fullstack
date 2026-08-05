#!/bin/bash

# Toyoland Local Docker Setup Script
# This script sets up the complete Toyoland development environment

set -e

echo "=========================================="
echo "Toyoland Local Docker Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker not found. Please install Docker Desktop${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose not found. Please install Docker Compose${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose installed${NC}"
echo ""

# Load environment variables
if [ -f .env.toyoland.local ]; then
    export $(cat .env.toyoland.local | grep -v '^#' | xargs)
    echo -e "${GREEN}✓ Environment loaded from .env.toyoland.local${NC}"
else
    echo -e "${YELLOW}⚠ .env.toyoland.local not found, using defaults${NC}"
fi

echo ""
echo "Configuration:"
echo "  Database: toyoland-store"
echo "  MongoDB Port: 27017"
echo "  Frontend Port: 8006"
echo "  Backend Port: 5093 (if applicable)"
echo ""

# Stop existing containers
echo "Stopping existing Toyoland containers..."
docker-compose -f docker-compose.toyoland.yml down --remove-orphans 2>/dev/null || true
echo ""

# Build images
echo "Building Docker images..."
docker-compose -f docker-compose.toyoland.yml build --no-cache

echo ""
echo "Starting services..."
docker-compose -f docker-compose.toyoland.yml up -d

echo ""
echo "Waiting for MongoDB to be healthy..."
sleep 5

# Check MongoDB health
echo "Verifying MongoDB connection..."
if docker exec toyoland-mongodb-dev mongosh \
  --username admin \
  --password 11223345 \
  --authenticationDatabase admin \
  --eval "db.runCommand('ping')" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ MongoDB is healthy${NC}"
else
    echo -e "${RED}✗ MongoDB failed to start${NC}"
    docker-compose -f docker-compose.toyoland.yml logs mongodb
    exit 1
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Toyoland Docker setup complete!${NC}"
echo "=========================================="
echo ""
echo "Services running:"
echo ""
docker-compose -f docker-compose.toyoland.yml ps
echo ""

echo "Access:"
echo "  MongoDB:"
echo "    Host: localhost:27017"
echo "    Username: admin"
echo "    Password: 11223345"
echo "    Database: toyoland-store"
echo ""
echo "  Toyoland Frontend:"
echo "    URL: http://localhost:8006"
echo ""

echo "Common commands:"
echo "  View logs:        docker-compose -f docker-compose.toyoland.yml logs -f"
echo "  MongoDB shell:    docker exec -it toyoland-mongodb-dev mongosh -u admin -p 11223345 --authenticationDatabase admin"
echo "  Stop services:    docker-compose -f docker-compose.toyoland.yml down"
echo "  Rebuild:          docker-compose -f docker-compose.toyoland.yml up -d --build"
echo ""
