"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getMasterClasses } from "@/lib/googleCalendar";
import { convertToKes, convertToUsdCents, isSupportedCurrency, type SupportedCurrency } from "@/lib/currency";

export type PaymentMethod = "intasend" | "stripe";

export async function createMasterClassCheckout(
  masterclassId: string,
  paymentMethod: PaymentMethod = "intasend"
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    console.log("Starting MasterClass checkout for:", { masterclassId, paymentMethod, userId });

    // Get masterclass details from Google Calendar
    const masterClasses = await getMasterClasses();
    console.log("Retrieved masterClasses:", masterClasses.length);

    const masterClass = masterClasses.find(mc => mc.id === masterclassId);
    console.log("Found masterClass:", masterClass ? "Yes" : "No");

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

    if (!masterClass.isPremium || masterClass.isFree) {
      throw new Error("This MasterClass is free and doesn't require payment");
    }

    if (!masterClass.price || masterClass.price <= 0) {
      throw new Error("Invalid MasterClass price");
    }

    // Create a unique API reference for tracking
    const apiRef = `masterclass-${masterclassId}-${userId}-${Date.now()}`;
    console.log("Created API ref:", apiRef);

    if (paymentMethod === "intasend") {
      console.log("Processing IntaSend payment...");

      // Convert price to KES for IntaSend
      let priceInKes = masterClass.price;
      const masterClassCurrency = masterClass.currency || "KES";
      console.log("Original price:", priceInKes, masterClassCurrency);

      if (masterClassCurrency !== "KES") {
        console.log("Converting currency to KES...");
        if (isSupportedCurrency(masterClassCurrency)) {
          priceInKes = convertToKes(masterClass.price, masterClassCurrency as SupportedCurrency);
          console.log("Converted price:", priceInKes, "KES");
        } else {
          // Fallback for unsupported currencies - assume USD
          priceInKes = convertToKes(masterClass.price, "USD");
          console.warn(`Unsupported currency ${masterClassCurrency}, treating as USD`);
        }
      }

      // Create IntaSend checkout with masterclass-specific data
      console.log("Creating IntaSend checkout with:", { priceInKes, apiRef });

      const result = await createMasterClassIntaSendCheckout({
        masterClass,
        userId,
        priceInKes,
        apiRef
      });

      console.log("IntaSend checkout created successfully");
      return result;
    } else {
      console.log("Processing Stripe payment...");

      // Convert price to USD cents for Stripe
      let priceInCents = masterClass.price * 100; // Default assume USD
      const masterClassCurrency = masterClass.currency || "KES";
      console.log("Original price:", masterClass.price, masterClassCurrency);

      if (masterClassCurrency !== "USD") {
        console.log("Converting currency to USD cents...");
        if (isSupportedCurrency(masterClassCurrency)) {
          priceInCents = convertToUsdCents(masterClass.price, masterClassCurrency as SupportedCurrency);
          console.log("Converted price:", priceInCents, "cents");
        } else {
          // Fallback for unsupported currencies - assume KES
          priceInCents = convertToUsdCents(masterClass.price, "KES");
          console.warn(`Unsupported currency ${masterClassCurrency}, treating as KES`);
        }
      }

      // Create Stripe checkout with masterclass-specific data
      console.log("Creating Stripe checkout with:", { priceInCents, apiRef });

      const result = await createMasterClassStripeCheckout({
        masterClass,
        userId,
        priceInCents,
        apiRef
      });

      console.log("Stripe checkout created successfully");
      return result;
    }
  } catch (error: any) {
    // Check if this is a Next.js redirect (which is expected)
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      // Re-throw redirect errors so Next.js can handle them
      throw error;
    }

    console.error("Error in createMasterClassCheckout:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      masterclassId,
      paymentMethod,
      userId
    });
    throw new Error(`Failed to create MasterClass checkout session: ${error?.message || 'Unknown error'}`);
  }
}

