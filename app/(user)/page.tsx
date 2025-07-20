import React from "react";
import Hero from "@/components/Hero";
import { getCourses } from "@/sanity/lib/courses/getCourses";
import { CourseCard } from "@/components/CourseCard";
import { MasterClassesSection } from "@/components/MasterClassesSection";
import { getUpcomingMasterClasses } from "@/lib/googleCalendar";

export const dynamic = "force-static";
// Revalidate at the most every hour
export const revalidate = 3600;

export default async function Home() {
  // Fetch both courses and masterclasses
  const [courses, masterClasses] = await Promise.all([
    getCourses(),
    getUpcomingMasterClasses().catch(() => []) // Fallback to empty array if Google Calendar fails
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Hero />

      {/* MasterClasses Section */}
      <MasterClassesSection masterClasses={masterClasses} />

      {/* Courses Grid */}
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 py-8">
          <div className="h-px flex-1 bg-gradient-to-r from-border/0 via-border to-border/0" />
          <span className="text-sm font-medium text-muted-foreground">
            Featured Courses
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-border/0 via-border to-border/0" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-16">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              href={`/courses/${course.slug}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
