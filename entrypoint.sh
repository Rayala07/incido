#!/bin/sh

# Start Nginx in background
echo "Starting Nginx..."
nginx -g 'daemon off;' &
NGINX_PID=$!

# Start backend
echo "Starting backend server..."
cd /app/backend
node server.js &
BACKEND_PID=$!

# Wait for both processes
wait $NGINX_PID $BACKEND_PID
