#!/bin/bash

# Development Start Script - Unified Container with Hot Reload
# Bu script development modunda hot reload desteği ile unified container'ı başlatır

set -e

echo "🔧 Starting Proxy Manager in Development Mode with Hot Reload..."

# Use docker compose if available, fallback to docker-compose
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

# Clean up previous containers and volumes if needed
echo "🧹 Cleaning up previous containers..."
$COMPOSE_CMD down -v

# Start unified container with hot reload
echo "🚀 Starting unified container with hot reload support..."
$COMPOSE_CMD up --build

echo "✅ Development environment started with hot reload!"
echo ""
echo "🔥 HOT RELOAD ENABLED:"
echo "   - Next.js source files are now mounted as volumes"
echo "   - Changes to /dashboard/src will be automatically reloaded"
echo "   - Turbopack is enabled for faster rebuilds"
echo ""
echo "🌐 Dashboard: http://localhost/"
echo "📡 Caddy Admin API: http://localhost:2019 (internal only)"
echo ""
echo "📝 Development Notes:"
echo "   - Edit files in ./dashboard/src/ to see changes instantly"
echo "   - Package.json changes require container restart"
echo "   - Database schema changes: run 'npx prisma db push' inside container"
echo ""
echo "To stop: $COMPOSE_CMD down"
echo "To restart: $COMPOSE_CMD restart proxy-manager"
echo "To rebuild: $COMPOSE_CMD up --build" 