require('dotenv').config();
var PrismaClient = require('@prisma/client').PrismaClient;
var prisma = new PrismaClient();
prisma.$connect()
  .then(function() {
    console.log('CONNECTED OK');
    return prisma.user.count();
  })
  .then(function(c) {
    console.log('Users in DB: ' + c);
    process.exit(0);
  })
  .catch(function(e) {
    var msg = e.message || '';
    console.log('FAILED: ' + msg.slice(0, 300));
    process.exit(1);
  });
