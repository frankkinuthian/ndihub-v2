import { defineField, defineType } from 'sanity'
import { BarChart3, TrendingUp } from 'lucide-react'

export const masterclassAnalytics = defineType({
  name: 'masterclassAnalytics',
  title: 'MasterClass Analytics',
  type: 'document',
  icon: BarChart3,
  fields: [
    defineField({
      name: 'title',
      title: 'Analytics Report',
      type: 'string',
      initialValue: 'MasterClass Performance Analytics',
      readOnly: true,
    }),
    defineField({
      name: 'reportDate',
      title: 'Report Date',
      type: 'date',
      initialValue: () => new Date().toISOString().split('T')[0],
    }),
    defineField({
      name: 'totalMasterClasses',
      title: 'Total MasterClasses',
      type: 'number',
      readOnly: true,
      description: 'Auto-calculated from Google Calendar',
    }),
    defineField({
      name: 'totalEnrollments',
      title: 'Total Enrollments',
      type: 'number',
      readOnly: true,
      description: 'Auto-calculated from enrollment records',
    }),
    defineField({
      name: 'totalRevenue',
      title: 'Total Revenue (KES)',
      type: 'number',
      readOnly: true,
      description: 'Auto-calculated from premium enrollments',
    }),
    defineField({
      name: 'revenueByMonth',
      title: 'Revenue by Month',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'month',
              title: 'Month',
              type: 'string',
            }),
            defineField({
              name: 'revenue',
              title: 'Revenue',
              type: 'number',
            }),
            defineField({
              name: 'enrollments',
              title: 'Enrollments',
              type: 'number',
            }),
          ],
        },
      ],
      readOnly: true,
    }),
    defineField({
      name: 'topMasterClasses',
      title: 'Top Performing MasterClasses',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'MasterClass Title',
              type: 'string',
            }),
            defineField({
              name: 'enrollments',
              title: 'Total Enrollments',
              type: 'number',
            }),
            defineField({
              name: 'revenue',
              title: 'Total Revenue',
              type: 'number',
            }),
            defineField({
              name: 'averageRating',
              title: 'Average Rating',
              type: 'number',
            }),
          ],
        },
      ],
      readOnly: true,
    }),
    defineField({
      name: 'paymentMethods',
      title: 'Payment Method Distribution',
      type: 'object',
      fields: [
        defineField({
          name: 'mpesa',
          title: 'M-Pesa Payments',
          type: 'number',
          readOnly: true,
        }),
        defineField({
          name: 'stripe',
          title: 'Card Payments',
          type: 'number',
          readOnly: true,
        }),
      ],
      readOnly: true,
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Last Updated',
      type: 'datetime',
      readOnly: true,
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      reportDate: 'reportDate',
      totalRevenue: 'totalRevenue',
      totalEnrollments: 'totalEnrollments',
    },
    prepare({ reportDate, totalRevenue, totalEnrollments }) {
      return {
        title: `Analytics Report - ${reportDate}`,
        subtitle: `${totalEnrollments} enrollments • KES ${totalRevenue?.toLocaleString() || 0} revenue`,
        media: TrendingUp,
      }
    },
  },
})
