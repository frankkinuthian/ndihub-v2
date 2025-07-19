import { NextResponse } from "next/server";
import { isEnrolledInCourse } from "@/sanity/lib/student/isEnrolledInCourse";

export async function POST(req: Request) {
  try {
    const { userId, courseId } = await req.json();

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: "Missing userId or courseId" },
        { status: 400 }
      );
    }

    const isEnrolled = await isEnrolledInCourse(userId, courseId);

    return NextResponse.json({ isEnrolled });
  } catch (error) {
    console.error("Error checking enrollment status:", error);
    return NextResponse.json(
      { error: "Failed to check enrollment status" },
      { status: 500 }
    );
  }
}
