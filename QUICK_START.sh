#!/bin/bash

# ============================================
# TOYOLAND LOCAL DOCKER QUICK START
# ============================================
# Kids Educational & Wooden Toys Platform
# MongoDB + Next.js 15 Frontend Setup

echo ""
echo "╔════════════════════════════════════════╗"
echo "║  TOYOLAND LOCAL DOCKER SETUP           ║"
echo "║  Kids Educational & Wooden Toys       ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not installed. Visit: https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo "✓ Docker found: $(docker --version)"
echo ""

# Load env
echo "📋 Loading environment variables..."
export $(cat .env 2>/dev/null | grep -v '^#' | xargs) || echo "⚠️  No .env found, using defaults"
echo ""

# Start services
echo "🚀 Starting Toyoland services..."
docker-compose -f docker-compose.toyoland.yml up -d --build 2>/dev/null

# Wait for services
echo "⏳ Waiting for services to be ready..."
sleep 3

# Check status
echo ""
echo "📊 Service Status:"
docker-compose -f docker-compose.toyoland.yml ps
echo ""

# MongoDB check
echo "🗄️  Verifying MongoDB..."
if docker exec toyoland-mongodb-dev mongosh \
  --username admin \
  --password 11223345 \
  --authenticationDatabase admin \
  --eval "db.runCommand('ping')" > /dev/null 2>&1; then
    echo "✓ MongoDB is healthy"
    echo "  Host: localhost:27017"
    echo "  Database: toyoland-store"
    echo "  Username: admin"
    echo "  Password: 11223345"
else
    echo "❌ MongoDB connection failed"
    echo "   Check logs: docker-compose -f docker-compose.toyoland.yml logs mongodb"
fi

echo ""
echo "✅ TOYOLAND SETUP COMPLETE!"
echo ""
echo "═══════════════════════════════════════════"
echo "ACCESS YOUR SERVICES:"
echo "═══════════════════════════════════════════"
echo ""
echo "🌐 Frontend:    http://localhost:8006"
echo "🗄️  MongoDB:     localhost:27017"
echo "   Shell:      docker exec -it toyoland-mongodb-dev mongosh -u admin -p 11223345 --authenticationDatabase admin"
echo ""
echo "═══════════════════════════════════════════"
echo "USEFUL COMMANDS:"
echo "═══════════════════════════════════════════"
echo ""
echo "View logs:        docker-compose -f docker-compose.toyoland.yml logs -f"
echo "Stop services:    docker-compose -f docker-compose.toyoland.yml down"
echo "Rebuild:          docker-compose -f docker-compose.toyoland.yml up -d --build"
echo "Clean all:        docker-compose -f docker-compose.toyoland.yml down -v"
echo ""
echo "Or use Makefile:  make toyoland-help"
echo ""
