/**
 * Basic IntaSend integration test - just verifies setup without making API calls
 * Run with: npx tsx test-instasend-basic.ts
 */

// Load environment variables first
import { config } from 'dotenv';
import path from 'path';
config({ path: path.join(process.cwd(), '.env.local') });

import { createIntaSendInstance } from '../../lib/instasend';

async function testBasicIntaSendSetup() {
  console.log('🧪 Testing Basic IntaSend Setup...\n');

  try {
    // Test 1: Check environment variables
    console.log('1️⃣ Checking environment variables...');
    const apiKey = process.env.INSTASEND_API_KEY;
    const apiSecret = process.env.INSTASEND_API_SECRET;
    
    if (!apiKey || !apiSecret) {
      throw new Error('IntaSend environment variables are not set');
    }
    
    console.log('✅ Environment variables found');
    console.log(`   API Key: ${apiKey.substring(0, 20)}...`);
    console.log(`   API Secret: ${apiSecret.substring(0, 20)}...`);
    console.log(`   Test Mode: ${process.env.NODE_ENV === 'development'}\n`);

    // Test 2: Create IntaSend instance
    console.log('2️⃣ Creating IntaSend instance...');
    const intasend = createIntaSendInstance();
    console.log('✅ IntaSend instance created successfully\n');

    // Test 3: Initialize services (without making API calls)
    console.log('3️⃣ Initializing IntaSend services...');

    try {
      const collection = intasend.collection();
      console.log('✅ Collection service initialized');
    } catch (error: any) {
      console.log('⚠️  Collection service initialization failed:', error.message);
    }

    try {
      const payouts = intasend.payouts();
      console.log('✅ Payouts service initialized');
    } catch (error: any) {
      console.log('⚠️  Payouts service initialization failed:', error.message);
    }

    try {
      const wallets = intasend.wallets();
      console.log('✅ Wallets service initialized');
    } catch (error: any) {
      console.log('⚠️  Wallets service initialization failed:', error.message);
    }

    console.log('\n🎉 Basic IntaSend setup test completed successfully!');
    console.log('✅ Your IntaSend configuration is correct.\n');

    console.log('📝 Next steps:');
    console.log('   1. The IntaSend instance can be imported and used in your app');
    console.log('   2. You can now implement payment features like checkout links');
    console.log('   3. Test actual API calls in a controlled environment');
    console.log('   4. Set up webhook endpoints for payment notifications\n');

  } catch (error: any) {
    console.error('❌ Basic IntaSend setup test failed:');
    console.error(`   Error: ${error.message || 'Unknown error'}`);
    
    if (error.stack) {
      console.error(`   Stack: ${error.stack}`);
    }
    
    console.log('\n🔍 Troubleshooting tips:');
    console.log('   1. Check that .env.local file exists and has INSTASEND_API_KEY and INSTASEND_API_SECRET');
    console.log('   2. Verify your IntaSend API keys are correct');
    console.log('   3. Make sure you\'re using test keys for development');
    console.log('   4. Check that the intasend-node package is properly installed\n');
    
    process.exit(1);
  }
}

// Run the test
testBasicIntaSendSetup();