// Helper function for IntaSend masterclass checkout
async function createMasterClassIntaSendCheckout({
  masterClass,
  userId,
  priceInKes,
  apiRef
}: {
  masterClass: any;
  userId: string;
  priceInKes: number;
  apiRef: string;
}) {
  const { createIntaSendInstance } = await import("@/lib/instasend");
  const { clerkClient } = await import("@clerk/nextjs/server");
  const { createStudentIfNotExists } = await import("@/sanity/lib/student/createStudentIfNotExists");
  const baseUrl = (await import("@/lib/baseUrl")).default;

  try {
    console.log("Getting user details from Clerk...");

    // Get user details from Clerk
    const clerkUser = await (await clerkClient()).users.getUser(userId);
    const { emailAddresses, firstName, lastName, imageUrl } = clerkUser;
    const email = emailAddresses[0]?.emailAddress;

    console.log("User details:", { email, firstName, lastName });

    if (!email) {
      throw new Error("User email not found");
    }

    console.log("Creating student in Sanity...");

    // Create student in Sanity if doesn't exist
    await createStudentIfNotExists({
      clerkId: userId,
      email,
      firstName: firstName || email,
      lastName: lastName || "",
      imageUrl: imageUrl || "",
    });

    console.log("Creating IntaSend instance...");

    // Create IntaSend checkout
    const intasend = createIntaSendInstance();

    console.log("Creating IntaSend collection...");
    const collection = intasend.collection();

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
      extra: {
        masterclass_id: masterClass.id,
        masterclass_title: masterClass.title,
        user_id: userId,
        type: "masterclass"
      }
    });

    console.log("IntaSend checkout response:", checkoutResponse);

    if (!checkoutResponse.url) {
      throw new Error("Failed to create IntaSend checkout URL");
    }

    console.log("Redirecting to:", checkoutResponse.url);

    // Redirect to IntaSend checkout
    redirect(checkoutResponse.url);
  } catch (error) {
    console.error("IntaSend MasterClass checkout error:", error);
    throw new Error("Failed to create IntaSend checkout");
  }
}

// Helper function for Stripe masterclass checkout
async function createMasterClassStripeCheckout({
  masterClass,
  userId,
  priceInCents,
  apiRef
}: {
  masterClass: any;
  userId: string;
  priceInCents: number;
  apiRef: string;
}) {
  const stripe = (await import("stripe")).default;
  const { clerkClient } = await import("@clerk/nextjs/server");
  const { createStudentIfNotExists } = await import("@/sanity/lib/student/createStudentIfNotExists");
  const baseUrl = (await import("@/lib/baseUrl")).default;

  try {
    // Get user details from Clerk
    const clerkUser = await (await clerkClient()).users.getUser(userId);
    const { emailAddresses, firstName, lastName, imageUrl } = clerkUser;
    const email = emailAddresses[0]?.emailAddress;

    if (!email) {
      throw new Error("User email not found");
    }

    // Create student in Sanity if doesn't exist
    await createStudentIfNotExists({
      clerkId: userId,
      email,
      firstName: firstName || email,
      lastName: lastName || "",
      imageUrl: imageUrl || "",
    });

    // Initialize Stripe
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia",
    });

    // Create Stripe checkout session
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: masterClass.title,
              description: `MasterClass with ${masterClass.instructor || 'Expert Instructor'}`,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/masterclasses/${masterClass.id}?payment=success`,
      cancel_url: `${baseUrl}/masterclasses/${masterClass.id}?payment=cancelled`,
      customer_email: email,
      metadata: {
        masterclass_id: masterClass.id,
        masterclass_title: masterClass.title,
        user_id: userId,
        type: "masterclass",
        api_ref: apiRef,
      },
    });

    if (!session.url) {
      throw new Error("Failed to create Stripe checkout URL");
    }

    // Redirect to Stripe checkout
    redirect(session.url);
  } catch (error) {
    console.error("Stripe MasterClass checkout error:", error);
    throw new Error("Failed to create Stripe checkout");
  }
}
