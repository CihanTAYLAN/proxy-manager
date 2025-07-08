#!/bin/bash

# Proxy Manager Setup Script
# Bu script projeyi kurmak ve çalıştırmak için gerekli adımları içerir

set -e

echo "🚀 Proxy Manager Setup Starting..."

# Check current directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Please run this script from the project root directory (where docker-compose.yml is located)"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose found"

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running. Please start Docker first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p caddy/data caddy/config caddy/logs

# Install dashboard dependencies
echo "📦 Installing dashboard dependencies..."
cd dashboard

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found in dashboard directory"
    exit 1
fi

npm install

echo "🔧 Setting up Prisma database..."
npx prisma generate
npx prisma db push

# Create seed data (optional)
if [ -f "prisma/seed.ts" ]; then
    echo "🌱 Seeding database..."
    npx prisma db seed
fi

cd ..

echo "🏗️ Building Docker containers..."
# Use docker compose if available, fallback to docker-compose
if docker compose version &> /dev/null; then
    docker compose build
else
    docker-compose build
fi

echo "🎉 Setup completed successfully!"
echo ""
echo "To start the application:"
echo "  docker compose up -d   (or docker-compose up -d)"
echo ""
echo "To view logs:"
echo "  docker compose logs -f   (or docker-compose logs -f)"
echo ""
echo "To stop the application:"
echo "  docker compose down   (or docker-compose down)"
echo ""
echo "🌐 After starting, access the dashboard at:"
echo "   - http://localhost (port 80)"  
echo "   - http://localhost:3000"
echo "⚙️ Caddy Admin API: http://localhost:2019 (internal only)" 