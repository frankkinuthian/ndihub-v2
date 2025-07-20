import { NextResponse } from "next/server";
import { getStudentByClerkId } from "@/sanity/lib/student/getStudentByClerkId";
import { createEnrollment } from "@/sanity/lib/student/createEnrollment";
import { createMasterClassEnrollment } from "@/sanity/lib/masterclass/createMasterClassEnrollment";
import { sendMasterClassEmailInvite } from "@/lib/emailService";
import { getMasterClasses } from "@/lib/googleCalendar";

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
  extra?: {
    masterclass_id?: string;
    masterclass_title?: string;
    user_id?: string;
    type?: string;
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.text();

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
      // Extract information from api_ref
      // Format: course-{courseId}-{userId}-{timestamp} OR masterclass-{masterclassId}-{userId}-{timestamp}
      const apiRef = payload.api_ref;

      if (!apiRef || (!apiRef.startsWith("course-") && !apiRef.startsWith("masterclass-"))) {
        console.error("Invalid api_ref format:", apiRef);
        return new NextResponse("Invalid api_ref format", { status: 400 });
      }

      const isMasterClass = apiRef.startsWith("masterclass-");

      // Better parsing: find the user ID pattern and timestamp
      const userIdMatch = apiRef.match(/-(user_[^-]+)-(\d+)$/);
      if (!userIdMatch) {
        console.error("Could not extract userId from api_ref:", apiRef);
        return new NextResponse("Invalid api_ref format", { status: 400 });
      }

      const userId = userIdMatch[1]; // user_2unmpymSS0WRkqHBOxzDvEwZ28x
      const timestamp = userIdMatch[2]; // 1752968453226

      // Extract ID by removing the prefix and suffix
      let itemId: string;
      if (isMasterClass) {
        itemId = apiRef
          .replace("masterclass-", "") // Remove prefix
          .replace(`-${userId}-${timestamp}`, ""); // Remove suffix
      } else {
        itemId = apiRef
          .replace("course-", "") // Remove prefix
          .replace(`-${userId}-${timestamp}`, ""); // Remove suffix
      }

      console.log("Parsed webhook data:", {
        apiRef,
        type: isMasterClass ? "masterclass" : "course",
        itemId,
        userId,
        timestamp
      });

      if (!itemId || !userId) {
        console.error("Missing item or user ID:", { itemId, userId, type: isMasterClass ? "masterclass" : "course" });
        return new NextResponse("Missing item or user ID", { status: 400 });
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

      if (isMasterClass) {
        // Create MasterClass enrollment
        let masterClassTitle = payload.extra?.masterclass_title;

        // Get the best available title using our helper function
        const { getMasterClassTitle } = await import("@/lib/googleCalendarEvent");
        masterClassTitle = await getMasterClassTitle(itemId, masterClassTitle);

        const masterClassEnrollmentData = {
          studentId: student._id,
          masterclassId: itemId,
          masterclassTitle: masterClassTitle,
          paymentId: payload.invoice_id,
          amount: parseFloat(payload.net_amount),
          currency: payload.currency,
        };

        console.log("Creating MasterClass enrollment:", masterClassEnrollmentData);

        const enrollmentResult = await createMasterClassEnrollment(masterClassEnrollmentData);

        console.log("MasterClass enrollment created successfully:", {
          paymentId: payload.invoice_id,
          enrollmentId: enrollmentResult._id,
          studentId: student._id,
          masterclassId: itemId
        });

        // Send email invite with calendar attachment
        try {
          console.log("Sending email invite with calendar attachment for MasterClass...");

          // Get the full MasterClass details
          const masterClasses = await getMasterClasses();
          const masterClass = masterClasses.find(mc => mc.id === itemId);

          if (masterClass) {
            const inviteSuccess = await sendMasterClassEmailInvite({
              email: student.email || '',
              firstName: student.firstName || 'Student',
              lastName: student.lastName || '',
              masterClass: masterClass
            });

            if (inviteSuccess) {
              console.log("Email invite with calendar attachment sent successfully:", {
                email: student.email,
                masterClassId: itemId,
                masterClassTitle: masterClass.title
              });
            } else {
              console.warn("Failed to send email invite, but enrollment still successful");
            }
          } else {
            console.warn("MasterClass not found for invite, but enrollment still successful");
          }
        } catch (inviteError) {
          console.error("Error sending email invite:", inviteError);
          // Don't fail the webhook - enrollment is still successful
        }
      } else {
        // Create course enrollment
        const enrollmentData = {
          studentId: student._id,
          courseId: itemId,
          paymentId: payload.invoice_id,
          amount: parseFloat(payload.net_amount),
          currency: payload.currency,
        };

        console.log("Creating course enrollment:", enrollmentData);

        const enrollmentResult = await createEnrollment(enrollmentData);

        console.log("Course enrollment created successfully:", {
          paymentId: payload.invoice_id,
          enrollmentId: enrollmentResult._id,
          studentId: student._id,
          courseId: itemId
        });
      }
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
