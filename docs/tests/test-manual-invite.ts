/**
 * Manual test for sending a calendar invite
 * Run with: npx tsx docs/tests/test-manual-invite.ts
 */

async function testManualInvite() {
  console.log('🧪 Testing Manual Calendar Invite...\n');

  try {
    // Import required functions
    const { getMasterClasses } = await import('../../lib/googleCalendar');
    const { sendMasterClassInvite } = await import('../../lib/googleCalendarInvite');

    // Get MasterClasses
    console.log('1. Fetching MasterClasses...');
    const masterClasses = await getMasterClasses();
    console.log(`Found ${masterClasses.length} MasterClasses`);

    if (masterClasses.length === 0) {
      console.log('❌ No MasterClasses found. Create one in Google Calendar first.');
      return;
    }

    // Find a test MasterClass
    const testMasterClass = masterClasses.find(mc => 
      mc.title.toLowerCase().includes('test') || 
      mc.title.toLowerCase().includes('premium')
    ) || masterClasses[0];

    console.log(`2. Using MasterClass: ${testMasterClass.title}`);
    console.log(`   ID: ${testMasterClass.id}`);

    // Test invite data - CHANGE THIS EMAIL TO YOUR EMAIL
    const testEmail = 'your-email@example.com'; // ⚠️ CHANGE THIS!
    
    if (testEmail === 'your-email@example.com') {
      console.log('❌ Please update the testEmail variable with your actual email address');
      return;
    }

    const inviteData = {
      email: testEmail,
      firstName: 'Test',
      lastName: 'User',
      masterClass: testMasterClass
    };

    console.log(`3. Sending invite to: ${testEmail}`);

    // Send the invite
    const success = await sendMasterClassInvite(inviteData);

    if (success) {
      console.log('✅ Calendar invite sent successfully!');
      console.log('\n📧 Check your email for the calendar invite');
      console.log('📅 The event should appear in your Google Calendar');
      console.log('🔔 You should receive automatic reminders');
    } else {
      console.log('❌ Failed to send calendar invite');
    }

  } catch (error) {
    console.error('❌ Error testing manual invite:', error);
    
    if (error.message.includes('Calendar API has not been used')) {
      console.log('\n🔧 Solution: Enable Google Calendar API in Cloud Console');
    } else if (error.message.includes('Forbidden')) {
      console.log('\n🔧 Solution: Share calendar with service account email');
    } else if (error.message.includes('Not found')) {
      console.log('\n🔧 Solution: Check calendar ID and event exists');
    }
  }
}

// Run the test
testManualInvite().catch(console.error);
