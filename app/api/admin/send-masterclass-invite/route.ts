import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sendMasterClassInvite } from "@/lib/googleCalendarInvite";
import { getMasterClasses } from "@/lib/googleCalendar";
import { getMasterClassEnrollments } from "@/sanity/lib/masterclass/getMasterClassEnrollments";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Add admin role check here
    // For now, any authenticated user can use this (you might want to restrict this)

    const body = await request.json();
    const { masterclassId, email, firstName, lastName } = body;

    if (!masterclassId || !email) {
      return NextResponse.json(
        { error: "MasterClass ID and email are required" },
        { status: 400 }
      );
    }

    // Get the MasterClass details
    const masterClasses = await getMasterClasses();
    const masterClass = masterClasses.find(mc => mc.id === masterclassId);

    if (!masterClass) {
      return NextResponse.json(
        { error: "MasterClass not found" },
        { status: 404 }
      );
    }

    // Send the invite
    const inviteSuccess = await sendMasterClassInvite({
      email,
      firstName: firstName || 'Student',
      lastName: lastName || '',
      masterClass
    });

    if (inviteSuccess) {
      return NextResponse.json({
        success: true,
        message: "Google Calendar invite sent successfully",
        data: {
          email,
          masterClassId,
          masterClassTitle: masterClass.title
        }
      });
    } else {
      return NextResponse.json(
        { error: "Failed to send Google Calendar invite" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Error in send-masterclass-invite API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to send invites to all enrolled students
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const masterclassId = searchParams.get('masterclassId');

    if (!masterclassId) {
      return NextResponse.json(
        { error: "MasterClass ID is required" },
        { status: 400 }
      );
    }

    // Get the MasterClass details
    const masterClasses = await getMasterClasses();
    const masterClass = masterClasses.find(mc => mc.id === masterclassId);

    if (!masterClass) {
      return NextResponse.json(
        { error: "MasterClass not found" },
        { status: 404 }
      );
    }

    // Get all enrollments for this MasterClass
    const enrollments = await getMasterClassEnrollments();
    const masterClassEnrollments = enrollments.filter(
      enrollment => enrollment.masterclassId === masterclassId && enrollment.status === 'active'
    );

    console.log(`Found ${masterClassEnrollments.length} active enrollments for MasterClass ${masterclassId}`);

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    // Send invite to each enrolled student
    for (const enrollment of masterClassEnrollments) {
      try {
        const inviteSuccess = await sendMasterClassInvite({
          email: enrollment.student.email,
          firstName: enrollment.student.firstName || 'Student',
          lastName: enrollment.student.lastName || '',
          masterClass
        });

        if (inviteSuccess) {
          successCount++;
          results.push({
            email: enrollment.student.email,
            status: 'success',
            message: 'Invite sent successfully'
          });
        } else {
          failureCount++;
          results.push({
            email: enrollment.student.email,
            status: 'failed',
            message: 'Failed to send invite'
          });
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        failureCount++;
        results.push({
          email: enrollment.student.email,
          status: 'error',
          message: `Error: ${error.message}`
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${masterClassEnrollments.length} enrollments`,
      summary: {
        total: masterClassEnrollments.length,
        successful: successCount,
        failed: failureCount
      },
      results
    });

  } catch (error) {
    console.error("Error in bulk send-masterclass-invite API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
