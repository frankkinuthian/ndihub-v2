import { defineField, defineType } from 'sanity'
import { Calendar, DollarSign, Settings } from 'lucide-react'

export const masterclassSettings = defineType({
  name: 'masterclassSettings',
  title: 'MasterClass Settings',
  type: 'document',
  icon: Settings,
  fields: [
    defineField({
      name: 'title',
      title: 'Settings Title',
      type: 'string',
      initialValue: 'MasterClass Configuration',
      readOnly: true,
    }),
    defineField({
      name: 'googleCalendarId',
      title: 'Google Calendar ID',
      type: 'string',
      description: 'The Google Calendar ID where MasterClasses are stored',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'defaultPricing',
      title: 'Default Pricing Settings',
      type: 'object',
      fields: [
        defineField({
          name: 'currency',
          title: 'Default Currency',
          type: 'string',
          options: {
            list: [
              { title: 'KES (M-Pesa)', value: 'KES' },
              { title: 'USD (Stripe)', value: 'USD' },
              { title: 'EUR (Stripe)', value: 'EUR' },
            ],
          },
          initialValue: 'KES',
        }),
        defineField({
          name: 'defaultPrice',
          title: 'Default Price',
          type: 'number',
          initialValue: 2000,
        }),
      ],
    }),
    defineField({
      name: 'emailSettings',
      title: 'Email Invite Settings',
      type: 'object',
      fields: [
        defineField({
          name: 'fromName',
          title: 'From Name',
          type: 'string',
          initialValue: 'NDIHub MasterClasses',
        }),
        defineField({
          name: 'fromEmail',
          title: 'From Email',
          type: 'string',
          initialValue: 'noreply@ndihub.com',
        }),
        defineField({
          name: 'emailTemplate',
          title: 'Email Template',
          type: 'text',
          rows: 10,
          description: 'HTML email template for calendar invites',
        }),
      ],
    }),
    defineField({
      name: 'webhookSettings',
      title: 'Webhook Configuration',
      type: 'object',
      fields: [
        defineField({
          name: 'intasendWebhookUrl',
          title: 'IntaSend Webhook URL',
          type: 'url',
          description: 'Current webhook URL for IntaSend',
        }),
        defineField({
          name: 'stripeWebhookUrl',
          title: 'Stripe Webhook URL',
          type: 'url',
          description: 'Current webhook URL for Stripe',
        }),
        defineField({
          name: 'lastWebhookTest',
          title: 'Last Webhook Test',
          type: 'datetime',
          readOnly: true,
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare() {
      return {
        title: 'MasterClass Settings',
        subtitle: 'System configuration',
        media: Settings,
      }
    },
  },
})
