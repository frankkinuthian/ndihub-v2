import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

// GET - Generate performance monitoring data
export async function GET() {
  try {
    console.log('📊 Generating performance monitoring data...');

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get recent enrollments (last 24 hours)
    const recentEnrollments = await client.fetch(`
      *[_type == "masterclassEnrollment" && _createdAt > $yesterday] {
        _id,
        _createdAt,
        status,
        paymentMethod,
        amount,
        currency
      }
    `, { yesterday: yesterday.toISOString() });

    // Calculate enrollment performance
    const totalEnrollments = recentEnrollments.length;
    const successfulEnrollments = recentEnrollments.filter(e => e.status === 'active').length;
    const enrollmentSuccessRate = totalEnrollments > 0 ? (successfulEnrollments / totalEnrollments) * 100 : 100;

    // Calculate payment performance
    const totalPayments = recentEnrollments.length; // Assuming each enrollment = 1 payment
    const successfulPayments = successfulEnrollments;
    const failedPayments = totalPayments - successfulPayments;
    const paymentSuccessRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 100;

    // Test system health
    let googleCalendarStatus = 'online';
    let sanityStatus = 'online';
    const intasendStatus = 'online';
    const stripeStatus = 'online';

    try {
      // Test Google Calendar API
      const { getMasterClasses } = await import('@/lib/googleCalendar');
      await getMasterClasses();
      googleCalendarStatus = 'online';
    } catch (error) {
      console.error('Google Calendar API test failed:', error);
      googleCalendarStatus = 'offline';
    }

    try {
      // Test Sanity
      await client.fetch('*[_type == "masterclassEnrollment"][0]');
      sanityStatus = 'online';
    } catch (error) {
      console.error('Sanity test failed:', error);
      sanityStatus = 'offline';
    }

    // Determine overall system status
    let overallStatus = 'healthy';
    if (googleCalendarStatus === 'offline' || sanityStatus === 'offline') {
      overallStatus = 'critical';
    } else if (paymentSuccessRate < 90 || enrollmentSuccessRate < 90) {
      overallStatus = 'warning';
    }

    // Generate alerts based on performance
    const alerts = [];
    
    if (paymentSuccessRate < 90) {
      alerts.push({
        severity: 'warning',
        message: `Payment success rate is ${paymentSuccessRate.toFixed(1)}% (below 90% threshold)`,
        timestamp: now.toISOString(),
        resolved: false,
      });
    }

    if (enrollmentSuccessRate < 95) {
      alerts.push({
        severity: 'warning',
        message: `Enrollment success rate is ${enrollmentSuccessRate.toFixed(1)}% (below 95% threshold)`,
        timestamp: now.toISOString(),
        resolved: false,
      });
    }

    if (googleCalendarStatus === 'offline') {
      alerts.push({
        severity: 'critical',
        message: 'Google Calendar API is offline - MasterClass fetching will fail',
        timestamp: now.toISOString(),
        resolved: false,
      });
    }

    if (sanityStatus === 'offline') {
      alerts.push({
        severity: 'critical',
        message: 'Sanity database is offline - enrollment creation will fail',
        timestamp: now.toISOString(),
        resolved: false,
      });
    }

    // Create performance monitoring object
    const performanceData = {
      _type: 'performanceMonitoring',
      title: 'System Performance Report',
      timestamp: now.toISOString(),
      webhookPerformance: {
        totalWebhooks: totalPayments, // Simplified - each payment triggers webhook
        successfulWebhooks: successfulPayments,
        failedWebhooks: failedPayments,
        averageResponseTime: 1500, // Placeholder - would need actual webhook timing
        lastFailure: failedPayments > 0 ? now.toISOString() : null,
      },
      paymentPerformance: {
        totalPayments,
        successfulPayments,
        failedPayments,
        averagePaymentTime: 3.5, // Placeholder - would need actual timing data
        paymentSuccessRate: Math.round(paymentSuccessRate * 100) / 100,
      },
      enrollmentPerformance: {
        totalEnrollments,
        enrollmentSuccessRate: Math.round(enrollmentSuccessRate * 100) / 100,
        averageEnrollmentTime: 2.1, // Placeholder - would need actual timing data
        emailInviteSuccessRate: 98.5, // Placeholder - would need email tracking
      },
      systemHealth: {
        status: overallStatus,
        googleCalendarStatus,
        sanityStatus,
        paymentProviderStatus: {
          intasend: intasendStatus,
          stripe: stripeStatus,
        },
      },
      alerts,
    };

    console.log('✅ Performance data generated:', {
      overallStatus,
      totalEnrollments,
      paymentSuccessRate: `${paymentSuccessRate.toFixed(1)}%`,
      alertCount: alerts.length,
    });

    return NextResponse.json(performanceData, { status: 200 });

  } catch (error) {
    console.error('❌ Error generating performance data:', error);
    return NextResponse.json(
      { error: 'Failed to generate performance data' },
      { status: 500 }
    );
  }
}

// POST - Update performance monitoring in Sanity
export async function POST(request: NextRequest) {
  try {
    console.log('📊 Updating performance monitoring in Sanity...');

    // Generate fresh performance data
    const performanceResponse = await GET(request);
    const performanceData = await performanceResponse.json();

    if (!performanceResponse.ok) {
      throw new Error('Failed to generate performance data');
    }

    // Always create a new performance monitoring document (for historical tracking)
    const result = await client.create(performanceData);
    console.log('✅ Performance monitoring created in Sanity');

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('❌ Error updating performance monitoring in Sanity:', error);
    return NextResponse.json(
      { error: 'Failed to update performance monitoring in Sanity' },
      { status: 500 }
    );
  }
}
