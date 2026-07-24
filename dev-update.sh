#!/bin/bash

# Quick Development Update Script
# Use on dev server to pull latest changes and restart

set -e

PROJECT_DIR="/opt/decantre-dev"
cd $PROJECT_DIR

echo "🔄 Updating Decantre Development..."

echo "📥 Pulling latest changes..."
git pull origin main

echo "📦 Building/Pulling images..."
docker compose -f docker-compose.dev.yml pull || docker compose -f docker-compose.dev.yml build --pull

echo "🔄 Restarting services..."
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up -d

echo "✓ Services updated and running!"
echo ""
docker compose -f docker-compose.dev.yml ps
echo ""
echo "Check logs: docker compose -f docker-compose.dev.yml logs -f"
