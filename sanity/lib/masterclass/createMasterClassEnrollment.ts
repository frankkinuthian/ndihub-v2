import { client } from "@/sanity/lib/adminClient";

interface MasterClassEnrollmentData {
  studentId: string;
  masterclassId: string;
  masterclassTitle: string;
  paymentId?: string;
  amount?: number;
  currency?: string;
}

export async function createMasterClassEnrollment(data: MasterClassEnrollmentData) {
  try {
    const enrollment = {
      _type: "masterclassEnrollment",
      student: {
        _type: "reference",
        _ref: data.studentId,
      },
      masterclassId: data.masterclassId,
      masterclassTitle: data.masterclassTitle,
      enrolledAt: new Date().toISOString(),
      paymentId: data.paymentId,
      amount: data.amount,
      currency: data.currency || "KES",
      status: "active",
      accessGranted: true,
      attendanceStatus: "registered",
    };

    const result = await client.create(enrollment);
    console.log("MasterClass enrollment created:", result._id);
    return result;
  } catch (error) {
    console.error("Error creating masterclass enrollment:", error);
    throw error;
  }
}
