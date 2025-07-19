/**
 * Test script for IntaSend webhook endpoint
 * Run with: npx tsx test-intasend-webhook.ts
 */

// Load environment variables first
import { config } from 'dotenv';
import path from 'path';
config({ path: path.join(process.cwd(), '.env.local') });

async function testIntaSendWebhook() {
  console.log('🧪 Testing IntaSend Webhook Endpoint...\n');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const webhookUrl = `${baseUrl}/api/intasend/webhook`;

  // Test payload examples
  const testPayloads = [
    {
      name: "Successful Payment",
      payload: {
        invoice_id: "TEST123",
        state: "COMPLETE",
        provider: "M-PESA",
        charges: "0.00",
        net_amount: "1300.00",
        currency: "KES",
        value: "1300.00",
        account: "test@example.com",
        api_ref: "course-test-course-id-test-user-id-1234567890",
        host: "https://sandbox.intasend.com",
        failed_reason: null,
        failed_code: null,
        failed_code_link: "https://intasend.com/troubleshooting",
        created_at: "2024-01-01T12:00:00.000000+03:00",
        updated_at: "2024-01-01T12:01:00.000000+03:00",
        challenge: "testnet"
      }
    },
    {
      name: "Failed Payment",
      payload: {
        invoice_id: "TEST456",
        state: "FAILED",
        provider: "M-PESA",
        charges: "0.00",
        net_amount: "1300.00",
        currency: "KES",
        value: "1300.00",
        account: "test@example.com",
        api_ref: "course-test-course-id-test-user-id-1234567891",
        host: "https://sandbox.intasend.com",
        failed_reason: "Insufficient funds",
        failed_code: "INSUFFICIENT_FUNDS",
        failed_code_link: "https://intasend.com/troubleshooting",
        created_at: "2024-01-01T12:00:00.000000+03:00",
        updated_at: "2024-01-01T12:01:00.000000+03:00",
        challenge: "testnet"
      }
    },
    {
      name: "Processing Payment",
      payload: {
        invoice_id: "TEST789",
        state: "PROCESSING",
        provider: "M-PESA",
        charges: "0.00",
        net_amount: "1300.00",
        currency: "KES",
        value: "1300.00",
        account: "test@example.com",
        api_ref: "course-test-course-id-test-user-id-1234567892",
        host: "https://sandbox.intasend.com",
        failed_reason: null,
        failed_code: null,
        failed_code_link: "https://intasend.com/troubleshooting",
        created_at: "2024-01-01T12:00:00.000000+03:00",
        updated_at: "2024-01-01T12:01:00.000000+03:00",
        challenge: "testnet"
      }
    },
    {
      name: "Invalid Challenge",
      payload: {
        invoice_id: "TEST999",
        state: "COMPLETE",
        provider: "M-PESA",
        charges: "0.00",
        net_amount: "1300.00",
        currency: "KES",
        value: "1300.00",
        account: "test@example.com",
        api_ref: "course-test-course-id-test-user-id-1234567893",
        host: "https://sandbox.intasend.com",
        failed_reason: null,
        failed_code: null,
        failed_code_link: "https://intasend.com/troubleshooting",
        created_at: "2024-01-01T12:00:00.000000+03:00",
        updated_at: "2024-01-01T12:01:00.000000+03:00",
        challenge: "invalid_challenge"
      }
    }
  ];

  console.log(`🎯 Testing webhook endpoint: ${webhookUrl}\n`);

  for (const test of testPayloads) {
    console.log(`📋 Testing: ${test.name}`);
    console.log(`   Invoice ID: ${test.payload.invoice_id}`);
    console.log(`   State: ${test.payload.state}`);
    console.log(`   API Ref: ${test.payload.api_ref}`);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test.payload)
      });

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      if (response.ok) {
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   📄 Response:`, responseData);
      } else {
        console.log(`   ⚠️  Status: ${response.status}`);
        console.log(`   📄 Response:`, responseData);
      }

    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    console.log(''); // Empty line for spacing
  }

  console.log('🎉 IntaSend webhook testing completed!\n');
  
  console.log('📝 Next steps:');
  console.log('   1. Start your Next.js development server: npm run dev');
  console.log('   2. Use ngrok to expose your local server: ngrok http 3000');
  console.log('   3. Configure the webhook URL in IntaSend dashboard');
  console.log('   4. Set the challenge to "testnet" in IntaSend dashboard');
  console.log('   5. Test with real payments in sandbox mode\n');
}

// Run the test
testIntaSendWebhook();
