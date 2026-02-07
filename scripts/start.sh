#!/bin/bash

# Configuration
NGINX_CONF="/home/runner/workspace/logs/nginx/nginx.conf"
RPC_URL="https://rpc.meechain.run.place"

echo "🛡️ Starting Nginx Start Ritual..."

# 1. Test Nginx Configuration
echo "🔍 Testing Nginx configuration..."
nginx -t -c "$NGINX_CONF" -g "pid /home/runner/workspace/logs/nginx/nginx.pid;"

if [ $? -eq 0 ]; then
    echo "✅ Configuration syntax is OK."
else
    echo "❌ Configuration test failed. Please check $NGINX_CONF"
    exit 1
fi

# 2. Start or Reload Nginx
if pgrep -x "nginx" > /dev/null; then
    echo "🔄 Nginx is already running, reloading..."
    nginx -s reload -c "$NGINX_CONF" -g "pid /home/runner/workspace/logs/nginx/nginx.pid;"
else
    echo "🚀 Starting Nginx..."
    nginx -c "$NGINX_CONF" -g "pid /home/runner/workspace/logs/nginx/nginx.pid;"
fi

# 3. Check Process
echo "🕵️ Verifying Nginx process..."
ps aux | grep nginx | grep -v grep

# 4. Health Check
echo "🏥 Performing RPC Health Check..."
sleep 2
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$RPC_URL")

if [ "$RESPONSE" == "200" ] || [ "$RESPONSE" == "405" ]; then
    echo "🎉 RPC is LIVE and Healthy ($RESPONSE)"
else
    echo "⚠️ RPC Health Check returned $RESPONSE. Please check logs at /home/runner/workspace/logs/nginx/error.log"
fi

echo "✨ Start Ritual Complete!"
