/**
 * Test Google Calendar event title fetching
 * Run with: pnpm test:event-titles
 */

// Load environment variables
import { config } from 'dotenv';
import { join } from 'path';
config({ path: join(process.cwd(), '.env.local') });

async function testEventTitleFetching() {
  console.log('🎯 Testing Google Calendar Event Title Fetching...\n');

  console.log('1️⃣ Testing Helper Functions...\n');

  try {
    // Get a real MasterClass ID to test with
    const { getMasterClasses } = await import('../../lib/googleCalendar');
    const masterClasses = await getMasterClasses();
    
    if (masterClasses.length === 0) {
      console.log('❌ No MasterClasses found to test with');
      return;
    }

    const testMasterClass = masterClasses[0];
    console.log(`Using test MasterClass: ${testMasterClass.id}`);
    console.log(`Expected title: "${testMasterClass.title}"`);

    // Test the helper functions
    const { getEventTitle, getEventDetails, getMasterClassTitle } = await import('../../lib/googleCalendarEvent');

    console.log('\n📋 Testing getEventTitle...');
    const eventTitle = await getEventTitle(testMasterClass.id);
    console.log(`Result: "${eventTitle}"`);

    console.log('\n📋 Testing getEventDetails...');
    const eventDetails = await getEventDetails(testMasterClass.id);
    if (eventDetails) {
      console.log(`✅ Event found: "${eventDetails.summary}"`);
      console.log(`   Start: ${eventDetails.start?.dateTime || eventDetails.start?.date}`);
      console.log(`   Description length: ${eventDetails.description?.length || 0} chars`);
    } else {
      console.log('❌ Event details not found');
    }

    console.log('\n📋 Testing getMasterClassTitle (no provided title)...');
    const masterClassTitle1 = await getMasterClassTitle(testMasterClass.id);
    console.log(`Result: "${masterClassTitle1}"`);

    console.log('\n📋 Testing getMasterClassTitle (with provided title)...');
    const masterClassTitle2 = await getMasterClassTitle(testMasterClass.id, "Provided Title");
    console.log(`Result: "${masterClassTitle2}"`);

    console.log('\n📋 Testing getMasterClassTitle (with bad provided title)...');
    const masterClassTitle3 = await getMasterClassTitle(testMasterClass.id, `MasterClass ${testMasterClass.id}`);
    console.log(`Result: "${masterClassTitle3}"`);

  } catch (error) {
    console.error('❌ Error testing helper functions:', error);
  }

  console.log('\n2️⃣ Testing with Recent Enrollments...\n');

  try {
    const { client } = await import('../../sanity/lib/client');
    
    // Get recent enrollments to test title improvement
    const recentEnrollments = await client.fetch(`
      *[_type == "masterclassEnrollment"] | order(_createdAt desc)[0..2] {
        _id,
        masterclassId,
        masterclassTitle
      }
    `);

    if (recentEnrollments.length === 0) {
      console.log('❌ No enrollments found to test with');
      return;
    }

    console.log('Testing title improvement for existing enrollments:');

    for (const enrollment of recentEnrollments) {
      console.log(`\n   📋 Enrollment: ${enrollment._id}`);
      console.log(`      Current title: "${enrollment.masterclassTitle}"`);
      console.log(`      Event ID: ${enrollment.masterclassId}`);

      // Test what the new title would be
      const { getMasterClassTitle } = await import('../../lib/googleCalendarEvent');
      const improvedTitle = await getMasterClassTitle(enrollment.masterclassId, enrollment.masterclassTitle);
      
      console.log(`      Improved title: "${improvedTitle}"`);
      
      if (improvedTitle !== enrollment.masterclassTitle) {
        console.log(`      ✅ Title would be improved!`);
      } else {
        console.log(`      ℹ️ Title is already good`);
      }
    }

  } catch (error) {
    console.error('❌ Error testing with enrollments:', error);
  }

  console.log('\n3️⃣ Testing Direct Google Calendar API...\n');

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
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    const calendar = google.calendar({ version: 'v3', auth });
    
    // List recent events to see their actual titles
    console.log('Recent events in calendar:');
    const eventsResponse = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      timeMin: new Date().toISOString(),
      maxResults: 5,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = eventsResponse.data.items || [];
    
    events.forEach((event, index) => {
      console.log(`\n   ${index + 1}. "${event.summary}"`);
      console.log(`      ID: ${event.id}`);
      console.log(`      Start: ${event.start?.dateTime || event.start?.date}`);
      
      // Check if this looks like a MasterClass
      const isMasterClass = event.summary?.toLowerCase().includes('masterclass') || 
                           event.description?.toLowerCase().includes('masterclass');
      console.log(`      Is MasterClass: ${isMasterClass ? '✅' : '❌'}`);
    });

  } catch (error) {
    console.error('❌ Error testing direct Google Calendar API:', error);
  }

  console.log('\n✅ Event title fetching test completed!\n');

  console.log('🎯 Summary:');
  console.log('• Helper functions test actual Google Calendar API access');
  console.log('• getMasterClassTitle provides multiple fallback strategies');
  console.log('• Webhooks will now fetch real event titles');
  console.log('• Sanity Studio should show proper MasterClass names\n');

  console.log('🔧 Next steps:');
  console.log('1. Complete a new test payment');
  console.log('2. Check webhook logs for title fetching');
  console.log('3. Verify Sanity Studio shows real titles');
  console.log('4. Check that titles are descriptive (not just IDs)\n');

  console.log('💡 Expected improvement:');
  console.log('   Before: "MasterClass 6am3flgfc3ed96chldn19nfdes"');
  console.log('   After:  "Advanced React Patterns MasterClass"');
}

// Run the test
testEventTitleFetching().catch(console.error);
