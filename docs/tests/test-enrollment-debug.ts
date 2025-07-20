/**
 * Debug enrollment issues
 * Run with: pnpm test:enrollment-debug
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { join } from 'path';

// Load .env.local file
config({ path: join(process.cwd(), '.env.local') });

async function testEnrollmentDebug() {
  console.log('🔍 Debugging Enrollment Issues...\n');

  console.log('1️⃣ Testing Calendar Configuration...\n');

  // Check environment variables
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  
  console.log(`Calendar ID: ${calendarId}`);
  console.log(`Service Account: ${serviceEmail}`);

  if (!calendarId || !serviceEmail) {
    console.log('❌ Missing calendar configuration');
    return;
  }

  console.log('\n2️⃣ Testing MasterClass Fetching...\n');

  try {
    const { getMasterClasses } = await import('../../lib/googleCalendar');
    
    console.log('Fetching MasterClasses...');
    const masterClasses = await getMasterClasses();
    
    console.log(`✅ Found ${masterClasses.length} MasterClasses`);

    if (masterClasses.length === 0) {
      console.log('❌ No MasterClasses found!');
      console.log('\nPossible causes:');
      console.log('• Calendar ID is incorrect');
      console.log('• No events in the calendar');
      console.log('• Events don\'t have "MasterClass" in the title');
      console.log('• Service account doesn\'t have calendar access');
      return;
    }

    // Show MasterClass details
    masterClasses.forEach((mc, index) => {
      console.log(`\n   ${index + 1}. ${mc.title}`);
      console.log(`      ID: ${mc.id}`);
      console.log(`      Status: ${mc.status}`);
      console.log(`      Premium: ${mc.isPremium}`);
      console.log(`      Price: ${mc.price} ${mc.currency}`);
      console.log(`      Start: ${new Date(mc.startTime).toLocaleString()}`);
    });

    console.log('\n3️⃣ Testing Enrollment Status API...\n');

    // Test enrollment status API
    const testMasterClass = masterClasses[0];
    console.log(`Testing enrollment status for: ${testMasterClass.title}`);

    try {
      const response = await fetch(`http://localhost:3000/api/masterclass/enrollment-status?masterclassId=${testMasterClass.id}`);
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ Enrollment API working: isEnrolled = ${data.isEnrolled}`);
      } else {
        console.log(`❌ Enrollment API error: ${data.error}`);
      }
    } catch (apiError) {
      console.log(`❌ Enrollment API failed: ${apiError.message}`);
    }

  } catch (error) {
    console.error('❌ MasterClass fetching failed:', error.message);
    
    if (error.message.includes('Not Found')) {
      console.log('\n🔧 Calendar ID Issue:');
      console.log('• The calendar ID is incorrect');
      console.log('• Check Google Calendar → Settings → Calendar ID');
      console.log('• Should look like: abc123@group.calendar.google.com');
      console.log('• NOT the embed URL');
    } else if (error.message.includes('Forbidden')) {
      console.log('\n🔧 Permission Issue:');
      console.log('• Service account needs calendar access');
      console.log('• Share calendar with service account email');
      console.log('• Set permission to "See all event details" or higher');
    }
    return;
  }

  console.log('\n4️⃣ Testing Payment Configuration...\n');

  const intasendKey = process.env.INSTASEND_API_KEY;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  
  if (intasendKey) {
    console.log('✅ IntaSend configured');
  } else {
    console.log('❌ IntaSend not configured');
  }

  if (stripeKey) {
    console.log('✅ Stripe configured');
  } else {
    console.log('❌ Stripe not configured');
  }

  console.log('\n5️⃣ Testing Sanity Configuration...\n');

  try {
    const { client } = await import('../../sanity/lib/client');
    console.log('✅ Sanity client configured');
    
    // Test a simple query
    const testQuery = await client.fetch('*[_type == "masterclassEnrollment"][0..2]');
    console.log(`✅ Found ${testQuery.length} enrollment records`);
    
  } catch (sanityError) {
    console.log(`❌ Sanity error: ${sanityError.message}`);
  }

  console.log('\n✅ Enrollment debug completed!\n');

  console.log('📝 Summary of potential issues:');
  console.log('• Calendar ID format (should be email-like, not URL)');
  console.log('• Service account permissions');
  console.log('• MasterClass event format in Google Calendar');
  console.log('• API endpoint accessibility');
  console.log('• Payment provider configuration\n');

  console.log('🎯 Next steps:');
  console.log('1. Fix any issues identified above');
  console.log('2. Test enrollment on a specific MasterClass');
  console.log('3. Check browser console for client-side errors');
  console.log('4. Verify payment flow works end-to-end\n');

  console.log('🔧 Common fixes:');
  console.log('• Update GOOGLE_CALENDAR_ID to correct format');
  console.log('• Share calendar with service account');
  console.log('• Ensure events have "MasterClass" in title');
  console.log('• Check payment provider API keys');
}

// Run the test
testEnrollmentDebug().catch(console.error);
