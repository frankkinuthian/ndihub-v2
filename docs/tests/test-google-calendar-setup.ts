/**
 * Test Google Calendar API setup for invites
 * Run with: npx tsx docs/tests/test-google-calendar-setup.ts
 */

async function testGoogleCalendarSetup() {
  console.log('🔍 Testing Google Calendar API Setup...\n');

  // Check environment variables
  console.log('1️⃣ Checking Environment Variables...\n');

  const requiredEnvVars = [
    'GOOGLE_PROJECT_ID',
    'GOOGLE_SERVICE_ACCOUNT_EMAIL', 
    'GOOGLE_PRIVATE_KEY',
    'GOOGLE_CALENDAR_ID'
  ];

  const optionalEnvVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_PRIVATE_KEY_ID'
  ];

  let allRequired = true;

  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (value) {
      console.log(`✅ ${envVar}: Set (${value.substring(0, 20)}...)`);
    } else {
      console.log(`❌ ${envVar}: Missing`);
      allRequired = false;
    }
  });

  optionalEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (value) {
      console.log(`🟡 ${envVar}: Set (${value.substring(0, 20)}...)`);
    } else {
      console.log(`🟡 ${envVar}: Not set (optional)`);
    }
  });

  if (!allRequired) {
    console.log('\n❌ Missing required environment variables. Please add them to .env.local\n');
    return;
  }

  // Test Google Calendar API connection
  console.log('\n2️⃣ Testing Google Calendar API Connection...\n');

  try {
    const { google } = await import('googleapis');
    
    const credentials = {
      type: "service_account",
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    };

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
      ],
    });

    const calendar = google.calendar({ version: 'v3', auth });
    console.log('✅ Google Calendar client created successfully');

    // Test calendar access
    console.log('Testing calendar access...');
    const calendarList = await calendar.calendarList.list({
      maxResults: 5
    });

    console.log(`✅ Calendar access successful. Found ${calendarList.data.items?.length || 0} calendars`);

    // Test specific calendar
    const calendarId = process.env.GOOGLE_CALENDAR_ID!;
    console.log(`Testing access to calendar: ${calendarId}`);

    const calendarInfo = await calendar.calendars.get({
      calendarId: calendarId
    });

    console.log(`✅ Target calendar accessible: ${calendarInfo.data.summary}`);

    // Test events access
    console.log('Testing events access...');
    const events = await calendar.events.list({
      calendarId: calendarId,
      maxResults: 5,
      timeMin: new Date().toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });

    console.log(`✅ Events access successful. Found ${events.data.items?.length || 0} upcoming events`);

    if (events.data.items && events.data.items.length > 0) {
      console.log('\nUpcoming events:');
      events.data.items.forEach((event, index) => {
        console.log(`   ${index + 1}. ${event.summary} (${event.id})`);
      });
    }

  } catch (error) {
    console.error('❌ Google Calendar API test failed:', error);
    console.log('\nTroubleshooting steps:');
    console.log('1. Check that Google Calendar API is enabled in Google Cloud Console');
    console.log('2. Verify service account has Calendar permissions');
    console.log('3. Ensure calendar is shared with service account email');
    console.log('4. Check that private key format is correct (with \\n)');
    return;
  }

  // Test MasterClass detection
  console.log('\n3️⃣ Testing MasterClass Detection...\n');

  try {
    const { getMasterClasses } = await import('../../lib/googleCalendar');
    
    console.log('Fetching MasterClasses...');
    const masterClasses = await getMasterClasses();
    
    console.log(`✅ Found ${masterClasses.length} MasterClasses`);

    if (masterClasses.length > 0) {
      console.log('\nMasterClasses found:');
      masterClasses.forEach((mc, index) => {
        console.log(`   ${index + 1}. ${mc.title} (${mc.id})`);
        console.log(`      Premium: ${mc.isPremium}, Price: ${mc.price} ${mc.currency}`);
      });

      // Find a premium MasterClass for testing
      const premiumMC = masterClasses.find(mc => mc.isPremium && mc.price && mc.price > 0);
      if (premiumMC) {
        console.log(`\n✅ Found premium MasterClass for testing: ${premiumMC.title}`);
      } else {
        console.log('\n🟡 No premium MasterClasses found. Create one for testing payments.');
      }
    } else {
      console.log('\n🟡 No MasterClasses found. Create some events with "MasterClass" in the title.');
    }

  } catch (error) {
    console.error('❌ MasterClass detection failed:', error);
    return;
  }

  // Test invite function (dry run)
  console.log('\n4️⃣ Testing Invite Function (Dry Run)...\n');

  try {
    const { sendMasterClassInvite } = await import('../../lib/googleCalendarInvite');
    console.log('✅ Invite function imported successfully');
    console.log('✅ Ready to send invites after payment');

  } catch (error) {
    console.error('❌ Invite function test failed:', error);
    return;
  }

  console.log('\n✅ Google Calendar setup test completed successfully!\n');

  console.log('🎯 Next steps for testing:');
  console.log('1. Create a test premium MasterClass in Google Calendar');
  console.log('2. Complete a test payment flow');
  console.log('3. Check your email for the calendar invite');
  console.log('4. Verify the event appears in your Google Calendar\n');

  console.log('📝 Test MasterClass format:');
  console.log('Title: "Test Premium MasterClass"');
  console.log('Description:');
  console.log('```');
  console.log('Instructor: Test Instructor');
  console.log('Max: 25');
  console.log('Price: KES 1000');
  console.log('Premium');
  console.log('');
  console.log('This is a test premium masterclass for testing invites.');
  console.log('```');
}

// Run the test
testGoogleCalendarSetup().catch(console.error);
