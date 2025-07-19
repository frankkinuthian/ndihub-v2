"use server";

import { createIntaSendInstance } from "@/lib/instasend";
import { convertToKes, isSupportedCurrency, type SupportedCurrency } from "@/lib/currency";
import baseUrl from "@/lib/baseUrl";

import { urlFor } from "@/sanity/lib/image";
import getCourseById from "@/sanity/lib/courses/getCourseById";
import { createStudentIfNotExists } from "@/sanity/lib/student/createStudentIfNotExists";
import { clerkClient } from "@clerk/nextjs/server";
import { createEnrollment } from "@/sanity/lib/student/createEnrollment";

export async function createIntaSendCheckout(courseId: string, userId: string) {
  try {
    // 1. Query course details from Sanity
    const course = await getCourseById(courseId);
    const clerkUser = await (await clerkClient()).users.getUser(userId);
    const { emailAddresses, firstName, lastName, imageUrl } = clerkUser;
    const email = emailAddresses[0]?.emailAddress;

    if (!emailAddresses || !email) {
      throw new Error("User details not found");
    }



    if (!course) {
      throw new Error("Course not found");
    }

    // mid step - create a user in sanity if it doesn't exist
    const user = await createStudentIfNotExists({
      clerkId: userId,
      email: email || "",
      firstName: firstName || email,
      lastName: lastName || "",
      imageUrl: imageUrl || "",
    });

    if (!user) {
      throw new Error("User not found");
    }

    // 2. Validate course data and prepare price for IntaSend
    if (!course.price && course.price !== 0) {
      throw new Error("Course price is not set");
    }

    // if course is free, create enrollment and redirect to course page (BYPASS INTASEND CHECKOUT)
    if (course.price === 0) {
      await createEnrollment({
        studentId: user._id,
        courseId: course._id,
        paymentId: "free",
        amount: 0,
        currency: course.currency || "KES",
      });

      return { url: `/courses/${course.slug?.current}` };
    }

    const { title, description, image, slug } = course;

    if (!title || !description || !image || !slug) {
      throw new Error("Course data is incomplete");
    }

    // 3. Handle currency conversion to KES for IntaSend
    const courseCurrency = course.currency || "KES";
    let priceInKes: number;

    if (isSupportedCurrency(courseCurrency)) {
      priceInKes = convertToKes(course.price, courseCurrency as SupportedCurrency);
    } else {
      // Fallback for unsupported currencies - assume USD
      priceInKes = convertToKes(course.price, "USD");
      console.warn(`Unsupported currency ${courseCurrency}, treating as USD`);
    }



    // 4. Create and configure IntaSend Checkout with course details
    const intasend = createIntaSendInstance();
    const collection = intasend.collection();
    
    const checkoutResponse = await collection.charge({
      first_name: firstName || "Student",
      last_name: lastName || "",
      email: email,
      host: baseUrl,
      amount: priceInKes,
      currency: "KES",
      api_ref: `course-${course._id}-${userId}-${Date.now()}`,
      redirect_url: `${baseUrl}/courses/${slug.current}`,
      comment: `Enrollment for ${title}`,
    });

    // 5. Return checkout URL for client redirect
    return { 
      url: checkoutResponse.url,
      paymentId: checkoutResponse.id,
      apiRef: checkoutResponse.api_ref 
    };
  } catch (error: any) {
    console.error("Error in createIntaSendCheckout:", error);

    // If it's a Buffer (IntaSend API error), convert to string for better debugging
    if (error instanceof Buffer) {
      const errorMessage = error.toString('utf8');
      console.error("IntaSend API Error (Buffer):", errorMessage);
    }

    throw new Error("Failed to create IntaSend checkout session");
  }
}
