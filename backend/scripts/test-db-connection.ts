/**
 * Test MongoDB connection using DATABASE_URL from .env
 * Run on EC2: cd ~/grandhr/backend && npx tsx scripts/test-db-connection.ts
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const url = process.env.DATABASE_URL || '';
const hasDb = /\.mongodb\.net\/[^/?]/.test(url) || /mongodb:\/\/[^/]+\/[^/?]/.test(url);

console.log('\n📋 DATABASE_URL check:');
console.log('   Set:', !!url);
console.log('   Has database name in path:', hasDb);
if (url) {
  const masked = url.replace(/:([^:@]+)@/, ':****@');
  console.log('   URL (masked):', masked);
}

console.log('\n🔌 Connecting to MongoDB...\n');
const prisma = new PrismaClient();

prisma
  .$connect()
  .then(async () => {
    const count = await prisma.user.count();
    console.log('✅ MongoDB OK. Connected. User count:', count);
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch((e: Error) => {
    console.error('❌ MongoDB connection failed:\n', e.message);
    if (e.message.includes('SCRAM') || e.message.includes('auth')) {
      console.log('\n📌 Fix:');
      console.log('   1. MongoDB Atlas → Database Access → edit your user → set a NEW password (letters+numbers only).');
      console.log('   2. Atlas → Connect → Drivers → copy connection string.');
      console.log('   3. Replace <password> with the new password.');
      console.log('   4. Ensure path has database name: ...net/grandhr?retryWrites=...');
      console.log('   5. nano ~/grandhr/backend/.env → set DATABASE_URL to that string.');
      console.log('   6. pm2 restart grandhr-backend');
    }
    process.exit(1);
  });
