import { groq } from "next-sanity";
import { sanityFetch } from "../live";

export interface MasterClassEnrollment {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  masterclassId: string;
  masterclassTitle: string;
  enrolledAt: string;
  paymentId?: string;
  amount?: number;
  currency?: string;
  status: "active" | "cancelled" | "completed";
  accessGranted: boolean;
  attendanceStatus: "registered" | "attended" | "no_show";
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    clerkId: string;
  };
}

export async function getMasterClassEnrollments(clerkId?: string): Promise<MasterClassEnrollment[]> {
  try {
    let query: string;
    let params: any = {};

    if (clerkId) {
      // Get enrollments for a specific student
      query = groq`*[_type == "masterclassEnrollment" && student->clerkId == $clerkId] {
        _id,
        _createdAt,
        _updatedAt,
        masterclassId,
        masterclassTitle,
        enrolledAt,
        paymentId,
        amount,
        currency,
        status,
        accessGranted,
        attendanceStatus,
        student-> {
          _id,
          firstName,
          lastName,
          email,
          clerkId
        }
      } | order(enrolledAt desc)`;
      params = { clerkId };
    } else {
      // Get all enrollments
      query = groq`*[_type == "masterclassEnrollment"] {
        _id,
        _createdAt,
        _updatedAt,
        masterclassId,
        masterclassTitle,
        enrolledAt,
        paymentId,
        amount,
        currency,
        status,
        accessGranted,
        attendanceStatus,
        student-> {
          _id,
          firstName,
          lastName,
          email,
          clerkId
        }
      } | order(enrolledAt desc)`;
    }

    const result = await sanityFetch({
      query,
      params,
    });

    return result.data || [];
  } catch (error) {
    console.error("Error fetching masterclass enrollments:", error);
    return [];
  }
}

export async function getMasterClassEnrollmentsByStatus(
  status: "active" | "cancelled" | "completed",
  clerkId?: string
): Promise<MasterClassEnrollment[]> {
  try {
    let query: string;
    let params: any = { status };

    if (clerkId) {
      query = groq`*[_type == "masterclassEnrollment" && status == $status && student->clerkId == $clerkId] {
        _id,
        _createdAt,
        _updatedAt,
        masterclassId,
        masterclassTitle,
        enrolledAt,
        paymentId,
        amount,
        currency,
        status,
        accessGranted,
        attendanceStatus,
        student-> {
          _id,
          firstName,
          lastName,
          email,
          clerkId
        }
      } | order(enrolledAt desc)`;
      params.clerkId = clerkId;
    } else {
      query = groq`*[_type == "masterclassEnrollment" && status == $status] {
        _id,
        _createdAt,
        _updatedAt,
        masterclassId,
        masterclassTitle,
        enrolledAt,
        paymentId,
        amount,
        currency,
        status,
        accessGranted,
        attendanceStatus,
        student-> {
          _id,
          firstName,
          lastName,
          email,
          clerkId
        }
      } | order(enrolledAt desc)`;
    }

    const result = await sanityFetch({
      query,
      params,
    });

    return result.data || [];
  } catch (error) {
    console.error("Error fetching masterclass enrollments by status:", error);
    return [];
  }
}

export async function getMasterClassRevenue(): Promise<{
  totalRevenue: number;
  revenueByMasterClass: Array<{
    masterclassId: string;
    masterclassTitle: string;
    totalRevenue: number;
    enrollmentCount: number;
    currency: string;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    enrollments: number;
  }>;
}> {
  try {
    const query = groq`*[_type == "masterclassEnrollment" && amount > 0] {
      masterclassId,
      masterclassTitle,
      amount,
      currency,
      enrolledAt
    }`;

    const result = await sanityFetch({
      query,
      params: {},
    });

    const enrollments = result.data || [];

    // Calculate total revenue (convert everything to KES for simplicity)
    const totalRevenue = enrollments.reduce((sum: number, enrollment: any) => {
      const amount = enrollment.amount || 0;
      // Simple conversion - in production, use proper exchange rates
      const kesAmount = enrollment.currency === 'USD' ? amount * 130 : amount;
      return sum + kesAmount;
    }, 0);

    // Group by masterclass
    const revenueByMasterClass = enrollments.reduce((acc: any, enrollment: any) => {
      const key = enrollment.masterclassId;
      if (!acc[key]) {
        acc[key] = {
          masterclassId: enrollment.masterclassId,
          masterclassTitle: enrollment.masterclassTitle,
          totalRevenue: 0,
          enrollmentCount: 0,
          currency: enrollment.currency,
        };
      }
      acc[key].totalRevenue += enrollment.amount || 0;
      acc[key].enrollmentCount += 1;
      return acc;
    }, {});

    // Group by month
    const revenueByMonth = enrollments.reduce((acc: any, enrollment: any) => {
      const date = new Date(enrollment.enrolledAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          revenue: 0,
          enrollments: 0,
        };
      }
      
      const kesAmount = enrollment.currency === 'USD' ? (enrollment.amount || 0) * 130 : (enrollment.amount || 0);
      acc[monthKey].revenue += kesAmount;
      acc[monthKey].enrollments += 1;
      return acc;
    }, {});

    return {
      totalRevenue,
      revenueByMasterClass: Object.values(revenueByMasterClass),
      revenueByMonth: Object.values(revenueByMonth).sort((a: any, b: any) => a.month.localeCompare(b.month)),
    };
  } catch (error) {
    console.error("Error calculating masterclass revenue:", error);
    return {
      totalRevenue: 0,
      revenueByMasterClass: [],
      revenueByMonth: [],
    };
  }
}
