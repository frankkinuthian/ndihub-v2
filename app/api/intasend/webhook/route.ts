import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getStudentByClerkId } from "@/sanity/lib/student/getStudentByClerkId";
import { createEnrollment } from "@/sanity/lib/student/createEnrollment";
import crypto from "crypto";

// IntaSend webhook challenge for verification
const webhookChallenge = process.env.INTASEND_WEBHOOK_CHALLENGE;

// IntaSend webhook payload interface
interface IntaSendWebhookPayload {
  invoice_id: string;
  state: "PENDING" | "PROCESSING" | "COMPLETE" | "FAILED";
  provider: string;
  charges: string;
  net_amount: string;
  currency: string;
  value: string;
  account: string;
  api_ref: string;
  host: string;
  failed_reason?: string;
  failed_code?: string;
  failed_code_link?: string;
  created_at: string;
  updated_at: string;
  challenge: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();

    // Parse the webhook payload
    const payload: IntaSendWebhookPayload = JSON.parse(body);

    // Verify the webhook challenge
    if (webhookChallenge && payload.challenge !== webhookChallenge) {
      console.error("IntaSend webhook challenge verification failed");
      return new NextResponse("Invalid challenge", { status: 401 });
    }

    // Log the webhook for debugging (remove in production)
    console.log("IntaSend webhook received:", {
      invoice_id: payload.invoice_id,
      state: payload.state,
      api_ref: payload.api_ref,
      amount: payload.net_amount,
      currency: payload.currency
    });

    // Handle the payment completion event
    if (payload.state === "COMPLETE") {
      // Extract course and user information from api_ref
      // Format: course-{courseId}-{userId}-{timestamp}
      const apiRef = payload.api_ref;

      if (!apiRef || !apiRef.startsWith("course-")) {
        console.error("Invalid api_ref format:", apiRef);
        return new NextResponse("Invalid api_ref format", { status: 400 });
      }

      // Better parsing: find the user ID pattern and timestamp
      const userIdMatch = apiRef.match(/-(user_[^-]+)-(\d+)$/);
      if (!userIdMatch) {
        console.error("Could not extract userId from api_ref:", apiRef);
        return new NextResponse("Invalid api_ref format", { status: 400 });
      }

      const userId = userIdMatch[1]; // user_2unmpymSS0WRkqHBOxzDvEwZ28x
      const timestamp = userIdMatch[2]; // 1752968453226

      // Extract courseId by removing the prefix and suffix
      const courseId = apiRef
        .replace("course-", "") // Remove prefix
        .replace(`-${userId}-${timestamp}`, ""); // Remove suffix

      console.log("Parsed webhook data:", {
        apiRef,
        courseId,
        userId,
        timestamp
      });

      if (!courseId || !userId) {
        console.error("Missing course or user ID:", { courseId, userId });
        return new NextResponse("Missing course or user ID", { status: 400 });
      }

      // Find the student by Clerk ID
      console.log("Looking for student with clerkId:", userId);
      const student = await getStudentByClerkId(userId);

      if (!student) {
        console.error("Student not found for userId:", userId);
        console.error("Make sure student exists in Sanity with clerkId:", userId);
        return new NextResponse("Student not found", { status: 400 });
      }

      console.log("Found student:", {
        studentId: student._id,
        clerkId: student.clerkId,
        email: student.email
      });

      // Create an enrollment record in Sanity
      const enrollmentData = {
        studentId: student._id,
        courseId,
        paymentId: payload.invoice_id,
        amount: parseFloat(payload.net_amount), // Convert string to number
        currency: payload.currency, // IntaSend provides currency in the payload
      };

      console.log("Creating enrollment:", enrollmentData);

      const enrollmentResult = await createEnrollment(enrollmentData);

      console.log("Enrollment created successfully:", {
        paymentId: payload.invoice_id,
        enrollmentId: enrollmentResult._id,
        studentId: student._id,
        courseId: courseId
      });
      return new NextResponse(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Handle failed payments
    if (payload.state === "FAILED") {
      console.log("IntaSend payment failed:", {
        invoice_id: payload.invoice_id,
        api_ref: payload.api_ref,
        failed_reason: payload.failed_reason,
        failed_code: payload.failed_code
      });
      return new NextResponse(JSON.stringify({
        success: true,
        message: "Failed payment logged"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Handle other states (PENDING, PROCESSING)
    console.log("IntaSend webhook - other state:", payload.state);
    return new NextResponse(JSON.stringify({
      success: true,
      message: `State ${payload.state} acknowledged`
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error in IntaSend webhook handler:", error);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }
}
