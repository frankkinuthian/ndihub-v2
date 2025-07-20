import { defineField, defineType } from 'sanity'
import { Activity, AlertTriangle } from 'lucide-react'

export const performanceMonitoring = defineType({
  name: 'performanceMonitoring',
  title: 'Performance Monitoring',
  type: 'document',
  icon: Activity,
  fields: [
    defineField({
      name: 'title',
      title: 'Monitoring Report',
      type: 'string',
      initialValue: 'System Performance Report',
      readOnly: true,
    }),
    defineField({
      name: 'timestamp',
      title: 'Report Timestamp',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
    defineField({
      name: 'webhookPerformance',
      title: 'Webhook Performance',
      type: 'object',
      fields: [
        defineField({
          name: 'totalWebhooks',
          title: 'Total Webhook Calls (24h)',
          type: 'number',
          readOnly: true,
        }),
        defineField({
          name: 'successfulWebhooks',
          title: 'Successful Webhooks',
          type: 'number',
          readOnly: true,
        }),
        defineField({
          name: 'failedWebhooks',
          title: 'Failed Webhooks',
          type: 'number',
          readOnly: true,
        }),
        defineField({
          name: 'averageResponseTime',
          title: 'Average Response Time (ms)',
          type: 'number',
          readOnly: true,
        }),
        defineField({
          name: 'lastFailure',
          title: 'Last Webhook Failure',
          type: 'datetime',
          readOnly: true,
        }),
      ],
    }),
    defineField({
      name: 'paymentPerformance',
      title: 'Payment Performance',
      type: 'object',
      fields: [
        defineField({
          name: 'totalPayments',
          title: 'Total Payments (24h)',
          type: 'number',
          readOnly: true,
        }),
        defineField({
          name: 'successfulPayments',
          title: 'Successful Payments',
          type: 'number',
          readOnly: true,
        }),
        defineField({
          name: 'failedPayments',
          title: 'Failed Payments',
          type: 'number',
          readOnly: true,
        }),
        defineField({
          name: 'averagePaymentTime',
          title: 'Average Payment Processing Time (s)',
          type: 'number',
          readOnly: true,
        }),
        defineField({
          name: 'paymentSuccessRate',
          title: 'Payment Success Rate (%)',
          type: 'number',
          readOnly: true,
        }),
      ],
    }),
    defineField({
      name: 'enrollmentPerformance',
      title: 'Enrollment Performance',
      type: 'object',
      fields: [
        defineField({
          name: 'totalEnrollments',
          title: 'Total Enrollments (24h)',
          type: 'number',
          readOnly: true,
        }),
        defineField({
          name: 'enrollmentSuccessRate',
          title: 'Enrollment Success Rate (%)',
          type: 'number',
          readOnly: true,
        }),
        defineField({
          name: 'averageEnrollmentTime',
          title: 'Average Enrollment Time (s)',
          type: 'number',
          readOnly: true,
        }),
        defineField({
          name: 'emailInviteSuccessRate',
          title: 'Email Invite Success Rate (%)',
          type: 'number',
          readOnly: true,
        }),
      ],
    }),
    defineField({
      name: 'systemHealth',
      title: 'System Health',
      type: 'object',
      fields: [
        defineField({
          name: 'status',
          title: 'Overall Status',
          type: 'string',
          options: {
            list: [
              { title: '🟢 Healthy', value: 'healthy' },
              { title: '🟡 Warning', value: 'warning' },
              { title: '🔴 Critical', value: 'critical' },
            ],
          },
          readOnly: true,
        }),
        defineField({
          name: 'googleCalendarStatus',
          title: 'Google Calendar API Status',
          type: 'string',
          options: {
            list: [
              { title: '✅ Online', value: 'online' },
              { title: '⚠️ Slow', value: 'slow' },
              { title: '❌ Offline', value: 'offline' },
            ],
          },
          readOnly: true,
        }),
        defineField({
          name: 'sanityStatus',
          title: 'Sanity Database Status',
          type: 'string',
          options: {
            list: [
              { title: '✅ Online', value: 'online' },
              { title: '⚠️ Slow', value: 'slow' },
              { title: '❌ Offline', value: 'offline' },
            ],
          },
          readOnly: true,
        }),
        defineField({
          name: 'paymentProviderStatus',
          title: 'Payment Providers Status',
          type: 'object',
          fields: [
            defineField({
              name: 'intasend',
              title: 'IntaSend Status',
              type: 'string',
              options: {
                list: [
                  { title: '✅ Online', value: 'online' },
                  { title: '⚠️ Slow', value: 'slow' },
                  { title: '❌ Offline', value: 'offline' },
                ],
              },
              readOnly: true,
            }),
            defineField({
              name: 'stripe',
              title: 'Stripe Status',
              type: 'string',
              options: {
                list: [
                  { title: '✅ Online', value: 'online' },
                  { title: '⚠️ Slow', value: 'slow' },
                  { title: '❌ Offline', value: 'offline' },
                ],
              },
              readOnly: true,
            }),
          ],
          readOnly: true,
        }),
      ],
    }),
    defineField({
      name: 'alerts',
      title: 'System Alerts',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'severity',
              title: 'Severity',
              type: 'string',
              options: {
                list: [
                  { title: '🔴 Critical', value: 'critical' },
                  { title: '🟡 Warning', value: 'warning' },
                  { title: '🔵 Info', value: 'info' },
                ],
              },
            }),
            defineField({
              name: 'message',
              title: 'Alert Message',
              type: 'text',
            }),
            defineField({
              name: 'timestamp',
              title: 'Alert Time',
              type: 'datetime',
            }),
            defineField({
              name: 'resolved',
              title: 'Resolved',
              type: 'boolean',
              initialValue: false,
            }),
          ],
        },
      ],
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      timestamp: 'timestamp',
      status: 'systemHealth.status',
      totalPayments: 'paymentPerformance.totalPayments',
    },
    prepare({ timestamp, status, totalPayments }) {
      const date = new Date(timestamp).toLocaleDateString();
      const statusIcon = status === 'healthy' ? '🟢' : status === 'warning' ? '🟡' : '🔴';
      
      return {
        title: `Performance Report - ${date}`,
        subtitle: `${statusIcon} ${status} • ${totalPayments || 0} payments`,
        media: Activity,
      }
    },
  },
})
