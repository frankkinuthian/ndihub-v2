import { defineField, defineType } from "sanity";

export const masterclassEnrollmentType = defineType({
  name: "masterclassEnrollment",
  title: "MasterClass Enrollment",
  type: "document",
  fields: [
    defineField({
      name: "student",
      title: "Student",
      type: "reference",
      to: [{ type: "student" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "masterclassId",
      title: "MasterClass ID",
      type: "string",
      description: "Google Calendar event ID",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "masterclassTitle",
      title: "MasterClass Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "enrolledAt",
      title: "Enrolled At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "paymentId",
      title: "Payment ID",
      type: "string",
      description: "Stripe or IntaSend payment ID",
    }),
    defineField({
      name: "amount",
      title: "Amount Paid",
      type: "number",
      description: "Amount paid for the masterclass",
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      description: "Currency used for payment",
      options: {
        list: [
          { title: "Kenyan Shilling", value: "KES" },
          { title: "US Dollar", value: "USD" },
          { title: "Euro", value: "EUR" },
          { title: "British Pound", value: "GBP" },
        ],
      },
      initialValue: "KES",
    }),
    defineField({
      name: "status",
      title: "Enrollment Status",
      type: "string",
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Cancelled", value: "cancelled" },
          { title: "Completed", value: "completed" },
        ],
      },
      initialValue: "active",
    }),
    defineField({
      name: "accessGranted",
      title: "Access Granted",
      type: "boolean",
      description: "Whether the student has access to the masterclass",
      initialValue: true,
    }),
    defineField({
      name: "attendanceStatus",
      title: "Attendance Status",
      type: "string",
      options: {
        list: [
          { title: "Registered", value: "registered" },
          { title: "Attended", value: "attended" },
          { title: "No Show", value: "no_show" },
        ],
      },
      initialValue: "registered",
    }),
  ],
  preview: {
    select: {
      title: "masterclassTitle",
      subtitle: "student.firstName",
      media: "student.imageUrl",
    },
    prepare(selection) {
      const { title, subtitle } = selection;
      return {
        title: title || "Untitled MasterClass",
        subtitle: subtitle ? `Student: ${subtitle}` : "No student",
      };
    },
  },
});
