/**
 * Test script for IntaSend checkout data validation
 * Run with: npx tsx docs/tests/test-intasend-checkout-data.ts
 */

import { convertToKes } from '../../lib/currency';

function testCheckoutDataValidation() {
  console.log('🧪 Testing IntaSend Checkout Data Validation...\n');

  // Test 1: Valid checkout data format
  console.log('1️⃣ Testing valid checkout data format...');
  
  const testCourse = {
    _id: "test-course-123",
    title: "Test Course",
    price: 50,
    currency: "USD",
    slug: { current: "test-course" }
  };

  const testUser = {
    id: "user_123",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com"
  };

  const baseUrl = "http://localhost:3000";
  const priceInKes = convertToKes(testCourse.price, "USD");

  const checkoutData = {
    first_name: (testUser.firstName || "Student").trim(),
    last_name: (testUser.lastName || "").trim(),
    email: testUser.email.trim().toLowerCase(),
    host: baseUrl,
    amount: priceInKes, // IntaSend expects integer for KES
    currency: "KES",
    api_ref: `course-${testCourse._id}-${testUser.id}-${Date.now()}`.replace(/[^a-zA-Z0-9-_]/g, ''),
    redirect_url: `${baseUrl}/courses/${testCourse.slug.current}?payment=success&enrolled=true`,
    comment: `Enrollment for ${testCourse.title}`.substring(0, 100),
  };

  console.log('   Generated checkout data:');
  console.log('   ', JSON.stringify(checkoutData, null, 2));

  // Test 2: Validate each field
  console.log('\n2️⃣ Validating individual fields...');

  const validations = [
    {
      field: 'first_name',
      value: checkoutData.first_name,
      valid: checkoutData.first_name.length > 0 && checkoutData.first_name.length <= 50,
      rule: 'Non-empty, max 50 chars'
    },
    {
      field: 'last_name',
      value: checkoutData.last_name,
      valid: checkoutData.last_name.length <= 50,
      rule: 'Max 50 chars (can be empty)'
    },
    {
      field: 'email',
      value: checkoutData.email,
      valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkoutData.email),
      rule: 'Valid email format'
    },
    {
      field: 'amount',
      value: checkoutData.amount,
      valid: Number.isInteger(checkoutData.amount) && checkoutData.amount >= 1 && checkoutData.amount <= 1000000,
      rule: 'Integer, 1-1,000,000 KES'
    },
    {
      field: 'currency',
      value: checkoutData.currency,
      valid: checkoutData.currency === 'KES',
      rule: 'Must be "KES"'
    },
    {
      field: 'api_ref',
      value: checkoutData.api_ref,
      valid: /^[a-zA-Z0-9-_]+$/.test(checkoutData.api_ref) && checkoutData.api_ref.length <= 100,
      rule: 'Alphanumeric, dash, underscore only, max 100 chars'
    },
    {
      field: 'redirect_url',
      value: checkoutData.redirect_url,
      valid: checkoutData.redirect_url.startsWith('http'),
      rule: 'Valid URL'
    },
    {
      field: 'comment',
      value: checkoutData.comment,
      valid: checkoutData.comment.length <= 100,
      rule: 'Max 100 chars'
    }
  ];

  validations.forEach(validation => {
    const status = validation.valid ? '✅' : '❌';
    console.log(`   ${status} ${validation.field}: ${validation.value} (${validation.rule})`);
  });

  const allValid = validations.every(v => v.valid);
  console.log(`\n   Overall validation: ${allValid ? '✅ PASS' : '❌ FAIL'}`);

  // Test 3: Common error scenarios
  console.log('\n3️⃣ Testing common error scenarios...');

  const errorScenarios = [
    {
      name: "Amount too small",
      data: { ...checkoutData, amount: 0 },
      expectedError: "Amount must be at least 1 KES"
    },
    {
      name: "Amount too large",
      data: { ...checkoutData, amount: 2000000 },
      expectedError: "Amount exceeds maximum"
    },
    {
      name: "Invalid email",
      data: { ...checkoutData, email: "invalid-email" },
      expectedError: "Invalid email format"
    },
    {
      name: "Empty first name",
      data: { ...checkoutData, first_name: "" },
      expectedError: "First name required"
    },
    {
      name: "Invalid currency",
      data: { ...checkoutData, currency: "USD" },
      expectedError: "Currency must be KES for IntaSend"
    }
  ];

  errorScenarios.forEach(scenario => {
    console.log(`   📋 ${scenario.name}:`);
    console.log(`      Data: ${JSON.stringify(scenario.data, null, 2)}`);
    console.log(`      Expected: ${scenario.expectedError}\n`);
  });

  console.log('✅ Checkout data validation tests completed\n');

  // Test 4: Real-world examples
  console.log('4️⃣ Testing real-world examples...');

  const realExamples = [
    {
      course: { price: 0, currency: "KES", title: "Free Course" },
      shouldBypass: true
    },
    {
      course: { price: 2000, currency: "KES", title: "Local Course" },
      expectedAmount: 2000
    },
    {
      course: { price: 25, currency: "USD", title: "International Course" },
      expectedAmount: convertToKes(25, "USD")
    }
  ];

  realExamples.forEach((example, index) => {
    console.log(`   Example ${index + 1}: ${example.course.title}`);
    console.log(`      Price: ${example.course.price} ${example.course.currency}`);
    
    if (example.shouldBypass) {
      console.log(`      Action: Bypass payment (free course)`);
    } else {
      console.log(`      IntaSend Amount: ${example.expectedAmount} KES`);
    }
    console.log('');
  });

  console.log('✅ Real-world examples completed\n');

  console.log('🎉 All IntaSend checkout data validation tests completed!\n');

  console.log('📝 Key Requirements for IntaSend:');
  console.log('   • Amount: Integer (no decimals) in KES');
  console.log('   • Email: Valid format, lowercase');
  console.log('   • Names: Trimmed, non-empty first name');
  console.log('   • API Ref: Alphanumeric + dash/underscore only');
  console.log('   • Currency: Must be "KES"');
  console.log('   • Comment: Max 100 characters\n');
}

// Run the test
testCheckoutDataValidation();
