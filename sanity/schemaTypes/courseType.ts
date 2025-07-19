import { defineField, defineType } from "sanity";

export const courseType = defineType({
  name: "course",
  title: "Course",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    {
      name: "price",
      title: "Price (KSh)",
      type: "number",
      description: "Price in Kenyan Shillings (KSh)",
      validation: (Rule) => Rule.min(0),
    },
    {
      name: "currency",
      title: "Currency",
      type: "string",
      description: "Currency code (e.g., KES, USD)",
      initialValue: "KES",
      options: {
        list: [
          { title: "Kenyan Shilling (KES)", value: "KES" },
          { title: "US Dollar (USD)", value: "USD" },
          { title: "Euro (EUR)", value: "EUR" },
          { title: "British Pound (GBP)", value: "GBP" },
        ],
      },
      validation: (Rule) => Rule.required(),
    },
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "image",
      title: "Course Image",
      type: "image",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "modules",
      title: "Modules",
      type: "array",
      of: [{ type: "reference", to: { type: "module" } }],
    }),
    defineField({
      name: "instructor",
      title: "Instructor",
      type: "reference",
      to: { type: "instructor" },
    }),
  ],
});
