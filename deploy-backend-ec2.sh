#!/bin/bash
# Run from repo root (e.g. ~/grandhr). Updates repo and deploys backend only.

set -e
cd "$(dirname "$0")"

echo "📥 Pulling latest code..."
git pull origin main || true

echo "📦 Building backend..."
cd backend
npm ci --omit=optional
npm run build

echo "🔄 Restarting backend..."
pm2 restart grandhr-backend || {
  echo "⚠️  PM2 process not found. Starting..."
  pm2 start dist/index.js --name grandhr-backend
  pm2 save
}

echo "✅ Done. Status:"
pm2 status
