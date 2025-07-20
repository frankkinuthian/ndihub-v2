import React from "react";
import { notFound } from "next/navigation";
import { getMasterClasses } from "@/lib/googleCalendar";
import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { isEnrolledInMasterClass } from "@/sanity/lib/masterclass/isEnrolledInMasterClass";
import { MasterClassPageClient } from "@/components/MasterClassPageClient";

interface MasterClassPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: MasterClassPageProps): Promise<Metadata> {
  const { id } = await params;
  const masterClasses = await getMasterClasses().catch(() => []);
  const masterClass = masterClasses.find(mc => mc.id === id);

  if (!masterClass) {
    return {
      title: "MasterClass Not Found | NDIHub",
    };
  }

  return {
    title: `${masterClass.title} | NDIHub`,
    description: masterClass.description || `Join ${masterClass.instructor} for an exclusive MasterClass session.`,
  };
}

export default async function MasterClassPage({ params }: MasterClassPageProps) {
  const { id } = await params;
  const masterClasses = await getMasterClasses().catch(() => []);
  const masterClass = masterClasses.find(mc => mc.id === id);

  if (!masterClass) {
    notFound();
  }

  // Check enrollment status if user is authenticated and masterclass is premium
  let isEnrolled = false;
  let userId: string | null = null;

  try {
    const authResult = await auth();
    userId = authResult.userId;

    if (userId && masterClass.isPremium && !masterClass.isFree) {
      try {
        isEnrolled = await isEnrolledInMasterClass(userId, masterClass.id);
      } catch (error) {
        console.error("Error checking enrollment:", error);
        isEnrolled = false;
      }
    }
  } catch {
    console.log("Auth not available, continuing without enrollment check");
    userId = null;
    isEnrolled = false;
  }



  return (
    <MasterClassPageClient
      masterClass={masterClass}
      initialIsEnrolled={isEnrolled}
    />
  );
}
