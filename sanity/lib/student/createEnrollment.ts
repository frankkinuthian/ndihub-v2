import { client } from "../adminClient";

interface CreateEnrollmentParams {
  studentId: string;
  courseId: string;
  paymentId: string;
  amount: number;
  currency?: string;
}

export async function createEnrollment({
  studentId,
  courseId,
  paymentId,
  amount,
  currency = "KES",
}: CreateEnrollmentParams) {
  return client.create({
    _type: "enrollment",
    student: {
      _type: "reference",
      _ref: studentId,
    },
    course: {
      _type: "reference",
      _ref: courseId,
    },
    paymentId,
    amount,
    currency,
    enrolledAt: new Date().toISOString(),
  });
}
