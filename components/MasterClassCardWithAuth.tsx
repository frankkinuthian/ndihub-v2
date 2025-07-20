"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { MasterClass } from "@/lib/googleCalendar";
import { MasterClassCard } from "./MasterClassCard";

interface MasterClassCardWithAuthProps {
  masterClass: MasterClass;
  className?: string;
}

export function MasterClassCardWithAuth({ 
  masterClass, 
  className = "" 
}: MasterClassCardWithAuthProps) {
  const { user, isLoaded } = useUser();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    async function checkEnrollment() {
      // Only check enrollment for premium masterclasses and authenticated users
      if (!user || !masterClass.isPremium || masterClass.isFree) {
        setIsEnrolled(false);
        return;
      }

      setIsChecking(true);
      try {
        const response = await fetch(`/api/masterclass/enrollment-status?masterclassId=${masterClass.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsEnrolled(data.isEnrolled || false);
        } else {
          setIsEnrolled(false);
        }
      } catch (error) {
        console.error("Error checking enrollment:", error);
        setIsEnrolled(false);
      } finally {
        setIsChecking(false);
      }
    }

    if (isLoaded) {
      checkEnrollment();
    }
  }, [user, isLoaded, masterClass.id, masterClass.isPremium, masterClass.isFree]);

  // Also check enrollment when component becomes visible (user returns from payment)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && masterClass.isPremium && !masterClass.isFree) {
        // Re-check enrollment when page becomes visible
        setTimeout(() => {
          setIsChecking(true);
          fetch(`/api/masterclass/enrollment-status?masterclassId=${masterClass.id}`)
            .then(response => response.json())
            .then(data => setIsEnrolled(data.isEnrolled || false))
            .catch(error => console.error("Error re-checking enrollment:", error))
            .finally(() => setIsChecking(false));
        }, 1000); // Small delay to allow webhook processing
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, masterClass.id, masterClass.isPremium, masterClass.isFree]);

  // Show loading state while checking auth or enrollment
  if (!isLoaded || isChecking) {
    return (
      <div className={className}>
        <MasterClassCard 
          masterClass={masterClass} 
          isEnrolled={false}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <MasterClassCard 
        masterClass={masterClass} 
        isEnrolled={isEnrolled}
      />
    </div>
  );
}

export default MasterClassCardWithAuth;
