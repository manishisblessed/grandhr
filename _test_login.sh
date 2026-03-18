#!/bin/bash
echo "=== Testing backend health ==="
curl -s http://localhost:5000/api/health

echo ""
echo "=== Testing login API ==="
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"support@grandhr.in","password":"Develop@2212"}'

echo ""
echo "=== Clearing old PM2 error logs ==="
pm2 flush grandhr-backend

echo ""
echo "=== Done ==="
