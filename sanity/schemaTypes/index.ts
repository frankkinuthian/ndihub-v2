import { type SchemaTypeDefinition } from "sanity";
import { courseType } from "./courseType";
import { moduleType } from "./moduleType";
import { lessonType } from "./lessonType";
import { instructorType } from "./instructorType";
import { blockContent } from "./blockContent";
import { studentType } from "./studentType";
import { enrollmentType } from "./enrollmentType";
import { masterclassEnrollmentType } from "./masterclassEnrollmentType";
import { categoryType } from "./categoryType";
import { lessonCompletionType } from "./lessonCompletionType";
import { masterclassSettings } from "./masterclassSettings";
import { masterclassAnalytics } from "./masterclassAnalytics";
import { performanceMonitoring } from "./performanceMonitoring";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    courseType,
    moduleType,
    lessonType,
    instructorType,
    blockContent,
    studentType,
    enrollmentType,
    masterclassEnrollmentType,
    categoryType,
    lessonCompletionType,
    masterclassSettings,
    masterclassAnalytics,
    performanceMonitoring,
  ],
};

export * from "./courseType";
export * from "./moduleType";
export * from "./lessonType";
export * from "./instructorType";
export * from "./studentType";
export * from "./enrollmentType";
export * from "./masterclassEnrollmentType";
export * from "./categoryType";
export * from "./lessonCompletionType";
export * from "./masterclassSettings";
export * from "./masterclassAnalytics";
export * from "./performanceMonitoring";
