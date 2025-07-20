import React from "react";
import { MasterClassesSection } from "@/components/MasterClassesSection";
import { getUpcomingMasterClasses } from "@/lib/googleCalendar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "MasterClasses | NDIHub",
  description: "Join live sessions with industry experts and thought leaders. Interactive workshops, Q&A sessions, and exclusive insights.",
};

export const dynamic = "force-dynamic"; // Always fetch fresh data for masterclasses
export const revalidate = 300; // Revalidate every 5 minutes

export default async function MasterClassesPage() {
  const masterClasses = await getUpcomingMasterClasses().catch(() => []);

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            MasterClasses
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Learn from industry experts in live, interactive sessions. 
            Get exclusive insights, ask questions, and network with professionals.
          </p>
        </div>
      </div>

      {/* MasterClasses Section */}
      <MasterClassesSection masterClasses={masterClasses} showAll={true} />
    </div>
  );
}
