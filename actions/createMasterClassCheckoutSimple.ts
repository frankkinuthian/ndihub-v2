"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getMasterClasses } from "@/lib/googleCalendar";
import { createIntaSendInstance } from "@/lib/instasend";
import { clerkClient } from "@clerk/nextjs/server";
import { createStudentIfNotExists } from "@/sanity/lib/student/createStudentIfNotExists";
import baseUrl from "@/lib/baseUrl";

export type PaymentMethod = "intasend" | "stripe";

export async function createMasterClassCheckoutSimple(
  masterclassId: string,
  paymentMethod: PaymentMethod = "intasend"
) {
  console.log("🚀 Starting simple MasterClass checkout...");
  console.log("Parameters:", { masterclassId, paymentMethod });

  try {
    // 1. Check authentication
    const { userId } = await auth();
    console.log("User ID:", userId);

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // 2. Get MasterClass details
    console.log("Fetching MasterClasses...");
    const masterClasses = await getMasterClasses();
    console.log(`Found ${masterClasses.length} MasterClasses`);

    const masterClass = masterClasses.find(mc => mc.id === masterclassId);
    console.log("MasterClass found:", !!masterClass);

    if (!masterClass) {
      throw new Error("MasterClass not found");
    }

    console.log("MasterClass details:", {
      id: masterClass.id,
      title: masterClass.title,
      isPremium: masterClass.isPremium,
      isFree: masterClass.isFree,
      price: masterClass.price,
      currency: masterClass.currency
    });

    // 3. Validate pricing
    if (!masterClass.isPremium || masterClass.isFree) {
      throw new Error("This MasterClass is free and doesn't require payment");
    }

    if (!masterClass.price || masterClass.price <= 0) {
      throw new Error("Invalid MasterClass price");
    }

    // 4. Get user details
    console.log("Getting user details from Clerk...");
    const clerkUser = await (await clerkClient()).users.getUser(userId);
    const { emailAddresses, firstName, lastName, imageUrl } = clerkUser;
    const email = emailAddresses[0]?.emailAddress;

    console.log("User details:", { email, firstName, lastName });

    if (!email) {
      throw new Error("User email not found");
    }

    // 5. Create student in Sanity
    console.log("Creating student in Sanity...");
    await createStudentIfNotExists({
      clerkId: userId,
      email,
      firstName: firstName || email,
      lastName: lastName || "",
      imageUrl: imageUrl || "",
    });

    // 6. For now, only support IntaSend to simplify
    if (paymentMethod !== "intasend") {
      throw new Error("Only IntaSend payments are supported in this simplified version");
    }

    // 7. Prepare checkout data
    const apiRef = `masterclass-${masterclassId}-${userId}-${Date.now()}`;
    const priceInKes = masterClass.price; // Assume KES for now

    console.log("Checkout details:", {
      apiRef,
      priceInKes,
      currency: "KES",
      baseUrl
    });

    const checkoutData = {
      amount: priceInKes,
      currency: "KES",
      email,
      first_name: firstName || "Student",
      last_name: lastName || "",
      api_ref: apiRef,
      redirect_url: `${baseUrl}/masterclasses/${masterClass.id}?payment=success`,
      webhook_url: `${baseUrl}/api/intasend/webhook`,
      extra: {
        masterclass_id: masterClass.id,
        masterclass_title: masterClass.title,
        user_id: userId,
        type: "masterclass"
      }
    };

    console.log("Creating IntaSend checkout with data:", checkoutData);

    // 8. Create IntaSend checkout
    const intasend = createIntaSendInstance();
    console.log("IntaSend instance created");

    const collection = intasend.collection();
    console.log("IntaSend collection created");

    const checkoutResponse = await collection.charge({
      first_name: firstName || "Student",
      last_name: lastName || "",
      email: email,
      host: baseUrl,
      amount: priceInKes,
      currency: "KES",
      api_ref: apiRef,
      redirect_url: `${baseUrl}/masterclasses/${masterClass.id}?payment=success`,
      comment: `Enrollment for ${masterClass.title}`,
    });

    console.log("IntaSend checkout response:", checkoutResponse);

    if (!checkoutResponse.url) {
      throw new Error("Failed to create IntaSend checkout URL");
    }

    console.log("Redirecting to:", checkoutResponse.url);

    // 9. Redirect to checkout
    redirect(checkoutResponse.url);

  } catch (error: any) {
    // Check if this is a Next.js redirect (which is expected)
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      // Re-throw redirect errors so Next.js can handle them
      throw error;
    }

    console.error("❌ Error in createMasterClassCheckoutSimple:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      masterclassId,
      paymentMethod
    });

    // Re-throw with more specific error message
    throw new Error(`MasterClass checkout failed: ${error?.message || 'Unknown error'}`);
  }
}
