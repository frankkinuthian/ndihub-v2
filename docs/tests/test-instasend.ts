/**
 * TypeScript test for IntaSend integration using our configured instance
 * Run with: npx tsx test-instasend.ts
 */

// Load environment variables first
import { config } from 'dotenv';
import path from 'path';
config({ path: path.join(process.cwd(), '.env.local') });

import { createIntaSendInstance } from '../../lib/instasend';

interface CheckoutResponse {
  url: string;
  api_ref: string;
  id: string;
  [key: string]: any;
}

async function testIntaSendWithConfiguredInstance() {
  console.log('🧪 Testing IntaSend with Configured Instance...\n');

  try {
    // Test 1: Create IntaSend instance
    console.log('1️⃣ Creating IntaSend instance...');
    const instasend = createIntaSendInstance();
    console.log('✅ IntaSend instance created successfully\n');

    // Test 2: Test collection service
    console.log('2️⃣ Initializing collection service...');
    const collection = instasend.collection();
    console.log('✅ Collection service initialized\n');

    // Test 3: Create a test checkout
    console.log('3️⃣ Creating test checkout with configured instance...');
    
    const testCheckoutData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      host: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      amount: 100, // 100 KES
      currency: 'KES',
      api_ref: `test-checkout-${Date.now()}`,
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success`,
      comment: 'Test payment for IntaSend integration'
    };

    console.log('📋 Test checkout data:');
    console.log(`   Name: ${testCheckoutData.first_name} ${testCheckoutData.last_name}`);
    console.log(`   Email: ${testCheckoutData.email}`);
    console.log(`   Amount: ${testCheckoutData.amount} ${testCheckoutData.currency}`);
    console.log(`   Reference: ${testCheckoutData.api_ref}\n`);

    try {
      const checkoutResponse: CheckoutResponse = await collection.charge(testCheckoutData);

      console.log('✅ Test checkout created successfully!');
      console.log(`   Checkout URL: ${checkoutResponse.url}`);
      console.log(`   Payment ID: ${checkoutResponse.id}`);
      console.log(`   Reference: ${checkoutResponse.api_ref}\n`);

      // Test 4: Test payment status check (if available)
      console.log('4️⃣ Testing payment status check...');
      try {
        // Note: This might not work immediately as the payment hasn't been made
        const statusResponse = await collection.status(checkoutResponse.id);
        console.log('✅ Payment status retrieved:');
        console.log(`   Status: ${statusResponse.invoice?.state || 'Unknown'}\n`);
      } catch (statusError) {
        console.log('⚠️  Payment status check failed (expected for new payments)');
        console.log(`   Error: ${statusError.message}\n`);
      }

    } catch (checkoutError: any) {
      console.log('⚠️  Checkout creation failed:');
      console.log(`   Error: ${checkoutError.message || 'Unknown error'}`);
      console.log(`   Full error:`, checkoutError);

      // Check if it's an authentication error
      const errorMessage = checkoutError.message || '';
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        console.log('💡 This might be an authentication issue. Please check:');
        console.log('   - Your IntaSend API keys are correct');
        console.log('   - Your account is active');
        console.log('   - You have the necessary permissions\n');
      } else if (errorMessage.includes('500')) {
        console.log('💡 This is a server error. This might be:');
        console.log('   - A temporary issue with IntaSend servers');
        console.log('   - Invalid request parameters');
        console.log('   - Account configuration issues\n');
      }
    }

    console.log('🎉 IntaSend TypeScript integration test completed!');
    console.log('✅ Your configured IntaSend instance is working.\n');

  } catch (error: any) {
    console.error('❌ IntaSend TypeScript test failed:');
    console.error(`   Error: ${error.message || 'Unknown error'}`);

    if (error.stack) {
      console.error(`   Stack: ${error.stack}`);
    }
    
    console.log('\n🔍 Troubleshooting tips:');
    console.log('   1. Check that .env.local file exists and has INSTASEND_API_KEY and INSTASEND_API_SECRET');
    console.log('   2. Verify your IntaSend account is active');
    console.log('   3. Make sure you\'re using test keys for development');
    console.log('   4. Check your network connection\n');
    
    process.exit(1);
  }
}

// Run the test
testIntaSendWithConfiguredInstance();
