#!/bin/sh
set -e

echo "🚀 Starting Unified Proxy Manager..."

# HOST environment variable kontrolü
if [ -z "$HOST" ]; then
    echo "⚠️  HOST environment variable not set, using localhost"
    export HOST="localhost"
fi

# PORT environment variable kontrolü
if [ -z "$PORT" ]; then
    echo "⚠️  PORT environment variable not set, using 3000"
    export PORT="3000"
fi

echo "🌐 Using HOST: $HOST"
echo "🔌 Using PORT: $PORT"

# Development vs Production Caddyfile seçimi
if [ "$NODE_ENV" = "production" ]; then
    echo "📝 Using production Caddyfile with HOST-based routing"
    CADDYFILE="/etc/caddy/Caddyfile"
else
    echo "📝 Using development Caddyfile"
    # Development için HOST değişkenini sed ile substitute et
    sed "s/\$HOST/$HOST/g" /etc/caddy/Caddyfile.dev > /tmp/Caddyfile.dev
    CADDYFILE="/tmp/Caddyfile.dev"
fi

# Start dashboard in background
echo "📊 Starting Dashboard on port $PORT..."
cd /app/dashboard && PORT=$PORT HOSTNAME=127.0.0.1 node server.js &
DASHBOARD_PID=$!

# Start Caddy in foreground
echo "🌐 Starting Caddy with config: $CADDYFILE"
exec caddy run --config "$CADDYFILE" 