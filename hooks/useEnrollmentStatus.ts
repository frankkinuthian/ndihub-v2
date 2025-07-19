"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

interface EnrollmentStatus {
  isEnrolled: boolean;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useEnrollmentStatus(courseId: string): EnrollmentStatus {
  const { user, isLoaded } = useUser();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkEnrollmentStatus = async () => {
    if (!user?.id || !courseId) {
      setIsEnrolled(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/enrollment/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          courseId: courseId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to check enrollment status");
      }

      const data = await response.json();
      setIsEnrolled(data.isEnrolled);
    } catch (err) {
      console.error("Error checking enrollment status:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setIsEnrolled(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      checkEnrollmentStatus();
    }
  }, [user?.id, courseId, isLoaded]);

  // Periodically check enrollment status (useful after payments)
  useEffect(() => {
    if (!user?.id || !courseId || isEnrolled) return;

    const interval = setInterval(() => {
      checkEnrollmentStatus();
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [user?.id, courseId, isEnrolled]);

  return {
    isEnrolled,
    isLoading,
    error,
    refetch: checkEnrollmentStatus,
  };
}
