import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { isEnrolledInMasterClass } from "@/sanity/lib/masterclass/isEnrolledInMasterClass";

export async function GET(request: NextRequest) {
  try {
    console.log("Checking enrollment status...");

    const { userId } = await auth();
    console.log("User ID:", userId);

    if (!userId) {
      console.log("No user ID, returning not enrolled");
      return NextResponse.json({ isEnrolled: false }, { status: 200 });
    }

    const { searchParams } = new URL(request.url);
    const masterclassId = searchParams.get('masterclassId');
    console.log("MasterClass ID:", masterclassId);

    if (!masterclassId) {
      console.log("No MasterClass ID provided");
      return NextResponse.json(
        { error: "MasterClass ID is required" },
        { status: 400 }
      );
    }

    console.log("Calling isEnrolledInMasterClass...");
    const isEnrolled = await isEnrolledInMasterClass(userId, masterclassId);
    console.log("Enrollment result:", isEnrolled);

    return NextResponse.json({ isEnrolled }, { status: 200 });
  } catch (error) {
    console.error("Error checking enrollment status:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });

    // Return false instead of error to prevent UI breaking
    return NextResponse.json({ isEnrolled: false }, { status: 200 });
  }
}
