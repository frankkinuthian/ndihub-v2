import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { getMasterClasses } from "@/lib/googleCalendar";

// GET - Generate analytics data for Sanity Studio
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Generating analytics data...');

    // Get all MasterClasses from Google Calendar
    const masterClasses = await getMasterClasses();
    console.log(`Found ${masterClasses.length} MasterClasses`);

    // Get all enrollments from Sanity
    const enrollments = await client.fetch(`
      *[_type == "masterclassEnrollment"] {
        _id,
        _createdAt,
        masterclassId,
        masterclassTitle,
        amount,
        currency,
        paymentMethod,
        status,
        student->{firstName, lastName, email}
      }
    `);
    console.log(`Found ${enrollments.length} enrollments`);

    // Calculate total revenue (convert everything to KES for consistency)
    const totalRevenue = enrollments.reduce((sum, enrollment) => {
      if (enrollment.status === 'active' && enrollment.amount) {
        // Convert to KES if needed (rough conversion rates)
        let amountInKES = enrollment.amount;
        if (enrollment.currency === 'USD') {
          amountInKES = enrollment.amount * 130; // Rough USD to KES
        } else if (enrollment.currency === 'EUR') {
          amountInKES = enrollment.amount * 140; // Rough EUR to KES
        }
        return sum + amountInKES;
      }
      return sum;
    }, 0);

    // Calculate revenue by month
    const revenueByMonth = enrollments
      .filter(e => e.status === 'active' && e.amount)
      .reduce((acc, enrollment) => {
        const month = new Date(enrollment._createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        });
        
        let amountInKES = enrollment.amount;
        if (enrollment.currency === 'USD') {
          amountInKES = enrollment.amount * 130;
        } else if (enrollment.currency === 'EUR') {
          amountInKES = enrollment.amount * 140;
        }

        if (!acc[month]) {
          acc[month] = { revenue: 0, enrollments: 0 };
        }
        acc[month].revenue += amountInKES;
        acc[month].enrollments += 1;
        return acc;
      }, {} as Record<string, { revenue: number; enrollments: number }>);

    const revenueByMonthArray = Object.entries(revenueByMonth).map(([month, data]) => ({
      month,
      revenue: Math.round(data.revenue),
      enrollments: data.enrollments,
    }));

    // Calculate top performing MasterClasses
    const masterClassPerformance = enrollments
      .filter(e => e.status === 'active')
      .reduce((acc, enrollment) => {
        const title = enrollment.masterclassTitle || 'Unknown MasterClass';
        if (!acc[title]) {
          acc[title] = { enrollments: 0, revenue: 0 };
        }
        acc[title].enrollments += 1;
        
        let amountInKES = enrollment.amount || 0;
        if (enrollment.currency === 'USD') {
          amountInKES = (enrollment.amount || 0) * 130;
        } else if (enrollment.currency === 'EUR') {
          amountInKES = (enrollment.amount || 0) * 140;
        }
        acc[title].revenue += amountInKES;
        return acc;
      }, {} as Record<string, { enrollments: number; revenue: number }>);

    const topMasterClasses = Object.entries(masterClassPerformance)
      .map(([title, data]) => ({
        title,
        enrollments: data.enrollments,
        revenue: Math.round(data.revenue),
        averageRating: 4.5, // Placeholder - would come from feedback system
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Calculate payment method distribution
    const paymentMethods = enrollments
      .filter(e => e.status === 'active')
      .reduce((acc, enrollment) => {
        const method = enrollment.paymentMethod || 'unknown';
        if (method.toLowerCase().includes('mpesa') || enrollment.currency === 'KES') {
          acc.mpesa += 1;
        } else {
          acc.stripe += 1;
        }
        return acc;
      }, { mpesa: 0, stripe: 0 });

    // Create analytics object
    const analyticsData = {
      _type: 'masterclassAnalytics',
      title: 'MasterClass Performance Analytics',
      reportDate: new Date().toISOString().split('T')[0],
      totalMasterClasses: masterClasses.length,
      totalEnrollments: enrollments.filter(e => e.status === 'active').length,
      totalRevenue: Math.round(totalRevenue),
      revenueByMonth: revenueByMonthArray,
      topMasterClasses,
      paymentMethods,
      lastUpdated: new Date().toISOString(),
    };

    console.log('✅ Analytics data generated:', {
      totalMasterClasses: analyticsData.totalMasterClasses,
      totalEnrollments: analyticsData.totalEnrollments,
      totalRevenue: analyticsData.totalRevenue,
    });

    return NextResponse.json(analyticsData, { status: 200 });

  } catch (error) {
    console.error('❌ Error generating analytics:', error);
    return NextResponse.json(
      { error: 'Failed to generate analytics data' },
      { status: 500 }
    );
  }
}

// POST - Update analytics in Sanity (called from Sanity Studio)
export async function POST(request: NextRequest) {
  try {
    console.log('📊 Updating analytics in Sanity...');

    // Generate fresh analytics data
    const analyticsResponse = await GET(request);
    const analyticsData = await analyticsResponse.json();

    if (!analyticsResponse.ok) {
      throw new Error('Failed to generate analytics data');
    }

    // Check if analytics document exists
    const existingAnalytics = await client.fetch(`
      *[_type == "masterclassAnalytics"] | order(_createdAt desc)[0]
    `);

    let result;
    if (existingAnalytics) {
      // Update existing document
      result = await client
        .patch(existingAnalytics._id)
        .set(analyticsData)
        .commit();
      console.log('✅ Analytics updated in Sanity');
    } else {
      // Create new document
      result = await client.create(analyticsData);
      console.log('✅ Analytics created in Sanity');
    }

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('❌ Error updating analytics in Sanity:', error);
    return NextResponse.json(
      { error: 'Failed to update analytics in Sanity' },
      { status: 500 }
    );
  }
}
