import React from "react";
import {
  GetCoursesQueryResult,
  SearchQueryResult,
  GetEnrolledCoursesQueryResult
} from "@/sanity.types";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { Loader } from "./ui/loader";
import { BookOpen } from "lucide-react";
import { CourseProgress } from "./CourseProgress";
import { PriceTag } from "./CurrencyDisplay";

// Union type to handle all different course query results
type CourseCardData =
  | GetCoursesQueryResult[number]
  | SearchQueryResult[number]
  | NonNullable<NonNullable<GetEnrolledCoursesQueryResult>['enrolledCourses'][number]['course']>;

interface CourseCardProps {
  course: CourseCardData;
  progress?: number;
  href: string;
}

export function CourseCard({ course, progress, href }: CourseCardProps) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="group hover:no-underline flex"
    >
      <div className="bg-card rounded-xl overflow-hidden shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:translate-y-[-4px] border border-border flex flex-col flex-1">
        <div className="relative h-52 w-full overflow-hidden">
          {course.image ? (
            <Image
              src={urlFor(course.image).url() || ""}
              alt={course.title || "course Image"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-muted">
              <Loader />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <span className="text-sm font-medium px-3 py-1 bg-black/50 text-white rounded-full backdrop-blur-sm">
              {course.category?.name || "Uncategorized"}
            </span>
            {"price" in course && typeof course.price === "number" && (
              <PriceTag
                amount={course.price}
                currency={course.currency || "KES"}
                size="sm"
                variant="card"
              />
            )}
          </div>
        </div>
        <div className="p-6 flex flex-col flex-1">
          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">
            {course.title}
          </h3>
          <p className="text-muted-foreground mb-4 line-clamp-2 flex-1">
            {course.description}
          </p>
          <div className="space-y-4 mt-auto">
            {course.instructor && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {course.instructor.photo ? (
                    <div className="relative h-8 w-8 mr-2">
                      <Image
                        src={urlFor(course.instructor.photo).url() || ""}
                        alt={course.instructor.name || "Instructor"}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-8 w-8 mr-2 rounded-full bg-muted flex items-center justify-center">
                      <Loader size="sm" />
                    </div>
                  )}
                  <span className="text-sm text-muted-foreground">
                    by {course.instructor.name}
                  </span>
                </div>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            {typeof progress === "number" && (
              <CourseProgress
                progress={progress}
                variant="default"
                size="sm"
                label="Course Progress"
              />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
