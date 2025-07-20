/**
 * Test admin Google Calendar permissions
 * Run with: pnpm test:admin-permissions
 */

async function testAdminPermissions() {
  console.log('🔐 Testing Admin Google Calendar Permissions...\n');

  console.log('1️⃣ Checking Environment Variables...\n');

  const requiredEnvVars = [
    'GOOGLE_PROJECT_ID',
    'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    'GOOGLE_PRIVATE_KEY',
    'GOOGLE_CALENDAR_ID'
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

  if (!allRequired) {
    console.log('\n❌ Missing required environment variables.\n');
    return;
  }

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
    const calendarInfo = await calendar.calendars.get({
      calendarId: process.env.GOOGLE_CALENDAR_ID!
    });

    console.log(`✅ Calendar accessible: ${calendarInfo.data.summary}`);

    // Test events listing
    console.log('Testing events access...');
    const events = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      maxResults: 5,
      timeMin: new Date().toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });

    console.log(`✅ Events access successful. Found ${events.data.items?.length || 0} upcoming events`);

    if (events.data.items && events.data.items.length > 0) {
      const testEvent = events.data.items[0];
      console.log(`\nTesting update permissions on event: ${testEvent.summary}`);
      
      // Test if we can read the event details
      const eventDetails = await calendar.events.get({
        calendarId: process.env.GOOGLE_CALENDAR_ID!,
        eventId: testEvent.id!
      });

      console.log('✅ Event details retrieved successfully');

      // Test if we can update the event (dry run - just read and write back the same data)
      console.log('Testing update permissions...');
      
      try {
        await calendar.events.update({
          calendarId: process.env.GOOGLE_CALENDAR_ID!,
          eventId: testEvent.id!,
          requestBody: {
            ...eventDetails.data,
            // Don't actually change anything, just test the permission
          },
        });

        console.log('✅ Update permissions confirmed - admin pricing will work!');
      } catch (updateError) {
        console.error('❌ Update permission failed:', updateError.message);
        console.log('\n🔧 To fix this:');
        console.log('1. Go to Google Calendar settings');
        console.log('2. Share calendar with service account email');
        console.log('3. Set permission to "Make changes to events"');
        console.log(`4. Service account email: ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}`);
      }
    } else {
      console.log('🟡 No events found to test update permissions');
      console.log('   Create a test MasterClass event first');
    }

  } catch (error) {
    console.error('❌ Google Calendar API test failed:', error.message);
    
    if (error.message.includes('Forbidden')) {
      console.log('\n🔧 Permission Error Solutions:');
      console.log('1. Share calendar with service account email');
      console.log('2. Set permission to "Make changes to events"');
      console.log('3. Wait a few minutes for permissions to propagate');
      console.log(`4. Service account: ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}`);
    } else if (error.message.includes('Calendar API has not been used')) {
      console.log('\n🔧 API Not Enabled:');
      console.log('1. Go to Google Cloud Console');
      console.log('2. Navigate to APIs & Services → Library');
      console.log('3. Search for "Google Calendar API"');
      console.log('4. Click "Enable"');
    }
    return;
  }

  console.log('\n3️⃣ Testing MasterClass Detection...\n');

  try {
    const { getMasterClasses } = await import('../../lib/googleCalendar');
    
    console.log('Fetching MasterClasses...');
    const masterClasses = await getMasterClasses();
    
    console.log(`✅ Found ${masterClasses.length} MasterClasses`);

    if (masterClasses.length > 0) {
      const premiumMC = masterClasses.find(mc => mc.isPremium && mc.price && mc.price > 0);
      if (premiumMC) {
        console.log(`✅ Found premium MasterClass: ${premiumMC.title} (${premiumMC.currency} ${premiumMC.price})`);
        console.log('   This can be used for testing admin pricing updates');
      } else {
        console.log('🟡 No premium MasterClasses found');
        console.log('   Create one with pricing in the description for testing');
      }
    }

  } catch (error) {
    console.error('❌ MasterClass detection failed:', error);
  }

  console.log('\n✅ Admin permissions test completed!\n');

  console.log('📝 Summary:');
  console.log('   • Google Calendar API connection');
  console.log('   • Calendar access permissions');
  console.log('   • Event read permissions');
  console.log('   • Event update permissions');
  console.log('   • MasterClass detection\n');

  console.log('🎯 If all tests pass:');
  console.log('   • Admin pricing management will work');
  console.log('   • You can update MasterClass pricing via /admin/pricing');
  console.log('   • Changes will reflect immediately in Google Calendar\n');

  console.log('🔧 If update permissions fail:');
  console.log('   1. Go to Google Calendar');
  console.log('   2. Calendar Settings → Share with specific people');
  console.log(`   3. Add: ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}`);
  console.log('   4. Permission: "Make changes to events"');
  console.log('   5. Wait 2-3 minutes for changes to take effect');
}

// Run the test
testAdminPermissions().catch(console.error);
