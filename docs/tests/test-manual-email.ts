/**
 * Manual test for sending email with .ics attachment
 * Run with: pnpm test:manual-email
 */

async function testManualEmail() {
  console.log('📧 Testing Manual Email with .ics Attachment...\n');

  try {
    // Import required functions
    const { getMasterClasses } = await import('../../lib/googleCalendar');
    const { sendMasterClassEmailInvite } = await import('../../lib/emailService');

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
    console.log(`   Start: ${new Date(testMasterClass.startTime).toLocaleString()}`);
    console.log(`   Meeting Link: ${testMasterClass.meetingLink || 'Not available'}`);

    // Test email data - CHANGE THIS EMAIL TO YOUR EMAIL
    const testEmail = 'your-email@example.com'; // ⚠️ CHANGE THIS!
    
    if (testEmail === 'your-email@example.com') {
      console.log('❌ Please update the testEmail variable with your actual email address');
      console.log('   Edit docs/tests/test-manual-email.ts and change the testEmail variable');
      return;
    }

    const inviteData = {
      email: testEmail,
      firstName: 'Test',
      lastName: 'User',
      masterClass: testMasterClass
    };

    console.log(`3. Sending email invite to: ${testEmail}`);
    console.log('   This may take a few seconds...');

    // Send the email invite
    const success = await sendMasterClassEmailInvite(inviteData);

    if (success) {
      console.log('✅ Email invite sent successfully!');
      console.log('\n📧 Check your email for:');
      console.log('   • Professional HTML email with event details');
      console.log('   • .ics calendar file attachment');
      console.log('   • Meeting link (if available)');
      console.log('   • Instructions for adding to calendar');
      console.log('\n📱 Test the .ics file by:');
      console.log('   • Clicking the attachment in your email');
      console.log('   • Verifying it opens in your calendar app');
      console.log('   • Checking that event details are correct');
      console.log('   • Confirming meeting link works');
    } else {
      console.log('❌ Failed to send email invite');
      console.log('\n🔧 Troubleshooting:');
      console.log('   • Check EMAIL_USER and EMAIL_APP_PASSWORD in .env.local');
      console.log('   • Verify Gmail App Password is correct');
      console.log('   • Check console for detailed error messages');
      console.log('   • Try with a different email provider');
    }

  } catch (error) {
    console.error('❌ Error testing manual email:', error);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n🔧 Email authentication failed:');
      console.log('   • Check EMAIL_USER is correct');
      console.log('   • Verify EMAIL_APP_PASSWORD is valid');
      console.log('   • For Gmail, create App Password at: https://myaccount.google.com/apppasswords');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\n🔧 Network/SMTP error:');
      console.log('   • Check internet connection');
      console.log('   • Verify SMTP settings if using custom provider');
    } else if (error.message.includes('Missing credentials')) {
      console.log('\n🔧 Missing email configuration:');
      console.log('   • Add EMAIL_USER to .env.local');
      console.log('   • Add EMAIL_APP_PASSWORD to .env.local');
    }
  }
}

// Run the test
testManualEmail().catch(console.error);
