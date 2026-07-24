#!/bin/bash

# Decantre Development Start Script
set -e

echo "🚀 Starting Decantre in DEVELOPMENT mode..."

# Load dev environment
export $(cat .env.dev | grep -v '#' | xargs)

# Check if containers are running
if docker ps --format '{{.Names}}' | grep -q decantre_; then
    echo "⚠️  Existing containers found. Stopping..."
    docker compose down
fi

echo "📦 Building images..."
docker compose build

echo "🏃 Starting services..."
docker compose up -d

echo ""
echo "✓ Development environment started!"
echo ""
echo "Services:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:4000"
echo "  MongoDB:  mongodb://admin:11223345@localhost:27017/perfume-store"
echo ""
echo "View logs: docker compose logs -f"
echo "Stop services: docker compose down"
