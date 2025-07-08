#!/bin/bash

# Database Migration Script
# Bu script Prisma veritabanı migration işlemlerini yönetir

set -e

cd dashboard

echo "🗃️ Running Prisma migrations..."

case $1 in
    "generate")
        echo "📋 Generating Prisma client..."
        npx prisma generate
        ;;
    "deploy")
        echo "🚀 Deploying migrations..."
        npx prisma db push
        ;;
    "reset")
        echo "⚠️  Resetting database..."
        npx prisma db push --force-reset
        ;;
    "seed")
        echo "🌱 Seeding database..."
        npx prisma db seed
        ;;
    *)
        echo "Usage: $0 {generate|deploy|reset|seed}"
        echo ""
        echo "Commands:"
        echo "  generate  - Generate Prisma client"
        echo "  deploy    - Deploy migrations to database"
        echo "  reset     - Reset database (WARNING: destroys data)"
        echo "  seed      - Seed database with initial data"
        exit 1
        ;;
esac

echo "✅ Migration operation completed!" 