import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStudentByClerkId } from "@/sanity/lib/student/getStudentByClerkId";
import { createEnrollment } from "@/sanity/lib/student/createEnrollment";
import { createMasterClassEnrollment } from "@/sanity/lib/masterclass/createMasterClassEnrollment";
import { sendMasterClassEmailInvite } from "@/lib/emailService";
import { getMasterClasses } from "@/lib/googleCalendar";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as Stripe.LatestApiVersion,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return new NextResponse("No signature found", { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(`Webhook signature verification failed: ${errorMessage}`);

      return new NextResponse(`Webhook Error: ${errorMessage}`, {
        status: 400,
      });
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Check if this is a MasterClass or course payment
      const isMasterClass = session.metadata?.type === "masterclass";
      const courseId = session.metadata?.courseId;
      const masterclassId = session.metadata?.masterclass_id;
      const masterclassTitle = session.metadata?.masterclass_title;
      const userId = session.metadata?.userId || session.metadata?.user_id;

      if (!userId) {
        return new NextResponse("Missing user ID in metadata", { status: 400 });
      }

      if (!isMasterClass && !courseId) {
        return new NextResponse("Missing course ID in metadata", { status: 400 });
      }

      if (isMasterClass && !masterclassId) {
        return new NextResponse("Missing masterclass ID in metadata", { status: 400 });
      }

      const student = await getStudentByClerkId(userId);

      if (!student) {
        return new NextResponse("Student not found", { status: 400 });
      }

      if (isMasterClass) {
        // Get the best available title using our helper function
        const { getMasterClassTitle } = await import("@/lib/googleCalendarEvent");
        const finalMasterclassTitle = await getMasterClassTitle(masterclassId!, masterclassTitle);

        // Create MasterClass enrollment
        await createMasterClassEnrollment({
          studentId: student._id,
          masterclassId: masterclassId!,
          masterclassTitle: finalMasterclassTitle,
          paymentId: session.id,
          amount: session.amount_total! / 100, // Convert from cents to dollars
          currency: session.currency?.toUpperCase() || "USD",
        });

        // Send email invite with calendar attachment
        try {
          console.log("Sending email invite with calendar attachment for MasterClass (Stripe)...");

          // Get the full MasterClass details
          const masterClasses = await getMasterClasses();
          const masterClass = masterClasses.find(mc => mc.id === masterclassId);

          if (masterClass) {
            const inviteSuccess = await sendMasterClassEmailInvite({
              email: student.email || '',
              firstName: student.firstName || 'Student',
              lastName: student.lastName || '',
              masterClass: masterClass
            });

            if (inviteSuccess) {
              console.log("Email invite with calendar attachment sent successfully (Stripe):", {
                email: student.email,
                masterClassId: masterclassId,
                masterClassTitle: masterClass.title
              });
            } else {
              console.warn("Failed to send email invite, but enrollment still successful");
            }
          } else {
            console.warn("MasterClass not found for invite, but enrollment still successful");
          }
        } catch (inviteError) {
          console.error("Error sending email invite (Stripe):", inviteError);
          // Don't fail the webhook - enrollment is still successful
        }
      } else {
        // Create course enrollment
        await createEnrollment({
          studentId: student._id,
          courseId: courseId!,
          paymentId: session.id,
          amount: session.amount_total! / 100, // Convert from cents to dollars
          currency: session.currency?.toUpperCase() || "USD",
        });
      }

      return new NextResponse(null, { status: 200 });
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Error in webhook handler:", error);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }
}
