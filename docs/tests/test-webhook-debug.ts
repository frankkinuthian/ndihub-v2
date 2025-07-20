/**
 * Debug webhook processing
 * Run with: pnpm test:webhook-debug
 */

// Load environment variables
import { config } from 'dotenv';
import { join } from 'path';
config({ path: join(process.cwd(), '.env.local') });

async function testWebhookDebug() {
  console.log('🔍 Debugging Webhook Processing...\n');

  console.log('1️⃣ Checking Webhook Configuration...\n');

  const webhookVars = [
    'INSTASEND_API_KEY',
    'INSTASEND_PUBLISHABLE_KEY', 
    'INSTASEND_WEBHOOK_SECRET'
  ];

  webhookVars.forEach(envVar => {
    const value = process.env[envVar];
    if (value) {
      console.log(`✅ ${envVar}: Set (${value.substring(0, 10)}...)`);
    } else {
      console.log(`❌ ${envVar}: Missing`);
    }
  });

  console.log('\n2️⃣ Testing Webhook Endpoint...\n');

  try {
    // Test if webhook endpoint is accessible
    const response = await fetch('http://localhost:3000/api/intasend/webhook', {
      method: 'GET'
    });

    console.log(`Webhook endpoint status: ${response.status}`);
    
    if (response.status === 405) {
      console.log('✅ Webhook endpoint exists (405 = Method Not Allowed for GET is expected)');
    } else {
      console.log('❌ Webhook endpoint may not be working properly');
    }

  } catch (error) {
    console.log(`❌ Webhook endpoint not accessible: ${error.message}`);
  }

  console.log('\n3️⃣ Checking Recent Payments...\n');

  try {
    // Check if there are any recent enrollments
    const { client } = await import('../../sanity/lib/client');
    
    const recentEnrollments = await client.fetch(`
      *[_type == "masterclassEnrollment"] | order(_createdAt desc)[0..4] {
        _id,
        _createdAt,
        masterclassId,
        masterclassTitle,
        paymentId,
        amount,
        currency,
        status,
        student->{firstName, lastName, email}
      }
    `);

    console.log(`Found ${recentEnrollments.length} recent enrollments:`);
    
    recentEnrollments.forEach((enrollment, index) => {
      console.log(`\n   ${index + 1}. ${enrollment.masterclassTitle}`);
      console.log(`      Payment ID: ${enrollment.paymentId}`);
      console.log(`      Amount: ${enrollment.amount} ${enrollment.currency}`);
      console.log(`      Student: ${enrollment.student?.firstName} ${enrollment.student?.lastName}`);
      console.log(`      Created: ${new Date(enrollment._createdAt).toLocaleString()}`);
      console.log(`      Status: ${enrollment.status}`);
    });

    if (recentEnrollments.length === 0) {
      console.log('❌ No enrollments found - webhook is not creating records');
    }

  } catch (error) {
    console.log(`❌ Error checking enrollments: ${error.message}`);
  }

  console.log('\n4️⃣ Testing Student Lookup...\n');

  try {
    // Check if the current user exists in Sanity
    const { getStudentByClerkId } = await import('../../sanity/lib/student/getStudentByClerkId');
    
    const testClerkId = 'user_2urmngFLBmdW5JudGqRcRxaW62C'; // From the logs
    const student = await getStudentByClerkId(testClerkId);
    
    if (student) {
      console.log(`✅ Student found: ${student.firstName} ${student.lastName} (${student.email})`);
      console.log(`   Student ID: ${student._id}`);
    } else {
      console.log('❌ Student not found - this could cause webhook failures');
    }

  } catch (error) {
    console.log(`❌ Error looking up student: ${error.message}`);
  }

  console.log('\n5️⃣ Webhook Troubleshooting Guide...\n');

  console.log('🔧 Common webhook issues:');
  console.log('');
  console.log('1. **Webhook URL not configured in IntaSend:**');
  console.log('   • Go to IntaSend Dashboard → Webhooks');
  console.log('   • Add webhook URL: https://your-domain.com/api/intasend/webhook');
  console.log('   • For local testing, use ngrok tunnel');
  console.log('');
  console.log('2. **Webhook secret mismatch:**');
  console.log('   • Check INSTASEND_WEBHOOK_SECRET in .env.local');
  console.log('   • Must match the secret in IntaSend dashboard');
  console.log('');
  console.log('3. **Local development webhook testing:**');
  console.log('   • Install ngrok: npm install -g ngrok');
  console.log('   • Run: ngrok http 3000');
  console.log('   • Use ngrok URL in IntaSend webhook settings');
  console.log('');
  console.log('4. **Student not found in database:**');
  console.log('   • User must be signed up and have a student record');
  console.log('   • Check Sanity Studio for student records');
  console.log('');
  console.log('5. **Payment provider configuration:**');
  console.log('   • Verify IntaSend API keys are correct');
  console.log('   • Check if payments are actually completing');
  console.log('   • Look at IntaSend dashboard for payment status');

  console.log('\n6️⃣ Manual Webhook Test...\n');

  console.log('To manually test the webhook:');
  console.log('');
  console.log('1. **Create a test payment in IntaSend dashboard**');
  console.log('2. **Check if webhook gets called** (look for logs)');
  console.log('3. **Verify enrollment gets created** in Sanity');
  console.log('4. **Test enrollment status API** returns true');
  console.log('');
  console.log('Expected webhook logs:');
  console.log('```');
  console.log('✅ MasterClass enrollment created successfully');
  console.log('✅ Email invite sent successfully');
  console.log('```');

  console.log('\n✅ Webhook debug completed!\n');

  console.log('🎯 Next steps:');
  console.log('1. Check IntaSend webhook configuration');
  console.log('2. Verify webhook URL is accessible');
  console.log('3. Test with ngrok for local development');
  console.log('4. Monitor webhook logs during payment');
  console.log('5. Check Sanity for enrollment creation\n');

  console.log('💡 Quick fix: If using local development, set up ngrok:');
  console.log('   pnpm add -g ngrok');
  console.log('   ngrok http 3000');
  console.log('   Use the https URL in IntaSend webhook settings');
}

// Run the test
testWebhookDebug().catch(console.error);
