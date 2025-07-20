import { groq } from "next-sanity";
import { sanityFetch } from "../live";

export async function isEnrolledInMasterClass(clerkId: string, masterclassId: string): Promise<boolean> {
  try {
    // First get the student's Sanity document ID using their Clerk ID
    const studentQuery = groq`*[_type == "student" && clerkId == $clerkId][0]._id`;
    const studentId = await sanityFetch({
      query: studentQuery,
      params: { clerkId },
    });

    if (!studentId.data) {
      console.log("No student found with clerkId:", clerkId);
      return false;
    }

    console.log("Checking masterclass enrollment for:", {
      clerkId,
      masterclassId,
      studentId: studentId.data
    });

    // Then check for enrollment using the student's Sanity document ID
    const enrollmentQuery = groq`*[_type == "masterclassEnrollment" && student._ref == $studentId && masterclassId == $masterclassId && status == "active"][0]`;
    const enrollment = await sanityFetch({
      query: enrollmentQuery,
      params: { studentId: studentId.data, masterclassId },
    });

    console.log("MasterClass enrollment query result:", {
      found: !!enrollment.data,
      enrollmentData: enrollment.data
    });

    return !!enrollment.data;
  } catch (error) {
    console.error("Error checking masterclass enrollment:", error);
    return false;
  }
}
