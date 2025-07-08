#!/bin/bash

# Development Start Script - Unified Container
# Bu script development modunda unified container'ı başlatır

set -e

echo "🔧 Starting Proxy Manager in Development Mode (Unified Container)..."

# Use docker compose if available, fallback to docker-compose
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

# Start unified container
echo "🚀 Starting unified container..."
$COMPOSE_CMD up --build

echo "✅ Development environment started!"
echo ""
echo "🌐 Dashboard: http://localhost:80 and http://localhost:3000"
echo "📡 Caddy Admin API: http://localhost:2019 (internal only)"
echo ""
echo "To stop: $COMPOSE_CMD down" 