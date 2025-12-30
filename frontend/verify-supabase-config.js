/**
 * Supabase Configuration Verification Script
 * Run this to check if your Supabase environment variables are set correctly
 * 
 * Usage: node verify-supabase-config.js
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from frontend directory
config({ path: join(__dirname, '.env') });

console.log('\n🔍 Checking Supabase Configuration...\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Check environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const apiUrl = process.env.VITE_API_URL;

let hasErrors = false;

// Check VITE_SUPABASE_URL
console.log('1. VITE_SUPABASE_URL:');
if (!supabaseUrl) {
  console.log('   ❌ NOT SET');
  console.log('   ⚠️  Please set VITE_SUPABASE_URL in your .env file');
  hasErrors = true;
} else {
  if (supabaseUrl.includes('placeholder') || supabaseUrl.includes('xxxxx')) {
    console.log('   ⚠️  PLACEHOLDER VALUE DETECTED');
    console.log('   ⚠️  Please replace with your actual Supabase URL');
    hasErrors = true;
  } else if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    console.log('   ⚠️  INVALID FORMAT');
    console.log('   ⚠️  Should start with https:// and contain .supabase.co');
    hasErrors = true;
  } else {
    console.log('   ✅ SET');
    console.log(`   📋 Value: ${supabaseUrl.substring(0, 30)}...`);
  }
}

console.log('');

// Check VITE_SUPABASE_ANON_KEY
console.log('2. VITE_SUPABASE_ANON_KEY:');
if (!supabaseAnonKey) {
  console.log('   ❌ NOT SET');
  console.log('   ⚠️  Please set VITE_SUPABASE_ANON_KEY in your .env file');
  hasErrors = true;
} else {
  if (supabaseAnonKey.includes('placeholder') || supabaseAnonKey.includes('your-anon-key')) {
    console.log('   ⚠️  PLACEHOLDER VALUE DETECTED');
    console.log('   ⚠️  Please replace with your actual Supabase Anon Key');
    hasErrors = true;
  } else if (supabaseAnonKey.length < 100) {
    console.log('   ⚠️  KEY TOO SHORT');
    console.log('   ⚠️  Anon keys are typically 200+ characters long');
    hasErrors = true;
  } else {
    console.log('   ✅ SET');
    console.log(`   📋 Key length: ${supabaseAnonKey.length} characters`);
    console.log(`   📋 Key preview: ${supabaseAnonKey.substring(0, 20)}...`);
  }
}

console.log('');

// Check VITE_API_URL
console.log('3. VITE_API_URL:');
if (!apiUrl) {
  console.log('   ⚠️  NOT SET (Optional)');
  console.log('   ℹ️  Defaults to http://localhost:5000/api');
} else {
  console.log('   ✅ SET');
  console.log(`   📋 Value: ${apiUrl}`);
}

console.log('');

// Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (hasErrors) {
  console.log('❌ CONFIGURATION ISSUES FOUND\n');
  console.log('📝 To fix:');
  console.log('   1. Open frontend/.env file');
  console.log('   2. Set the following variables:');
  console.log('      VITE_SUPABASE_URL=https://your-project.supabase.co');
  console.log('      VITE_SUPABASE_ANON_KEY=your-anon-key-here');
  console.log('   3. Get your credentials from:');
  console.log('      https://app.supabase.com → Your Project → Settings → API');
  console.log('   4. Restart your dev server after changes\n');
  process.exit(1);
} else {
  console.log('✅ CONFIGURATION LOOKS GOOD!\n');
  console.log('📝 Next steps:');
  console.log('   1. Restart your dev server if you just changed .env');
  console.log('   2. Test the connection by logging in/registering');
  console.log('   3. Check browser console for any Supabase errors\n');
  process.exit(0);
}

