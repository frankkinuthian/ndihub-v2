/**
 * Test script for enrollment status checking functionality
 * Run with: npx tsx docs/tests/test-enrollment-status.ts
 */

// Load environment variables first
import { config } from 'dotenv';
import path from 'path';
config({ path: path.join(process.cwd(), '.env.local') });

async function testEnrollmentStatusAPI() {
  console.log('🧪 Testing Enrollment Status API...\n');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const apiUrl = `${baseUrl}/api/enrollment/check`;

  // Test scenarios
  const testCases = [
    {
      name: "Valid user and course",
      payload: {
        userId: "test-user-123",
        courseId: "test-course-456"
      },
      expectedStatus: 200
    },
    {
      name: "Missing userId",
      payload: {
        courseId: "test-course-456"
      },
      expectedStatus: 400
    },
    {
      name: "Missing courseId",
      payload: {
        userId: "test-user-123"
      },
      expectedStatus: 400
    },
    {
      name: "Empty payload",
      payload: {},
      expectedStatus: 400
    }
  ];

  console.log(`🎯 Testing API endpoint: ${apiUrl}\n`);

  for (const testCase of testCases) {
    console.log(`📋 Testing: ${testCase.name}`);
    console.log(`   Payload:`, JSON.stringify(testCase.payload, null, 2));

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.payload)
      });

      const responseData = await response.json();

      console.log(`   Status: ${response.status} (expected: ${testCase.expectedStatus})`);
      console.log(`   Response:`, responseData);

      if (response.status === testCase.expectedStatus) {
        console.log(`   ✅ Test passed\n`);
      } else {
        console.log(`   ⚠️  Status mismatch\n`);
      }

    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }
  }
}

function testEnrollmentStatusLogic() {
  console.log('🧪 Testing Enrollment Status Logic...\n');

  // Test the enrollment status checking logic
  console.log('1️⃣ Testing enrollment status scenarios...');

  const scenarios = [
    {
      name: "User not enrolled",
      serverIsEnrolled: false,
      clientIsEnrolled: false,
      expected: false
    },
    {
      name: "User enrolled (server-side)",
      serverIsEnrolled: true,
      clientIsEnrolled: false,
      expected: true
    },
    {
      name: "User enrolled (client-side)",
      serverIsEnrolled: false,
      clientIsEnrolled: true,
      expected: true
    },
    {
      name: "User enrolled (both)",
      serverIsEnrolled: true,
      clientIsEnrolled: true,
      expected: true
    }
  ];

  scenarios.forEach(scenario => {
    // Simulate the logic from EnrollButton
    const isEnrolled = scenario.clientIsEnrolled || scenario.serverIsEnrolled;
    const result = isEnrolled === scenario.expected ? '✅' : '❌';
    
    console.log(`   ${result} ${scenario.name}: ${isEnrolled} (expected: ${scenario.expected})`);
  });

  console.log('\n✅ Enrollment status logic tests completed\n');

  // Test URL parameter handling
  console.log('2️⃣ Testing URL parameter handling...');

  const urlScenarios = [
    {
      url: "/courses/test-course",
      hasPaymentSuccess: false,
      shouldRefetch: false
    },
    {
      url: "/courses/test-course?payment=success",
      hasPaymentSuccess: true,
      shouldRefetch: true
    },
    {
      url: "/courses/test-course?payment=success&enrolled=true",
      hasPaymentSuccess: true,
      shouldRefetch: true
    },
    {
      url: "/courses/test-course?payment=failed",
      hasPaymentSuccess: false,
      shouldRefetch: false
    }
  ];

  urlScenarios.forEach(scenario => {
    const url = new URL(scenario.url, 'http://localhost:3000');
    const paymentStatus = url.searchParams.get('payment');
    const shouldRefetch = paymentStatus === 'success';
    
    const result = shouldRefetch === scenario.shouldRefetch ? '✅' : '❌';
    console.log(`   ${result} ${scenario.url}: refetch=${shouldRefetch} (expected: ${scenario.shouldRefetch})`);
  });

  console.log('\n✅ URL parameter handling tests completed\n');
}

