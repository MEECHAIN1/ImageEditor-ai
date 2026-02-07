#!/bin/bash

# Configuration
NGINX_CONF="/home/runner/workspace/logs/nginx/nginx.conf"
RPC_URL="https://rpc.meechain.run.place"
CERT_PATH="/home/runner/workspace/certbot/config/live/rpc.meechain.run.place/fullchain.pem"

echo "🚀 Starting MeeChain RPC Deployment Ritual..."

# 1. Create necessary directories
echo "📁 Ensuring directory structure..."
mkdir -p /home/runner/workspace/logs/nginx

# 2. SSL Check
if [ -f "$CERT_PATH" ]; then
    echo "✅ SSL Certificate found."
else
    echo "❌ SSL Certificate NOT found at $CERT_PATH"
    echo "Please run certbot ritual first."
fi

# 3. Nginx Deployment
echo "🌐 Deploying Nginx..."
if pgrep -x "nginx" > /dev/null; then
    echo "🔄 Nginx is running, reloading config..."
    nginx -s reload -c "$NGINX_CONF"
else
    echo "🚀 Starting Nginx..."
    nginx -c "$NGINX_CONF"
fi

# 4. Health Check
echo "🏥 Performing RPC Health Check..."
sleep 2
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$RPC_URL")

if [ "$RESPONSE" == "200" ] || [ "$RESPONSE" == "405" ]; then
    echo "🎉 RPC is LIVE and Healthy ($RESPONSE)"
else
    echo "⚠️ RPC Health Check returned $RESPONSE. Please check logs."
fi

# 5. Cert Renewal Reminder
EXPIRY_DATE=$(openssl x509 -enddate -noout -in "$CERT_PATH" | cut -d= -f2)
echo "📅 SSL Certificate expires on: $EXPIRY_DATE"
echo "💡 Reminder: Renew manually before expiry to keep the ritual alive."

echo "✨ Ritual Complete! MeeChain RPC is ready to serve."
