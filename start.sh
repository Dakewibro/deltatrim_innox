#!/bin/bash

# Start script for DELTATRIM application
# This script starts both the backend server and frontend dev server

echo "Starting DELTATRIM application..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

# Start backend server in background
echo "Starting backend server on port 3001..."
npm run server &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend dev server
echo "Starting frontend dev server on port 3000..."
echo ""
echo "Application will be available at: http://localhost:3000"
echo "API server running at: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

npm run dev

# Cleanup: kill backend when frontend stops
kill $BACKEND_PID 2>/dev/null