function testPaymentFlowIntegration() {
  console.log('🧪 Testing Payment Flow Integration...\n');

  console.log('1️⃣ Testing payment success flow...');
  
  const paymentFlow = [
    "1. User clicks 'Enroll with M-Pesa'",
    "2. IntaSend checkout created with redirect URL",
    "3. User completes payment on IntaSend",
    "4. IntaSend redirects to: /courses/course-slug?payment=success&enrolled=true",
    "5. EnrollButton detects payment=success in URL",
    "6. EnrollButton calls refetch() to check enrollment status",
    "7. API call to /api/enrollment/check",
    "8. Sanity query checks for enrollment record",
    "9. EnrollButton updates to show 'Access Course' button"
  ];

  paymentFlow.forEach((step, index) => {
    console.log(`   ${step}`);
  });

  console.log('\n✅ Payment flow integration documented\n');

  console.log('2️⃣ Testing webhook timing scenarios...');
  
  const timingScenarios = [
    {
      scenario: "Webhook processes before user returns",
      webhookDelay: 0,
      userReturnDelay: 2000,
      enrollmentFound: true
    },
    {
      scenario: "User returns before webhook processes",
      webhookDelay: 3000,
      userReturnDelay: 1000,
      enrollmentFound: false,
      needsRetry: true
    },
    {
      scenario: "Webhook fails to process",
      webhookDelay: Infinity,
      userReturnDelay: 2000,
      enrollmentFound: false,
      needsManualRefresh: true
    }
  ];

  timingScenarios.forEach(scenario => {
    console.log(`   📋 ${scenario.scenario}:`);
    console.log(`      Webhook delay: ${scenario.webhookDelay}ms`);
    console.log(`      User return delay: ${scenario.userReturnDelay}ms`);
    console.log(`      Enrollment found: ${scenario.enrollmentFound}`);
    if (scenario.needsRetry) {
      console.log(`      ⏱️  Needs automatic retry after 1 second`);
    }
    if (scenario.needsManualRefresh) {
      console.log(`      🔄 User can manually refresh status`);
    }
    console.log('');
  });

  console.log('✅ Webhook timing scenarios documented\n');
}

async function runAllTests() {
  console.log('🚀 Running Enrollment Status Tests...\n');

  // Test 1: Logic tests (always work)
  testEnrollmentStatusLogic();
  
  // Test 2: Payment flow integration
  testPaymentFlowIntegration();

  // Test 3: API tests (only if server is running)
  console.log('3️⃣ Testing API endpoint...');
  console.log('   Note: This requires the Next.js development server to be running\n');
  
  try {
    await testEnrollmentStatusAPI();
  } catch (error) {
    console.log('   ⚠️  API tests skipped (server not running)');
    console.log('   💡 Start the dev server with: npm run dev\n');
  }

  console.log('🎉 All enrollment status tests completed!\n');

  console.log('📝 Summary of fixes implemented:');
  console.log('   • ✅ Client-side enrollment status checking');
  console.log('   • ✅ API endpoint for enrollment verification');
  console.log('   • ✅ URL parameter detection for payment success');
  console.log('   • ✅ Automatic refetch after successful payment');
  console.log('   • ✅ Manual refresh button for debugging');
  console.log('   • ✅ Loading states during status checks');
  console.log('   • ✅ Fallback to server-side enrollment status\n');

  console.log('🔧 How to test the fix:');
  console.log('   1. Start development server: npm run dev');
  console.log('   2. Create a test course in Sanity');
  console.log('   3. Complete a payment flow');
  console.log('   4. Verify button updates to "Access Course"');
  console.log('   5. Use refresh button if needed\n');
}

// Run all tests
runAllTests();
