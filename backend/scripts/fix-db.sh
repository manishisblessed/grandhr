#!/bin/bash
# Run on EC2: bash ~/fix-db.sh
# Tests MongoDB connection and shows what needs fixing

cd ~/grandhr/backend

echo ""
echo "=== Current DATABASE_URL ==="
grep DATABASE_URL .env | sed 's/:.*@/:****@/'

echo ""
echo "=== Testing MongoDB connection with Node ==="
node -e "
require('dotenv').config();
var url = process.env.DATABASE_URL;
if (!url) { console.log('ERROR: DATABASE_URL not set'); process.exit(1); }

// Check for database name in path
var match = url.match(/mongodb\+srv:\/\/[^@]+@[^/]+\/([^?]+)/);
var dbName = match ? match[1] : '';
if (!dbName) {
  console.log('ERROR: No database name in URL. Should be: ...net/grandhr?...');
  process.exit(1);
}
console.log('DB name in URL: ' + dbName);

var mongoose = require('mongoose') 2>/dev/null
" 2>/dev/null

# Try direct connection with Prisma
echo ""
echo "=== Prisma connection test ==="
node -e "
var dotenv = require('dotenv');
dotenv.config();
var PrismaModule = require('@prisma/client');
var prisma = new PrismaModule.PrismaClient();
prisma.\$connect()
  .then(function() {
    console.log('SUCCESS: MongoDB connected!');
    return prisma.user.count();
  })
  .then(function(count) {
    console.log('User count: ' + count);
    process.exit(0);
  })
  .catch(function(err) {
    console.log('FAILED: ' + err.message.split('\n')[0]);
    if (err.message.indexOf('SCRAM') !== -1 || err.message.indexOf('authentication') !== -1) {
      echo ''
      echo 'FIX NEEDED: Wrong username or password in DATABASE_URL'
      echo 'Go to MongoDB Atlas > Database Access > edit user > set new password'
      echo 'Then update DATABASE_URL in ~/grandhr/backend/.env'
    }
    process.exit(1);
  });
"
