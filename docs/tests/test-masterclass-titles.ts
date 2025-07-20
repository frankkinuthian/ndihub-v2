/**
 * Test MasterClass title display in Sanity Studio
 * Run with: pnpm test:masterclass-titles
 */

// Load environment variables
import { config } from 'dotenv';
import { join } from 'path';
config({ path: join(process.cwd(), '.env.local') });

async function testMasterClassTitles() {
  console.log('🎯 Testing MasterClass Title Display...\n');

  console.log('1️⃣ Checking Recent Enrollments...\n');

  try {
    const { client } = await import('../../sanity/lib/client');
    
    // Get recent enrollments
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
    
    if (recentEnrollments.length === 0) {
      console.log('❌ No enrollments found to test titles');
      return;
    }

    recentEnrollments.forEach((enrollment, index) => {
      console.log(`\n   ${index + 1}. Enrollment Details:`);
      console.log(`      📝 Title: "${enrollment.masterclassTitle}"`);
      console.log(`      🆔 ID: ${enrollment.masterclassId}`);
      console.log(`      👤 Student: ${enrollment.student?.firstName} ${enrollment.student?.lastName}`);
      console.log(`      💰 Amount: ${enrollment.amount} ${enrollment.currency}`);
      console.log(`      📅 Created: ${new Date(enrollment._createdAt).toLocaleString()}`);
      console.log(`      ✅ Status: ${enrollment.status}`);
      
      // Check if title is meaningful
      if (enrollment.masterclassTitle && !enrollment.masterclassTitle.startsWith('MasterClass ')) {
        console.log(`      ✅ Title looks good: "${enrollment.masterclassTitle}"`);
      } else {
        console.log(`      ⚠️ Title needs improvement: "${enrollment.masterclassTitle}"`);
      }
    });

  } catch (error) {
    console.error('❌ Error checking enrollments:', error);
    return;
  }

  console.log('\n2️⃣ Checking Google Calendar MasterClasses...\n');

  try {
    const { getMasterClasses } = await import('../../lib/googleCalendar');
    
    const masterClasses = await getMasterClasses();
    console.log(`Found ${masterClasses.length} MasterClasses in Google Calendar:`);

    masterClasses.forEach((mc, index) => {
      console.log(`\n   ${index + 1}. ${mc.title}`);
      console.log(`      🆔 ID: ${mc.id}`);
      console.log(`      💰 Price: ${mc.price} ${mc.currency}`);
      console.log(`      📅 Start: ${new Date(mc.startTime).toLocaleString()}`);
      console.log(`      🎯 Status: ${mc.status}`);
    });

  } catch (error) {
    console.error('❌ Error fetching MasterClasses:', error);
  }

  console.log('\n3️⃣ Testing Sanity Studio Preview...\n');

  try {
    const { client } = await import('../../sanity/lib/client');
    
    // Test how enrollments would appear in Sanity Studio
    const enrollmentsForPreview = await client.fetch(`
      *[_type == "masterclassEnrollment"] | order(_createdAt desc)[0..2] {
        _id,
        masterclassTitle,
        "studentName": student->firstName,
        "preview": {
          "title": masterclassTitle,
          "subtitle": "Student: " + student->firstName
        }
      }
    `);

    console.log('Sanity Studio Preview Simulation:');
    enrollmentsForPreview.forEach((enrollment, index) => {
      console.log(`\n   ${index + 1}. Studio Display:`);
      console.log(`      📋 Title: "${enrollment.preview.title}"`);
      console.log(`      👤 Subtitle: "${enrollment.preview.subtitle}"`);
      console.log(`      🆔 Document ID: ${enrollment._id}`);
    });

  } catch (error) {
    console.error('❌ Error testing Sanity preview:', error);
  }

  console.log('\n4️⃣ Recommendations...\n');

  console.log('🎯 For better title display in Sanity Studio:');
  console.log('');
  console.log('✅ **Current Implementation:**');
  console.log('   • IntaSend now passes masterclass_title in extra data');
  console.log('   • Webhook falls back to Google Calendar if title missing');
  console.log('   • Stripe already passes title in metadata');
  console.log('   • Sanity schema uses masterclassTitle for preview');
  console.log('');
  console.log('🔧 **If titles still show as IDs:**');
  console.log('   1. Complete a new test payment');
  console.log('   2. Check webhook logs for title extraction');
  console.log('   3. Verify Google Calendar event has proper title');
  console.log('   4. Refresh Sanity Studio to see updated data');
  console.log('');
  console.log('📊 **In Sanity Studio you should see:**');
  console.log('   • "Advanced React Patterns MasterClass" (not abc123def)');
  console.log('   • "Student: John" as subtitle');
  console.log('   • Meaningful document titles in lists');

  console.log('\n✅ MasterClass title testing completed!\n');

  console.log('🎯 Next steps:');
  console.log('1. Complete a test payment to verify title extraction');
  console.log('2. Check Sanity Studio for improved display');
  console.log('3. Verify webhook logs show proper title handling');
  console.log('4. Confirm Google Calendar titles are descriptive\n');

  console.log('💡 Pro tip: Use descriptive MasterClass titles in Google Calendar:');
  console.log('   ✅ "Advanced React Patterns MasterClass"');
  console.log('   ❌ "Meeting" or "Event"');
}

// Run the test
testMasterClassTitles().catch(console.error);
