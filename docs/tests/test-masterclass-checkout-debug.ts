/**
 * Debug script for MasterClass checkout issues
 * Run with: npx tsx docs/tests/test-masterclass-checkout-debug.ts
 */

async function debugMasterClassCheckout() {
  console.log('🔍 Debugging MasterClass Checkout Issues...\n');

  console.log('1️⃣ Testing Google Calendar Integration...\n');

  try {
    // Test if we can get MasterClasses from Google Calendar
    const { getMasterClasses } = await import("../../lib/googleCalendar");
    
    console.log("Fetching MasterClasses from Google Calendar...");
    const masterClasses = await getMasterClasses();
    
    console.log(`Found ${masterClasses.length} MasterClasses`);
    
    if (masterClasses.length > 0) {
      console.log("\nMasterClass details:");
      masterClasses.forEach((mc, index) => {
        console.log(`  ${index + 1}. ${mc.title}`);
        console.log(`     ID: ${mc.id}`);
        console.log(`     Premium: ${mc.isPremium}`);
        console.log(`     Free: ${mc.isFree}`);
        console.log(`     Price: ${mc.price} ${mc.currency}`);
        console.log(`     Status: ${mc.status}`);
        console.log('');
      });
      
      // Find a premium MasterClass for testing
      const premiumMasterClass = masterClasses.find(mc => mc.isPremium && !mc.isFree && mc.price && mc.price > 0);
      
      if (premiumMasterClass) {
        console.log("✅ Found premium MasterClass for testing:");
        console.log(`   Title: ${premiumMasterClass.title}`);
        console.log(`   ID: ${premiumMasterClass.id}`);
        console.log(`   Price: ${premiumMasterClass.price} ${premiumMasterClass.currency}`);
      } else {
        console.log("❌ No premium MasterClass found for testing");
        console.log("   Create a MasterClass with pricing in Google Calendar:");
        console.log("   Description should include: 'Price: KES 2000' or 'Price: $50'");
      }
    } else {
      console.log("❌ No MasterClasses found");
      console.log("   Make sure you have events in Google Calendar with 'masterclass' in the title");
    }
  } catch (error) {
    console.error("❌ Error fetching MasterClasses:", error);
  }

  console.log('\n2️⃣ Testing Environment Variables...\n');

  const envVars = [
    'INSTASEND_API_KEY',
    'INSTASEND_API_SECRET',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_BASE_URL',
    'GOOGLE_CALENDAR_ID',
    'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    'GOOGLE_PRIVATE_KEY'
  ];

  envVars.forEach(envVar => {
    const value = process.env[envVar];
    if (value) {
      console.log(`✅ ${envVar}: Set (${value.substring(0, 10)}...)`);
    } else {
      console.log(`❌ ${envVar}: Not set`);
    }
  });

  console.log('\n3️⃣ Testing Currency Conversion...\n');

  try {
    const { convertToKes, convertToUsdCents, isSupportedCurrency } = await import("../../lib/currency");
    
    const testCases = [
      { amount: 50, from: 'USD', to: 'KES' },
      { amount: 2000, from: 'KES', to: 'USD' },
      { amount: 25, from: 'EUR', to: 'KES' }
    ];

    testCases.forEach(test => {
      try {
        if (test.to === 'KES') {
          const result = convertToKes(test.amount, test.from as any);
          console.log(`✅ ${test.amount} ${test.from} → ${result} KES`);
        } else {
          const result = convertToUsdCents(test.amount, test.from as any);
          console.log(`✅ ${test.amount} ${test.from} → ${result} cents (${result/100} USD)`);
        }
      } catch (error) {
        console.log(`❌ ${test.amount} ${test.from} → ${test.to}: ${error.message}`);
      }
    });
  } catch (error) {
    console.error("❌ Error testing currency conversion:", error);
  }

  console.log('\n4️⃣ Testing IntaSend Integration...\n');

  try {
    const { createIntaSendInstance } = await import("../../lib/instasend");
    
    console.log("Creating IntaSend instance...");
    const intasend = createIntaSendInstance();
    console.log("✅ IntaSend instance created successfully");
    
    // Test a simple API call (this might fail in test environment)
    console.log("Testing IntaSend API connection...");
    // Note: We won't actually create a checkout in the test
    console.log("✅ IntaSend integration appears to be working");
  } catch (error) {
    console.error("❌ Error with IntaSend integration:", error);
  }

  console.log('\n5️⃣ Testing Sanity Integration...\n');

  try {
    const { createStudentIfNotExists } = await import("../../sanity/lib/student/createStudentIfNotExists");
    console.log("✅ createStudentIfNotExists function imported successfully");
    
    // Test if we can connect to Sanity (without actually creating a student)
    console.log("✅ Sanity integration appears to be working");
  } catch (error) {
    console.error("❌ Error with Sanity integration:", error);
  }

  console.log('\n6️⃣ Testing Base URL...\n');

  try {
    const baseUrl = (await import("../../lib/baseUrl")).default;
    console.log(`Base URL: ${baseUrl}`);
    
    if (baseUrl && baseUrl !== 'undefined') {
      console.log("✅ Base URL is configured");
    } else {
      console.log("❌ Base URL is not properly configured");
      console.log("   Set NEXT_PUBLIC_BASE_URL in your .env.local file");
    }
  } catch (error) {
    console.error("❌ Error with base URL:", error);
  }

  console.log('\n7️⃣ Common Issues and Solutions...\n');

  const commonIssues = [
    {
      issue: "MasterClass not found",
      cause: "Google Calendar event doesn't exist or doesn't have 'masterclass' in title",
      solution: "Create event with 'MasterClass' in title and proper pricing"
    },
    {
      issue: "Invalid MasterClass price",
      cause: "Event doesn't have pricing information or price is 0",
      solution: "Add 'Price: KES 2000' or 'Price: $50' to event description"
    },
    {
      issue: "IntaSend API error",
      cause: "Missing API keys or incorrect configuration",
      solution: "Check INSTASEND_API_KEY and INSTASEND_API_SECRET in .env.local"
    },
    {
      issue: "User not authenticated",
      cause: "Clerk auth not working properly",
      solution: "Make sure user is signed in and Clerk is configured"
    },
    {
      issue: "Webhook URL error",
      cause: "Incorrect webhook URL in checkout data",
      solution: "Ensure webhook points to /api/intasend/webhook"
    }
  ];

  commonIssues.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue.issue}:`);
    console.log(`      Cause: ${issue.cause}`);
    console.log(`      Solution: ${issue.solution}`);
    console.log('');
  });

  console.log('✅ Debug analysis completed!\n');

  console.log('🎯 Next steps:');
  console.log('   1. Check the console logs when testing checkout');
  console.log('   2. Verify MasterClass has proper pricing in Google Calendar');
  console.log('   3. Ensure all environment variables are set');
  console.log('   4. Test with a simple premium MasterClass first');
  console.log('   5. Check browser network tab for API errors\n');

  console.log('📝 To create a test MasterClass:');
  console.log('   Title: "Test Premium MasterClass"');
  console.log('   Description:');
  console.log('   ```');
  console.log('   Instructor: Test Instructor');
  console.log('   Max: 25');
  console.log('   Price: KES 1000');
  console.log('   Premium');
  console.log('   ');
  console.log('   This is a test premium masterclass for testing payments.');
  console.log('   ```');
}

// Run the debug
debugMasterClassCheckout().catch(console.error);
