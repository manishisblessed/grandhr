#!/bin/bash

# GrandHR Backend EC2 Deployment Script
# This script updates and restarts the backend on EC2

set -e  # Exit on error

echo "🚀 Starting GrandHR Backend Deployment..."

# Navigate to backend directory
cd "$(dirname "$0")"

# Pull latest code
echo "📥 Pulling latest code from GitHub..."
git pull origin main || {
    echo "⚠️  Warning: Could not pull from GitHub. Continuing with existing code..."
}

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run prisma:generate

# Build the application
echo "🏗️  Building application..."
npm run build

# Restart PM2 process
echo "🔄 Restarting backend..."
pm2 restart grandhr-backend || {
    echo "⚠️  PM2 process not found. Starting new process..."
    pm2 start dist/index.js --name grandhr-backend
    pm2 save
}

# Show status
echo "✅ Deployment complete!"
echo ""
echo "📊 Current status:"
pm2 status

echo ""
echo "📝 View logs with: pm2 logs grandhr-backend"

