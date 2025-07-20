import { NextResponse } from "next/server";
import { getUpcomingMasterClasses } from "@/lib/googleCalendar";

export async function GET() {
  try {
    const masterClasses = await getUpcomingMasterClasses();
    
    return NextResponse.json({
      success: true,
      data: masterClasses,
      count: masterClasses.length
    });
  } catch (error) {
    console.error("Error fetching masterclasses:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch masterclasses",
        data: []
      },
      { status: 500 }
    );
  }
}
