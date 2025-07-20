import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getMasterClasses } from "@/lib/googleCalendar";
import { google } from "googleapis";

// GET - List all MasterClasses with pricing
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Add admin role check here
    // For now, any authenticated user can view (might want to restrict this)

    const masterClasses = await getMasterClasses();

    const pricingData = masterClasses.map(mc => ({
      id: mc.id,
      title: mc.title,
      instructor: mc.instructor,
      startTime: mc.startTime,
      endTime: mc.endTime,
      isPremium: mc.isPremium,
      isFree: mc.isFree,
      price: mc.price,
      currency: mc.currency,
      status: mc.status,
      maxAttendees: mc.maxAttendees,
      attendees: mc.attendees
    }));

    return NextResponse.json({
      success: true,
      data: pricingData,
      total: pricingData.length
    });

  } catch (error) {
    console.error("Error fetching MasterClass pricing:", error);
    return NextResponse.json(
      { error: "Failed to fetch MasterClass pricing" },
      { status: 500 }
    );
  }
}

// PUT - Update MasterClass pricing
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Add admin role check here

    const body = await request.json();
    const { masterclassId, price, currency, isPremium, isFree } = body;

    if (!masterclassId) {
      return NextResponse.json(
        { error: "MasterClass ID is required" },
        { status: 400 }
      );
    }

    // Initialize Google Calendar API
    const credentials = {
      type: "service_account",
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    };

    const auth_client = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
      ],
    });

    const calendar = google.calendar({ version: 'v3', auth: auth_client });

    // Get the current event
    const event = await calendar.events.get({
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      eventId: masterclassId,
    });

    if (!event.data) {
      return NextResponse.json(
        { error: "MasterClass event not found" },
        { status: 404 }
      );
    }

    // Parse current description
    let description = event.data.description || '';
    
    // Remove existing pricing lines
    description = description
      .replace(/Price:.*$/gm, '')
      .replace(/Premium.*$/gm, '')
      .replace(/Free.*$/gm, '')
      .replace(/^\s*$/gm, '') // Remove empty lines
      .trim();

    // Add new pricing information
    const lines = description.split('\n');
    const metadataEndIndex = lines.findIndex(line => 
      !line.match(/^(Instructor:|Max:|Limit:|Capacity:|Register:)/i)
    );

    const insertIndex = metadataEndIndex === -1 ? lines.length : metadataEndIndex;

    // Insert pricing information
    if (isFree) {
      lines.splice(insertIndex, 0, 'Free');
    } else if (isPremium && price && price > 0) {
      lines.splice(insertIndex, 0, `Price: ${currency || 'KES'} ${price}`);
      lines.splice(insertIndex + 1, 0, 'Premium');
    }

    const updatedDescription = lines.join('\n').trim();

    // Update the event
    await calendar.events.update({
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      eventId: masterclassId,
      requestBody: {
        ...event.data,
        description: updatedDescription,
      },
    });

    console.log('MasterClass pricing updated:', {
      masterclassId,
      price,
      currency,
      isPremium,
      isFree
    });

    return NextResponse.json({
      success: true,
      message: "MasterClass pricing updated successfully",
      data: {
        masterclassId,
        price,
        currency,
        isPremium,
        isFree,
        updatedDescription
      }
    });

  } catch (error: unknown) {
    console.error("Error updating MasterClass pricing:", error);

    const errorObj = error as any;
    console.error("Error details:", {
      message: errorObj?.message,
      status: errorObj?.status,
      code: errorObj?.code,
    });

    // Provide specific error messages based on the error type
    if (errorObj?.status === 403 || errorObj?.code === 403) {
      return NextResponse.json(
        {
          error: "Permission denied. Please ensure the service account has 'Make changes to events' permission on the calendar.",
          details: "Go to Google Calendar → Settings → Share with specific people → Add service account email with 'Make changes to events' permission"
        },
        { status: 403 }
      );
    } else if (errorObj?.message?.includes('Calendar API has not been used')) {
      return NextResponse.json(
        {
          error: "Google Calendar API not enabled",
          details: "Enable Google Calendar API in Google Cloud Console"
        },
        { status: 400 }
      );
    } else if (errorObj?.message?.includes('Not found')) {
      return NextResponse.json(
        {
          error: "MasterClass event not found",
          details: "The event may have been deleted or the ID is incorrect"
        },
        { status: 404 }
      );
    } else {
      return NextResponse.json(
        {
          error: "Failed to update MasterClass pricing",
          details: errorObj?.message || "Unknown error occurred"
        },
        { status: 500 }
      );
    }
  }
}
