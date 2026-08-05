#!/bin/bash

# Toyoland MongoDB Setup Script
# This script initializes the MongoDB database with the Toyoland schema

set -e

DATABASE_NAME="toyoland-store"
AUTH_USERNAME="admin"
AUTH_PASSWORD="11223345"
AUTH_DB="admin"
MONGODB_PORT="27017"
MONGODB_HOST="localhost"

echo "=========================================="
echo "Toyoland MongoDB Initialization"
echo "=========================================="
echo ""
echo "Configuration:"
echo "  Database: $DATABASE_NAME"
echo "  Host: $MONGODB_HOST:$MONGODB_PORT"
echo "  Auth Username: $AUTH_USERNAME"
echo "  Auth Database: $AUTH_DB"
echo ""

# Check if mongosh is installed
if ! command -v mongosh &> /dev/null; then
    echo "ERROR: mongosh not found. Install MongoDB Shell (mongosh):"
    echo "  macOS: brew install mongosh"
    echo "  Linux: npm install -g @mongosh/cli"
    echo "  Or: Download from https://www.mongodb.com/try/download/shell"
    exit 1
fi

echo "Waiting for MongoDB to be ready..."
sleep 2

# Run initialization script
echo "Running initialization script..."
mongosh \
  --host "$MONGODB_HOST:$MONGODB_PORT" \
  --username "$AUTH_USERNAME" \
  --password "$AUTH_PASSWORD" \
  --authenticationDatabase "$AUTH_DB" \
  --file ./toyoland-mongodb-init.js

echo ""
echo "=========================================="
echo "✓ MongoDB initialization complete!"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "1. Copy toyoland-mongodb.env.example to .env in your backend"
echo "2. Update MONGO_URI with your actual connection details"
echo "3. Verify connection in Node.js:"
echo "   const mongoose = require('mongoose');"
echo "   mongoose.connect(process.env.MONGO_URI);"
echo ""
